import hre, { ethers } from "hardhat";
import { ContractFactory, Signer } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployOptions } from "hardhat-deploy/types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

type Modify<T, R> = Omit<T, keyof R> & R;
type DeployParam<T extends ContractFactory> = Parameters<
  InstanceType<{ new (): T }>["deploy"]
>;
type ContractInstance<T extends ContractFactory> = ReturnType<
  InstanceType<{ new (): T }>["attach"]
>;

export interface Accounts {
  [name: string]: SignerWithAddress;
}

class Ship {
  public signers: SignerWithAddress[];
  public hre: HardhatRuntimeEnvironment;
  private log: boolean | undefined;

  constructor(signers: SignerWithAddress[], log?: boolean) {
    this.log = log;
    this.hre = hre;
    this.signers = signers;
  }

  static create = async (log?: boolean): Promise<Ship> => {
    const signers = await ethers.getSigners();
    const ship = new Ship(signers, log);
    return ship;
  };

  get addresses(): string[] {
    return this.signers.map((signer) => signer.address);
  }

  get provider() {
    return this.hre.ethers.provider;
  }

  deploy = async <T extends ContractFactory>(
    contractFactory: new () => T,
    option?: Modify<
      DeployOptions,
      {
        from?: SignerWithAddress;
        args?: DeployParam<T>;
        log?: boolean;
      }
    >
  ) => {
    const contractName = contractFactory.name.split("__")[0];
    const from = option?.from || this.signers[0];

    const log =
      option?.log || this.log || this.hre.network.name !== "hardhat"
        ? true
        : false;
    const res = await this.hre.deployments.deploy(contractName, {
      ...option,
      from: from.address,
      args: option?.args,
      log,
    });

    return (await ethers.getContractAt(
      contractName,
      res.address,
      from
    )) as ContractInstance<T>;
  };

  connect = async <T extends ContractFactory>(
    contractFactory: new () => T,
    newAddress?: string | boolean,
    signer?: Signer
  ): Promise<ContractInstance<T>> => {
    const contractName = contractFactory.name.split("__")[0];
    if (typeof newAddress === "string") {
      const factory = (await ethers.getContractFactory(
        contractName,
        signer || this.signers[0]
      )) as T;
      return factory.attach(newAddress) as ContractInstance<T>;
    } else {
      return (await ethers.getContract(
        contractName,
        signer || this.signers[0]
      )) as ContractInstance<T>;
    }
  };
}

export default Ship;
