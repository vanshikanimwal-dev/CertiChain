import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button, Field, TextInput } from "../components/ui";
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
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="flex flex-col justify-between bg-navy px-8 py-10 text-paper sm:px-12">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-paper/60 uppercase">CertiChain</p>
          <h1 className="mt-8 max-w-md font-serif text-5xl leading-tight">
            Issue a certificate once. Verify it anywhere.
          </h1>
          <p className="mt-6 max-w-md text-sm leading-6 text-paper/75">
            {INSTITUTION_NAME} uses this console to register students, issue credentials, and publish a
            public verification page. The records in this preview are synthetic.
          </p>
        </div>
        <p className="mt-12 text-xs tracking-[0.14em] text-paper/50 uppercase">Institution console</p>
      </section>
      <section className="flex items-center bg-paper px-6 py-12 sm:px-12">
        <form onSubmit={submit} className="mx-auto w-full max-w-sm">
          <h2 className="font-serif text-3xl">Sign in</h2>
          <p className="mt-2 text-sm text-muted">Institution admin access for the local preview.</p>
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
          <p className="mt-8 border border-line bg-white px-4 py-3 text-sm leading-6 text-muted">
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
