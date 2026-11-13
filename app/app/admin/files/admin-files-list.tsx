"use client";

import { useEffect, useState } from "react";

type AdminFile = { id: string; owner_id: string; uploaded_by_email: string; original_filename: string; content_type: string; file_size: number; created_at: string };

export default function AdminFilesList() {
  const [files, setFiles] = useState<AdminFile[]>([]);
  const [message, setMessage] = useState("Loading files…");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadFiles(nextPage: number) {
    await fetch(`/api/files?page=${nextPage}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Unable to load files.");
        setFiles((previous) => nextPage === 0 ? data.files : [...previous, ...data.files]);
        setPage(nextPage);
        setHasMore(data.hasMore === true);
        setMessage(nextPage === 0 && !data.files.length ? "No uploaded files." : "");
      })
      .catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Unable to load files."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    void loadFiles(0);
  }, []);

  async function download(file: AdminFile) {
    try {
      const response = await fetch(`/api/files?id=${encodeURIComponent(file.id)}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.file?.signed_url) {
        setMessage(data.error ?? "Could not create a secure download link.");
        return;
      }
      window.location.assign(data.file.signed_url);
    } catch {
      setMessage("Could not create a secure download link.");
    }
  }

  return (
    <main className="min-h-screen bg-[#111318] px-6 py-16 text-[#f4f1ea]">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d6b36a]">Administrator</p>
        <h1 className="mt-3 text-4xl font-semibold">Member documents</h1>
        <p className="mt-3 text-[#b3b5bb]">Private customer files. Handle and download only when required to provide the service.</p>
        {message ? <p role="status" className="mt-6 text-sm text-[#e2c681]">{message}</p> : null}
        <div className="mt-8 space-y-3">
          {files.map((file) => (
            <article key={file.id} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#1b1e25] p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold">{file.original_filename}</h2>
                <p className="mt-1 text-sm text-[#aeb1b8]">Owner: {file.uploaded_by_email} · {file.owner_id}</p>
                <p className="mt-1 text-xs text-[#858991]">{file.content_type} · {(file.file_size / 1024 / 1024).toFixed(2)} MB · {new Date(file.created_at).toLocaleString()}</p>
              </div>
              {hasMore ? <button type="button" disabled={loading} onClick={() => { setLoading(true); void loadFiles(page + 1); }} className="mt-5 rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold disabled:opacity-50">{loading ? "Loading…" : "Load more files"}</button> : null}
              <button onClick={() => void download(file)} className="rounded-full bg-[#d6b36a] px-5 py-2.5 text-sm font-bold text-[#171717]">Secure download</button>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
