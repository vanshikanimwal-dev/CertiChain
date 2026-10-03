import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { INSTITUTION_NAME } from "../types";
import { useRecords } from "../state/records";

const links = [
  { to: "/dashboard", label: "Dashboard", end: true },
  { to: "/students", label: "Students", end: false },
  { to: "/certificates", label: "Certificates", end: false },
  { to: "/history", label: "Verification log", end: true },
];

export function AdminLayout() {
  const { session, logout, resetDemo } = useRecords();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function signOut() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-paper md:grid md:grid-cols-[240px_1fr]">
      {open ? (
        <button
          className="fixed inset-0 z-20 bg-navy/40 md:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <aside
        className={`${open ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-navy text-paper transition-transform md:static md:translate-x-0`}
      >
        <div className="border-b border-white/10 px-5 py-6">
          <p className="font-serif text-2xl">CertiChain</p>
          <p className="mt-1 text-xs tracking-[0.14em] text-paper/60 uppercase">{INSTITUTION_NAME}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 text-sm ${isActive ? "bg-white/10 text-white" : "text-paper/70 hover:text-white"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 px-5 py-4 text-sm">
          <p className="font-medium">{session?.name}</p>
          <p className="mt-1 text-xs text-paper/60">{session?.email}</p>
          <div className="mt-4 flex gap-4">
            <button className="text-xs text-paper/70 hover:text-white" onClick={signOut}>
              Sign out
            </button>
            <button
              className="text-xs text-paper/70 hover:text-white"
              onClick={() => {
                resetDemo();
                setOpen(false);
              }}
            >
              Reset demo
            </button>
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex items-center justify-between border-b border-line px-4 py-3 md:hidden">
          <p className="font-serif text-xl">CertiChain</p>
          <button className="text-sm font-medium" onClick={() => setOpen(true)}>
            Menu
          </button>
        </header>
        <main className="px-4 py-6 sm:px-8 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
