const hre = require("hardhat");

async function main() {
  console.log("Deploying AIAgentMarketplace contract...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Get the contract factory
  const AIAgentMarketplace = await hre.ethers.getContractFactory("AIAgentMarketplace");

  // Deploy the contract with fee recipient as deployer address
  const marketplace = await AIAgentMarketplace.deploy(deployer.address);

  await marketplace.deployed();

  console.log("AIAgentMarketplace deployed to:", marketplace.address);
  console.log("Fee recipient set to:", deployer.address);

  // Verify the contract on Etherscan (if not on localhost)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await marketplace.deployTransaction.wait(6);

    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: marketplace.address,
        constructorArguments: [deployer.address],
      });
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }

  // Seed some test data
  console.log("Seeding test data...");
  
  try {
    // Upload test agents
    const tx1 = await marketplace.uploadAgent(
      "Text Summarizer Pro",
      "bafybeiexamplemodelhash1",
      hre.ethers.utils.parseEther("0.01")
    );
    await tx1.wait();
    
    const tx2 = await marketplace.uploadAgent(
      "Sentiment Analyzer",
      "bafybeisample2",
      hre.ethers.utils.parseEther("0")
    );
    await tx2.wait();
    
    const tx3 = await marketplace.uploadAgent(
      "Image Caption Generator",
      "bafybeiexampleimg",
      hre.ethers.utils.parseEther("0.02")
    );
    await tx3.wait();

    console.log("Test agents uploaded successfully!");
  } catch (error) {
    console.log("Error seeding data:", error.message);
  }

  console.log("\nDeployment Summary:");
  console.log("===================");
  console.log("Contract Address:", marketplace.address);
  console.log("Network:", hre.network.name);
  console.log("Gas Used: Check transaction receipt");
  console.log("\nNext steps:");
  console.log("1. Update frontend contract address");
  console.log("2. Update environment variables");
  console.log("3. Test contract functions");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });