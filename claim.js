
//GDROH5UGA34G6R6HWE4AVZPHET7HSGXQDFCDVJIEZAY3SRQI4LAQ3TJA

//SDNKM2YCIRRSYECZPNTKOVXB6RTZF74M6HUYQXXSXNBZSYM6NOKH2DME

//console.log(StellarSdk);

async function main() {
    
var sdk = require('stellar-sdk');
  let server = new sdk.Server("https://horizon-testnet.stellar.org");
console.log(server);
  let A = sdk.Keypair.fromSecret("SDNKM2YCIRRSYECZPNTKOVXB6RTZF74M6HUYQXXSXNBZSYM6NOKH2DME");
  let B = sdk.Keypair.fromPublicKey("GAS4V4O2B7DW5T7IQRPEEVCRXMDZESKISR7DVIGKZQYYV3OSQ5SH5LVP");

  // NOTE: Proper error checks are omitted for brevity; always validate things!

  let aAccount = await server.loadAccount(A.publicKey()).catch(function (err) {
    console.error(`Failed to load ${A.publicKey()}: ${err}`)
  })
  //if (!aAccount) { return }

  // Create a claimable balance with our two above-described conditions.
  let soon = Math.ceil((Date.now() / 1000) + 60); // .now() is in ms
  let bCanClaim = sdk.Claimant.predicateBeforeRelativeTime("60");
  let aCanReclaim = sdk.Claimant.predicateNot(
    sdk.Claimant.predicateBeforeAbsoluteTime(soon.toString())
  );

  // Create the operation and submit it in a transaction.
  let claimableBalanceEntry = sdk.Operation.createClaimableBalance({
    claimants: [
      new sdk.Claimant(B.publicKey(), bCanClaim),
      new sdk.Claimant(A.publicKey(), aCanReclaim)
    ],
    asset: sdk.Asset.native(),
    amount: "777",
  });

  let tx = new sdk.TransactionBuilder(aAccount, {fee: sdk.BASE_FEE})
    .addOperation(claimableBalanceEntry)
    .setNetworkPassphrase(sdk.Networks.TESTNET)
    .setTimeout(180)
    .build();

  tx.sign(A);
  let txResponse = await server.submitTransaction(tx).then(function() {
    console.log("Claimable balance created!");
  }).catch(function (err) {
    console.error(`Tx submission failed: ${err}`)
  });
}
main()