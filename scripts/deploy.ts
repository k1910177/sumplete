import { Sumplete__factory } from "../types";
import { Ship } from "../utils";

async function main() {
  const ship = await Ship.create();
  await ship.deploy(Sumplete__factory);
}

main()
  .then(() => process.exit(0))
  .catch((err: Error) => {
    console.error(err);
    process.exit(1);
  });
