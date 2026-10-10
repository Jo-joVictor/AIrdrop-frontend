import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { sepolia } from "wagmi/chains";

export const CHAIN = sepolia;

export const wagmiConfig = getDefaultConfig({
  appName: "MCH Airdrop",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "00000000000000000000000000000000",
  chains: [CHAIN],
  transports: {
    [CHAIN.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL || undefined),
  },
});
