import { formatAmount } from "../lib/format";
import { Countdown } from "./Countdown";

interface Props {
  symbol: string;
  decimals: number;
  totalClaimed?: bigint;
  contractBalance?: bigint;
  startTime?: bigint;
  expirationTime?: bigint;
}

export function StatsRow({ symbol, decimals, totalClaimed, contractBalance, startTime, expirationTime }: Props) {
  const fmt = (v?: bigint) => (v === undefined ? "--" : `${formatAmount(v, decimals)} ${symbol}`);
  return (
    <div className="stats">
      <div className="stat">
        <span className="stat-label">Total claimed</span>
        <span className="stat-value">{fmt(totalClaimed)}</span>
      </div>
      <div className="stat">
        <span className="stat-label">Left in contract</span>
        <span className="stat-value">{fmt(contractBalance)}</span>
      </div>
      <div className="stat">
        <span className="stat-label">Claim window</span>
        <span className="stat-value">
          <Countdown start={startTime} end={expirationTime} />
        </span>
      </div>
    </div>
  );
}
