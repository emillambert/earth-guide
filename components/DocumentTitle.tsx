"use client";

import { useEffect } from "react";

export function DocumentTitle({ title }: { title: string }) {
  useEffect(() => {
    const fullTitle = `${title} | The Hitchhiker’s Guide`;
    const applyTitle = () => {
      if (document.title !== fullTitle) document.title = fullTitle;
    };
    applyTitle();

    const observer = new MutationObserver(applyTitle);
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    return () => observer.disconnect();
  }, [title]);

  return null;
}
