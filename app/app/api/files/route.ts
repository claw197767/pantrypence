import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SIGNED_URL_TTL_SECONDS = 60;
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

  const fileId = request.nextUrl.searchParams.get("id");
  if (!fileId) {
    const { data, error } = await supabase
      .from("user_files")
      .select(
        "id, owner_id, uploaded_by_email, original_filename, content_type, file_size, created_at",
      )
      .order("created_at", { ascending: false });

    if (error) return jsonError("Unable to list files.", 500);
    return NextResponse.json({ files: data });
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

  const isAdmin = user.app_metadata?.role === "admin";
  let ownerId = user.id;
  if (isAdmin) {
    const requestedOwnerId = formData.get("owner_id");
    // The admin share form always sends owner_id; the member files form
    // never does. An admin uploading from the member form is uploading to
    // their own account, so only run the share checks when owner_id was
    // actually supplied.
    if (requestedOwnerId !== null) {
      if (
        typeof requestedOwnerId !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestedOwnerId)
      ) {
        return jsonError("Choose a member account for this file.", 400);
      }

      const { data: membership, error: membershipError } = await supabase
        .from("user_subscriptions")
        .select("status, current_period_end")
        .eq("user_id", requestedOwnerId)
        .maybeSingle();

      if (membershipError) return jsonError("Unable to verify member account.", 500);
      const active = Boolean(
        membership &&
          ["active", "trialing"].includes(membership.status) &&
          (!membership.current_period_end || new Date(membership.current_period_end) > new Date()),
      );
      if (!active) return jsonError("Files can only be assigned to active members.", 404);
      ownerId = requestedOwnerId;
    }
  }

  const originalFilename =
    file.name
      .replace(/[\\/]/g, "_")
      .replace(/[^\w.() -]/g, "_")
      .trim()
      .slice(0, 120) || "upload";
  const objectPath = `${ownerId}/${crypto.randomUUID()}-${originalFilename}`;
  const { error: uploadError } = await supabase.storage
    .from("user-files")
    .upload(objectPath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Storage upload failed", {
      message: uploadError.message,
      name: uploadError.name,
    });
    return jsonError("Unable to upload file.", 400);
  }

  const { data: metadata, error: metadataError } = await supabase
    .from("user_files")
    .insert({
      owner_id: ownerId,
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
