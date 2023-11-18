const { ethers } = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const hre = require("hardhat");

async function main() {

  ///DEPLOYING LUMOS NFT
  const LumosNFT = await ethers.deployContract("LumosNFT");
  await LumosNFT.waitForDeployment();

  console.log(`LumosNFT contract is deployed to ${LumosNFT.target}`);
  
  //DEPLOYING AUCTION CONTRACT
  const startPrice = ethers.parseEther("0.00005");
  
  const endTime = 10;  //10 minutes

  const Auction = await ethers.deployContract("Auction", [LumosNFT.target, endTime, startPrice]);
  await Auction.waitForDeployment();

  console.log(`Auction contract is deployed to ${Auction.target}`);

  //INTERACTION WITH LUMOS NFT CONTRACT TO GIVE APPROVAL TO THE AUCTION CONTRACT
  const lumosInteract = await ethers.getContractAt("LumosNFT", LumosNFT.target);

  const mintNFT = await lumosInteract.mintNFT("https://ipfs.io/ipfs/Qma1YsBMguqxHGJege2oeym6eKUVqFuD7u3W958DKxPPvQ");
  await mintNFT.wait();

  const approveContract = await lumosInteract.approve(Auction.target, 1);
  await approveContract.wait();

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});