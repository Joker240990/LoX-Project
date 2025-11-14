# LoX-Project
Best meme coin on the market
# LoX Project

This repository contains the LoX ecosystem:

- blockchain/: Solidity contracts + Hardhat scripts
- backend/: Node/Express API (auth, KYC stub, mining)
- frontend/: React UI (dashboard minimal)
- mobile/: React Native skeleton
- games/: HTML5 game prototypes
- mining/: miner client

## Quick start (blockchain)
1. cd blockchain
2. cp .env.example .env and set RPC credentials
3. npm install
4. npx hardhat compile
5. npx hardhat test
6. npx hardhat run scripts/deploy.js --network sepolia

## Notes
- Never commit .env with secrets
- Use multisig (Gnosis Safe) for owner on mainnet
- Run external audit before mainnet deployment
