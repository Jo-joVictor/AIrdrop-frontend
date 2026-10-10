import { sepolia } from "https://esm.sh/viem/chains"
import {
  createWalletClient,
  custom,
  formatEther,
  parseEther,
  defineChain,
  createPublicClient,
  BaseError,
  ContractFunctionRevertedError,
} from "https://esm.sh/viem"
import "https://esm.sh/viem/window"
import { abi, contractAddress } from "./constants-js.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
const ethAmountInput = document.getElementById("ethAmount")
const statusText = document.getElementById("status")

let walletClient
let publicClient

function setStatus(message, isError = false) {
  statusText.textContent = message
  statusText.style.color = isError ? "crimson" : "inherit"
}

function explain(error) {
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

async function connect() {
  if (typeof window.ethereum === "undefined") {
    setStatus("No wallet found. Install MetaMask and refresh the page.", true)
    return
  }
  try {
    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    })
    const [account] = await walletClient.requestAddresses()
    connectButton.innerHTML = `${account.slice(0, 6)}...${account.slice(-4)}`
    setStatus(`Connected: ${account}`)
  } catch (error) {
    console.log(error)
    setStatus(explain(error), true)
  }
}

async function fund() {
  const ethAmount = ethAmountInput.value.trim()
  console.log(`Funding with ${ethAmount}...`)

  if (typeof window.ethereum !== "undefined") {
    try {
      walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum),
      })
      publicClient = createPublicClient({
        chain: sepolia,
        transport: custom(window.ethereum),
      })
      const [account] = await walletClient.requestAddresses()
      await walletClient.switchChain({ id: sepolia.id })

      setStatus("Confirm the transaction in your wallet...")
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi,
        functionName: "fund",
        account,
        chain: sepolia,
        value: parseEther(ethAmount),
      })
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

async function getBalance() {
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

async function withdraw() {
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
        functionName: "cheaperWithdraw", 
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

async function getCurrentChain(client) {
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

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw