import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getFileAccess } from "@/lib/membership";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SIGNED_URL_TTL_SECONDS = 60;
const FILES_PER_PAGE = 50;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
]);

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return jsonError("Authentication required.", 401);

  let access;
  try {
    access = await getFileAccess(supabase, user);
  } catch {
    return jsonError("Unable to check membership.", 500);
  }
  if (!access.canRead) return jsonError("An active membership is required to access files.", 403);

  const fileId = request.nextUrl.searchParams.get("id");
  if (!fileId) {
    const pageParam = request.nextUrl.searchParams.get("page") ?? "0";
    if (!/^\d+$/.test(pageParam) || !Number.isSafeInteger(Number(pageParam) * FILES_PER_PAGE)) {
      return jsonError("Invalid page.", 400);
    }
    const offset = Number(pageParam) * FILES_PER_PAGE;
    let query = supabase
      .from("user_files")
      .select(
        "id, owner_id, uploaded_by_email, original_filename, content_type, file_size, created_at",
      );
    if (request.nextUrl.searchParams.get("scope") === "own") {
      query = query.eq("owner_id", user.id);
    }
    const { data, error } = await query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + FILES_PER_PAGE);

    if (error) return jsonError("Unable to list files.", 500);
    return NextResponse.json({
      files: data.slice(0, FILES_PER_PAGE),
      hasMore: data.length > FILES_PER_PAGE,
      isAdmin: access.isAdmin,
      canUpload: access.active,
    });
  }

  const { data: file, error: fileError } = await supabase
    .from("user_files")
    .select(
      "id, owner_id, uploaded_by_email, original_filename, content_type, file_size, object_path, created_at",
    )
    .eq("id", fileId)
    .maybeSingle();

  // RLS intentionally makes another user's file indistinguishable from a missing file.
  if (fileError || !file) return jsonError("File not found.", 404);

  const { data: signed, error: signedError } = await supabase.storage
    .from("user-files")
    .createSignedUrl(file.object_path, SIGNED_URL_TTL_SECONDS);

  if (signedError || !signed) return jsonError("Unable to access file.", 403);

  return NextResponse.json({
    file: {
      id: file.id,
      owner_id: file.owner_id,
      uploaded_by_email: file.uploaded_by_email,
      original_filename: file.original_filename,
      content_type: file.content_type,
      file_size: file.file_size,
      created_at: file.created_at,
      signed_url: signed.signedUrl,
    },
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return jsonError("Authentication required.", 401);

  let access;
  try {
    access = await getFileAccess(supabase, user);
  } catch {
    return jsonError("Unable to check membership.", 500);
  }
  if (!access.active) return jsonError("An active membership is required to upload files.", 403);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Expected a multipart form with a file field.", 400);
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return jsonError("Choose a non-empty file to upload.", 400);
  }
  if (file.size > MAX_FILE_SIZE) {
    return jsonError("Files must be 10 MB or smaller.", 413);
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return jsonError("Supported files: PDF, CSV, XLSX, JPEG, and PNG.", 415);
  }

  const originalFilename =
    file.name
      .replace(/[\\/]/g, "_")
      .replace(/[^\w.() -]/g, "_")
      .trim()
      .slice(0, 120) || "upload";
  const objectPath = `${user.id}/${crypto.randomUUID()}-${originalFilename}`;
  const { error: uploadError } = await supabase.storage
    .from("user-files")
    .upload(objectPath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) return jsonError("Unable to upload file.", 400);

  const { data: metadata, error: metadataError } = await supabase
    .from("user_files")
    .insert({
      owner_id: user.id,
      uploaded_by_email: user.email ?? "",
      original_filename: originalFilename,
      object_path: objectPath,
      content_type: file.type,
      file_size: file.size,
    })
    .select(
      "id, owner_id, uploaded_by_email, original_filename, content_type, file_size, created_at",
    )
    .single();

  if (metadataError || !metadata) {
    // Avoid leaving an unlisted object if metadata insertion is rejected.
    await supabase.storage.from("user-files").remove([objectPath]);
    return jsonError("Unable to save file details.", 500);
  }

  return NextResponse.json({ file: metadata }, { status: 201 });
}
