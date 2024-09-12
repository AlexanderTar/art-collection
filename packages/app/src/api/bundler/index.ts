import { http } from 'viem'
import { entryPoint06Address, createBundlerClient } from 'viem/account-abstraction'

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createPimlicoClient } from 'permissionless/clients/pimlico'
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const bundlerService = process.env['VITE_PAYMASTER_SERVICE_URL']!
  const pimlicoRpcUrl = process.env['VITE_PIMLICO_RPC_URL']!

  const pimlicoClient = createPimlicoClient({
    transport: http(pimlicoRpcUrl),
    entryPoint: {
      address: entryPoint06Address,
      version: '0.6',
    },
  })

  const bundlerClient = createBundlerClient({
    paymaster: true,
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
    const result = await bundlerClient.request({
      method,
      params,
    })
    return res.send(
      JSON.stringify({ id, jsonrpc, result }, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    )
  }
}
