import { BaseError, ContractFunctionRevertedError, UserRejectedRequestError } from "viem";

const MESSAGES: Record<string, string> = {
  MerkleAirdrop__InvalidProof: "Your Merkle proof is not valid for the amount and root on the contract. The proofs file may be out of date.",
  MerkleAirdrop__AlreadyClaimed: "This address has already claimed its airdrop.",
  MerkleAirdrop__InvalidSignature: "The signature does not match this address. Switch to the account that is claiming and try again.",
  MerkleAirdrop__AirdropExpired: "The claim window has closed.",
  MerkleAirdrop__AirdropNotStarted: "Claiming has not opened yet.",
  MerkleAirdrop__InsufficientBalance: "The airdrop contract does not hold enough tokens to pay this claim. Ask the owner to fund it.",
};

export function parseError(error: unknown): string {
  if (error instanceof BaseError) {
    if (error.walk((e) => e instanceof UserRejectedRequestError)) {
      return "You rejected the request in your wallet.";
    }
    const reverted = error.walk((e) => e instanceof ContractFunctionRevertedError);
    if (reverted instanceof ContractFunctionRevertedError) {
      const name = reverted.data?.errorName;
      if (name && MESSAGES[name]) return MESSAGES[name];
      if (name) return `The contract rejected the claim (${name}).`;
    }
    return error.shortMessage || "The transaction failed.";
  }
  return error instanceof Error ? error.message : "Something went wrong.";
}
