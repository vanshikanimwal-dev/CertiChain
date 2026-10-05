import { Link } from "react-router-dom";
import { DataTable, EmptyRow, PageHeader, StatusPill } from "../../components/ui";
import { formatTimestamp } from "../../lib/format";
import { useRecords } from "../../state/records";

export function HistoryPage() {
  const { logs } = useRecords();

  return (
    <div>
      <PageHeader
        title="Verification log"
        lede="Every public lookup and document check is kept here, so you can see what an employer opened."
      />
      <DataTable headers={["When", "Certificate", "Check", "Result"]}>
        {logs.map((log) => (
          <tr key={log.id} className="border-b border-line last:border-0">
            <td className="px-4 py-3">{formatTimestamp(log.verifiedAt)}</td>
            <td className="px-4 py-3">
              <Link to={`/certificates/${log.certificateId}`} className="font-medium text-seal">
                {log.certificateId}
              </Link>
            </td>
            <td className="px-4 py-3">{log.verificationType === "QR_LOOKUP" ? "Public lookup" : "Document check"}</td>
            <td className="px-4 py-3">
              <StatusPill status={log.result} />
            </td>
          </tr>
        ))}
        {logs.length === 0 ? <EmptyRow colSpan={4}>No verification activity yet.</EmptyRow> : null}
      </DataTable>
    </div>
  );
}
