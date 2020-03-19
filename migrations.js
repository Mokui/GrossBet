var GrossCoin = artifacts.require("GrossCoin");
module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(GrossCoin);
};