import type { RecordsState } from "../types";

export function createSeed(): RecordsState {
  return {
    students: [
      {
        id: "stu-vanshika",
        name: "Vanshika Nimwal",
        studentNumber: "DU2022001",
        department: "Computer Science",
        course: "B.Tech Computer Science",
        graduationYear: 2026,
      },
      {
        id: "stu-arjun",
        name: "Arjun Mehta",
        studentNumber: "DU2022044",
        department: "Computer Science",
        course: "B.Tech Computer Science",
        graduationYear: 2026,
      },
      {
        id: "stu-meera",
        name: "Meera Iyer",
        studentNumber: "DU2022118",
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
        documentHash: "0290186015a2878d7a27ccd0e04ce28d281f77a05c401f9ca0d70522e81ebb24",
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
        documentHash: "698db744358275c7c15e1cf06f7900e2d2bf374427c2118a276ae28a0946b054",
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
        documentHash: "54ef3be2c656a06135c78e0cc414ba140f6e563d39b7b0645114ed5098e45d7b",
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
