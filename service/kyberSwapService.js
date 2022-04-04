const Web3 = require("web3");
const web3 = new Web3(
  "https://mainnet.infura.io/v3/1f0e05aa0b5c4ece90db3baebbf4ec4d"
);
const fs = require("fs");

const kyberSwapFactoryABI = require("../contractABI/FactoryContractABI/kyberSwapFactory.json");

const kyberSwapV2Factory = new web3.eth.Contract(
  kyberSwapFactoryABI,
  "0x833e4083B7ae46CeA85695c4f7ed25CDAd8886dE"
);

const loadFiles = fs.readFileSync(
  "/home/dxuser/project file/training-data/assetList.txt",
  "utf8"
);

let lineArray = [];
loadFiles.split(/\r?\n/).forEach((line) => {
  lineArray.push(line);
});



var outArray =[];
var outArray2=[];

// lineArray.forEach((line, index) => {
//   addressExtractor(line, index);
// });

function addressExtractor(line, index) {
  const tempArray = line.split(":");
  const arr=tempArray[0].split('"')
  outArray.push({"token":arr[1]});
  const tempArray2 = tempArray[1].split(",");
  const address = tempArray2[0].split('"');
  return address[1];
}

// for (i = 0; i < lineArray.length - 1; i++) {
//   for (j = i + 1; j < lineArray.length; j++) {
//     const address1 = web3.utils.toChecksumAddress(
//       addressExtractor(lineArray[i])
//     );
//     const address2 = web3.utils.toChecksumAddress(
//       addressExtractor(lineArray[j])
//     );

//     callChainFunction(address1, address2)
//       .then((response) => {
//         if (response.length > 0) {
//           console.log("response : ", response);
//         }
//         // "response" is an array of addresses
//       })
//       .catch((e) => {
//         console.log("exception: ", e);
//       });
//   }
// }


async function wrapperFunction() {
  for (i = 0; i < lineArray.length - 1; i++) {
    for (j = i + 1; j < lineArray.length; j++) {
      const address1 = web3.utils.toChecksumAddress(
        addressExtractor(lineArray[i])
      );
      const address2 = web3.utils.toChecksumAddress(
        addressExtractor(lineArray[j])
      );

      const response = await kyberSwapV2Factory.methods
      .getPools(address1, address2)
      .call();
      if (response.length > 0) {
        //console.log("response : ", response);
        outArray.push({"poolAddress":response});
        console.log(outArray);
        outArray2.push(outArray)
      }
    }
  }
}
wrapperFunction();

// async function callChainFunction(address1, address2) {
//   try {
//     const response = await kyberSwapV2Factory.methods
//       .getPools(address1, address2)
//       .call();
//     return response;
//   } catch (e) {
//     console.log("exception: ", e);
//   }
// }






// callChainFunction(
//   "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
//   "0xdac17f958d2ee523a2206206994597c13d831ec7"
// );
