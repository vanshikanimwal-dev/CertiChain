import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const inputClass =
  "w-full border border-line bg-white px-3 py-2 text-sm text-ink outline-none placeholder:text-muted/70";

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
          <p className="mb-2 text-xs font-medium tracking-[0.16em] text-muted uppercase">{eyebrow}</p>
        ) : null}
        <h1 className="font-serif text-4xl leading-tight text-ink">{title}</h1>
        {lede ? <p className="mt-2 text-sm leading-6 text-muted">{lede}</p> : null}
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
    primary: "bg-seal text-white hover:bg-[#184f37]",
    secondary: "border border-line bg-white text-ink hover:bg-white/70",
    danger: "bg-[#8c2f2f] text-white hover:bg-[#742626]",
    ghost: "text-muted hover:text-ink",
  }[variant];
  return (
    <button
      className={`inline-flex items-center justify-center px-3.5 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
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
    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold tracking-wide ${tone}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

export function DataTable({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto border border-line bg-white">
      <table className="w-full min-w-[680px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs tracking-[0.12em] text-muted uppercase">
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-medium">
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
