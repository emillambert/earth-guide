"use client";

import { PlasticButton } from "@/components/PlasticButton";
import { RecoveryScreen } from "@/components/RecoveryScreen";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RecoveryScreen
      label="Guide malfunction"
      title="The index has become temporarily theoretical"
      action={
        <PlasticButton fullWidth onClick={reset}>
          Retry this page
        </PlasticButton>
      }
    >
      The Guide encountered a problem while arranging this page. Existing
      copies remain on the device; the editorial machinery may be tried again.
    </RecoveryScreen>
  );
}
