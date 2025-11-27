const hre = require("hardhat")

async function main() {
  console.log("Deploying ChainMart Smart Contracts...")

  const [deployer] = await hre.ethers.getSigners()
  console.log("Deploying with account:", deployer.address)

  // Deploy ReputationNFT first
  console.log("\n1. Deploying ReputationNFT...")
  const ReputationNFT = await hre.ethers.getContractFactory("ReputationNFT")
  const reputationNFT = await ReputationNFT.deploy()
  await reputationNFT.deployed()
  console.log("ReputationNFT deployed to:", reputationNFT.address)

  // Deploy MarketplaceEscrow
  console.log("\n2. Deploying MarketplaceEscrow...")
  const platformWallet = deployer.address
  const MarketplaceEscrow = await hre.ethers.getContractFactory("MarketplaceEscrow")
  const marketplace = await MarketplaceEscrow.deploy(platformWallet, reputationNFT.address)
  await marketplace.deployed()
  console.log("MarketplaceEscrow deployed to:", marketplace.address)

  // Save deployment addresses
  const deploymentData = {
    network: hre.network.name,
    reputationNFT: reputationNFT.address,
    marketplace: marketplace.address,
    platformWallet: platformWallet,
    deployedAt: new Date().toISOString(),
  }

  console.log("\n✅ Deployment Complete!")
  console.log(JSON.stringify(deploymentData, null, 2))

  // Save to file for reference
  const fs = require("fs")
  fs.writeFileSync(`deployments-${hre.network.name}.json`, JSON.stringify(deploymentData, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
