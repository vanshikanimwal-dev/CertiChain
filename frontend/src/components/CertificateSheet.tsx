import { QRCodeSVG } from "qrcode.react";
import { formatIssueDate, verificationPath } from "../lib/format";
import { shortHash } from "../lib/hash";
import { INSTITUTION_NAME, type Certificate, type Student } from "../types";

export function CertificateSheet({
  certificate,
  student,
  showQr = false,
}: {
  certificate: Certificate;
  student: Student | undefined;
  showQr?: boolean;
}) {
  const verifyUrl = `${window.location.origin}${verificationPath(certificate.id)}`;

  return (
    <article className="border border-line bg-white px-6 py-8 sm:px-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">{INSTITUTION_NAME}</p>
          <h2 className="mt-3 font-serif text-3xl text-ink">{certificate.certificateType} certificate</h2>
        </div>
        <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-full border border-seal text-xs font-semibold tracking-wide text-seal sm:flex">
          CC
        </div>
      </div>
      <p className="mt-8 text-sm text-muted">This record certifies that</p>
      <p className="mt-1 font-serif text-3xl text-ink">{student?.name ?? "Unknown student"}</p>
      <p className="mt-4 max-w-md text-sm leading-6 text-ink">
        has completed <span className="font-semibold">{certificate.degree || "—"}</span> in the{" "}
        {certificate.department || "—"} department.
      </p>
      <dl className="mt-8 grid gap-4 border-t border-line pt-6 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs tracking-[0.12em] text-muted uppercase">Certificate ID</dt>
          <dd className="mt-1 font-medium">{certificate.id}</dd>
        </div>
        <div>
          <dt className="text-xs tracking-[0.12em] text-muted uppercase">Issue date</dt>
          <dd className="mt-1 font-medium">{formatIssueDate(certificate.issueDate)}</dd>
        </div>
        <div>
          <dt className="text-xs tracking-[0.12em] text-muted uppercase">Grade</dt>
          <dd className="mt-1 font-medium">{certificate.grade || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs tracking-[0.12em] text-muted uppercase">Student number</dt>
          <dd className="mt-1 font-medium">{student?.studentNumber ?? "—"}</dd>
        </div>
      </dl>
      {certificate.documentHash ? (
        <p className="mt-6 text-xs leading-5 text-muted">
          Integrity hash {shortHash(certificate.documentHash)}
        </p>
      ) : (
        <p className="mt-6 text-xs leading-5 text-muted">The integrity hash is written when this certificate is issued.</p>
      )}
      {showQr && certificate.status === "ISSUED" ? (
        <div className="mt-6 flex items-center gap-4 border-t border-line pt-6">
          <QRCodeSVG value={verifyUrl} size={96} bgColor="#ffffff" fgColor="#141c27" />
          <div>
            <p className="text-sm font-medium">Scan to verify</p>
            <p className="mt-1 max-w-xs text-xs leading-5 break-all text-muted">{verifyUrl}</p>
          </div>
        </div>
      ) : null}
    </article>
  );
}
