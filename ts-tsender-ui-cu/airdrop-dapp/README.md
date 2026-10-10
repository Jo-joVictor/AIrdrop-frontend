# MCH Airdrop dapp (claimant only)

React + TypeScript + Vite + wagmi + viem + RainbowKit. Sepolia. White and blue theme.

## Setup

```bash
npm install
cp .env.example .env      # then fill in the values
```

## 1. Build the proofs

Put your recipients in `scripts/recipients.csv` (`address,amount`, whole tokens, 18 decimals).

```bash
npm run proofs            # writes public/proofs.json and prints the Merkle root
npm run verify:proofs     # checks every proof and the EIP-712 signature flow offline
```

## 2. Deploy and fund

1. Deploy `MerkleAirdrop` with the printed root, the MCH token address, a start time and a duration.
2. Transfer at least the printed total (in wei) of MCH to the airdrop contract.
3. Put the airdrop address in `.env` as `VITE_AIRDROP_ADDRESS`.

The dapp reads the token address from the contract, so only the airdrop address is needed.

## 3. Run

```bash
npm run dev
npm run build             # type-check and production build
```

Deploy `dist/` to Vercel. Add the same `VITE_` variables in the Vercel project settings.

## Notes

- If `public/proofs.json` does not match the root stored in the contract, the dapp shows "Proofs file is out of date" instead of letting a claim fail.
- The sample `recipients.csv` uses well-known test addresses. Replace it with your own list.
- Claiming requires the connected wallet to be the claiming address, because the EIP-712 signature must come from it.
