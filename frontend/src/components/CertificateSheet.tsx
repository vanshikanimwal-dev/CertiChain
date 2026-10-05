import { QRCodeSVG } from "qrcode.react";
import { LogoMark } from "./ui";
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
    <article className="panel bg-[linear-gradient(180deg,#fffdf8,#ffffff_28%)] p-3 sm:p-4">
      <div className="border border-brass/45 px-6 py-8 sm:px-10">
      <div className="flex items-start justify-between gap-6 border-b border-line pb-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-brass uppercase">{INSTITUTION_NAME}</p>
          <h2 className="mt-3 font-serif text-3xl text-ink">{certificate.certificateType} certificate</h2>
        </div>
        <LogoMark className="hidden h-16 w-16 shrink-0 sm:block" />
      </div>
      <p className="mt-8 text-sm text-muted">This record certifies that</p>
      <p className="mt-1 font-serif text-4xl leading-tight text-ink">{student?.name ?? "Unknown student"}</p>
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
          <div className="rounded-xl bg-white p-2 shadow-sm ring-1 ring-line">
            <QRCodeSVG value={verifyUrl} size={96} bgColor="#ffffff" fgColor="#121922" />
          </div>
          <div>
            <p className="text-sm font-semibold">Scan to verify</p>
            <p className="mt-1 max-w-xs text-xs leading-5 break-all text-muted">{verifyUrl}</p>
          </div>
        </div>
      ) : null}
      </div>
    </article>
  );
}
