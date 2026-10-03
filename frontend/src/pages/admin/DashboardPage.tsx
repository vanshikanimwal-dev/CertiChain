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
        lede={`${session?.name ?? "Admin"} can issue certificates here and check them on the public verification page. Blockchain registration comes after this console is in place.`}
      />
      <div className="grid grid-cols-2 gap-px bg-line md:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white px-4 py-5">
            <p className="font-serif text-3xl">{stat.value}</p>
            <p className="mt-1 text-xs tracking-[0.12em] text-muted uppercase">{stat.label}</p>
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
          <ul className="border border-line bg-white">
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
