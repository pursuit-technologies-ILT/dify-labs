"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
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

function errorMessage(code: string | null): string | null {
  if (!code) {
    return null;
  }
  if (code === "password") {
    return "That password is not correct.";
  }
  if (code === "rate") {
    return "Too many attempts. Wait a few minutes and try again.";
  }
  if (code === "config") {
    return "Collaborator login is not configured on this deployment.";
  }
  return "Could not sign in. Try again.";
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const error = useMemo(
    () => errorMessage(searchParams.get("error")),
    [searchParams],
  );

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
        <form
          method="post"
          action="/api/auth/login"
          className="flex flex-col gap-4"
        >
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
              required
              autoComplete="current-password"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:border-white/70 dark:bg-white/18 dark:text-white dark:placeholder:text-white/70"
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
              className="inline-flex h-10 min-w-32 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Continue
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
