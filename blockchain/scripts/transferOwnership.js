const hre = require("hardhat");
require('dotenv').config();

async function main(){
  const tokenAddr = process.env.LOX_ADDRESS;
  const safeAddr = process.env.SAFE_ADDRESS;
  if(!tokenAddr || !safeAddr) throw new Error('set LOX_ADDRESS and SAFE_ADDRESS in env');
  const token = await hre.ethers.getContractAt("LuciferCoinWithPartner", tokenAddr);
  const tx = await token.transferOwnership(safeAddr);
  await tx.wait();
  console.log('ownership transferred to', safeAddr);
}
main().catch(e => { console.error(e); process.exit(1); });
