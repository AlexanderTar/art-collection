# NFT Art Collection

This application allows users to mint and manage NFT certificates representing artwork or other collectibles.

## Features

- Mint new NFT certificates with artwork details
- View and manage existing certificates
- Burn (remove) certificates
- Wallet connection and authentication using Coinbase Smart Wallet
- Gas sponsorship for transactions - no ETH required from users

## Tech Stack

- React
- TypeScript
- Tailwind CSS
- React Router
- i18next for internationalization
- Radix UI components
- Solidity (for smart contracts)
- Coinbase Smart Wallet for wallet management and gas sponsorship

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   yarn
   ```
3. Configure your environment variables in `packages/app/.env` (see `.env.example` for required variables)
4. Start the development server:
   ```
   yarn dev
   ```

## Project Structure

- `app/src/features/dashboard/features/certificates/` - Certificate-related components and pages
- `app/src/common/components/` - Reusable UI components
- `app/src/client/` - API client and data fetching hooks
- `app/src/common/auth/` - Authentication logic
- `app/src/common/wallet/` - Wallet connection functionality
- `contracts/` - Smart contract source code

## Smart Contracts

The NFT certificates are managed by Ethereum smart contracts written in Solidity. The main contract implements the ERC-721 standard for non-fungible tokens.

Key features of the smart contracts:
- Minting new certificates
- Transferring ownership
- Burning (removing) certificates
- Storing metadata URIs for each certificate

To interact with the smart contracts:
1. The application uses Coinbase Smart Wallet for wallet management, so no additional wallet installation is required
2. Connect your Coinbase Smart Wallet to the application
3. Thanks to gas sponsorship, you don't need ETH in your wallet to perform transactions

Latest contract deployment:
- Base Mainnet: [0x6a60c76247E89256BF8bb32b39B92DEb7bd3ebb4](https://basescan.org/address/0x6a60c76247E89256BF8bb32b39B92DEb7bd3ebb4)

Smart contract deployment:
1. Configure your environment variables in `packages/contracts/.env` (see `.env.example` for required variables)
2. Run deployment script:
   ```
   yarn deploy
   ```

## Wallet Integration

This application uses Coinbase Smart Wallet for managing user wallets. Key benefits include:
- No need to install additional browser extensions
- Simplified onboarding for new users
- Enhanced security features
- Gas sponsorship - users don't need ETH to perform transactions

Users can connect their Coinbase Smart Wallet directly through the application interface.

## Gas Sponsorship

Our application leverages Coinbase Smart Wallet's gas sponsorship feature. This means:
- Users don't need to hold ETH in their wallets to perform transactions
- All gas fees are covered by the application
- Seamless user experience with no interruptions for gas payments
