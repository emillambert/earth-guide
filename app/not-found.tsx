import { RecoveryScreen } from "@/components/RecoveryScreen";

export default function NotFound() {
  return (
    <RecoveryScreen label="Index discrepancy" title="Entry not found">
      The requested page is absent from this edition. This may indicate an old
      reference, a typing error, or unusually decisive editorial work.
    </RecoveryScreen>
  );
}
