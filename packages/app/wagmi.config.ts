import { defineConfig } from '@wagmi/cli'
import { Abi, erc20Abi } from 'viem'

import ArtCertificateABI from './src/client/abi/ArtCertificate.json'
import SmartWalletABI from './src/client/abi/SmartWallet.json'

export default defineConfig({
  out: 'src/client/abi/generated.ts',
  contracts: [
    {
      name: 'ERC20',
      abi: erc20Abi,
    },
    {
      name: 'ArtCertificate',
      abi: ArtCertificateABI as Abi,
    },
    {
      name: 'SmartWallet',
      abi: SmartWalletABI as Abi,
    },
  ],
  plugins: [],
})
