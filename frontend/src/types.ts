export const INSTITUTION_NAME = "Demo University";

export const DEMO_ADMIN = {
  name: "Institution Admin",
  email: "admin@demouniversity.edu",
  password: "certichain",
  role: "INSTITUTION_ADMIN",
} as const;

export type Session = {
  name: string;
  email: string;
  role: "INSTITUTION_ADMIN";
};

export type Student = {
  id: string;
  name: string;
  studentNumber: string;
  department: string;
  course: string;
  graduationYear: number;
};

export type CertificateStatus = "DRAFT" | "ISSUED" | "REVOKED";

export type Certificate = {
  id: string;
  studentId: string;
  certificateType: string;
  degree: string;
  department: string;
  issueDate: string;
  grade: string;
  status: CertificateStatus;
  documentHash: string;
  revokedReason: string;
};

export type VerificationResult = "VERIFIED" | "REVOKED" | "HASH_MISMATCH" | "NOT_FOUND";

export type VerificationType = "QR_LOOKUP" | "DOCUMENT_CHECK";

export type VerificationLog = {
  id: string;
  certificateId: string;
  result: VerificationResult;
  verificationType: VerificationType;
  verifiedAt: string;
};

export type RecordsState = {
  students: Student[];
  certificates: Certificate[];
  logs: VerificationLog[];
};
