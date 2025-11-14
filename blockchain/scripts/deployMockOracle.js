const hre = require("hardhat");
async function main() {
  const decimals = 8;
  const initial = hre.ethers.BigNumber.from("500").mul(hre.ethers.BigNumber.from(10).pow(decimals)); // $500
  const Mock = await hre.ethers.getContractFactory("MockV3Aggregator");
  const mock = await Mock.deploy(decimals, initial);
  await mock.deployed();
  console.log("Mock oracle:", mock.address);
}
main().catch(e => { console.error(e); process.exit(1); });
