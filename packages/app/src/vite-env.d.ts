/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_WALLET_CONNECT_PROJECT_ID: string
  readonly VITE_PRIVY_APP_ID: string
  readonly VITE_PINATA_JWT: string
  readonly VITE_GATEWAY_URL: string
  readonly VITE_BUNDLER_PROXY_URL: string
  readonly VITE_PIMLICO_RPC_URL: string

  readonly VITE_ART_CERTIFICATE_ADDRESS: `0x${string}`
  readonly VITE_COINBASE_MAGIC_SPEND_ADDRESS: `0x${string}`

  readonly VITEST?: 'true' | 'false'
  readonly CI?: 'true' | 'false'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
