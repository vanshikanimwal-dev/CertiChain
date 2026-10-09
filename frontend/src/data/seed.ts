import type { RecordsState } from "../types";

export function createSeed(): RecordsState {
  return {
    students: [
      {
        id: "stu-vanshika",
        name: "Vanshika Nimwal",
        studentNumber: "CC2022001",
        department: "Computer Science",
        course: "B.Tech Computer Science",
        graduationYear: 2026,
      },
      {
        id: "stu-arjun",
        name: "Arjun Mehta",
        studentNumber: "CC2022044",
        department: "Computer Science",
        course: "B.Tech Computer Science",
        graduationYear: 2026,
      },
      {
        id: "stu-meera",
        name: "Meera Iyer",
        studentNumber: "CC2022118",
        department: "Electronics",
        course: "B.Tech Electronics and Communication",
        graduationYear: 2026,
      },
    ],
    certificates: [
      {
        id: "CERT-2026-001245",
        studentId: "stu-vanshika",
        certificateType: "Degree",
        degree: "B.Tech Computer Science",
        department: "Computer Science",
        issueDate: "2026-09-30",
        grade: "8.2",
        status: "ISSUED",
        documentHash: "9c4a7f5fd5237c33a74cf22428e82470887398553b94fe7f154460c5640133b0",
        revokedReason: "",
      },
      {
        id: "CERT-2026-001188",
        studentId: "stu-arjun",
        certificateType: "Degree",
        degree: "B.Tech Computer Science",
        department: "Computer Science",
        issueDate: "2026-09-30",
        grade: "8.7",
        status: "ISSUED",
        documentHash: "7e27071e1b6c103cad10f7346cffac6b7890ddf7a67b4924010b59f3c0ecc65f",
        revokedReason: "",
      },
      {
        id: "CERT-2026-000902",
        studentId: "stu-meera",
        certificateType: "Degree",
        degree: "B.Tech Electronics and Communication",
        department: "Electronics",
        issueDate: "2026-06-12",
        grade: "7.9",
        status: "REVOKED",
        documentHash: "b766149cf1402fd1b208846cf5f019875a848a9d8454520c8981ed7659b2191f",
        revokedReason: "Issued against the wrong program.",
      },
    ],
    logs: [
      {
        id: "log-1",
        certificateId: "CERT-2026-001245",
        result: "VERIFIED",
        verificationType: "QR_LOOKUP",
        verifiedAt: "2026-10-02T08:40:00.000Z",
      },
      {
        id: "log-2",
        certificateId: "CERT-2026-001188",
        result: "VERIFIED",
        verificationType: "QR_LOOKUP",
        verifiedAt: "2026-10-02T11:15:00.000Z",
      },
      {
        id: "log-3",
        certificateId: "CERT-2026-000902",
        result: "REVOKED",
        verificationType: "QR_LOOKUP",
        verifiedAt: "2026-10-03T04:05:00.000Z",
      },
    ],
  };
}
