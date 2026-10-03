import { INSTITUTION_NAME } from "../types";

export function canonicalRecord(input: {
  certificateId: string;
  studentName: string;
  degree: string;
  issueDate: string;
  grade: string;
}): string {
  return [
    input.certificateId,
    input.studentName,
    input.degree,
    input.issueDate,
    input.grade,
    INSTITUTION_NAME,
  ].join("|");
}

export async function sha256Hex(value: string | ArrayBuffer): Promise<string> {
  const data = typeof value === "string" ? new TextEncoder().encode(value) : value;
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function shortHash(hash: string): string {
  if (hash.length < 20) return hash;
  return `${hash.slice(0, 12)}…${hash.slice(-8)}`;
}
