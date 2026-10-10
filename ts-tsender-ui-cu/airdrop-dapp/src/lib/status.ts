export type AirdropState =
  | "no-contract"
  | "loading"
  | "no-account"
  | "root-mismatch"
  | "not-eligible"
  | "claimed"
  | "not-started"
  | "expired"
  | "underfunded"
  | "available";

/** Short status label shown on the airdrop card. */
export const STATE_LABEL: Record<AirdropState, string> = {
  "no-contract": "Not configured",
  loading: "Checking",
  "no-account": "Connect to check",
  "root-mismatch": "Proofs out of date",
  "not-eligible": "Not eligible",
  claimed: "Already claimed",
  "not-started": "Not open yet",
  expired: "Claim window closed",
  underfunded: "Awaiting funding",
  available: "Available to claim",
};

export type Tone = "ok" | "warn" | "bad" | "neutral";

export const STATE_TONE: Record<AirdropState, Tone> = {
  "no-contract": "bad",
  loading: "neutral",
  "no-account": "neutral",
  "root-mismatch": "bad",
  "not-eligible": "neutral",
  claimed: "neutral",
  "not-started": "warn",
  expired: "bad",
  underfunded: "warn",
  available: "ok",
};
