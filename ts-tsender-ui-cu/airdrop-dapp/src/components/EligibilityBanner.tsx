import type { AirdropState } from "../lib/status";

interface Props {
  state: AirdropState;
  amountText?: string;
  symbol: string;
  onReveal: () => void;
  onConnect?: () => void;
}

function copyFor(state: AirdropState, amountText: string | undefined, symbol: string) {
  const amount = amountText ? `${amountText} ${symbol}` : symbol;
  switch (state) {
    case "available":
      return { title: "You are eligible", body: `You can claim ${amount}.` };
    case "claimed":
      return { title: "Already claimed", body: `${amount} was sent to this address.` };
    case "not-started":
      return { title: "You are eligible", body: `You are on the list for ${amount}. Claiming has not opened yet.` };
    case "expired":
      return { title: "Claim window closed", body: `This address was eligible for ${amount}, but the window has ended.` };
    case "underfunded":
      return { title: "You are eligible", body: `You are on the list for ${amount}, but the contract has not been funded with enough tokens yet.` };
    case "not-eligible":
      return { title: "Not eligible", body: "This address is not on the recipient list. Try another address or switch wallets." };
    case "root-mismatch":
      return { title: "Proofs file is out of date", body: "proofs.json does not match the root stored in the contract. Regenerate it from the recipient list that was used to deploy." };
    case "no-contract":
      return { title: "Contract not configured", body: "Set VITE_AIRDROP_ADDRESS in your .env file and restart the dev server." };
    case "loading":
      return { title: "Checking eligibility", body: "Reading the contract and your allocation." };
    default:
      return { title: "Check your eligibility", body: "Connect your wallet or enter an address to see if you qualify for the MCH airdrop." };
  }
}

export function EligibilityBanner({ state, amountText, symbol, onReveal, onConnect }: Props) {
  const { title, body } = copyFor(state, amountText, symbol);
  return (
    <section className="banner" aria-live="polite">
      <h2 className="banner-title">{title}</h2>
      <p className="banner-body">{body}</p>
      {state === "available" && (
        <button className="btn btn-light" onClick={onReveal}>
          Reveal airdrop
        </button>
      )}
      {state === "no-account" && onConnect && (
        <button className="btn btn-light" onClick={onConnect}>
          Connect wallet
        </button>
      )}
    </section>
  );
}
