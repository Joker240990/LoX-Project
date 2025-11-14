const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LuciferCoinWithPartner", function () {
  let lox, mock, deployer, partner, reserve;

  beforeEach(async function () {
    [deployer, reserve, partner] = await ethers.getSigners();
    const Mock = await ethers.getContractFactory("MockV3Aggregator");
    mock = await Mock.deploy(8, ethers.BigNumber.from("500").mul(ethers.BigNumber.from(10).pow(8)));
    await mock.deployed();

    const LoX = await ethers.getContractFactory("LuciferCoinWithPartner");
    lox = await LoX.deploy(reserve.address, partner.address);
    await lox.deployed();

    await lox.setPriceFeed(mock.address);
  });

  it("reverts partner release when price low", async function () {
    await expect(lox.releasePartnerReserve()).to.be.revertedWith("price below $1000");
  });

  it("releases partner when price hits threshold", async function () {
    await mock.updateAnswer(ethers.BigNumber.from("1500").mul(ethers.BigNumber.from(10).pow(8)));
    await expect(lox.releasePartnerReserve()).to.not.be.reverted;
    const bal = await lox.balanceOf(partner.address);
    expect(bal).to.equal(ethers.BigNumber.from("6666").mul(ethers.BigNumber.from(10).pow(18)));
  });
});
