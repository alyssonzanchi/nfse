import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import AuthProvider from "@/components/AuthProvider";
import { Header } from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NFSe App",
  description: "Gerador de Nota Fiscal",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-zinc-950 text-zinc-50 antialiased flex flex-col h-screen`}
      >
        <AuthProvider>
          <Header />
          <main className="flex-1 max-w-7xl mx-auto p-6 w-full">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
