import { useEffect } from "react";
import type { Hex } from "viem";
import { CHAIN } from "../config/wagmi";
import type { ClaimStage } from "../hooks/useClaim";

interface Props {
  stage: ClaimStage;
  hash?: Hex;
  error?: string;
  amountText?: string;
  symbol: string;
  onClose: () => void;
  onRetry: () => void;
}

const STEPS: { stage: ClaimStage; label: string }[] = [
  { stage: "signing", label: "Sign the claim message in your wallet" },
  { stage: "sending", label: "Approve the claim transaction" },
  { stage: "confirming", label: "Wait for network confirmation" },
];

export function ClaimModal({ stage, hash, error, amountText, symbol, onClose, onRetry }: Props) {
  const inProgress = stage === "signing" || stage === "sending" || stage === "confirming";

  useEffect(() => {
    if (stage === "idle" || inProgress) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage, inProgress, onClose]);

  if (stage === "idle") return null;

  const activeIndex = STEPS.findIndex((s) => s.stage === stage);
  const txLink = hash ? `${CHAIN.blockExplorers.default.url}/tx/${hash}` : undefined;

  return (
    <div className="overlay">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        {inProgress && (
          <>
            <h2 id="modal-title" className="modal-title">Claiming your airdrop</h2>
            <ol className="steps">
              {STEPS.map((step, i) => (
                <li key={step.stage} className={i < activeIndex ? "step is-done" : i === activeIndex ? "step is-active" : "step"}>
                  {step.label}
                </li>
              ))}
            </ol>
            {txLink && (
              <a className="modal-link" href={txLink} target="_blank" rel="noreferrer">
                View transaction on {CHAIN.blockExplorers.default.name}
              </a>
            )}
          </>
        )}

        {stage === "success" && (
          <>
            <h2 id="modal-title" className="modal-title">Claim successful</h2>
            <p className="modal-text">
              {amountText ? `${amountText} ${symbol}` : symbol} was sent to your wallet.
            </p>
            {txLink && (
              <a className="modal-link" href={txLink} target="_blank" rel="noreferrer">
                View transaction on {CHAIN.blockExplorers.default.name}
              </a>
            )}
            <button className="btn btn-primary btn-block" onClick={onClose}>
              Continue
            </button>
          </>
        )}

        {stage === "error" && (
          <>
            <h2 id="modal-title" className="modal-title">Claim failed</h2>
            <p className="modal-text">{error}</p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={onClose}>
                Close
              </button>
              <button className="btn btn-primary" onClick={onRetry}>
                Try again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
