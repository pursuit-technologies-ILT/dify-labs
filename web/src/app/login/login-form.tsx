"use client";

import { useState, type FormEvent } from "react";
import { KeyRoundIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { COLLAB_TEARDOWN_DATE } from "@/lib/collab-config";

export function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Prefer the live field value so paste/autofill still works even if
    // React state lagged behind the DOM.
    const form = event.currentTarget;
    const field = form.elements.namedItem("password");
    const nextPassword =
      field instanceof HTMLInputElement ? field.value : password;
    const trimmed = nextPassword.trim();
    if (!trimmed) {
      setError("Enter the collaborator password.");
      return;
    }
    setPassword(trimmed);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: trimmed }),
      });
      const json = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || json.ok !== true) {
        setError(
          typeof json.error === "string"
            ? json.error
            : "That password is not correct.",
        );
        return;
      }
      window.location.assign("/");
      return;
    } catch {
      setError("Could not reach the login service. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Collaborator access</CardTitle>
          <CardDescription>
            One password for this demo. After Continue you can paste your own
            OpenRouter key and open the live Dify canvas. Access expires{" "}
            {COLLAB_TEARDOWN_DATE}.
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <CardContent className="flex flex-col gap-2">
            <label
              htmlFor="collab-password"
              className="text-sm font-medium text-foreground"
            >
              Password
            </label>
            <input
              id="collab-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              aria-invalid={error ? true : undefined}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
              onChange={(event) => {
                setPassword(event.target.value);
                setError(null);
              }}
            />
            <p className="text-sm text-muted-foreground">
              Password only — no email. Then paste your own OpenRouter key and
              open the Dify canvas.
            </p>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
          </CardContent>
          <CardFooter>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 min-w-32 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {loading ? "Checking…" : "Continue"}
            </button>
          </CardFooter>
        </form>
      </Card>
      <Alert>
        <KeyRoundIcon />
        <AlertTitle>Demo-only gate</AlertTitle>
        <AlertDescription>
          Shared-password Studio is not the production portal-BFF student path.
          Bring your own OpenRouter key; it is never stored on the server.
        </AlertDescription>
      </Alert>
    </div>
  );
}
