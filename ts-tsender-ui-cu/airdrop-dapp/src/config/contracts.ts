import { isAddress, type Address } from "viem";

const raw = import.meta.env.VITE_AIRDROP_ADDRESS;

/** Undefined when the env var is missing or not a valid address. */
export const AIRDROP_ADDRESS: Address | undefined = raw && isAddress(raw) ? raw : undefined;
