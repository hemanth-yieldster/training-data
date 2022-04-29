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

// const loadFiles = fs.readFileSync(
//   "/home/dxuser/project file/training-data/assetList.txt",
//   "utf8"
// );
const loadFiles = fs.readFileSync(
  "/home/dxuser/Documents/assetList.txt",
  "utf8"
);


let lineArray = [];
loadFiles.split(/\r?\n/).forEach((line) => {
  lineArray.push(line);
});

// lineArray.forEach((line, index) => {
//   addressExtractor(line, index);
// });

var outArray =[];
var outArray2=[];

function addressExtractor(line, index) {
  const tempArray = line.split(":");
  const arr=tempArray[0].split('"')
  console.log("trying to reach",arr[1]);
  outArray.push(arr[1]);
  const tempArray2 = tempArray[1].split(",");
  const address = tempArray2[0].split('"');
  return address[1];
}


async function wrapperFunction() {
  for (i = 0; i < lineArray.length - 1; i++) {
    for (j = i + 1; j < lineArray.length; j++) {
      const address1 = web3.utils.toChecksumAddress(
        addressExtractor(lineArray[i])
      );
      const address2 = web3.utils.toChecksumAddress(
        addressExtractor(lineArray[j])
      );

      const response = await sushiSwapV2Factory.methods
      .getPair(address1, address2)
      .call();

      console.log("response : ", response);
      if (!(response == "0x0000000000000000000000000000000000000000")) {
        //console.log("response : ", response);
        outArray.push(response);
        console.log(outArray);
        outArray2.push(outArray)
      }
      outArray=[];
      fs.writeFile('./dataFile/sushiswapV2File.txt', outArray2,{ flag: 'w+' }, err => {
        if (err) {
          console.error(err)
          return
        }
        //file written successfully
      })
    }
   
  }
 
}

wrapperFunction();






