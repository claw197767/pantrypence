"use client";

import { useEffect, useState } from "react";

type AdminFile = { id: string; owner_id: string; uploaded_by_email: string; original_filename: string; content_type: string; file_size: number; created_at: string };
type Member = { id: string; email: string };

export default function AdminFilesList() {
  const [files, setFiles] = useState<AdminFile[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberId, setMemberId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState("Loading files…");
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    void fetch("/api/files", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Unable to load files.");
        setFiles(data.files ?? []);
        setMessage(data.files?.length ? "" : "No uploaded files.");
      })
      .catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Unable to load files."));

    void fetch("/api/admin/members", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Unable to load members.");
        const loadedMembers: Member[] = data.members ?? [];
        setMembers(loadedMembers);
        setMemberId(loadedMembers[0]?.id ?? "");
      })
      .catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Unable to load members."))
      .finally(() => setLoadingMembers(false));
  }, []);

  async function uploadForMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!memberId || !selectedFile) {
      setMessage("Choose an active member and a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("owner_id", memberId);
    setUploading(true);
    setMessage("Uploading member file…");

    try {
      const response = await fetch("/api/files", { method: "POST", body: formData });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data.error ?? "Unable to upload member file.");
        return;
      }

      setSelectedFile(null);
      setMessage("File uploaded for the selected member.");
      const filesResponse = await fetch("/api/files", { cache: "no-store" });
      const filesData = await filesResponse.json();
      if (filesResponse.ok) setFiles(filesData.files ?? []);
    } catch {
      setMessage("Unable to upload member file.");
    } finally {
      setUploading(false);
    }
  }

  async function download(file: AdminFile) {
    const response = await fetch(`/api/files?id=${encodeURIComponent(file.id)}`, { cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.file?.signed_url) {
      setMessage(data.error ?? "Could not create a secure download link.");
      return;
    }
    window.open(data.file.signed_url, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="min-h-screen shimmer-surface bg-[#0a1f14] px-6 py-16 text-[#f4f1ea]">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d6b36a]">Administrator</p>
        <h1 className="mt-3 text-4xl font-semibold">Member documents</h1>
        <p className="mt-3 text-[#b3b5bb]">Private customer files. Handle and download only when required to provide the service.</p>
        <form onSubmit={uploadForMember} className="mt-8 grid gap-4 rounded-3xl border border-white/10 bg-[#12311f] p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="text-sm font-semibold">
            Active member
            <select
              value={memberId}
              onChange={(event) => setMemberId(event.target.value)}
              disabled={loadingMembers || members.length === 0}
              className="mt-2 block w-full rounded-xl border border-white/15 bg-[#0a1f14] px-4 py-3 text-white"
            >
              {members.length === 0 ? <option value="">No active members</option> : null}
              {members.map((member) => (
                <option key={member.id} value={member.id}>{member.email}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Report or file
            <input
              type="file"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              className="mt-2 block w-full rounded-xl border border-white/15 bg-[#0a1f14] px-3 py-2.5 text-sm text-white"
            />
          </label>
          <button
            type="submit"
            disabled={uploading || loadingMembers || !memberId || !selectedFile}
            className="rounded-full bg-[#d6b36a] px-6 py-3 font-bold text-[#171717] disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Share file"}
          </button>
        </form>
        {message ? <p role="status" className="mt-6 text-sm text-[#e2c681]">{message}</p> : null}
        <div className="mt-8 space-y-3">
          {files.map((file) => (
            <article key={file.id} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#12311f] p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold">{file.original_filename}</h2>
                <p className="mt-1 text-sm text-[#aeb1b8]">Account: {file.owner_id} · Uploaded by: {file.uploaded_by_email}</p>
                <p className="mt-1 text-xs text-[#858991]">{file.content_type} · {(file.file_size / 1024 / 1024).toFixed(2)} MB · {new Date(file.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => void download(file)} className="rounded-full bg-[#d6b36a] px-5 py-2.5 text-sm font-bold text-[#171717]">Secure download</button>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
