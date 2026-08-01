"use client";

import { useEffect, useState } from "react";
import { PlasticButton } from "@/components/PlasticButton";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferred || dismissed) return null;

  return (
    <div className="space-y-2 border border-[color:var(--screen-muted)]/35 px-3 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--screen-muted)]">
        Install this terminal
      </p>
      <p className="text-sm leading-relaxed">
        Add the Guide to your home screen for faster consultation.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <PlasticButton
          onClick={async () => {
            await deferred.prompt();
            setDeferred(null);
          }}
        >
          Install
        </PlasticButton>
        <PlasticButton variant="secondary" onClick={() => setDismissed(true)}>
          Later
        </PlasticButton>
      </div>
    </div>
  );
}
