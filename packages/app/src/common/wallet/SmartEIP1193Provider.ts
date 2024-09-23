import { EventEmitter } from 'events'
import {
  type Chain,
  type Client,
  type EIP1193Parameters,
  type EIP1193RequestFn,
  type Hash,
  type RpcSchema,
  type SendTransactionParameters,
  type Transport,
} from 'viem'
import { SmartAccount } from 'viem/account-abstraction'
import { SmartAccountClient } from 'permissionless'

export class SmartEIP1193Provider<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartAccount | undefined = SmartAccount | undefined,
  client extends Client | undefined = Client | undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
> extends EventEmitter {
  private smartAccountClient: SmartAccountClient<transport, chain, account, client, rpcSchema>

  constructor(
    smartAccountClient: SmartAccountClient<transport, chain, account, client, rpcSchema>,
  ) {
    super()
    this.smartAccountClient = smartAccountClient
  }

  async request({
    method,
    params,
  }: EIP1193Parameters<rpcSchema>): ReturnType<EIP1193RequestFn<rpcSchema>> {
    switch (method) {
      case 'eth_requestAccounts':
        return this.handleEthRequestAccounts()
      case 'eth_accounts':
        return this.handleEthAccounts()
      case 'eth_sendTransaction':
        return this.handleEthSendTransaction(params)
      case 'eth_sign':
        return this.handleEthSign(params as [string, string])
      case 'personal_sign':
        return this.handlePersonalSign(params as [string, string])
      case 'eth_signTypedData':
      case 'eth_signTypedData_v4':
        return this.handleEthSignTypedDataV4(params as [string, string])
      default:
        return this.smartAccountClient.transport.request({ method, params })
    }
  }

  private async handleEthRequestAccounts(): Promise<string[]> {
    if (!this.smartAccountClient.account) {
      return []
    }
    return [this.smartAccountClient.account.address]
  }

  private async handleEthAccounts(): Promise<string[]> {
    if (!this.smartAccountClient.account) {
      return []
    }
    return [this.smartAccountClient.account.address]
  }

  private async handleEthSendTransaction(params: unknown): Promise<Hash> {
    const [tx] = params as [SendTransactionParameters]

    const userOperation = await this.smartAccountClient.prepareUserOperation({
      account: this.smartAccountClient.account as SmartAccount,
      calls: [{ to: tx.to, data: tx.data, value: tx.value }],
    })

    return this.smartAccountClient.sendTransaction({
      calls: [{ to: tx.to, data: tx.data, value: tx.value }],
      preVerificationGas: userOperation.preVerificationGas * 3n,
      verificationGasLimit: userOperation.verificationGasLimit * 3n,
      maxFeePerGas: userOperation.maxFeePerGas,
      maxPriorityFeePerGas: userOperation.maxPriorityFeePerGas,
    } as any)
  }

  private async handleEthSign(params: [string, string]): Promise<string> {
    if (!this.smartAccountClient?.account) {
      throw new Error('account not connected!')
    }
    const [address, message] = params
    if (address.toLowerCase() !== this.smartAccountClient.account.address.toLowerCase()) {
      throw new Error('cannot sign for address that is not the current account')
    }

    return this.smartAccountClient.signMessage({
      message,
      account: this.smartAccountClient.account,
    })
  }

  private async handlePersonalSign(params: [string, string]): Promise<string> {
    if (!this.smartAccountClient?.account) {
      throw new Error('account not connected!')
    }
    const [message, address] = params
    if (address.toLowerCase() !== this.smartAccountClient.account.address.toLowerCase()) {
      throw new Error('cannot sign for address that is not the current account')
    }

    return this.smartAccountClient.signMessage({
      message,
      account: this.smartAccountClient.account,
    })
  }

  private async handleEthSignTypedDataV4(params: [string, string]): Promise<string> {
    if (!this.smartAccountClient?.account) {
      throw new Error('account not connected!')
    }
    const [address, typedDataJSON] = params
    const typedData = JSON.parse(typedDataJSON)
    if (address.toLowerCase() !== this.smartAccountClient.account.address.toLowerCase()) {
      throw new Error('cannot sign for address that is not the current account')
    }

    return this.smartAccountClient.signTypedData({
      account: this.smartAccountClient.account,
      domain: typedData.domain,
      types: typedData.types,
      message: typedData.message,
      primaryType: typedData.primaryType,
    })
  }
}
