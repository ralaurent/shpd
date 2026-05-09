import type { Metadata } from "next";
import SessionContextProvider from '@/contexts/SessionContext'
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { GlobalContextProvider } from "@/contexts/GlobalContext";

export const metadata: Metadata = {
  title: "SHPD",
  description: "Health & Wellness",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <GlobalContextProvider>
          <SessionContextProvider>
            {children}
          </SessionContextProvider>
        </GlobalContextProvider>
      </body>
    </html>
  );
}
