import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, DataTable, EmptyRow, PageHeader, StatusPill, TextInput } from "../../components/ui";
import { formatIssueDate } from "../../lib/format";
import { useRecords } from "../../state/records";
import type { CertificateStatus } from "../../types";

const filters: Array<CertificateStatus | "ALL"> = ["ALL", "ISSUED", "DRAFT", "REVOKED"];

export function CertificatesPage() {
  const { certificates, studentById } = useRecords();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("ALL");

  const visible = certificates.filter((certificate) => {
    const student = studentById(certificate.studentId);
    const haystack = `${certificate.id} ${certificate.degree} ${student?.name ?? ""}`.toLowerCase();
    const matchesQuery = haystack.includes(query.trim().toLowerCase());
    const matchesFilter = filter === "ALL" || certificate.status === filter;
    return matchesQuery && matchesFilter;
  });

  return (
    <div>
      <PageHeader
        title="Certificates"
        lede="Draft a credential, issue it, and open the public page an employer would see."
        action={
          <Link to="/certificates/new">
            <Button type="button">New certificate</Button>
          </Link>
        }
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-sm flex-1">
          <TextInput
            placeholder="Search ID, student, or credential"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search certificates"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`px-3 py-1.5 text-xs font-medium tracking-wide ${
                filter === item ? "bg-navy text-paper" : "border border-line bg-white text-muted"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <DataTable headers={["Certificate", "Student", "Credential", "Issued", "Status"]}>
        {visible.map((certificate) => (
          <tr key={certificate.id} className="border-b border-line last:border-0">
            <td className="px-4 py-3">
              <Link to={`/certificates/${certificate.id}`} className="font-medium text-seal">
                {certificate.id}
              </Link>
            </td>
            <td className="px-4 py-3">{studentById(certificate.studentId)?.name ?? "—"}</td>
            <td className="px-4 py-3">{certificate.degree}</td>
            <td className="px-4 py-3">{formatIssueDate(certificate.issueDate)}</td>
            <td className="px-4 py-3">
              <StatusPill status={certificate.status} />
            </td>
          </tr>
        ))}
        {visible.length === 0 ? <EmptyRow colSpan={5}>No certificates match that filter.</EmptyRow> : null}
      </DataTable>
    </div>
  );
}
