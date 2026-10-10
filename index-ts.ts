import { sepolia } from "viem/chains"
import {
  createWalletClient,
  custom,
  formatEther,
  parseEther,
  defineChain,
  createPublicClient,
  BaseError,
  ContractFunctionRevertedError,
  type Chain,
  type WalletClient,
  type PublicClient,
} from "viem"
import "viem/window"
import { abi, contractAddress } from "./constants-ts"

const connectButton = document.getElementById(
  "connectButton",
) as HTMLButtonElement
const fundButton = document.getElementById("fundButton") as HTMLButtonElement
const balanceButton = document.getElementById(
  "balanceButton",
) as HTMLButtonElement
const withdrawButton = document.getElementById(
  "withdrawButton",
) as HTMLButtonElement
const ethAmountInput = document.getElementById("ethAmount") as HTMLInputElement
const statusText = document.getElementById("status") as HTMLParagraphElement

let walletClient: WalletClient
let publicClient: PublicClient

function setStatus(message: string, isError = false): void {
  statusText.textContent = message
  statusText.style.color = isError ? "crimson" : "inherit"
}

function explain(error: unknown): string {
  if (error instanceof BaseError) {
    const reverted = error.walk(
      (e) => e instanceof ContractFunctionRevertedError,
    )
    if (reverted instanceof ContractFunctionRevertedError) {
      const name = reverted.data?.errorName
      if (name === "FundMe__NotEnoughETH")
        return "Not enough ETH: the minimum is $50 worth."
      if (name === "FundMe__NotOwner")
        return "Only the contract owner can withdraw."
    }
    return error.shortMessage
  }
  return "Something went wrong. Check the console for details."
}

async function connect(): Promise<void> {
  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    })
    await walletClient.requestAddresses()
    connectButton.innerHTML = "Connected"
  } else {
    connectButton.innerHTML = "Please install MetaMask"
  }
}

async function fund(): Promise<void> {
  const ethAmount = ethAmountInput.value
  console.log(`Funding with ${ethAmount}...`)

  if (typeof window.ethereum !== "undefined") {
    try {
      walletClient = createWalletClient({
        transport: custom(window.ethereum),
      })
      const [account] = await walletClient.requestAddresses()
      const currentChain = await getCurrentChain(walletClient)

      publicClient = createPublicClient({
        transport: custom(window.ethereum),
      })
      setStatus("Checking the transaction...")
      const { request } = await publicClient.simulateContract({
        address: contractAddress,
        abi,
        functionName: "fund",
        account,
        chain: currentChain,
        value: parseEther(ethAmount),
      })
      setStatus("Confirm the transaction in your wallet...")
      const hash = await walletClient.writeContract(request)
      setStatus(`Sent (${hash}). Waiting for confirmation...`)
      await publicClient.waitForTransactionReceipt({ hash })
      setStatus(`Funded with ${ethAmount} ETH. Thank you!`)
    } catch (error) {
      console.log(error)
      setStatus(explain(error), true)
    }
  } else {
    fundButton.innerHTML = "Please install MetaMask"
  }
}

async function getBalance(): Promise<void> {
  if (typeof window.ethereum !== "undefined") {
    try {
      publicClient = createPublicClient({
        transport: custom(window.ethereum),
      })
      const balance = await publicClient.getBalance({
        address: contractAddress,
      })
      setStatus(`Contract balance: ${formatEther(balance)} ETH`)
    } catch (error) {
      console.log(error)
      setStatus(explain(error), true)
    }
  } else {
    balanceButton.innerHTML = "Please install MetaMask"
  }
}

async function withdraw(): Promise<void> {
  console.log(`Withdrawing...`)

  if (typeof window.ethereum !== "undefined") {
    try {
      walletClient = createWalletClient({
        transport: custom(window.ethereum),
      })
      publicClient = createPublicClient({
        transport: custom(window.ethereum),
      })
      const [account] = await walletClient.requestAddresses()
      const currentChain = await getCurrentChain(walletClient)

      setStatus("Checking the transaction...")
      const { request } = await publicClient.simulateContract({
        account,
        address: contractAddress,
        abi,
        functionName: "cheaperWithdraw", // or "withdraw"
        chain: currentChain,
      })
      setStatus("Confirm the transaction in your wallet...")
      const hash = await walletClient.writeContract(request)
      setStatus(`Sent (${hash}). Waiting for confirmation...`)
      await publicClient.waitForTransactionReceipt({ hash })
      setStatus("Withdrawal complete.")
    } catch (error) {
      console.log(error)
      setStatus(explain(error), true)
    }
  } else {
    withdrawButton.innerHTML = "Please install MetaMask"
  }
}

async function getCurrentChain(client: WalletClient): Promise<Chain> {
  const chainId = await client.getChainId()
  const currentChain = defineChain({
    id: chainId,
    name: "Custom Chain",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ["http://localhost:8545"],
      },
    },
  })
  return currentChain
}

// Event listeners
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw