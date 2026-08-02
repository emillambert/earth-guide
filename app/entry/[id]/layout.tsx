import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Guide Entry",
};

export default function EntryLayout({ children }: { children: ReactNode }) {
  return children;
}
