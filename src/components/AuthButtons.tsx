"use client";

import { signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AuthButtons({ session }: { session: any }) {
  if (session) {
    return (
      <>
        <p className="text-sm">Olá, {session.user?.name}!</p>
        <Button
          onClick={() => signOut()}
          variant="destructive"
          className="cursor-pointer"
        >
          Sair
        </Button>
      </>
    );
  }

  return <Button onClick={() => signIn()}>Entrar</Button>;
}
