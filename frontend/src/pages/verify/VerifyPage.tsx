import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_BASE } from "../../api/client";
import { Button, LogoMark, StatusPill } from "../../components/ui";
import { chainSummary, formatIssueDate } from "../../lib/format";
import { shortHash } from "../../lib/hash";
import { INSTITUTION_NAME, type VerificationResult } from "../../types";

type PublicRecord = {
  certificateId: string;
  status: VerificationResult;
  studentName: string;
  studentNumber: string;
  degree: string;
  department: string;
  issueDate: string;
  grade: string;
  institution: string;
  documentHash: string;
  revokedReason: string;
  chainStatus: string;
  chainTxHash: string;
  chainNetwork: string;
};

type FieldScan = {
  field: string;
  expected: string;
  found: string;
  match: boolean;
};

export function VerifyPage() {
  const { certificateId = "" } = useParams();
  const [record, setRecord] = useState<PublicRecord | null>(null);
  const [loadError, setLoadError] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileHash, setFileHash] = useState("");
  const [fileResult, setFileResult] = useState<VerificationResult | "">("");
  const [scanNote, setScanNote] = useState("");
  const [fields, setFields] = useState<FieldScan[]>([]);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setRecord(null);
    setLoadError("");
    setFileName("");
    setFileHash("");
    setFileResult("");
    setScanNote("");
    setFields([]);
    setActionError("");
    fetch(`${API_BASE}/api/public/verify/${certificateId}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("The verification service did not respond.");
        return (await response.json()) as PublicRecord;
      })
      .then((next) => {
        if (!cancelled) setRecord(next);
      })
      .catch((caught: unknown) => {
        if (!cancelled) setLoadError(caught instanceof Error ? caught.message : "Verification failed.");
      });
    return () => {
      cancelled = true;
    };
  }, [certificateId]);

  async function postFile(path: string, file: File) {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch(`${API_BASE}${path}`, { method: "POST", body });
    if (!response.ok) {
      const problem = (await response.json().catch(() => null)) as { detail?: string } | null;
      throw new Error(problem?.detail || "The file could not be checked.");
    }
    return response.json();
  }

  async function checkFile(file: File) {
    setActionError("");
    try {
      const result = (await postFile(`/api/public/verify/${certificateId}/check-file`, file)) as {
        result: VerificationResult;
        fileHash: string;
        documentHash: string;
      };
      setFileName(file.name);
      setFileHash(result.fileHash);
      setFileResult(result.result);
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "The file could not be checked.");
    }
  }

  async function scanFile(file: File) {
    setActionError("");
    try {
      const result = (await postFile(`/api/public/verify/${certificateId}/scan`, file)) as {
        note: string;
        fields: FieldScan[];
      };
      setScanNote(result.note);
      setFields(result.fields);
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "The file could not be scanned.");
    }
  }

  async function downloadRecord() {
    if (!record || record.status === "NOT_FOUND") return;
    setActionError("");
    const response = await fetch(`${API_BASE}/api/public/verify/${record.certificateId}/document`);
    if (!response.ok) {
      setActionError("The issued PDF could not be downloaded.");
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${record.certificateId}.pdf`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const waiting = !record && !loadError;
  const publicResult = record?.status ?? "NOT_FOUND";
  const headline = waiting
    ? "Checking"
    : publicResult === "VERIFIED"
      ? "Verified"
      : publicResult === "REVOKED"
        ? "Revoked"
        : loadError
          ? "Unavailable"
          : "Not found";
  const explanation = loadError
    ? loadError
    : publicResult === "VERIFIED"
      ? "This certificate matches the record issued by the institution."
      : publicResult === "REVOKED"
        ? "The institution withdrew this certificate. It should not be treated as valid."
        : waiting
          ? "Looking up the certificate."
          : "No issued certificate uses this ID.";
  const banner =
    publicResult === "VERIFIED" && record
      ? "bg-seal text-white"
      : publicResult === "REVOKED" && record
        ? "bg-[#8c2f2f] text-white"
        : "bg-navy text-paper";

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-line/80 bg-white/70 px-4 py-4 backdrop-blur sm:px-8">
        <div className="flex items-center gap-3">
          <LogoMark className="h-11 w-11" />
          <p className="font-serif text-2xl text-ink">CertiChain</p>
        </div>
        <p className="hidden text-[11px] font-semibold tracking-[0.16em] text-muted uppercase sm:block">Public verification</p>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <section className="panel overflow-hidden">
          <div className={`px-6 py-8 sm:px-8 ${banner}`}>
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase opacity-75">Certificate verification</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="font-serif text-4xl leading-[1.05] sm:text-6xl">{headline}</h1>
              {record ? <StatusPill status={publicResult} /> : null}
            </div>
            <p className="mt-4 max-w-xl text-sm leading-6 opacity-85">{explanation}</p>
          </div>

        {record && publicResult !== "NOT_FOUND" ? (
          <div className="px-6 py-6 sm:px-8">
            <dl className="grid gap-5 sm:grid-cols-2">
              <Field label="Certificate ID" value={record.certificateId} />
              <Field label="Student" value={record.studentName} />
              <Field label="Institution" value={record.institution || INSTITUTION_NAME} />
              <Field label="Credential" value={record.degree} />
              <Field label="Issue date" value={formatIssueDate(record.issueDate)} />
              <Field label="Document integrity" value={record.documentHash ? "Hash on record" : "Missing hash"} />
            </dl>
            <p className="mt-6 font-mono text-xs break-all text-muted">{record.documentHash}</p>
            <p className="mt-3 text-sm text-muted">
              {chainSummary(record.chainStatus, record.chainTxHash, record.chainNetwork)}
            </p>
            {publicResult === "REVOKED" ? (
              <p className="mt-4 text-sm text-[#8c2f2f]">Reason: {record.revokedReason}</p>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-6">
              <Button type="button" variant="secondary" onClick={() => void downloadRecord()}>
                Download issued PDF
              </Button>
              <FileButton label="Check a file" onFile={(file) => void checkFile(file)} />
              <FileButton label="Scan fields" onFile={(file) => void scanFile(file)} />
            </div>
            {actionError ? <p className="mt-4 text-sm text-[#8c2f2f]">{actionError}</p> : null}
            {fileResult ? (
              <div className="mt-4 text-sm">
                <p className="font-medium">
                  {fileName}: {fileMessage(fileResult)}
                </p>
                <p className="mt-1 text-muted">File fingerprint {shortHash(fileHash)}</p>
              </div>
            ) : (
              <p className="mt-4 text-xs leading-5 text-muted">
                Download the issued PDF and upload it here to confirm the file. A text record of the same certificate still matches the fingerprint.
              </p>
            )}
            {fields.length > 0 ? (
              <div className="mt-6 border-t border-line pt-4">
                <p className="text-sm font-medium">Document scan</p>
                <p className="mt-1 text-xs leading-5 text-muted">{scanNote}</p>
                <ul className="mt-3 space-y-2 text-sm">
                  {fields.map((field) => (
                    <li key={field.field} className="flex items-center justify-between gap-3">
                      <span>{field.field}</span>
                      <StatusPill status={field.match ? "VERIFIED" : "HASH_MISMATCH"} label={field.match ? "Match" : "Differs"} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="px-6 py-6 text-sm text-muted sm:px-8">Certificate ID {certificateId}</p>
        )}
        </section>
        <p className="mt-6 text-xs leading-5 text-muted">
          These records are synthetic. They are not official academic credentials.
        </p>
      </main>
    </div>
  );
}

function fileMessage(result: VerificationResult | "") {
  if (result === "VERIFIED") return "this file matches the issued certificate";
  if (result === "REVOKED") return "this file matches a certificate the institution has revoked";
  if (result === "NOT_FOUND") return "no issued certificate uses this ID";
  return "this file does not match the issued certificate";
}

function FileButton({ label, onFile }: { label: string; onFile: (file: File) => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:border-brass/50">
      {label}
      <input
        className="sr-only"
        type="file"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onFile(file);
        }}
      />
    </label>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs tracking-[0.12em] text-muted uppercase">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}
