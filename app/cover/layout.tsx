import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Field Cover",
};

export default function CoverLayout({ children }: { children: ReactNode }) {
  return children;
}
