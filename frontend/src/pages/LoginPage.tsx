import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button, Field, LogoMark, TextInput } from "../components/ui";
import { useRecords } from "../state/records";
import { DEMO_ADMIN, INSTITUTION_NAME } from "../types";

export function LoginPage() {
  const { session, login } = useRecords();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (session) return <Navigate to="/dashboard" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sign-in failed.");
    }
  }

  function useDemoAccount() {
    setEmail(DEMO_ADMIN.email);
    setPassword(DEMO_ADMIN.password);
    setError("");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
      <section className="relative flex flex-col justify-between overflow-hidden bg-navy px-8 py-10 text-paper sm:px-14">
        <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full border border-brass/40" />
        <div className="pointer-events-none absolute -top-4 -right-4 h-40 w-40 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute bottom-16 -left-20 h-56 w-56 rounded-full bg-seal/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-4">
            <LogoMark className="h-24 w-24 sm:h-28 sm:w-28" />
            <div>
              <p className="font-serif text-3xl leading-none">CertiChain</p>
              <p className="mt-2 text-xs font-semibold tracking-[0.18em] text-brass uppercase">{INSTITUTION_NAME}</p>
            </div>
          </div>
          <h1 className="mt-10 max-w-lg font-serif text-5xl leading-[1.05] sm:text-6xl">
            Issue a certificate once.
            <span className="mt-2 block font-serif text-[0.92em] text-brass italic">Verify it anywhere.</span>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-paper/75">
            {INSTITUTION_NAME} uses this console to register students, issue credentials, and publish a
            public verification page. The records in this demo are synthetic.
          </p>
        </div>
        <p className="relative mt-12 text-xs tracking-[0.16em] text-paper/45 uppercase">Institution console</p>
      </section>
      <section className="flex items-center px-6 py-12 sm:px-12">
        <form onSubmit={submit} className="panel mx-auto w-full max-w-md px-7 py-8">
          <h2 className="font-serif text-4xl">Sign in</h2>
          <p className="mt-2 text-sm text-muted">Institution admin access for Demo University.</p>
          <div className="mt-8 space-y-4">
            <Field label="Email">
              <TextInput
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </Field>
            <Field label="Password">
              <TextInput
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </Field>
          </div>
          {error ? <p className="mt-4 text-sm text-[#8c2f2f]">{error}</p> : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="submit">Sign in</Button>
            <Button type="button" variant="secondary" onClick={useDemoAccount}>
              Fill demo account
            </Button>
          </div>
          <p className="mt-8 rounded-2xl bg-[#f4f7f4] px-4 py-3 text-sm leading-6 text-muted">
            Demo account
            <br />
            <span className="text-ink">{DEMO_ADMIN.email}</span>
            <br />
            <span className="text-ink">{DEMO_ADMIN.password}</span>
          </p>
        </form>
      </section>
    </div>
  );
}
