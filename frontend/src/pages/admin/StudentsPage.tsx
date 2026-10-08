import { useState, type FormEvent } from "react";
import { Button, DataTable, EmptyRow, Field, PageHeader, TextInput } from "../../components/ui";
import { useRecords } from "../../state/records";

const emptyForm = {
  name: "",
  studentNumber: "",
  department: "",
  course: "",
  graduationYear: "2026",
};

export function StudentsPage() {
  const { students, addStudent, ready } = useRecords();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  const visible = students.filter((student) => {
    const haystack = `${student.name} ${student.studentNumber} ${student.department} ${student.course}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  function update(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const year = Number(form.graduationYear);
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      setMessage("Enter a graduation year between 2000 and 2100.");
      return;
    }
    try {
      await addStudent({
        name: form.name.trim(),
        studentNumber: form.studentNumber.trim(),
        department: form.department.trim(),
        course: form.course.trim(),
        graduationYear: year,
      });
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "The student could not be saved.");
      return;
    }
    setForm(emptyForm);
    setOpen(false);
    setMessage(`${form.name.trim()} is now on the student list.`);
  }

  return (
    <div>
      <PageHeader
        title="Students"
        lede="Register the people who can receive a certificate from this institution."
        action={
          <Button type="button" onClick={() => setOpen((value) => !value)}>
            {open ? "Close form" : "Add student"}
          </Button>
        }
      />
      {message ? <p className="mb-4 text-sm text-seal">{message}</p> : null}
      {open ? (
        <form onSubmit={submit} className="panel mb-6 grid gap-4 p-5 sm:grid-cols-2">
          <Field label="Full name">
            <TextInput value={form.name} onChange={(event) => update("name", event.target.value)} required />
          </Field>
          <Field label="Student number">
            <TextInput
              value={form.studentNumber}
              onChange={(event) => update("studentNumber", event.target.value)}
              required
            />
          </Field>
          <Field label="Department">
            <TextInput
              value={form.department}
              onChange={(event) => update("department", event.target.value)}
              required
            />
          </Field>
          <Field label="Course">
            <TextInput value={form.course} onChange={(event) => update("course", event.target.value)} required />
          </Field>
          <Field label="Graduation year">
            <TextInput
              inputMode="numeric"
              value={form.graduationYear}
              onChange={(event) => update("graduationYear", event.target.value)}
              required
            />
          </Field>
          <div className="flex items-end">
            <Button type="submit">Save student</Button>
          </div>
        </form>
      ) : null}
      <div className="mb-4 max-w-sm">
        <TextInput
          placeholder="Search name, number, or course"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search students"
        />
      </div>
      <DataTable headers={["Name", "Number", "Department", "Course", "Year"]}>
        {visible.map((student) => (
          <tr key={student.id} className="border-b border-line last:border-0">
            <td className="px-4 py-3 font-medium">{student.name}</td>
            <td className="px-4 py-3">{student.studentNumber}</td>
            <td className="px-4 py-3">{student.department}</td>
            <td className="px-4 py-3">{student.course}</td>
            <td className="px-4 py-3">{student.graduationYear}</td>
          </tr>
        ))}
        {visible.length === 0 ? (
          <EmptyRow colSpan={5}>{ready ? "No students match that search." : "Loading students."}</EmptyRow>
        ) : null}
      </DataTable>
    </div>
  );
}
