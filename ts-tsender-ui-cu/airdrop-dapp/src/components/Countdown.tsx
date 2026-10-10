import { useCountdown } from "../hooks/useCountdown";
import { formatDuration } from "../lib/format";

export function Countdown({ start, end }: { start?: bigint; end?: bigint }) {
  const cd = useCountdown(start, end);
  if (!cd) return <>--</>;
  if (cd.phase === "starts") return <>Opens in {formatDuration(cd.seconds)}</>;
  if (cd.phase === "ends") return <>Closes in {formatDuration(cd.seconds)}</>;
  return <>Window closed</>;
}
