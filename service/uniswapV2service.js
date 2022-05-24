const Web3 = require("web3");
const web3 = new Web3(
 //"https://mainnet.infura.io/v3/1f0e05aa0b5c4ece90db3baebbf4ec4d"
   "https://mainnet.infura.io/v3/c90ce75b4af34a5885acdcc9a3b788fb"
  //"https://mainnet.infura.io/v3/75b3261575284b5c8a40c33e53770901"
  // "https://mainnet.infura.io/v3/5c8d3c7c9b4b4cba9a24fa00b820f103"
 //"https://mainnet.infura.io/v3/af228a6d64524b3891a4f546b5c2d9a7"

);
const fs = require("fs");

const UniswapV2FactoryABI = require("../contractABI/FactoryContractABI/uniswapV2Factory.json");
const res = require("express/lib/response");
//const { response } = require("express");

const UniswapV2Factory = new web3.eth.Contract(
  UniswapV2FactoryABI,
  "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"
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
let outArray2=[];

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
      
      const response = await UniswapV2Factory.methods
        .getPair(address1, address2)
        .call();

      console.log("response : ", response);
      if (!(response == "0x0000000000000000000000000000000000000000")) {
       // console.log("response : ", response);
        outArray.push(response);
       
        outArray2.push(outArray)
      

        }  
        outArray=[];
        console.log(outArray2)
    }fs.writeFile('./dataFile/uniswapV2File.txt', outArray2,{ flag: 'w+' }, err => {
      if (err) {
        console.error(err)
        return
      }
      //file written successfully
    })
   
    
  }
  
 
}
//outArray2.push.apply(outArray2,outArray);
wrapperFunction();


