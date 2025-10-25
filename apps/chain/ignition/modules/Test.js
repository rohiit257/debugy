const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

// Deploy the BountyPlatform contract (must match the Solidity contract name exactly)
const DeployModule = buildModule("BountyModule", (m) => {
  const bountyPlatform = m.contract("BountyPlatform");
  return { bountyPlatform };
});

module.exports = DeployModule;