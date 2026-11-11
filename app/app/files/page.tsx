"use client";

import { useEffect, useMemo, useState } from "react";

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

export default function FilesPage() {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "unauthenticated" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Loading your files…");
  const [uploading, setUploading] = useState(false);

  const fileSummary = useMemo(
    () =>
      files.reduce((total, file) => total + Number(file.file_size || 0), 0),
    [files],
  );

  async function loadFiles() {
    setStatus("loading");
    setMessage("Loading your files…");

    const response = await fetch("/api/files", { cache: "no-store" });
    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      setFiles([]);
      setStatus("unauthenticated");
      setMessage("Please sign in to manage your private files.");
      return;
    }

    if (!response.ok) {
      setFiles([]);
      setStatus("error");
      setMessage(data?.error || "Unable to load your files right now.");
      return;
    }

    setFiles(Array.isArray(data.files) ? data.files : []);
    setStatus("ready");
    setMessage(
      files.length > 0
        ? `${files.length} file${files.length === 1 ? "" : "s"} ready`
        : "No files uploaded yet.",
    );
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

    const response = await fetch("/api/files", {
      method: "POST",
      body: formData,
    });

    const data = await response.json().catch(() => ({}));
    setUploading(false);

    if (!response.ok) {
      setStatus("error");
      setMessage(data?.error || "Upload failed.");
      return;
    }

    setSelectedFile(null);
    setStatus("ready");
    setMessage("Upload complete.");
    await loadFiles();
  }

  async function openDownload(file: UserFile) {
    let signedUrl = file.signed_url;

    if (!signedUrl) {
      const response = await fetch(`/api/files?id=${file.id}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      signedUrl = data.file?.signed_url;
    }

    if (!signedUrl) {
      setStatus("error");
      setMessage("This file cannot be downloaded right now.");
      return;
    }

    window.open(signedUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="min-h-screen bg-[#f7f7ef] px-6 py-16 text-[#183b2b]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#8a9b50]">
              PantryPence files
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">Your private uploads</h1>
          </div>
          <a
            href="/"
            className="rounded-full border border-[#183b2b] px-5 py-3 text-sm font-bold transition hover:bg-[#183b2b] hover:text-white"
          >
            Back home
          </a>
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-[#dfe4ce]">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-bold text-[#183b2b]">Upload a file</label>
              <input
                type="file"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                className="block w-full rounded-2xl border border-[#d7dcca] bg-[#f8f8f3] px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-[#183b2b] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
              />
            </div>

            <button
              type="button"
              onClick={async () => {
                if (!selectedFile) {
                  setStatus("error");
                  setMessage("Choose a file before uploading.");
                  return;
                }

                const formData = new FormData();
                formData.append("file", selectedFile);
                setUploading(true);
                setMessage("Uploading file…");

                const response = await fetch("/api/files", {
                  method: "POST",
                  body: formData,
                });
                const data = await response.json().catch(() => ({}));
                setUploading(false);

                if (!response.ok) {
                  setStatus("error");
                  setMessage(data?.error || "Upload failed.");
                  return;
                }

                setSelectedFile(null);
                setStatus("ready");
                setMessage("Upload complete.");
                await loadFiles();
              }}
              disabled={!selectedFile || uploading}
              className="inline-flex min-w-[170px] items-center justify-center rounded-full bg-[#183b2b] px-6 py-3 font-bold text-white transition disabled:cursor-not-allowed disabled:bg-[#85927b]"
            >
              {uploading ? "Uploading…" : "Upload file"}
            </button>
          </div>

          <p className="mt-4 text-sm text-[#647266]">
            Supported file types: PDF, CSV, XLSX, JPG, PNG. Max size: 10 MB.
          </p>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-[#183b2b] p-5 text-white">
            <p className="text-sm uppercase tracking-[0.2em] text-[#c5d19b]">Files</p>
            <p className="mt-4 text-3xl font-black">{files.length}</p>
          </div>
          <div className="rounded-3xl bg-[#e7ead8] p-5 text-[#183b2b]">
            <p className="text-sm uppercase tracking-[0.2em] text-[#536b37]">Storage used</p>
            <p className="mt-4 text-3xl font-black">{(fileSummary / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <div className="rounded-3xl bg-white p-5 text-[#183b2b] ring-1 ring-[#dfe4ce]">
            <p className="text-sm uppercase tracking-[0.2em] text-[#536b37]">Status</p>
            <p className="mt-4 text-lg font-bold">{status === "ready" ? "Secure" : status === "unauthenticated" ? "Sign in required" : status === "error" ? "Action needed" : "Checking"}</p>
          </div>
        </section>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-lg ring-1 ring-[#dfe4ce]">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-black">Your file list</h2>
            <span className="rounded-full bg-[#f7f7ef] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#536b37]">
              {status === "ready" ? "Visible to you" : "Not available"}
            </span>
          </div>

          {message ? <p className="mb-4 text-sm text-[#647266]">{message}</p> : null}

          {status === "unauthenticated" ? (
            <div className="rounded-2xl border border-dashed border-[#c7cdb8] bg-[#f8f8f3] p-8 text-center text-[#647266]">
              Sign in to view or upload bills, invoices, receipts, and supporting files.
            </div>
          ) : files.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#c7cdb8] bg-[#f8f8f3] p-8 text-center text-[#647266]">
              No files uploaded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex flex-col gap-3 rounded-2xl border border-[#dfe4ce] bg-[#f9faf4] p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-bold">{file.original_filename}</p>
                    <p className="mt-1 text-sm text-[#647266]">
                      {file.content_type} • {(file.file_size / 1024 / 1024).toFixed(2)} MB • {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void openDownload(file)}
                    className="rounded-full bg-[#183b2b] px-5 py-2.5 text-sm font-bold text-white"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
