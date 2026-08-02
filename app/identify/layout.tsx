import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Identify",
};

export default function IdentifyLayout({ children }: { children: ReactNode }) {
  return children;
}
