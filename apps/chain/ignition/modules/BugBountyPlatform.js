const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("BugBountyPlatformModule", (m) => {
  // Deploy the BugBountyToken contract first
  const bugBountyToken = m.contract("BugBountyToken", [m.getAccount(0)]);

  // Deploy the BountyPlatform contract with the token address
  const bountyPlatform = m.contract("BountyPlatform", [bugBountyToken]);

  // Set the BountyPlatform as the owner of the BugBountyToken
  m.call(bugBountyToken, "transferOwnership", [bountyPlatform]);

  return { bugBountyToken, bountyPlatform };
});
