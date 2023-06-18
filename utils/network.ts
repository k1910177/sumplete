export function rpcUrl(networkName: string) {
  if (networkName == "localhost") {
    return "http://127.0.0.1:8545";
  }
  return process.env[networkName.toUpperCase() + "_RPC_URL"] || "";
}

export function verifyApiKey(scannerName: string) {
  const apiKey = process.env[scannerName.toUpperCase() + "_API_KEY"] || "";
  return {
    etherscan: {
      apiKey,
    },
  };
}

export function accounts() {
  return {
    mnemonic:
      process.env.MNEMONIC ||
      "test test test test test test test test test test test junk",
  };
}
