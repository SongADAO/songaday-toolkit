/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  ERC20Generic,
  ERC20GenericInterface,
} from "../../tokens/ERC20Generic";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "_spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "remaining",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_value",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_value",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_from",
        type: "address",
      },
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_value",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60806040523480156200001157600080fd5b506040518060400160405280600d81526020017f47656e6572696320455243323000000000000000000000000000000000000000815250600090805190602001906200005f929190620000d0565b506040518060400160405280600581526020017f47454e323000000000000000000000000000000000000000000000000000000081525060019080519060200190620000ad929190620000d0565b506012600260006101000a81548160ff021916908360ff160217905550620001e5565b828054620000de9062000180565b90600052602060002090601f0160209004810192826200010257600085556200014e565b82601f106200011d57805160ff19168380011785556200014e565b828001600101855582156200014e579182015b828111156200014d57825182559160200191906001019062000130565b5b5090506200015d919062000161565b5090565b5b808211156200017c57600081600090555060010162000162565b5090565b600060028204905060018216806200019957607f821691505b60208210811415620001b057620001af620001b6565b5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b61135680620001f56000396000f3fe608060405234801561001057600080fd5b506004361061009e5760003560e01c806370a082311161006657806370a082311461015d57806395d89b411461018d578063a0712d68146101ab578063a9059cbb146101c7578063dd62ed3e146101f75761009e565b806306fdde03146100a3578063095ea7b3146100c157806318160ddd146100f157806323b872dd1461010f578063313ce5671461013f575b600080fd5b6100ab610227565b6040516100b89190610f0a565b60405180910390f35b6100db60048036038101906100d69190610d90565b6102b5565b6040516100e89190610eef565b60405180910390f35b6100f96103a7565b6040516101069190610fac565b60405180910390f35b61012960048036038101906101249190610d3d565b6103ad565b6040516101369190610eef565b60405180910390f35b6101476108ad565b6040516101549190610fc7565b60405180910390f35b61017760048036038101906101729190610cd0565b6108c0565b6040516101849190610fac565b60405180910390f35b6101956108d8565b6040516101a29190610f0a565b60405180910390f35b6101c560048036038101906101c09190610dd0565b610966565b005b6101e160048036038101906101dc9190610d90565b610a10565b6040516101ee9190610eef565b60405180910390f35b610211600480360381019061020c9190610cfd565b610c1f565b60405161021e9190610fac565b60405180910390f35b6000805461023490611110565b80601f016020809104026020016040519081016040528092919081815260200182805461026090611110565b80156102ad5780601f10610282576101008083540402835291602001916102ad565b820191906000526020600020905b81548152906001019060200180831161029057829003601f168201915b505050505081565b600081600560003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040516103959190610fac565b60405180910390a36001905092915050565b60035481565b600081600460008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020541015610431576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161042890610f2c565b60405180910390fd5b81600560008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020541015806104e757508373ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16145b610526576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161051d90610f8c565b60405180910390fd5b8373ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146106625781600560008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546105e19190611054565b600560008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055505b600560008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054821115610721576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161071890610f6c565b60405180910390fd5b81600460008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461076c9190611054565b600460008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555081600460008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546107fa9190610ffe565b600460008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8460405161089a9190610fac565b60405180910390a3600190509392505050565b600260009054906101000a900460ff1681565b60046020528060005260406000206000915090505481565b600180546108e590611110565b80601f016020809104026020016040519081016040528092919081815260200182805461091190611110565b801561095e5780601f106109335761010080835404028352916020019161095e565b820191906000526020600020905b81548152906001019060200180831161094157829003601f168201915b505050505081565b80600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546109b19190610ffe565b600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508060036000828254610a069190610ffe565b9250508190555050565b600081600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020541015610a94576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a8b90610f4c565b60405180910390fd5b81600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054610adf9190611054565b600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555081600460008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054610b6d9190610ffe565b600460008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef84604051610c0d9190610fac565b60405180910390a36001905092915050565b6000600560008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b600081359050610cb5816112f2565b92915050565b600081359050610cca81611309565b92915050565b600060208284031215610ce657610ce56111a0565b5b6000610cf484828501610ca6565b91505092915050565b60008060408385031215610d1457610d136111a0565b5b6000610d2285828601610ca6565b9250506020610d3385828601610ca6565b9150509250929050565b600080600060608486031215610d5657610d556111a0565b5b6000610d6486828701610ca6565b9350506020610d7586828701610ca6565b9250506040610d8686828701610cbb565b9150509250925092565b60008060408385031215610da757610da66111a0565b5b6000610db585828601610ca6565b9250506020610dc685828601610cbb565b9150509250929050565b600060208284031215610de657610de56111a0565b5b6000610df484828501610cbb565b91505092915050565b610e068161109a565b82525050565b6000610e1782610fe2565b610e218185610fed565b9350610e318185602086016110dd565b610e3a816111a5565b840191505092915050565b6000610e52602683610fed565b9150610e5d826111b6565b604082019050919050565b6000610e75602783610fed565b9150610e8082611205565b604082019050919050565b6000610e98602883610fed565b9150610ea382611254565b604082019050919050565b6000610ebb603883610fed565b9150610ec6826112a3565b604082019050919050565b610eda816110c6565b82525050565b610ee9816110d0565b82525050565b6000602082019050610f046000830184610dfd565b92915050565b60006020820190508181036000830152610f248184610e0c565b905092915050565b60006020820190508181036000830152610f4581610e45565b9050919050565b60006020820190508181036000830152610f6581610e68565b9050919050565b60006020820190508181036000830152610f8581610e8b565b9050919050565b60006020820190508181036000830152610fa581610eae565b9050919050565b6000602082019050610fc16000830184610ed1565b92915050565b6000602082019050610fdc6000830184610ee0565b92915050565b600081519050919050565b600082825260208201905092915050565b6000611009826110c6565b9150611014836110c6565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0382111561104957611048611142565b5b828201905092915050565b600061105f826110c6565b915061106a836110c6565b92508282101561107d5761107c611142565b5b828203905092915050565b6000611093826110a6565b9050919050565b60008115159050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b600060ff82169050919050565b60005b838110156110fb5780820151818401526020810190506110e0565b8381111561110a576000848401525b50505050565b6000600282049050600182168061112857607f821691505b6020821081141561113c5761113b611171565b5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600080fd5b6000601f19601f8301169050919050565b7f7472616e7366657246726f6d3a205f66726f6d2062616c616e6365206973207460008201527f6f6f206c6f770000000000000000000000000000000000000000000000000000602082015250565b7f7472616e736665723a206d73672e73656e6465722062616c616e63652069732060008201527f746f6f206c6f7700000000000000000000000000000000000000000000000000602082015250565b7f45524332303a207472616e7366657220616d6f756e742065786365656473206160008201527f6c6c6f77616e6365000000000000000000000000000000000000000000000000602082015250565b7f7472616e7366657246726f6d3a206d73672e73656e64657220616c6c6f77616e60008201527f63652077697468205f66726f6d20697320746f6f206c6f770000000000000000602082015250565b6112fb81611088565b811461130657600080fd5b50565b611312816110c6565b811461131d57600080fd5b5056fea2646970667358221220dcf62fee5cf1bfc8d55e06068f97d88b3266c4e1f537c3d30f49f9ff3d37525664736f6c63430008050033";

type ERC20GenericConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ERC20GenericConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ERC20Generic__factory extends ContractFactory {
  constructor(...args: ERC20GenericConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ERC20Generic> {
    return super.deploy(overrides || {}) as Promise<ERC20Generic>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): ERC20Generic {
    return super.attach(address) as ERC20Generic;
  }
  override connect(signer: Signer): ERC20Generic__factory {
    return super.connect(signer) as ERC20Generic__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ERC20GenericInterface {
    return new utils.Interface(_abi) as ERC20GenericInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ERC20Generic {
    return new Contract(address, _abi, signerOrProvider) as ERC20Generic;
  }
}
