import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Provider } from "jotai";

import { Banner } from "@/components/shared/banner";
import { Navbar } from "@/components/shared/navbar";
import { QueryProvider } from "@/providers/query-provider";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DS Clone",
  description: "DS Clone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider>
          <QueryProvider>
            <Banner />
            <Navbar />
            <main>{children}</main>
            <Toaster />
          </QueryProvider>
        </Provider>
      </body>
    </html>
  );
}
