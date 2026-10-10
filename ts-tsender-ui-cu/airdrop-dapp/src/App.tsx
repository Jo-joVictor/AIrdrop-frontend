import { useEffect, useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useSwitchChain } from "wagmi";
import type { Address } from "viem";
import { Header } from "./components/Header";
import { EligibilityBanner } from "./components/EligibilityBanner";
import { AirdropCard, type CardAction } from "./components/AirdropCard";
import { StatsRow } from "./components/StatsRow";
import { ClaimModal } from "./components/ClaimModal";
import { AddressLookup } from "./components/AddressLookup";
import { CHAIN } from "./config/wagmi";
import { useAirdropStatus } from "./hooks/useAirdropStatus";
import { useClaim } from "./hooks/useClaim";
import { findAllocation, useProofs } from "./hooks/useProofs";
import { formatAmount, shortAddress } from "./lib/format";
import { STATE_LABEL } from "./lib/status";

export default function App() {
  const { address: connected, chainId } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { switchChain } = useSwitchChain();

  const [lookup, setLookup] = useState<Address>();
  const [lookupOpen, setLookupOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const account = lookup ?? connected;
  const proofs = useProofs();
  const allocation = findAllocation(proofs.data, account);

  const status = useAirdropStatus({
    account,
    allocation,
    proofsRoot: proofs.data?.root,
    proofsLoading: proofs.isLoading,
  });
  const { claim, stage, hash, error, reset } = useClaim();

  useEffect(() => setRevealed(false), [account]);

  const { state, symbol, decimals } = status;
  const amountText = allocation ? formatAmount(allocation.amount, decimals) : undefined;
  const wrongChain = Boolean(connected) && chainId !== CHAIN.id;
  const viewingOther = Boolean(lookup && connected && lookup.toLowerCase() !== connected.toLowerCase());

  function startClaim() {
    if (allocation) void claim(allocation.amount, allocation.proof);
  }

  function reveal() {
    setRevealed(true);
    document.getElementById("airdrop-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  let action: CardAction = { label: STATE_LABEL[state], disabled: true };
  if (state === "available" && allocation) {
    if (!revealed) action = { label: "Reveal airdrop", onClick: reveal };
    else if (!connected) action = { label: "Connect wallet to claim", onClick: openConnectModal };
    else if (lookup && viewingOther) action = { label: "Connect this address to claim", disabled: true };
    else if (wrongChain) action = { label: `Switch to ${CHAIN.name}`, onClick: () => switchChain({ chainId: CHAIN.id }) };
    else action = { label: `Claim ${amountText} ${symbol}`, onClick: startClaim };
  }

  async function copyAddress() {
    if (!account) return;
    await navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <Header />
      <main className="container main">
        <div className="address-row">
          {account ? (
            <>
              <h1 className="address" title={account}>{shortAddress(account)}</h1>
              <button className="btn btn-outline btn-small" onClick={copyAddress}>
                {copied ? "Copied" : "Copy"}
              </button>
              <button className="btn btn-outline btn-small" onClick={() => setLookupOpen((o) => !o)}>
                Check another address
              </button>
              {lookup && (
                <button
                  className="btn btn-outline btn-small"
                  onClick={() => {
                    setLookup(undefined);
                    setLookupOpen(false);
                  }}
                >
                  {connected ? "Back to my wallet" : "Clear"}
                </button>
              )}
            </>
          ) : (
            <>
              <h1 className="address">Your airdrop</h1>
              <button className="btn btn-outline btn-small" onClick={() => setLookupOpen((o) => !o)}>
                Check an address
              </button>
            </>
          )}
        </div>

        {lookupOpen && (
          <AddressLookup
            onSubmit={(a) => {
              setLookup(a);
              setLookupOpen(false);
            }}
            onClose={() => setLookupOpen(false)}
          />
        )}

        {lookup && <p className="viewing-note">Viewing {shortAddress(lookup)} in read-only mode.</p>}

        <EligibilityBanner
          state={state}
          amountText={amountText}
          symbol={symbol}
          onReveal={reveal}
          onConnect={openConnectModal}
        />

        <div className="grid">
          <AirdropCard
            state={state}
            amountText={amountText}
            symbol={symbol}
            token={status.token}
            startTime={status.startTime}
            expirationTime={status.expirationTime}
            revealed={revealed}
            action={action}
          />
          <StatsRow
            symbol={symbol}
            decimals={decimals}
            totalClaimed={status.totalClaimed}
            contractBalance={status.contractBalance}
            startTime={status.startTime}
            expirationTime={status.expirationTime}
          />
        </div>
      </main>

      <ClaimModal
        stage={stage}
        hash={hash}
        error={error}
        amountText={amountText}
        symbol={symbol}
        onClose={reset}
        onRetry={startClaim}
      />
    </>
  );
}
