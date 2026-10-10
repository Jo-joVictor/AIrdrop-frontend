/**
 * Sanity checks without a deployed contract:
 *  1. Every proof in public/proofs.json verifies against the root, using the same
 *     leaf and sorted-pair hashing as the contract (OpenZeppelin MerkleProof.verify).
 *  2. An EIP-712 AirdropClaim signature produced the way the dapp signs it recovers
 *     to the signer, and splits into the v, r, s the contract expects.
 */
import fs from "node:fs";
import {
  concat,
  encodeAbiParameters,
  keccak256,
  parseSignature,
  recoverTypedDataAddress,
  type Hex,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const data = JSON.parse(fs.readFileSync("public/proofs.json", "utf8")) as {
  root: Hex;
  entries: Record<string, { amount: string; proof: Hex[] }>;
};

function hashPair(a: Hex, b: Hex): Hex {
  return BigInt(a) < BigInt(b) ? keccak256(concat([a, b])) : keccak256(concat([b, a]));
}

let failures = 0;
for (const [address, { amount, proof }] of Object.entries(data.entries)) {
  const inner = keccak256(
    encodeAbiParameters([{ type: "address" }, { type: "uint256" }], [address as Hex, BigInt(amount)]),
  );
  const leaf = keccak256(concat([inner]));
  const computed = proof.reduce<Hex>((acc, sibling) => hashPair(acc, sibling), leaf);
  const ok = computed === data.root;
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  proof  ${address}`);
}

async function checkSignature() {
  const account = privateKeyToAccount(generatePrivateKey());
  const domain = {
    name: "MerkleAirdrop",
    version: "1",
    chainId: 11155111,
    verifyingContract: "0x0000000000000000000000000000000000000001",
  } as const;
  const types = {
    AirdropClaim: [
      { name: "account", type: "address" },
      { name: "amount", type: "uint256" },
    ],
  } as const;
  const message = { account: account.address, amount: 1000n } as const;

  const signature = await account.signTypedData({ domain, types, primaryType: "AirdropClaim", message });
  const recovered = await recoverTypedDataAddress({ domain, types, primaryType: "AirdropClaim", message, signature });
  const { r, s, v, yParity } = parseSignature(signature);
  const vNum = v !== undefined ? Number(v) : 27 + yParity;

  const ok = recovered === account.address && (vNum === 27 || vNum === 28) && r.length === 66 && s.length === 66;
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  EIP-712 signature round trip (v=${vNum})`);
}

await checkSignature();

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log("\nAll checks passed.");
