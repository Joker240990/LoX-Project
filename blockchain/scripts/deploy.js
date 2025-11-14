const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with", deployer.address);

  const reserve = process.env.RESERVE_WALLET || deployer.address;
  const partner = process.env.PARTNER_WALLET || deployer.address;

  const LoX = await hre.ethers.getContractFactory("LuciferCoinWithPartner");
  const lox = await LoX.deploy(reserve, partner);
  await lox.deployed();
  console.log("LoX deployed:", lox.address);

  // optionally deploy mock oracle on testnet if needed
}

main().catch(e => { console.error(e); process.exit(1); });
