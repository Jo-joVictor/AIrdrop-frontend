import type { Address } from "viem";
import { CHAIN } from "../config/wagmi";
import { formatDate, shortAddress } from "../lib/format";
import { STATE_LABEL, STATE_TONE, type AirdropState } from "../lib/status";

export interface CardAction {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

interface Props {
  state: AirdropState;
  amountText?: string;
  symbol: string;
  token?: Address;
  startTime?: bigint;
  expirationTime?: bigint;
  revealed: boolean;
  action: CardAction;
}

export function AirdropCard({ state, amountText, symbol, token, startTime, expirationTime, revealed, action }: Props) {
  const hidden = state === "available" && !revealed;

  let headline: string;
  if (state === "not-eligible") headline = "No allocation";
  else if (!amountText) headline = "--";
  else headline = hidden ? "8,888" : amountText;

  return (
    <article className="card" id="airdrop-card">
      <div className="card-top">
        <span className={hidden ? "card-amount is-blurred" : "card-amount"} aria-label={hidden ? "Amount hidden" : undefined}>
          {headline}
        </span>
        {amountText && state !== "not-eligible" && <span className="card-symbol">{symbol}</span>}
      </div>

      <div className="card-body">
        <h3 className="card-title">MCH airdrop</h3>
        <p className={`card-status tone-${STATE_TONE[state]}`}>{STATE_LABEL[state]}</p>

        <dl className="card-meta">
          <div>
            <dt>Token</dt>
            <dd>
              {token ? (
                <a href={`${CHAIN.blockExplorers.default.url}/address/${token}`} target="_blank" rel="noreferrer">
                  {symbol} ({shortAddress(token)})
                </a>
              ) : (
                "--"
              )}
            </dd>
          </div>
          <div>
            <dt>Opens</dt>
            <dd>{startTime !== undefined ? formatDate(startTime) : "--"}</dd>
          </div>
          <div>
            <dt>Closes</dt>
            <dd>{expirationTime !== undefined ? formatDate(expirationTime) : "--"}</dd>
          </div>
        </dl>

        <button className="btn btn-primary btn-block" onClick={action.onClick} disabled={action.disabled}>
          {action.label}
        </button>
      </div>
    </article>
  );
}
