import { Link } from "react-router-dom";
import { DataTable, EmptyRow, PageHeader, StatusPill } from "../../components/ui";
import { formatTimestamp, greeting } from "../../lib/format";
import { useRecords } from "../../state/records";
import { INSTITUTION_NAME } from "../../types";

export function DashboardPage() {
  const { session, students, certificates, logs, studentById } = useRecords();
  const issued = certificates.filter((item) => item.status === "ISSUED").length;
  const revoked = certificates.filter((item) => item.status === "REVOKED").length;
  const drafts = certificates.filter((item) => item.status === "DRAFT").length;
  const verifiedLookups = logs.filter((item) => item.result === "VERIFIED").length;

  const stats = [
    { label: "Students", value: students.length },
    { label: "Issued", value: issued },
    { label: "Drafts", value: drafts },
    { label: "Revoked", value: revoked },
    { label: "Verified lookups", value: verifiedLookups },
  ];

  return (
    <div>
      <PageHeader
        eyebrow={INSTITUTION_NAME}
        title={greeting()}
        lede={`${session?.name ?? "Admin"}, the registry is ready. Issue a credential, then open its public page to check the hash and local anchor.`}
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat, index) => (
          <div key={stat.label} className="panel relative overflow-hidden px-4 py-5">
            <span className={`absolute inset-x-0 top-0 h-1 ${index % 2 === 0 ? "bg-seal" : "bg-brass"}`} />
            <p className="font-serif text-4xl leading-none">{stat.value}</p>
            <p className="mt-2 text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-8 xl:grid-cols-[1.4fr_0.8fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-2xl">Recent certificates</h2>
            <Link to="/certificates" className="text-sm text-seal">
              View all
            </Link>
          </div>
          <DataTable headers={["Certificate", "Student", "Credential", "Status"]}>
            {certificates.slice(0, 5).map((certificate) => (
              <tr key={certificate.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <Link to={`/certificates/${certificate.id}`} className="font-medium text-seal">
                    {certificate.id}
                  </Link>
                </td>
                <td className="px-4 py-3">{studentById(certificate.studentId)?.name ?? "—"}</td>
                <td className="px-4 py-3">{certificate.degree}</td>
                <td className="px-4 py-3">
                  <StatusPill status={certificate.status} />
                </td>
              </tr>
            ))}
            {certificates.length === 0 ? (
              <EmptyRow colSpan={4}>No certificates yet.</EmptyRow>
            ) : null}
          </DataTable>
        </section>
        <section>
          <h2 className="mb-3 font-serif text-2xl">Latest checks</h2>
          <ul className="panel overflow-hidden">
            {logs.slice(0, 5).map((log) => (
              <li key={log.id} className="border-b border-line px-4 py-3 last:border-0">
                <div className="flex items-center justify-between gap-3">
                  <Link to={`/verify/${log.certificateId}`} className="text-sm font-medium text-seal">
                    {log.certificateId}
                  </Link>
                  <StatusPill status={log.result} />
                </div>
                <p className="mt-1 text-xs text-muted">
                  {log.verificationType === "QR_LOOKUP" ? "Public lookup" : "Document check"} ·{" "}
                  {formatTimestamp(log.verifiedAt)}
                </p>
              </li>
            ))}
            {logs.length === 0 ? <li className="px-4 py-8 text-sm text-muted">No checks yet.</li> : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
