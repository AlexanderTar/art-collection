import {
  entryPoint06Address,
  createBundlerClient,
  createPaymasterClient,
  UserOperation,
} from 'viem/account-abstraction'

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createPimlicoClient } from 'permissionless/clients/pimlico'

import { Address, Hex, http, decodeFunctionData, createPublicClient } from 'viem'
import { base } from 'viem/chains'

import { smartWalletAbi, artCertificateAbi } from '@/client/abi/generated'

const willSponsor = async ({
  chainId,
  entrypoint,
  userOp,
}: {
  chainId: number
  entrypoint: string
  userOp: UserOperation<'0.6'>
}) => {
  const env = process.env
  if (!env) return false

  // check chain id
  if (chainId !== base.id) return false

  // check entrypoint
  if (entrypoint.toLowerCase() !== entryPoint06Address.toLowerCase()) return false

  try {
    // check that userOp.callData is making a call we want to sponsor
    const calldata = decodeFunctionData({
      abi: smartWalletAbi,
      data: userOp.callData,
    })

    let calls = [] as {
      target: Address
      value: bigint
      data: Hex
    }[]
    if (calldata.functionName === 'execute') {
      if (!calldata.args || calldata.args.length !== 3) return false
      calls = [
        {
          target: calldata.args[0] as Address,
          value: calldata.args[1] as bigint,
          data: calldata.args[2] as Hex,
        },
      ]
    } else if (calldata.functionName === 'executeBatch') {
      if (!calldata.args || calldata.args.length !== 1) return false
      calls = calldata.args[0] as {
        target: Address
        value: bigint
        data: Hex
      }[]
    }

    // disallow batch calls
    if (calls.length > 2) return false

    let callToCheckIndex = 0
    if (calls.length > 1) {
      // if there is more than one call, check if the first is a magic spend call
      if (
        calls[0]!!.target.toLowerCase() !== env['VITE_COINBASE_MAGIC_SPEND_ADDRESS']!!.toLowerCase()
      )
        return false
      callToCheckIndex = 1
    }

    if (
      calls[callToCheckIndex]!!.target.toLowerCase() ===
      env['VITE_ART_CERTIFICATE_ADDRESS']!!.toLowerCase()
    ) {
      const innerCalldata = decodeFunctionData({
        abi: artCertificateAbi,
        data: calls[callToCheckIndex]!!.data,
      })
      if (innerCalldata.functionName === 'mint' || innerCalldata.functionName === 'burn')
        return true
    }

    return false
  } catch (e) {
    console.error(`willSponsor check failed: ${e}`)
    return false
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const bundlerService = process.env['VITE_BUNDLER_SERVICE_URL']!
  const pimlicoRpcUrl = process.env['VITE_PIMLICO_RPC_URL']!

  const pimlicoClient = createPimlicoClient({
    transport: http(pimlicoRpcUrl),
    entryPoint: {
      address: entryPoint06Address,
      version: '0.6',
    },
  })

  const client = createPublicClient({
    chain: base,
    transport: http(bundlerService),
  })

  const paymasterClient = createPaymasterClient({
    transport: http(bundlerService),
  })

  const bundlerClient = createBundlerClient({
    client,
    transport: http(bundlerService),
  })

  const { method, params, id, jsonrpc } = req.body
  if (method === 'pimlico_getUserOperationGasPrice') {
    const result = await pimlicoClient.getUserOperationGasPrice()

    return res.send(
      JSON.stringify({ id, jsonrpc, result }, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    )
  } else if (method === 'pm_getPaymasterStubData') {
    const [userOp, entrypoint, chainId] = params
    if (!willSponsor({ chainId: parseInt(chainId), entrypoint, userOp })) {
      return res.json({ error: 'Not a sponsorable operation' })
    }

    const result = await pimlicoClient.getPaymasterStubData({
      chainId,
      entryPointAddress: entrypoint,
      ...userOp,
    })

    return res.send(
      JSON.stringify({ id, jsonrpc, result }, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    )
  } else if (method === 'pm_getPaymasterData') {
    const [userOp, entrypoint, chainId] = params
    if (!willSponsor({ chainId: parseInt(chainId), entrypoint, userOp })) {
      return res.json({ error: 'Not a sponsorable operation' })
    }

    const result = await paymasterClient.getPaymasterData({
      chainId,
      entryPointAddress: entrypoint,
      ...userOp,
    })
    return res.send(
      JSON.stringify({ id, jsonrpc, result }, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    )
  } else if (method === 'eth_estimateUserOperationGas') {
    const [userOp, entrypoint] = params
    const result = await bundlerClient.estimateUserOperationGas({
      entryPointAddress: entrypoint,
      ...userOp,
    })
    return res.send(
      JSON.stringify({ id, jsonrpc, result }, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    )
  } else if (method === 'eth_sendUserOperation') {
    const [userOp, entrypoint] = params
    const result = await bundlerClient.sendUserOperation({
      entryPointAddress: entrypoint,
      ...userOp,
    })
    return res.send(
      JSON.stringify({ id, jsonrpc, result }, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    )
  } else if (method === 'eth_getUserOperationReceipt') {
    const [hash] = params
    try {
      const result = await bundlerClient.getUserOperationReceipt({
        hash,
      })
      return res.send(
        JSON.stringify({ id, jsonrpc, result }, (_, value) =>
          typeof value === 'bigint' ? value.toString() : value,
        ),
      )
    } catch (e) {
      return res.json({ id, jsonrpc, result: null })
    }
  } else {
    const response = await fetch(bundlerService, {
      method: req.method,
      body: JSON.stringify(req.body),
    })
    return res.json(await response.json())
  }
}
