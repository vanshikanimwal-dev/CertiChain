import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, StatusPill } from "../../components/ui";
import { formatIssueDate } from "../../lib/format";
import { canonicalRecord, sha256Hex, shortHash } from "../../lib/hash";
import { useRecords } from "../../state/records";
import { INSTITUTION_NAME, type VerificationResult } from "../../types";

export function VerifyPage() {
  const { certificateId = "" } = useParams();
  const { certificateById, studentById, addLog } = useRecords();
  const certificate = certificateById(certificateId);
  const student = certificate ? studentById(certificate.studentId) : undefined;
  const [fileName, setFileName] = useState("");
  const [fileHash, setFileHash] = useState("");
  const [fileResult, setFileResult] = useState<VerificationResult | "">("");

  const publicResult: VerificationResult = !certificate
    ? "NOT_FOUND"
    : certificate.status === "REVOKED"
      ? "REVOKED"
      : certificate.status === "ISSUED"
        ? "VERIFIED"
        : "NOT_FOUND";

  useEffect(() => {
    const key = `certichain.viewed.${certificateId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    addLog({
      certificateId,
      result: publicResult,
      verificationType: "QR_LOOKUP",
    });
  }, [addLog, certificateId, publicResult]);

  async function checkFile(file: File) {
    const bytes = await file.arrayBuffer();
    const hash = await sha256Hex(bytes);
    setFileName(file.name);
    setFileHash(hash);
    const matches = Boolean(certificate?.documentHash) && hash === certificate?.documentHash;
    const result: VerificationResult = matches ? "VERIFIED" : "HASH_MISMATCH";
    setFileResult(result);
    addLog({ certificateId, result, verificationType: "DOCUMENT_CHECK" });
  }

  function downloadRecord() {
    if (!certificate || !student) return;
    const payload = canonicalRecord({
      certificateId: certificate.id,
      studentName: student.name,
      degree: certificate.degree,
      issueDate: certificate.issueDate,
      grade: certificate.grade,
    });
    const blob = new Blob([payload], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${certificate.id}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const headline =
    publicResult === "VERIFIED"
      ? "Verified"
      : publicResult === "REVOKED"
        ? "Revoked"
        : "Not found";

  const explanation =
    publicResult === "VERIFIED"
      ? "This certificate matches the record issued by the institution."
      : publicResult === "REVOKED"
        ? "The institution withdrew this certificate. It should not be treated as valid."
        : "No issued certificate uses this ID.";

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
          <StatusPill status={publicResult} />
        </div>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">{explanation}</p>

        {certificate && student && certificate.status !== "DRAFT" ? (
          <section className="mt-8 border border-line bg-white px-6 py-6">
            <dl className="grid gap-5 sm:grid-cols-2">
              <Field label="Certificate ID" value={certificate.id} />
              <Field label="Student" value={student.name} />
              <Field label="Institution" value={INSTITUTION_NAME} />
              <Field label="Credential" value={certificate.degree} />
              <Field label="Issue date" value={formatIssueDate(certificate.issueDate)} />
              <Field label="Document integrity" value={certificate.documentHash ? "Hash on record" : "Missing hash"} />
            </dl>
            <p className="mt-6 font-mono text-xs break-all text-muted">{certificate.documentHash}</p>
            {certificate.status === "REVOKED" ? (
              <p className="mt-4 text-sm text-[#8c2f2f]">Reason: {certificate.revokedReason}</p>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-6">
              <Button type="button" variant="secondary" onClick={downloadRecord}>
                Download issued record
              </Button>
              <label className="inline-flex cursor-pointer items-center border border-line bg-white px-3.5 py-2 text-sm font-medium">
                Check a file
                <input
                  className="sr-only"
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void checkFile(file);
                  }}
                />
              </label>
            </div>
            {fileResult ? (
              <div className="mt-4 text-sm">
                <p className="font-medium">
                  {fileName}: {fileResult === "VERIFIED" ? "hash matches" : "hash mismatch"}
                </p>
                <p className="mt-1 text-muted">
                  File {shortHash(fileHash)} · Record {shortHash(certificate.documentHash)}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-xs leading-5 text-muted">
                Download the issued record and upload that same file to see a match. Any other file produces a hash mismatch.
              </p>
            )}
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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs tracking-[0.12em] text-muted uppercase">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}
