"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { KeyRoundIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { COLLAB_TEARDOWN_DATE, DIFY_ADMIN_EMAIL } from "@/lib/collab-config";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
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
      router.replace("/");
      router.refresh();
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
            One shared password for this demo walkthrough. After sign-in, paste
            your own OpenRouter key. Demo access expires {COLLAB_TEARDOWN_DATE}
            .
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={error ? true : undefined}>
                <FieldLabel htmlFor="collab-password">Password</FieldLabel>
                <Input
                  id="collab-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  aria-invalid={error ? true : undefined}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError(null);
                  }}
                />
                <FieldDescription>
                  Same secret as Dify Studio if the console login form appears.
                  Email: {DIFY_ADMIN_EMAIL}.
                </FieldDescription>
                {error ? (
                  <p className="text-sm text-destructive">{error}</p>
                ) : null}
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading || password.length === 0}>
              {loading ? "Checking…" : "Continue"}
            </Button>
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
