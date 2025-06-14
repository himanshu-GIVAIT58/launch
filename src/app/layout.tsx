import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LaunchPad - Project Management",
  description: "Manage your product launches seamlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* This wraps your entire application with the session provider,
            making authentication state available everywhere. */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
