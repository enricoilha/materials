"use client";
import Head from "next/head";
import { ReactNode } from "react";

export default function FormLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1">
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Head>
      {children}
    </div>
  );
}
