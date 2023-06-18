const provider = new ethers.providers.Web3Provider(window.ethereum);
const abi = [
  "function check(uint[2] a, uint[2][2] b, uint[2] c, uint[15] input)",
  "function verifyProof(uint[2] a, uint[2][2] b, uint[2] c, uint[15] input) view returns (bool r)",
  "function balanceOf(address account) view returns (uint256)",
];
const address = "0xD2De7d805c4407Fb619b22f8e2747b058b3D1588";

async function setup() {
  await provider.send("eth_requestAccounts", []);
}

function getUserInput() {
  const grid = document.getElementById("grid");

  const puzzle = [];
  const solution = [];
  const sum = [[], []];

  for (let i = 0; i < gridsize - 1; i++) {
    puzzle.push([]);
    solution.push([]);

    for (let j = 0; j < gridsize; j++) {
      const index = i * gridsize + j;
      const cell = grid.children[index];

      if (j == gridsize - 1) {
        sum[0].push(cell.textContent);
      } else {
        puzzle[i].push(cell.textContent);
        solution[i].push(
          cell.classList.contains("delete") ? "0" : cell.textContent
        );
      }
    }
  }

  for (let j = 0; j < gridsize - 1; j++) {
    const index = (gridsize - 1) * gridsize + j;
    const cell = grid.children[index];
    sum[1].push(cell.textContent);
  }

  return { puzzle, solution, sum };
}

async function verify() {
  const userInput = getUserInput();

  const signer = provider.getSigner();
  const sumplete = new ethers.Contract(address, abi, signer);

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    userInput,
    "sumplete.wasm",
    "sumplete.zkey"
  );
  const pi_a = [proof.pi_a[0], proof.pi_a[1]];
  const pi_b = [
    [proof.pi_b[0][1], proof.pi_b[0][0]],
    [proof.pi_b[1][1], proof.pi_b[1][0]],
  ];
  const pi_c = [proof.pi_c[0], proof.pi_c[1]];
  const input = publicSignals;

  await sumplete.check(pi_a, pi_b, pi_c, input);
}

setup();
