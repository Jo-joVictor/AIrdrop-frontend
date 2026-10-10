import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount, usePublicClient, useSignTypedData, useWriteContract } from "wagmi";
import { parseSignature, type Hex } from "viem";
import { airdropAbi } from "../config/abis";
import { AIRDROP_ADDRESS } from "../config/contracts";
import { CHAIN } from "../config/wagmi";
import { parseError } from "../lib/errors";

export type ClaimStage = "idle" | "signing" | "sending" | "confirming" | "success" | "error";

export function useClaim() {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: CHAIN.id });
  const { signTypedDataAsync } = useSignTypedData();
  const { writeContractAsync } = useWriteContract();
  const queryClient = useQueryClient();

  const [stage, setStage] = useState<ClaimStage>("idle");
  const [hash, setHash] = useState<Hex>();
  const [error, setError] = useState<string>();

  const reset = useCallback(() => {
    setStage("idle");
    setHash(undefined);
    setError(undefined);
  }, []);

  const claim = useCallback(
    async (amount: bigint, proof: Hex[]) => {
      if (!address || !AIRDROP_ADDRESS || !publicClient) return;
      setError(undefined);
      setHash(undefined);

      try {
        // 1. Sign the EIP-712 AirdropClaim message (must come from the claiming account).
        setStage("signing");
        const signature = await signTypedDataAsync({
          domain: {
            name: "MerkleAirdrop",
            version: "1",
            chainId: CHAIN.id,
            verifyingContract: AIRDROP_ADDRESS,
          },
          types: {
            AirdropClaim: [
              { name: "account", type: "address" },
              { name: "amount", type: "uint256" },
            ],
          },
          primaryType: "AirdropClaim",
          message: { account: address, amount },
        });

        const { r, s, v, yParity } = parseSignature(signature);
        const vNum = v !== undefined ? Number(v) : 27 + yParity;
        const args = [address, amount, proof, vNum, r, s] as const;

        // 2. Simulate first so contract errors surface before the wallet prompt.
        setStage("sending");
        await publicClient.simulateContract({
          address: AIRDROP_ADDRESS,
          abi: airdropAbi,
          functionName: "claim",
          args,
          account: address,
        });

        const txHash = await writeContractAsync({
          address: AIRDROP_ADDRESS,
          abi: airdropAbi,
          functionName: "claim",
          args,
          chainId: CHAIN.id,
        });
        setHash(txHash);

        // 3. Wait for the receipt.
        setStage("confirming");
        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
        if (receipt.status !== "success") throw new Error("The transaction was mined but reverted.");

        setStage("success");
        await queryClient.invalidateQueries();
      } catch (err) {
        setError(parseError(err));
        setStage("error");
      }
    },
    [address, publicClient, signTypedDataAsync, writeContractAsync, queryClient],
  );

  return { claim, stage, hash, error, reset };
}
