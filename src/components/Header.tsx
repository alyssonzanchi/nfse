"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/proprietarios/novo", label: "Novo Proprietário" },
  { href: "/imoveis/novo", label: "Novo Imóvel" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="text-lg font-semibold">
          NFSe App
        </Link>
      </div>

      <nav className="flex items-center gap-4">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Button
              key={link.href}
              asChild
              variant={isActive ? "secondary" : "link"}
              className={isActive ? "text-black" : "text-zinc-50"}
            >
              <Link href={link.href}>{link.label}</Link>
            </Button>
          );
        })}
      </nav>

      <div className="flex items-center gap-4">
        <Button
          onClick={() => signOut()}
          variant="destructive"
          className="cursor-pointer"
        >
          Sair
        </Button>
      </div>
    </header>
  );
}
