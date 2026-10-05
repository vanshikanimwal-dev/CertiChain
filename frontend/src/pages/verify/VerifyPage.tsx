import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_BASE } from "../../api/client";
import { Button, StatusPill } from "../../components/ui";
import { formatIssueDate } from "../../lib/format";
import { canonicalRecord, shortHash } from "../../lib/hash";
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

  useEffect(() => {
    let cancelled = false;
    setRecord(null);
    setLoadError("");
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
    const result = (await postFile(`/api/public/verify/${certificateId}/check-file`, file)) as {
      result: VerificationResult;
      fileHash: string;
      documentHash: string;
    };
    setFileName(file.name);
    setFileHash(result.fileHash);
    setFileResult(result.result);
  }

  async function scanFile(file: File) {
    const result = (await postFile(`/api/public/verify/${certificateId}/scan`, file)) as {
      note: string;
      fields: FieldScan[];
    };
    setScanNote(result.note);
    setFields(result.fields);
  }

  function downloadRecord() {
    if (!record || record.status === "NOT_FOUND") return;
    const payload = canonicalRecord({
      certificateId: record.certificateId,
      studentName: record.studentName,
      degree: record.degree,
      issueDate: record.issueDate,
      grade: record.grade,
    });
    const blob = new Blob([payload], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${record.certificateId}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const publicResult = record?.status ?? "NOT_FOUND";
  const headline =
    publicResult === "VERIFIED" ? "Verified" : publicResult === "REVOKED" ? "Revoked" : loadError ? "Unavailable" : "Not found";
  const explanation = loadError
    ? loadError
    : publicResult === "VERIFIED"
      ? "This certificate matches the record issued by the institution."
      : publicResult === "REVOKED"
        ? "The institution withdrew this certificate. It should not be treated as valid."
        : record
          ? "No issued certificate uses this ID."
          : "Looking up the certificate.";

  return (
    <div className="min-h-screen bg-paper">
      <header className="flex items-center justify-between border-b border-line px-4 py-4 sm:px-8">
        <p className="font-serif text-2xl text-ink">CertiChain</p>
        <p className="text-xs tracking-[0.14em] text-muted uppercase">Public verification</p>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="text-xs font-medium tracking-[0.16em] text-muted uppercase">Certificate verification</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-5xl">{headline}</h1>
          {record ? <StatusPill status={publicResult} /> : null}
        </div>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">{explanation}</p>

        {record && publicResult !== "NOT_FOUND" ? (
          <section className="mt-8 border border-line bg-white px-6 py-6">
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
              {record.chainStatus === "ANCHORED_LOCALLY"
                ? `Local blockchain anchor ${record.chainTxHash}. Ethereum Sepolia is not connected yet.`
                : "This record is not anchored yet."}
            </p>
            {publicResult === "REVOKED" ? (
              <p className="mt-4 text-sm text-[#8c2f2f]">Reason: {record.revokedReason}</p>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-6">
              <Button type="button" variant="secondary" onClick={downloadRecord}>
                Download issued record
              </Button>
              <FileButton label="Check a file" onFile={(file) => void checkFile(file)} />
              <FileButton label="Scan fields" onFile={(file) => void scanFile(file)} />
            </div>
            {fileResult ? (
              <div className="mt-4 text-sm">
                <p className="font-medium">
                  {fileName}: {fileResult === "VERIFIED" ? "hash matches" : "hash mismatch"}
                </p>
                <p className="mt-1 text-muted">
                  File {shortHash(fileHash)} · Record {shortHash(record.documentHash)}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-xs leading-5 text-muted">
                Download the issued record and upload that same file to see a match. Any other file produces a hash mismatch.
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
                      <StatusPill status={field.match ? "VERIFIED" : "HASH_MISMATCH"} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : (
          <p className="mt-8 text-sm text-muted">Certificate ID {certificateId}</p>
        )}
        <p className="mt-8 text-xs leading-5 text-muted">
          These are synthetic demonstration records for {INSTITUTION_NAME}. They are not official academic credentials.
        </p>
      </main>
    </div>
  );
}

function FileButton({ label, onFile }: { label: string; onFile: (file: File) => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center border border-line bg-white px-3.5 py-2 text-sm font-medium">
      {label}
      <input
        className="sr-only"
        type="file"
        onChange={(event) => {
          const file = event.target.files?.[0];
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
