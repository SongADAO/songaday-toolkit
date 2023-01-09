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
  "0x608060405234801561001057600080fd5b506107ee806100206000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c8063469ea2e3146100515780639e3b1d1f14610066578063b73172e014610079578063e1204ce71461008c575b600080fd5b61006461005f36600461069f565b61009f565b005b61006461007436600461064a565b61021d565b61006461008736600461064a565b6103a1565b61006461009a36600461069f565b6104b9565b604051630b3f780560e41b81526001600160a01b038581166004830152868116602483015287169063b3f7805090604401600060405180830381600087803b1580156100ea57600080fd5b505af11580156100fe573d6000803e3d6000fd5b50505050836001600160a01b031663f242432a33888686866101209190610770565b6040518563ffffffff1660e01b815260040161013f94939291906106fe565b600060405180830381600087803b15801561015957600080fd5b505af115801561016d573d6000803e3d6000fd5b505050505b8082101561021557604051630808ea6760e31b81526001600160a01b038716906340475338906101d090879087907f973bb64086f173ec8099b7ed3d43da984f4a332e4417a08bc6a286e6402b058690600190600090600401610736565b600060405180830381600087803b1580156101ea57600080fd5b505af11580156101fe573d6000803e3d6000fd5b50505050818061020d90610787565b925050610172565b505050505050565b604051630b3f780560e41b81526001600160a01b038481166004830152858116602483015286169063b3f7805090604401600060405180830381600087803b15801561026857600080fd5b505af115801561027c573d6000803e3d6000fd5b505050505b8082101561039a57604051635c46a7ef60e11b81523360048201526001600160a01b03868116602483015260448201849052608060648301526000608483015284169063b88d4fde9060a401600060405180830381600087803b1580156102e757600080fd5b505af11580156102fb573d6000803e3d6000fd5b5050604051630808ea6760e31b81526001600160a01b03881692506340475338915061035590869086907f73ad2146b3d3a286642c794379d750360a2d53a3459a11b3e5d6cc900f55f44a90600190600090600401610736565b600060405180830381600087803b15801561036f57600080fd5b505af1158015610383573d6000803e3d6000fd5b50505050818061039290610787565b925050610281565b5050505050565b8082101561039a57604051635c46a7ef60e11b81523360048201526001600160a01b03868116602483015260448201849052608060648301526000608483015284169063b88d4fde9060a401600060405180830381600087803b15801561040757600080fd5b505af115801561041b573d6000803e3d6000fd5b5050604051630808ea6760e31b81526001600160a01b03881692506340475338915061047490869086907f73ad2146b3d3a286642c794379d750360a2d53a3459a11b3e5d6cc900f55f44a906001908b90600401610736565b600060405180830381600087803b15801561048e57600080fd5b505af11580156104a2573d6000803e3d6000fd5b5050505081806104b190610787565b9250506103a1565b604051630b3f780560e41b81526001600160a01b038581166004830152868116602483015287169063b3f7805090604401600060405180830381600087803b15801561050457600080fd5b505af1158015610518573d6000803e3d6000fd5b50505050836001600160a01b031663f242432a338886868661053a9190610770565b6040518563ffffffff1660e01b815260040161055994939291906106fe565b600060405180830381600087803b15801561057357600080fd5b505af1158015610587573d6000803e3d6000fd5b505050505b8082101561021557604051630808ea6760e31b81526001600160a01b038716906340475338906105e990879087907f973bb64086f173ec8099b7ed3d43da984f4a332e4417a08bc6a286e6402b0586906001908c90600401610736565b600060405180830381600087803b15801561060357600080fd5b505af1158015610617573d6000803e3d6000fd5b50505050818061062690610787565b92505061058c565b80356001600160a01b038116811461064557600080fd5b919050565b600080600080600060a0868803121561066257600080fd5b61066b8661062e565b94506106796020870161062e565b93506106876040870161062e565b94979396509394606081013594506080013592915050565b60008060008060008060c087890312156106b857600080fd5b6106c18761062e565b95506106cf6020880161062e565b94506106dd6040880161062e565b9350606087013592506080870135915060a087013590509295509295509295565b6001600160a01b0394851681529290931660208301526040820152606081019190915260a06080820181905260009082015260c00190565b6001600160a01b03958616815260208101949094526001600160e01b03199290921660408401526060830152909116608082015260a00190565b600082821015610782576107826107a2565b500390565b600060001982141561079b5761079b6107a2565b5060010190565b634e487b7160e01b600052601160045260246000fdfea26469706673582212206be7669f233c18a27f5e1b6bfbac5232744cca0d982e08168f252e75329606b064736f6c63430008050033";

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
