import { BigNumber } from "ethers";
import * as fs from "fs";
import * as path from "path";
import { Sumplete__factory } from "../types";
import { Ship } from "../utils";

const snarkjs = require("snarkjs");
const ff = require("ffjavascript");

interface ICallData {
  pi_a: [BigNumber, BigNumber];
  pi_b: [[BigNumber, BigNumber], [BigNumber, BigNumber]];
  pi_c: [BigNumber, BigNumber];
  input: BigNumber[];
}

interface Proof {
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    protocol: string;
    curve: string;
  };
  publicSignals: string[];
}

const BASE_PATH = path.resolve(__dirname, "../circuits");

function p256(n: BigInt): BigNumber {
  let nstr = n.toString(16);
  while (nstr.length < 64) nstr = "0" + nstr;
  nstr = `0x${nstr}`;
  return BigNumber.from(nstr);
}

async function generateCallData(): Promise<ICallData> {
  const zkProof = await generateProof();

  const proof = ff.utils.unstringifyBigInts(zkProof.proof);
  const pub = ff.utils.unstringifyBigInts(zkProof.publicSignals) as BigInt[];

  return {
    pi_a: [p256(proof.pi_a[0]), p256(proof.pi_a[1])],
    pi_b: [
      [p256(proof.pi_b[0][1]), p256(proof.pi_b[0][0])],
      [p256(proof.pi_b[1][1]), p256(proof.pi_b[1][0])],
    ],
    pi_c: [p256(proof.pi_c[0]), p256(proof.pi_c[1])],
    input: pub.map((item) => p256(item)),
  };
}

async function generateProof(): Promise<Proof> {
  // read input parameters
  const inputPath = path.resolve(BASE_PATH, "./sumplete.input.json");
  const inputData = fs.readFileSync(inputPath, "utf8");
  const input = JSON.parse(inputData);

  // calculate witness
  await snarkjs.wtns.calculate(
    input,
    path.resolve(BASE_PATH, "./out/sumplete.wasm"),
    path.resolve(BASE_PATH, "./out/sumplete.wtns")
  );

  // calculate proof
  const proof = await snarkjs.groth16.prove(
    path.resolve(BASE_PATH, "./out/sumplete.zkey"),
    path.resolve(BASE_PATH, "./out/sumplete.wtns")
  );

  return proof;
}

async function main() {
  const ship = await Ship.create();
  const sumplete = await ship.connect(Sumplete__factory);

  const { pi_a, pi_b, pi_c, input } = await generateCallData();

  const result = await sumplete.verifyProof(pi_a, pi_b, pi_c, input);
  console.log("result: ", result);
}

main()
  .then(() => process.exit(0))
  .catch((err: Error) => {
    console.error(err);
    process.exit(1);
  });
