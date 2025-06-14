"use client";

import { SessionProvider } from "next-auth/react";
import React, { type ReactNode } from "react";

// The SessionProvider makes the user's session data (e.g., name, email, image)
// available to all client components in your app without having to pass props.
export default function Providers({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
