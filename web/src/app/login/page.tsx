import { Suspense } from "react";

import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col">
      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-md px-4 py-16 text-sm text-muted-foreground">
            Loading sign-in…
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
