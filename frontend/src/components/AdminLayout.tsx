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
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      {open ? (
        <button
          className="fixed inset-0 z-20 bg-navy/40 md:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <aside
        className={`${open ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-navy text-paper shadow-2xl transition-transform md:static md:w-auto md:translate-x-0 md:shadow-none`}
      >
        <div className="border-b border-white/10 px-5 py-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-brass/70 font-serif text-xs tracking-[0.12em] text-brass">
              CC
            </div>
            <div>
              <p className="font-serif text-2xl leading-none">CertiChain</p>
              <p className="mt-1 text-[11px] tracking-[0.16em] text-paper/55 uppercase">{INSTITUTION_NAME}</p>
            </div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-xl px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-white/10 text-white shadow-[inset_3px_0_0_#a67c42]"
                    : "text-paper/70 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 px-5 py-5 text-sm">
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
              Reload
            </button>
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex items-center justify-between border-b border-line/80 bg-white/70 px-4 py-3 backdrop-blur md:hidden">
          <p className="font-serif text-xl">CertiChain</p>
          <button className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-medium" onClick={() => setOpen(true)}>
            Menu
          </button>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
