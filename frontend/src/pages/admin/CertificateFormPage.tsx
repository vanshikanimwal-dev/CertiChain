import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CertificateSheet } from "../../components/CertificateSheet";
import { Button, Field, PageHeader, SelectInput, TextInput } from "../../components/ui";
import { useRecords } from "../../state/records";

export function CertificateFormPage() {
  const { students, saveCertificate, studentById } = useRecords();
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [certificateType, setCertificateType] = useState("Degree");
  const [degree, setDegree] = useState(students[0]?.course ?? "");
  const [department, setDepartment] = useState(students[0]?.department ?? "");
  const [issueDate, setIssueDate] = useState("2026-10-03");
  const [grade, setGrade] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const student = studentById(studentId);
  const preview = {
    id: "CERT-DRAFT",
    studentId,
    certificateType,
    degree,
    department,
    issueDate,
    grade,
    status: "DRAFT" as const,
    documentHash: "",
    revokedReason: "",
  };

  function applyStudent(nextId: string) {
    const next = studentById(nextId);
    setStudentId(nextId);
    setDegree(next?.course ?? "");
    setDepartment(next?.department ?? "");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const status = submitter instanceof HTMLButtonElement && submitter.value === "draft" ? "DRAFT" : "ISSUED";
    if (!studentId) {
      setError("Add a student before creating a certificate.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const saved = await saveCertificate({
        studentId,
        certificateType,
        degree,
        department,
        issueDate,
        grade,
        status,
      });
      navigate(`/certificates/${saved.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The certificate could not be saved.");
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="New certificate"
        lede="Issuing writes an SHA-256 fingerprint of the credential fields. The public page compares later checks against that fingerprint."
        action={
          <Link to="/certificates" className="text-sm text-seal">
            Back to certificates
          </Link>
        }
      />
      <form onSubmit={submit} className="grid items-start gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="panel space-y-4 p-5">
          <Field label="Student">
            <SelectInput value={studentId} onChange={(event) => applyStudent(event.target.value)} required>
              {students.length === 0 ? <option value="">No students yet</option> : null}
              {students.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {item.studentNumber}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Credential type">
            <SelectInput value={certificateType} onChange={(event) => setCertificateType(event.target.value)}>
              <option>Degree</option>
              <option>Course completion</option>
              <option>Training</option>
            </SelectInput>
          </Field>
          <Field label="Credential title">
            <TextInput value={degree} onChange={(event) => setDegree(event.target.value)} required />
          </Field>
          <Field label="Department">
            <TextInput value={department} onChange={(event) => setDepartment(event.target.value)} required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Issue date">
              <TextInput type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} required />
            </Field>
            <Field label="Grade or CGPA">
              <TextInput value={grade} onChange={(event) => setGrade(event.target.value)} required />
            </Field>
          </div>
          {error ? <p className="text-sm text-[#8c2f2f]">{error}</p> : null}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" value="issue" disabled={saving || students.length === 0}>
              Issue certificate
            </Button>
            <Button type="submit" value="draft" variant="secondary" disabled={saving || students.length === 0}>
              Save draft
            </Button>
          </div>
        </div>
        <CertificateSheet certificate={preview} student={student} />
      </form>
    </div>
  );
}
