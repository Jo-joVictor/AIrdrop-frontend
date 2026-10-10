import { useQuery } from "@tanstack/react-query";
import type { Address, Hex } from "viem";

export interface Allocation {
  amount: bigint;
  proof: Hex[];
}

interface ProofsFile {
  root: Hex;
  decimals: number;
  count: number;
  total: string;
  entries: Record<string, { amount: string; proof: Hex[] }>;
}

export function useProofs() {
  return useQuery({
    queryKey: ["proofs"],
    staleTime: Infinity,
    queryFn: async (): Promise<ProofsFile> => {
      const res = await fetch("/proofs.json", { cache: "no-cache" });
      if (!res.ok) throw new Error("Could not load proofs.json");
      return res.json();
    },
  });
}

export function findAllocation(file: ProofsFile | undefined, account: Address | undefined): Allocation | undefined {
  if (!file || !account) return undefined;
  const entry = file.entries[account.toLowerCase()];
  return entry ? { amount: BigInt(entry.amount), proof: entry.proof } : undefined;
}
