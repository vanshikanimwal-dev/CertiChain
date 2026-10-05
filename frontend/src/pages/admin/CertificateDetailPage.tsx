import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { CertificateSheet } from "../../components/CertificateSheet";
import { Button, Field, PageHeader, StatusPill, TextArea } from "../../components/ui";
import { verificationPath } from "../../lib/format";
import { useRecords } from "../../state/records";

export function CertificateDetailPage() {
  const { certificateId = "" } = useParams();
  const { certificateById, studentById, revokeCertificate, saveCertificate } = useRecords();
  const certificate = certificateById(certificateId);
  const [reason, setReason] = useState("");
  const [revoking, setRevoking] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [error, setError] = useState("");

  if (!certificate) {
    return (
      <PageHeader
        title="Certificate not found"
        lede="That ID is not in the local preview records."
        action={
          <Link to="/certificates" className="text-sm text-seal">
            Back to certificates
          </Link>
        }
      />
    );
  }

  const student = studentById(certificate.studentId);

  async function issueDraft() {
    if (!certificate) return;
    setIssuing(true);
    setError("");
    try {
      await saveCertificate({ ...certificate, status: "ISSUED" });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The certificate could not be issued.");
    } finally {
      setIssuing(false);
    }
  }

  async function revoke(event: FormEvent) {
    event.preventDefault();
    if (!certificate) return;
    if (!reason.trim()) {
      setError("Add a short reason before revoking.");
      return;
    }
    try {
      await revokeCertificate(certificate.id, reason);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The certificate could not be revoked.");
      return;
    }
    setRevoking(false);
    setReason("");
    setError("");
  }

  return (
    <div>
      <PageHeader
        eyebrow={certificate.id}
        title={student?.name ?? "Certificate"}
        lede={certificate.degree}
        action={<StatusPill status={certificate.status} />}
      />
      <div className="mb-6 flex flex-wrap gap-3">
        <Link to="/certificates" className="text-sm text-seal">
          Back to certificates
        </Link>
        {certificate.status !== "DRAFT" ? (
          <Link to={verificationPath(certificate.id)} className="text-sm text-seal">
            Open public page
          </Link>
        ) : null}
      </div>
      <div className="grid items-start gap-8 xl:grid-cols-[1.1fr_0.8fr]">
        <CertificateSheet certificate={certificate} student={student} showQr />
        <aside className="space-y-4 border border-line bg-white p-4">
          <h2 className="font-serif text-2xl">Record</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs tracking-[0.12em] text-muted uppercase">Department</dt>
              <dd className="mt-1">{certificate.department}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.12em] text-muted uppercase">Integrity hash</dt>
              <dd className="mt-1 font-mono text-xs break-all">
                {certificate.documentHash || "Written when the certificate is issued."}
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.12em] text-muted uppercase">Blockchain</dt>
              <dd className="mt-1 text-sm">
                {certificate.chainStatus === "ANCHORED_LOCALLY"
                  ? `Local anchor ${certificate.chainTxHash}. Sepolia is not connected yet.`
                  : "Not anchored yet."}
              </dd>
            </div>
            {certificate.status === "REVOKED" ? (
              <div>
                <dt className="text-xs tracking-[0.12em] text-muted uppercase">Revocation reason</dt>
                <dd className="mt-1">{certificate.revokedReason}</dd>
              </div>
            ) : null}
          </dl>
          {error ? <p className="text-sm text-[#8c2f2f]">{error}</p> : null}
          {certificate.status === "DRAFT" ? (
            <Button type="button" onClick={issueDraft} disabled={issuing}>
              Issue certificate
            </Button>
          ) : null}
          {certificate.status === "ISSUED" ? (
            revoking ? (
              <form onSubmit={revoke} className="space-y-3">
                <Field label="Reason for revocation">
                  <TextArea value={reason} onChange={(event) => setReason(event.target.value)} required />
                </Field>
                <div className="flex gap-3">
                  <Button type="submit" variant="danger">
                    Confirm revoke
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setRevoking(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button type="button" variant="danger" onClick={() => setRevoking(true)}>
                Revoke certificate
              </Button>
            )
          ) : null}
        </aside>
      </div>
    </div>
  );
}
