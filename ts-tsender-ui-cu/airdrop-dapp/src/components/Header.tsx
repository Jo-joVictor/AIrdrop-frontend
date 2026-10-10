import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <span className="brand">MCH Airdrop</span>
        <ConnectButton.Custom>
          {({ account, chain, openConnectModal, openAccountModal, openChainModal, mounted }) => {
            if (!mounted) return <div className="header-placeholder" />;
            if (!account || !chain) {
              return (
                <button className="btn btn-primary" onClick={openConnectModal}>
                  Connect wallet
                </button>
              );
            }
            if (chain.unsupported) {
              return (
                <button className="btn btn-danger" onClick={openChainModal}>
                  Wrong network
                </button>
              );
            }
            return (
              <button className="btn btn-outline" onClick={openAccountModal}>
                {account.displayName}
              </button>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </header>
  );
}
