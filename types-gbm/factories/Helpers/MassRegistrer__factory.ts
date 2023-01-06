/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  MassRegistrer,
  MassRegistrerInterface,
} from "../../Helpers/MassRegistrer";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_GBM",
        type: "address",
      },
      {
        internalType: "address",
        name: "_initiator",
        type: "address",
      },
      {
        internalType: "address",
        name: "_ERC1155Contract",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_tokenID",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_indexStart",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_indexEnd",
        type: "uint256",
      },
    ],
    name: "massRegistrerERC1155Default",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_GBM",
        type: "address",
      },
      {
        internalType: "address",
        name: "_initiator",
        type: "address",
      },
      {
        internalType: "address",
        name: "_ERC1155Contract",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_tokenID",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_indexStart",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_indexEnd",
        type: "uint256",
      },
    ],
    name: "massRegistrerERC1155Each",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_GBM",
        type: "address",
      },
      {
        internalType: "address",
        name: "_initiator",
        type: "address",
      },
      {
        internalType: "address",
        name: "_ERC721Contract",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_tokenIDStart",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_tokenIDEnd",
        type: "uint256",
      },
    ],
    name: "massRegistrerERC721Default",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_GBM",
        type: "address",
      },
      {
        internalType: "address",
        name: "_initiator",
        type: "address",
      },
      {
        internalType: "address",
        name: "_ERC721Contract",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_tokenIDStart",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_tokenIDEnd",
        type: "uint256",
      },
    ],
    name: "massRegistrerERC721Each",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50610b10806100206000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c8063469ea2e3146100515780639e3b1d1f1461006d578063b73172e014610089578063e1204ce7146100a5575b600080fd5b61006b60048036038101906100669190610763565b6100c1565b005b610087600480360381019061008291906106e8565b610263565b005b6100a3600480360381019061009e91906106e8565b6103f7565b005b6100bf60048036038101906100ba9190610763565b61051d565b005b8573ffffffffffffffffffffffffffffffffffffffff1663b3f7805085876040518363ffffffff1660e01b81526004016100fc92919061084f565b600060405180830381600087803b15801561011657600080fd5b505af115801561012a573d6000803e3d6000fd5b505050508373ffffffffffffffffffffffffffffffffffffffff1663f242432a3388868686610159919061097e565b6040518563ffffffff1660e01b815260040161017894939291906108c2565b600060405180830381600087803b15801561019257600080fd5b505af11580156101a6573d6000803e3d6000fd5b505050505b8082101561025b578573ffffffffffffffffffffffffffffffffffffffff16634047533885857f973bb64086f173ec8099b7ed3d43da984f4a332e4417a08bc6a286e6402b0586600160006040518663ffffffff1660e01b815260040161021695949392919061091a565b600060405180830381600087803b15801561023057600080fd5b505af1158015610244573d6000803e3d6000fd5b50505050818061025390610a2c565b9250506101ab565b505050505050565b8473ffffffffffffffffffffffffffffffffffffffff1663b3f7805084866040518363ffffffff1660e01b815260040161029e92919061084f565b600060405180830381600087803b1580156102b857600080fd5b505af11580156102cc573d6000803e3d6000fd5b505050505b808210156103f0578273ffffffffffffffffffffffffffffffffffffffff1663b88d4fde3387856040518463ffffffff1660e01b815260040161031693929190610878565b600060405180830381600087803b15801561033057600080fd5b505af1158015610344573d6000803e3d6000fd5b505050508473ffffffffffffffffffffffffffffffffffffffff16634047533884847f73ad2146b3d3a286642c794379d750360a2d53a3459a11b3e5d6cc900f55f44a600160006040518663ffffffff1660e01b81526004016103ab95949392919061091a565b600060405180830381600087803b1580156103c557600080fd5b505af11580156103d9573d6000803e3d6000fd5b5050505081806103e890610a2c565b9250506102d1565b5050505050565b5b80821015610516578273ffffffffffffffffffffffffffffffffffffffff1663b88d4fde3387856040518463ffffffff1660e01b815260040161043d93929190610878565b600060405180830381600087803b15801561045757600080fd5b505af115801561046b573d6000803e3d6000fd5b505050508473ffffffffffffffffffffffffffffffffffffffff16634047533884847f73ad2146b3d3a286642c794379d750360a2d53a3459a11b3e5d6cc900f55f44a6001896040518663ffffffff1660e01b81526004016104d195949392919061091a565b600060405180830381600087803b1580156104eb57600080fd5b505af11580156104ff573d6000803e3d6000fd5b50505050818061050e90610a2c565b9250506103f8565b5050505050565b8573ffffffffffffffffffffffffffffffffffffffff1663b3f7805085876040518363ffffffff1660e01b815260040161055892919061084f565b600060405180830381600087803b15801561057257600080fd5b505af1158015610586573d6000803e3d6000fd5b505050508373ffffffffffffffffffffffffffffffffffffffff1663f242432a33888686866105b5919061097e565b6040518563ffffffff1660e01b81526004016105d494939291906108c2565b600060405180830381600087803b1580156105ee57600080fd5b505af1158015610602573d6000803e3d6000fd5b505050505b808210156106b6578573ffffffffffffffffffffffffffffffffffffffff16634047533885857f973bb64086f173ec8099b7ed3d43da984f4a332e4417a08bc6a286e6402b058660018a6040518663ffffffff1660e01b815260040161067195949392919061091a565b600060405180830381600087803b15801561068b57600080fd5b505af115801561069f573d6000803e3d6000fd5b5050505081806106ae90610a2c565b925050610607565b505050505050565b6000813590506106cd81610aac565b92915050565b6000813590506106e281610ac3565b92915050565b600080600080600060a0868803121561070457610703610aa4565b5b6000610712888289016106be565b9550506020610723888289016106be565b9450506040610734888289016106be565b9350506060610745888289016106d3565b9250506080610756888289016106d3565b9150509295509295909350565b60008060008060008060c087890312156107805761077f610aa4565b5b600061078e89828a016106be565b965050602061079f89828a016106be565b95505060406107b089828a016106be565b94505060606107c189828a016106d3565b93505060806107d289828a016106d3565b92505060a06107e389828a016106d3565b9150509295509295509295565b6107f9816109b2565b82525050565b610808816109c4565b82525050565b61081781610a1a565b82525050565b600061082a60008361096d565b915061083582610aa9565b600082019050919050565b61084981610a10565b82525050565b600060408201905061086460008301856107f0565b61087160208301846107f0565b9392505050565b600060808201905061088d60008301866107f0565b61089a60208301856107f0565b6108a76040830184610840565b81810360608301526108b88161081d565b9050949350505050565b600060a0820190506108d760008301876107f0565b6108e460208301866107f0565b6108f16040830185610840565b6108fe6060830184610840565b818103608083015261090f8161081d565b905095945050505050565b600060a08201905061092f60008301886107f0565b61093c6020830187610840565b61094960408301866107ff565b610956606083018561080e565b61096360808301846107f0565b9695505050505050565b600082825260208201905092915050565b600061098982610a10565b915061099483610a10565b9250828210156109a7576109a6610a75565b5b828203905092915050565b60006109bd826109f0565b9050919050565b60007fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b6000610a2582610a10565b9050919050565b6000610a3782610a10565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff821415610a6a57610a69610a75565b5b600182019050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600080fd5b50565b610ab5816109b2565b8114610ac057600080fd5b50565b610acc81610a10565b8114610ad757600080fd5b5056fea264697066735822122094d44c3aaba28069672151f490878f68c8fa6d5867170384560b8e658470a16264736f6c63430008050033";

type MassRegistrerConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MassRegistrerConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class MassRegistrer__factory extends ContractFactory {
  constructor(...args: MassRegistrerConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<MassRegistrer> {
    return super.deploy(overrides || {}) as Promise<MassRegistrer>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): MassRegistrer {
    return super.attach(address) as MassRegistrer;
  }
  override connect(signer: Signer): MassRegistrer__factory {
    return super.connect(signer) as MassRegistrer__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MassRegistrerInterface {
    return new utils.Interface(_abi) as MassRegistrerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MassRegistrer {
    return new Contract(address, _abi, signerOrProvider) as MassRegistrer;
  }
}