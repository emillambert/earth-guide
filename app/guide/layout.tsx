import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Earth Index",
};

export default function GuideLayout({ children }: { children: ReactNode }) {
  return children;
}
