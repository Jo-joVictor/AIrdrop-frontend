import { useNow } from "./useNow";

export type CountdownPhase = "starts" | "ends" | "ended";

export function useCountdown(start?: bigint, end?: bigint) {
  const now = useNow(1000);
  if (start === undefined || end === undefined) return undefined;
  if (now < Number(start)) return { phase: "starts" as CountdownPhase, seconds: Number(start) - now };
  if (now <= Number(end)) return { phase: "ends" as CountdownPhase, seconds: Number(end) - now };
  return { phase: "ended" as CountdownPhase, seconds: 0 };
}
