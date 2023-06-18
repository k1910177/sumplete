import axios from "axios";
import * as fs from "fs";
import * as stream from "stream";
import * as path from "path";
import { promisify } from "util";

const ptau = "powersOfTau28_hez_final_15.ptau";
const baseUrl = "https://hermez.s3-eu-west-1.amazonaws.com";
const basePath = path.resolve(__dirname, "../circuits");
const pipeline = promisify(stream.pipeline);

const main = async () => {
  const url = baseUrl + "/" + ptau;
  const path = basePath + "/" + ptau;
  if (fs.existsSync(path)) {
    return;
  }
  const res = await axios.get(url, {
    responseType: "stream",
  });
  await pipeline(res.data, fs.createWriteStream(path));
};

main()
  .then(() => process.exit(0))
  .catch((err: Error) => {
    console.error(err);
    process.exit(1);
  });
