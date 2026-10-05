export function formatIssueDate(isoDate: string): string {
  if (!isoDate) return "—";
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTimestamp(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function greeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function verificationPath(certificateId: string): string {
  return `/verify/${certificateId}`;
}

export function chainSummary(status?: string, tx?: string, network?: string): string {
  if (status === "ANCHORED" && tx?.startsWith("0x")) {
    const where = network === "sepolia" ? "Sepolia" : "the local chain";
    return `Anchored on ${where}. Transaction ${tx}.`;
  }
  if (status === "ANCHORED_LOCALLY" || tx?.startsWith("local-")) {
    return `Local anchor ${tx}. The chain node has not confirmed this record yet.`;
  }
  return "Not anchored yet.";
}
