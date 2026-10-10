/**
 * Builds the Merkle tree for the airdrop and writes public/proofs.json.
 *
 * Usage:  npm run proofs [path/to/recipients.csv]
 * CSV:    header row "address,amount", amounts in whole tokens (e.g. 1000 or 5000.5).
 *
 * Leaf format matches the contract:
 *   keccak256(bytes.concat(keccak256(abi.encode(account, amount))))
 * which is what @openzeppelin/merkle-tree's StandardMerkleTree produces.
 */
import fs from "node:fs";
import path from "node:path";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { getAddress, isAddress, parseUnits } from "viem";

const DECIMALS = 18;
const csvPath = path.resolve(process.argv[2] ?? "scripts/recipients.csv");
const outPath = path.resolve("public/proofs.json");

const lines = fs
  .readFileSync(csvPath, "utf8")
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter(Boolean);

if (lines.length < 2) throw new Error("CSV needs a header row and at least one recipient.");

const seen = new Set<string>();
const values: [string, string][] = [];

lines.slice(1).forEach((line, i) => {
  const [rawAddress, rawAmount] = line.split(",").map((s) => s.trim());
  const row = i + 2;
  if (!rawAddress || !isAddress(rawAddress)) throw new Error(`Row ${row}: invalid address "${rawAddress}"`);
  if (!rawAmount || !/^\d+(\.\d+)?$/.test(rawAmount)) throw new Error(`Row ${row}: invalid amount "${rawAmount}"`);

  const key = rawAddress.toLowerCase();
  if (seen.has(key)) throw new Error(`Row ${row}: duplicate address ${rawAddress}`);
  seen.add(key);

  const amount = parseUnits(rawAmount, DECIMALS);
  if (amount === 0n) throw new Error(`Row ${row}: amount must be greater than zero`);
  values.push([getAddress(rawAddress), amount.toString()]);
});

const tree = StandardMerkleTree.of(values, ["address", "uint256"]);

const entries: Record<string, { amount: string; proof: string[] }> = {};
for (const [i, [address, amount]] of tree.entries()) {
  entries[address.toLowerCase()] = { amount, proof: tree.getProof(i) };
}

const total = values.reduce((sum, [, amount]) => sum + BigInt(amount), 0n);

fs.writeFileSync(
  outPath,
  JSON.stringify({ root: tree.root, decimals: DECIMALS, count: values.length, total: total.toString(), entries }, null, 2),
);

console.log(`Recipients : ${values.length}`);
console.log(`Total (wei): ${total}`);
console.log(`Merkle root: ${tree.root}`);
console.log(`Written to : ${outPath}`);
console.log("\nDeploy MerkleAirdrop with this root, then fund the contract with at least the total above.");
