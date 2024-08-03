/// <reference types="vitest" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import vercel from 'vite-plugin-vercel'
import { checker } from 'vite-plugin-checker'
import { ValidateEnv } from '@julr/vite-plugin-validate-env'
import { z } from 'zod'
import path from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [
    ValidateEnv({
      validator: 'zod',
      schema: {
        VITE_APP_NAME: z.string(),
        VITE_WALLET_CONNECT_PROJECT_ID: z.string(),
        VITE_GATEWAY_URL: z.string(),
        VITE_PINATA_JWT: z.string(),
        VITE_RPC_PROVIDER_URL: z.string(),
        VITE_PAYMASTER_SERVICE_URL: z.string(),
        VITE_ART_CERTIFICATE_ADDRESS: z.string(),
      },
    }),
    react(),
    vercel(),
    tsconfigPaths(),
    mode !== 'test' &&
      checker({
        enableBuild: false,
        overlay: false,
        typescript: true,
        eslint: {
          lintCommand:
            'eslint "./**/*.{js,cjs,ts,tsx}" --max-warnings 0 --report-unused-disable-directives',
        },
      }),
  ],
  define: {
    __ENABLE_MSW_IN_PROD__: process.env.VERCEL !== undefined || process.env.IS_PREVIEW === 'true',
  },
  server: {
    open: true,
    port: 3000,
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  resolve: {
    alias: {
      jsbi: path.resolve(__dirname, './node_modules/jsbi/dist/jsbi-cjs.js'),
    },
  },
  vercel: {
    additionalEndpoints: [
      {
        source: './src/api/paymaster/index.ts',
        destination: '/api/paymaster',
        addRoute: true,
      },
    ],
  },
}))
