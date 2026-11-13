"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type UserFile = {
  id: string;
  original_filename: string;
  content_type: string;
  file_size: number;
  created_at: string;
  uploaded_by_email?: string;
  owner_id?: string;
  signed_url?: string;
};

type PageStatus = "loading" | "ready" | "unauthenticated" | "forbidden" | "error";

export default function FilesPage() {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<PageStatus>("loading");
  const [message, setMessage] = useState("Loading your files…");
  const [uploading, setUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [canUpload, setCanUpload] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fileSummary = useMemo(
    () => files.reduce((total, file) => total + Number(file.file_size || 0), 0),
    [files],
  );

  async function loadFiles(nextPage = 0) {
    await fetch(`/api/files?scope=own&page=${nextPage}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));

        if (response.status === 401) {
          setFiles([]);
          setStatus("unauthenticated");
          setMessage("Please sign in to manage your private files.");
          return;
        }

        if (response.status === 403) {
          setFiles([]);
          setStatus("forbidden");
          setMessage(data?.error || "An active membership is required to access files.");
          return;
        }

        if (!response.ok) {
          setFiles([]);
          setStatus("error");
          setMessage(data?.error || "Unable to load your files right now.");
          return;
        }

        const loadedFiles: UserFile[] = Array.isArray(data.files) ? data.files : [];
        setFiles((previous) => nextPage === 0 ? loadedFiles : [...previous, ...loadedFiles]);
        setIsAdmin(data.isAdmin === true);
        setCanUpload(data.canUpload === true);
        setPage(nextPage);
        setHasMore(data.hasMore === true);
        setStatus("ready");
        setMessage("");
      })
      .catch(() => {
        setFiles([]);
        setStatus("error");
        setMessage("Unable to load your files right now.");
      });
  }

  useEffect(() => {
    void loadFiles();
  }, []);

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFile) {
      setStatus("error");
      setMessage("Choose a file before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    setUploading(true);
    setMessage("Uploading file…");

    try {
      const response = await fetch("/api/files", { method: "POST", body: formData });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus("error");
        setMessage(data?.error || "Upload failed.");
        return;
      }

      setSelectedFile(null);
      setStatus("loading");
      setMessage("Loading your files…");
      await loadFiles();
    } catch {
      setStatus("error");
      setMessage("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function openDownload(file: UserFile) {
    try {
      const response = await fetch(`/api/files?id=${encodeURIComponent(file.id)}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      const signedUrl = data.file?.signed_url as string | undefined;
      if (!response.ok || !signedUrl) {
        setStatus("error");
        setMessage(data?.error || "This file cannot be downloaded right now.");
        return;
      }
      window.location.assign(signedUrl);
    } catch {
      setStatus("error");
      setMessage("This file cannot be downloaded right now.");
    }
  }

  return (
    <main className="min-h-screen bg-[#111318] px-6 py-16 text-[#f4f1ea]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d6b36a]">PantryPence files</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">Your private uploads</h1>
          </div>
          <a href="/members" className="rounded-full border border-white/20 px-5 py-3 text-sm font-bold transition hover:border-[#d6b36a] hover:text-[#e2c681]">
            Members area
          </a>
        </div>

        {isAdmin ? <a href="/admin/files" className="mb-6 inline-block text-sm font-bold text-[#e2c681] underline underline-offset-4">View all member documents</a> : null}
        {canUpload ? (
        <form onSubmit={handleUpload} className="rounded-3xl border border-white/10 bg-[#1b1e25] p-6 shadow-xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex-1">
              <label htmlFor="private-file" className="mb-2 block text-sm font-semibold">Upload a document</label>
              <input
                id="private-file"
                type="file"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                className="block w-full rounded-2xl border border-white/15 bg-[#111318] px-4 py-3 text-sm text-[#e7e4dc] file:mr-4 file:rounded-full file:border-0 file:bg-[#d6b36a] file:px-4 file:py-2 file:font-bold file:text-[#171717]"
              />
            </div>
            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="inline-flex min-w-[170px] items-center justify-center rounded-full bg-[#d6b36a] px-6 py-3 font-bold text-[#171717] transition hover:bg-[#e4c989] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Upload file"}
            </button>
          </div>
          <p className="mt-4 text-sm text-[#aeb1b8]">Supported file types: PDF, CSV, XLSX, JPG, PNG. Max size: 10 MB.</p>
        </form>
        ) : null}

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-[#d6b36a]/20 bg-[#d6b36a]/[0.08] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[#d6b36a]">Files shown</p>
            <p className="mt-4 text-3xl font-semibold">{files.length}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#1b1e25] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[#aeb1b8]">Storage shown</p>
            <p className="mt-4 text-3xl font-semibold">{(fileSummary / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#1b1e25] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[#aeb1b8]">Status</p>
            <p className="mt-4 text-lg font-semibold">{status === "ready" ? "Secure" : status === "unauthenticated" ? "Sign in required" : status === "error" || status === "forbidden" ? "Action needed" : "Checking"}</p>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-[#1b1e25] p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Your file list</h2>
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#d6b36a]">
              {status === "ready" ? "Private to your account" : "Not available"}
            </span>
          </div>

          {message ? <p role="status" className="mb-4 text-sm text-[#aeb1b8]">{message}</p> : null}

          {status === "unauthenticated" ? (
            <div className="rounded-2xl border border-dashed border-white/20 bg-black/10 p-8 text-center text-[#aeb1b8]">
              <a href="/login?next=%2Ffiles" className="text-[#e2c681] underline">Sign in</a> to view or upload bills, invoices, receipts, and supporting files.
            </div>
          ) : status === "forbidden" ? (
            <div className="rounded-2xl border border-dashed border-white/20 bg-black/10 p-8 text-center text-[#aeb1b8]">
              <Link href="/" className="text-[#e2c681] underline">Start a membership</Link> to access your files.
            </div>
          ) : status === "ready" && files.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/20 bg-black/10 p-8 text-center text-[#aeb1b8]">
              No files uploaded yet.
            </div>
          ) : files.length > 0 ? (
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="flex flex-col gap-3 rounded-2xl border border-white/[0.07] bg-[#111318] p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold">{file.original_filename}</p>
                    <p className="mt-1 text-sm text-[#aeb1b8]">
                      {file.content_type} • {(file.file_size / 1024 / 1024).toFixed(2)} MB • {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button type="button" onClick={() => void openDownload(file)} className="rounded-full bg-[#d6b36a] px-5 py-2.5 text-sm font-bold text-[#171717] transition hover:bg-[#e4c989]">
                    Download
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          {status === "ready" && hasMore ? (
            <button type="button" disabled={loadingMore} onClick={() => { setLoadingMore(true); void loadFiles(page + 1).finally(() => setLoadingMore(false)); }} className="mt-5 rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold disabled:opacity-50">{loadingMore ? "Loading…" : "Load more files"}</button>
          ) : null}
        </section>
      </div>
    </main>
  );
}
