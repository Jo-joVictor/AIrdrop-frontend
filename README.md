# Fund Me (Frontend)

A minimal web3 front end for a `FundMe` smart contract. Visitors connect a wallet and donate ETH (minimum **$50 worth**, priced by a Chainlink ETH/USD feed). The contract owner can withdraw the funds.

Built with plain HTML, JavaScript or TypeScript, and [viem](https://viem.sh), bundled with [Vite](https://vite.dev). There is no framework.

- **Network:** Sepolia testnet
- **Contract address:** `YOUR_SEPOLIA_CONTRACT_ADDRESS`
- **Live site:** `YOUR_LIVE_URL`

## Features

- Connect a browser wallet (MetaMask or any injected wallet)
- Fund the contract with ETH (`fund`)
- Read the contract's ETH balance (`getBalance`)
- Owner-only withdrawal (`cheaperWithdraw`)
- Readable on-page status and error messages, including the contract's custom errors (`FundMe__NotEnoughETH`, `FundMe__NotOwner`)

## Project structure

| File | Purpose |
| --- | --- |
| `index.html` | The page: buttons, ETH input and a status line |
| `index-js.js` | JavaScript version of the app logic (loads viem from esm.sh) |
| `index-ts.ts` | TypeScript version of the same logic (uses viem from `node_modules`) |
| `constants-js.js` | Contract address and ABI for the JS version |
| `constants-ts.ts` | Contract address and ABI for the TS version (`as const` for type safety) |
| `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` | Dependencies and scripts |
| `tsconfig.json` | TypeScript settings (type check only, Vite does the bundling) |
| `.prettierrc`, `.prettierignore` | Code formatting rules and files Prettier skips |

The JS and TS versions behave the same. Use whichever you prefer (see [Choose JS or TS](#choose-js-or-ts)).

## Prerequisites

- [Node.js](https://nodejs.org) 18 or newer
- [pnpm](https://pnpm.io) (`npm install -g pnpm`)
- A browser wallet such as [MetaMask](https://metamask.io), set to the Sepolia network
- Some Sepolia ETH from a faucet, to pay for donations and gas

## Getting started

```bash
# 1. Install dependencies
pnpm install

# 2. Start the dev server
pnpm dev
```

Open the local URL that Vite prints (usually `http://localhost:5173`). Don't open `index.html` by double-clicking it, because browsers block module scripts on `file://` pages.

## Configuration

Set the deployed contract address on line 1 of **both** constants files:

```js
// constants-js.js and constants-ts.ts
export const contractAddress = "0xYourDeployedContractAddress"
```

The ABI in those files matches the `FundMe` contract in this project. If you change the contract, update the ABI in both files too.

### Choose JS or TS

In `index.html`, enable exactly one script line:

```html
<!-- TypeScript (recommended for hosting: viem is bundled locally) -->
<script src="./index-ts.ts" type="module"></script>

<!-- JavaScript -->
<!-- <script src="./index-js.js" type="module"></script> -->
```

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Starts the Vite dev server |
| `pnpm compile` | Type-checks the TypeScript files (`tsc`, no output files) |
| `pnpm format` | Formats the project with Prettier |
| `pnpm exec prettier --check .` | Checks formatting without changing files |
| `pnpm exec vite build` | Builds the production site into `dist/` |
| `pnpm anvil` | Starts a local Anvil chain from `fundme-anvil.json` (local testing only) |

## How to use the app

1. Click **Connect** and approve the connection in your wallet.
2. Enter an ETH amount and click **Buy Coffee**. The amount must be worth at least $50 at the current ETH price. Confirm the transaction in your wallet and wait for the status line to say it is funded.
3. Click **getBalance** to see the contract's current balance.
4. The contract owner (the account that deployed it) can click **Withdraw** to collect the funds.

## Deployment

### Contract

1. Deploy `FundMe` to Sepolia with Foundry, passing Chainlink's Sepolia ETH/USD price feed address as the constructor argument. Check the address on [Chainlink's price feed list](https://docs.chain.link/data-feeds/price-feeds/addresses).
2. Put the deployed address in both constants files.

### Website

Build the site and upload the `dist/` folder to any static host (Vercel, Netlify, GitHub Pages and so on):

```bash
pnpm exec vite build
```

On Vercel or Netlify, set the build command to `pnpm exec vite build` and the output directory to `dist`.

## Local testing with Anvil

1. Run `anvil`.
2. Deploy a mock price feed, then deploy `FundMe` with the mock's address as the constructor argument.
3. Add the Anvil network to your wallet (RPC `http://localhost:8545`, chain ID `31337`) and import one of Anvil's test keys.
4. Set `contractAddress` to the address your deploy prints.

With the mock feed at $2,000 per ETH, the $50 minimum is 0.025 ETH.

## Troubleshooting

| Problem | Likely cause and fix |
| --- | --- |
| "Please install MetaMask" | No wallet detected. Install or enable one, then refresh. |
| `tsc` error about `moduleResolution` or import extensions | Make sure `tsconfig.json` uses `"module": "ESNext"` and `"moduleResolution": "bundler"`. |
| `ERR_PNPM_IGNORED_BUILDS` | Keep `pnpm-workspace.yaml` in the project, or run `pnpm approve-builds` and select `esbuild`. |
| No wallet popup when funding | Check that `contractAddress` is correct for the network and that the wallet is on Sepolia. Open the browser console (F12) for the full error. |
| "Not enough ETH" message | The amount is under $50 worth. Try `0.05` ETH or more. |
| Withdraw fails | Only the account that deployed the contract can withdraw. |

## Notes

- The $50 minimum and the price feed address are set in the smart contract. The price feed address is immutable, so a wrong feed means redeploying the contract.
- On mainnet, every transaction is real money. Test thoroughly on Sepolia first, and consider an audit before holding real funds.

## License

MIT