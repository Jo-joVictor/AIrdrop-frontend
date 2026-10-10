export const airdropAbi = [
  {
    type: "function",
    name: "claim",
    stateMutability: "nonpayable",
    inputs: [
      { name: "account", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "merkleProof", type: "bytes32[]" },
      { name: "v", type: "uint8" },
      { name: "r", type: "bytes32" },
      { name: "s", type: "bytes32" },
    ],
    outputs: [],
  },
  { type: "function", name: "getMerkleRoot", stateMutability: "view", inputs: [], outputs: [{ type: "bytes32" }] },
  { type: "function", name: "getAirdropToken", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "getStartTime", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "getExpirationTime", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "getTotalClaimed", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  {
    type: "function",
    name: "hasClaimed",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "bool" }],
  },
  { type: "function", name: "isActive", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { type: "event", name: "Claimed", inputs: [
    { name: "account", type: "address", indexed: true },
    { name: "amount", type: "uint256", indexed: false },
  ] },
  // Custom errors, included so viem can decode reverts into readable names.
  { type: "error", name: "MerkleAirdrop__InvalidProof", inputs: [] },
  { type: "error", name: "MerkleAirdrop__AlreadyClaimed", inputs: [] },
  { type: "error", name: "MerkleAirdrop__InvalidSignature", inputs: [] },
  { type: "error", name: "MerkleAirdrop__AirdropExpired", inputs: [] },
  { type: "error", name: "MerkleAirdrop__AirdropNotStarted", inputs: [] },
  { type: "error", name: "MerkleAirdrop__InsufficientBalance", inputs: [] },
  { type: "error", name: "MerkleAirdrop__NoTokensToRecover", inputs: [] },
] as const;

export const erc20Abi = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
] as const;
