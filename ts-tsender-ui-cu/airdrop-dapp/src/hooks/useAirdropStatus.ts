import { useMemo } from "react";
import { useReadContract, useReadContracts } from "wagmi";
import type { Address, Hex } from "viem";
import { airdropAbi, erc20Abi } from "../config/abis";
import { AIRDROP_ADDRESS } from "../config/contracts";
import { CHAIN } from "../config/wagmi";
import type { AirdropState } from "../lib/status";
import type { Allocation } from "./useProofs";
import { useNow } from "./useNow";

interface Args {
  account?: Address;
  allocation?: Allocation;
  proofsRoot?: Hex;
  proofsLoading: boolean;
}

export function useAirdropStatus({ account, allocation, proofsRoot, proofsLoading }: Args) {
  const now = useNow(5000);
  const enabled = Boolean(AIRDROP_ADDRESS);

  const info = useReadContracts({
    allowFailure: false,
    query: { enabled, refetchInterval: 15_000 },
    contracts: [
      { address: AIRDROP_ADDRESS, abi: airdropAbi, functionName: "getMerkleRoot", chainId: CHAIN.id },
      { address: AIRDROP_ADDRESS, abi: airdropAbi, functionName: "getAirdropToken", chainId: CHAIN.id },
      { address: AIRDROP_ADDRESS, abi: airdropAbi, functionName: "getStartTime", chainId: CHAIN.id },
      { address: AIRDROP_ADDRESS, abi: airdropAbi, functionName: "getExpirationTime", chainId: CHAIN.id },
      { address: AIRDROP_ADDRESS, abi: airdropAbi, functionName: "getTotalClaimed", chainId: CHAIN.id },
    ],
  });

  const [root, token, startTime, expirationTime, totalClaimed] = info.data ?? [];

  const tokenInfo = useReadContracts({
    allowFailure: false,
    query: { enabled: Boolean(token), refetchInterval: 15_000 },
    contracts: [
      { address: token, abi: erc20Abi, functionName: "symbol", chainId: CHAIN.id },
      { address: token, abi: erc20Abi, functionName: "decimals", chainId: CHAIN.id },
      { address: token, abi: erc20Abi, functionName: "balanceOf", args: [AIRDROP_ADDRESS as Address], chainId: CHAIN.id },
    ],
  });

  const [symbol, decimals, contractBalance] = tokenInfo.data ?? [];

  const claimedQuery = useReadContract({
    address: AIRDROP_ADDRESS,
    abi: airdropAbi,
    functionName: "hasClaimed",
    args: account ? [account] : undefined,
    chainId: CHAIN.id,
    query: { enabled: enabled && Boolean(account), refetchInterval: 15_000 },
  });

  const state: AirdropState = useMemo(() => {
    if (!enabled) return "no-contract";
    if (info.isLoading || tokenInfo.isLoading || proofsLoading) return "loading";
    if (startTime === undefined || expirationTime === undefined) return "loading";
    if (proofsRoot && root && proofsRoot.toLowerCase() !== root.toLowerCase()) return "root-mismatch";
    if (!account) return "no-account";
    if (claimedQuery.isLoading) return "loading";
    if (!allocation) return "not-eligible";
    if (claimedQuery.data) return "claimed";
    if (now < Number(startTime)) return "not-started";
    if (now > Number(expirationTime)) return "expired";
    if (contractBalance !== undefined && contractBalance < allocation.amount) return "underfunded";
    return "available";
  }, [
    enabled, info.isLoading, tokenInfo.isLoading, proofsLoading, startTime, expirationTime,
    proofsRoot, root, account, claimedQuery.isLoading, claimedQuery.data, allocation, now, contractBalance,
  ]);

  return {
    state,
    root,
    token,
    startTime,
    expirationTime,
    totalClaimed,
    symbol: symbol ?? "MCH",
    decimals: decimals ?? 18,
    contractBalance,
    error: info.error ?? tokenInfo.error,
  };
}
