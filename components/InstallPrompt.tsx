"use client";

import { useEffect, useState } from "react";
import { PlasticButton } from "@/components/PlasticButton";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const INSTALL_DISMISSED_KEY = "hitchhikers-guide-install-dismissed";

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [dismissed, setDismissed] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  useEffect(() => {
    const isIos =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    const frame = window.requestAnimationFrame(() => {
      try {
        setDismissed(
          isStandalone ||
            window.localStorage.getItem(INSTALL_DISMISSED_KEY) === "true",
        );
      } catch {
        setDismissed(isStandalone);
      }
      setShowIosInstructions(isIos && !isStandalone);
    });

    const handler = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  if (dismissed || (!deferred && !showIosInstructions)) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(INSTALL_DISMISSED_KEY, "true");
    } catch {
      // Dismissal still applies for this session.
    }
  };

  return (
    <div className="space-y-2 border border-[color:var(--screen-muted)]/35 px-3 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--screen-muted)]">
        Install this terminal
      </p>
      <p className="text-sm leading-relaxed">
        {deferred
          ? "Add the Guide to your home screen for faster consultation."
          : "In Safari, tap Share, then Add to Home Screen."}
      </p>
      <div className={deferred ? "grid grid-cols-2 gap-2" : "grid gap-2"}>
        {deferred ? (
          <PlasticButton
            onClick={async () => {
              await deferred.prompt();
              const choice = await deferred.userChoice;
              setDeferred(null);
              if (choice.outcome === "accepted") dismiss();
            }}
          >
            Install
          </PlasticButton>
        ) : null}
        <PlasticButton variant="secondary" onClick={dismiss}>
          {deferred ? "Later" : "Got it"}
        </PlasticButton>
      </div>
    </div>
  );
}
