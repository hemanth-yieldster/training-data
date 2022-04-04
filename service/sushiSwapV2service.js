const Web3 = require("web3");
const web3 = new Web3(
  "https://mainnet.infura.io/v3/1f0e05aa0b5c4ece90db3baebbf4ec4d"
);
const fs = require("fs");

const sushiSwapV2FactoryABI = require("../contractABI/FactoryContractABI/sushiSwapV2Factory.json");
const res = require("express/lib/response");

const sushiSwapV2Factory = new web3.eth.Contract(
  sushiSwapV2FactoryABI,
  "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac"
);

const loadFiles = fs.readFileSync(
  "/Users/abilmanoj/Desktop/Yieldster/training-data/assetList.txt",
  "utf8"
);

let lineArray = [];
loadFiles.split(/\r?\n/).forEach((line) => {
  lineArray.push(line);
});

lineArray.forEach((line, index) => {
  addressExtractor(line, index);
});

function addressExtractor(line, index) {
  const tempArray = line.split(":");
  const tempArray2 = tempArray[1].split(",");
  const address = tempArray2[0].split('"');
  return address[1];
}

for (i = 0; i < lineArray.length - 1; i++) {
  for (j = i + 1; j < lineArray.length; j++) {
    const address1 = web3.utils.toChecksumAddress(
      addressExtractor(lineArray[i])
    );
    const address2 = web3.utils.toChecksumAddress(
      addressExtractor(lineArray[j])
    );

    // console.log("addresses: ", lineArray[i], "  ", lineArray[j]);
    callChainFunction(address1, address2).then((response) => {
      if (!(response == "0x0000000000000000000000000000000000000000")) {
        console.log("response : ", response);
      }
    });
  }
}

async function callChainFunction(address1, address2) {
  const response = await sushiSwapV2Factory.methods
    .getPair(address1, address2)
    .call();
  return response;
}

// callChainFunction(
//   "0x6B175474E89094C44Da98b954EedeAC495271d0F",
//   "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
// );