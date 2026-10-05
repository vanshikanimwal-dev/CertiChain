import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const inputClass =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink shadow-sm outline-none transition placeholder:text-muted/70 focus:border-seal focus:ring-2 focus:ring-seal/15";

export function PageHeader({
  eyebrow,
  title,
  lede,
  action,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-brass uppercase">{eyebrow}</p>
        ) : null}
        <h1 className="font-serif text-4xl leading-none tracking-tight text-ink sm:text-5xl">{title}</h1>
        {lede ? <p className="mt-3 max-w-xl text-sm leading-6 text-muted">{lede}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  const styles = {
    primary: "bg-seal text-white shadow-sm shadow-seal/30 hover:bg-[#184f37]",
    secondary: "border border-line bg-white text-ink shadow-sm hover:border-brass/50 hover:bg-[#fffaf3]",
    danger: "bg-[#8c2f2f] text-white shadow-sm hover:bg-[#742626]",
    ghost: "text-muted hover:text-ink",
  }[variant];
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
      {...props}
    />
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputClass} {...props} />;
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={inputClass} {...props} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputClass} min-h-24`} {...props} />;
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function StatusPill({ status }: { status: string }) {
  const tone =
    status === "ISSUED" || status === "VERIFIED"
      ? "bg-[#e5f2eb] text-seal"
      : status === "REVOKED" || status === "HASH_MISMATCH" || status === "NOT_FOUND"
        ? "bg-[#f8e8e4] text-[#8c2f2f]"
        : "bg-[#efeadd] text-muted";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${tone}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

export function DataTable({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="panel data-table overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-[#fbf7f0] text-[11px] tracking-[0.14em] text-muted uppercase">
            {headers.map((header) => (
              <th key={header} className="px-4 py-3.5 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-ink">{children}</tbody>
      </table>
    </div>
  );
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-8 text-sm text-muted">
        {children}
      </td>
    </tr>
  );
}
