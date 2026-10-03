import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { createSeed } from "../data/seed";
import { canonicalRecord, sha256Hex } from "../lib/hash";
import {
  DEMO_ADMIN,
  type Certificate,
  type RecordsState,
  type Session,
  type Student,
  type VerificationLog,
} from "../types";

const RECORDS_KEY = "certichain.records.v1";
const SESSION_KEY = "certichain.session.v1";

type Action =
  | { type: "add-student"; student: Student }
  | { type: "save-certificate"; certificate: Certificate }
  | { type: "log"; entry: Omit<VerificationLog, "id" | "verifiedAt"> }
  | { type: "reset" };

function reducer(state: RecordsState, action: Action): RecordsState {
  switch (action.type) {
    case "add-student":
      return { ...state, students: [action.student, ...state.students] };
    case "save-certificate":
      return {
        ...state,
        certificates: [
          action.certificate,
          ...state.certificates.filter((item) => item.id !== action.certificate.id),
        ],
      };
    case "log":
      return {
        ...state,
        logs: [
          {
            ...action.entry,
            id: crypto.randomUUID(),
            verifiedAt: new Date().toISOString(),
          },
          ...state.logs,
        ],
      };
    case "reset":
      return createSeed();
  }
}

function loadRecords(): RecordsState {
  const raw = localStorage.getItem(RECORDS_KEY);
  if (!raw) return createSeed();
  try {
    return JSON.parse(raw) as RecordsState;
  } catch {
    return createSeed();
  }
}

function loadSession(): Session | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

type CertificateInput = {
  id?: string;
  studentId: string;
  certificateType: string;
  degree: string;
  department: string;
  issueDate: string;
  grade: string;
  status: "DRAFT" | "ISSUED";
};

type RecordsContextValue = {
  students: Student[];
  certificates: Certificate[];
  logs: VerificationLog[];
  session: Session | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addStudent: (input: Omit<Student, "id">) => Student;
  saveCertificate: (input: CertificateInput) => Promise<Certificate>;
  revokeCertificate: (id: string, reason: string) => void;
  addLog: (entry: Omit<VerificationLog, "id" | "verifiedAt">) => void;
  resetDemo: () => void;
  studentById: (id: string) => Student | undefined;
  certificateById: (id: string) => Certificate | undefined;
};

const RecordsContext = createContext<RecordsContextValue | null>(null);

function nextCertificateId(existing: Certificate[]): string {
  const year = new Date().getFullYear();
  let id = "";
  do {
    const suffix = String(Math.floor(100000 + Math.random() * 900000));
    id = `CERT-${year}-${suffix}`;
  } while (existing.some((item) => item.id === id));
  return id;
}

export function RecordsProvider({ children }: { children: ReactNode }) {
  const [records, dispatch] = useReducer(reducer, undefined, loadRecords);
  const [session, setSession] = useState<Session | null>(loadSession);

  useEffect(() => {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  }, [session]);

  const login = useCallback((email: string, password: string) => {
    const matches =
      email.trim().toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password;
    if (!matches) return false;
    setSession({ name: DEMO_ADMIN.name, email: DEMO_ADMIN.email, role: DEMO_ADMIN.role });
    return true;
  }, []);

  const logout = useCallback(() => setSession(null), []);

  const addStudent = useCallback((input: Omit<Student, "id">) => {
    const student: Student = { ...input, id: `stu-${crypto.randomUUID().slice(0, 8)}` };
    dispatch({ type: "add-student", student });
    return student;
  }, []);

  const saveCertificate = useCallback(
    async (input: CertificateInput) => {
      const student = records.students.find((item) => item.id === input.studentId);
      if (!student) throw new Error("Select a student before saving the certificate.");
      const id = input.id ?? nextCertificateId(records.certificates);
      const existing = records.certificates.find((item) => item.id === id);
      const documentHash =
        input.status === "ISSUED"
          ? await sha256Hex(
              canonicalRecord({
                certificateId: id,
                studentName: student.name,
                degree: input.degree.trim(),
                issueDate: input.issueDate,
                grade: input.grade.trim(),
              }),
            )
          : "";
      const certificate: Certificate = {
        id,
        studentId: input.studentId,
        certificateType: input.certificateType,
        degree: input.degree.trim(),
        department: input.department.trim(),
        issueDate: input.issueDate,
        grade: input.grade.trim(),
        status: input.status,
        documentHash,
        revokedReason: existing?.revokedReason ?? "",
      };
      dispatch({ type: "save-certificate", certificate });
      return certificate;
    },
    [records.certificates, records.students],
  );

  const revokeCertificate = useCallback((id: string, reason: string) => {
    const current = records.certificates.find((item) => item.id === id);
    if (!current || current.status !== "ISSUED") return;
    dispatch({
      type: "save-certificate",
      certificate: { ...current, status: "REVOKED", revokedReason: reason.trim() },
    });
  }, [records.certificates]);

  const addLog = useCallback((entry: Omit<VerificationLog, "id" | "verifiedAt">) => {
    dispatch({ type: "log", entry });
  }, []);

  const resetDemo = useCallback(() => {
    localStorage.removeItem(RECORDS_KEY);
    for (const key of Object.keys(sessionStorage)) {
      if (key.startsWith("certichain.viewed.")) sessionStorage.removeItem(key);
    }
    dispatch({ type: "reset" });
  }, []);

  const value = useMemo<RecordsContextValue>(
    () => ({
      students: records.students,
      certificates: records.certificates,
      logs: records.logs,
      session,
      login,
      logout,
      addStudent,
      saveCertificate,
      revokeCertificate,
      addLog,
      resetDemo,
      studentById: (id) => records.students.find((item) => item.id === id),
      certificateById: (id) => records.certificates.find((item) => item.id === id),
    }),
    [
      records,
      session,
      login,
      logout,
      addStudent,
      saveCertificate,
      revokeCertificate,
      addLog,
      resetDemo,
    ],
  );

  return <RecordsContext.Provider value={value}>{children}</RecordsContext.Provider>;
}

export function useRecords(): RecordsContextValue {
  const context = useContext(RecordsContext);
  if (!context) throw new Error("useRecords must be used within RecordsProvider");
  return context;
}
