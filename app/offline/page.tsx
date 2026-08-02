"use client";

import { GuideShell } from "@/components/GuideShell";
import { GuideScreen } from "@/components/GuideScreen";
import { PlasticButton } from "@/components/PlasticButton";
import { useRouter } from "next/navigation";

export default function OfflinePage() {
  const router = useRouter();

  return (
    <GuideShell>
      <GuideScreen>
        <div className="flex flex-1 flex-col justify-center gap-4 py-8">
          <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--screen-muted)]">
            Connection unavailable
          </p>
          <h1
            data-page-heading
            tabIndex={-1}
            className="text-2xl font-semibold uppercase tracking-[0.06em]"
          >
            Index temporarily unreachable
          </h1>
          <p className="text-sm leading-relaxed text-[color:var(--screen-muted)]">
            Saved entries remain available on this device. New consultations
            require a connection to Earth&apos;s current supplement.
          </p>
          <PlasticButton fullWidth onClick={() => router.push("/saved")}>
            Open saved entries
          </PlasticButton>
          <PlasticButton
            fullWidth
            variant="secondary"
            onClick={() => router.push("/guide")}
          >
            Open index
          </PlasticButton>
        </div>
      </GuideScreen>
    </GuideShell>
  );
}
