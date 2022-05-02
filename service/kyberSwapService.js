const Web3 = require("web3");
const web3 = new Web3(
  //"https://mainnet.infura.io/v3/1f0e05aa0b5c4ece90db3baebbf4ec4d"
  "https://mainnet.infura.io/v3/6b7e574215f04cd3b9ec93f791a8b6c6"
);
const fs = require("fs");

const kyberSwapFactoryABI = require("../contractABI/FactoryContractABI/kyberSwapFactory.json");

const kyberSwapV2Factory = new web3.eth.Contract(
  kyberSwapFactoryABI,
  "0x833e4083B7ae46CeA85695c4f7ed25CDAd8886dE"
);

const loadFiles = fs.readFileSync(
  "/home/dxuser/project file/training-data/kyberassetList.txt",
  "utf8"
);
// const loadFiles = fs.readFileSync(
//   "/home/dxuser/Desktop/kyber/assetList.txt",
//   "utf8"
// );



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
  console.log("try to reach:",arr[1]);
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

      const response = await kyberSwapV2Factory.methods
      .getPools(address1, address2)
      .call();
      console.log("response array:===>",response)

      if (response.length > 0) {
        console.log("response : ", response);
        outArray.push(response);
        console.log(outArray2);
        outArray2.push(outArray)
      }
      outArray=[];
      console.log(outArray2)
      fs.writeFile('./dataFile/kyberswapV2File.txt',outArray2,{ flag: 'w+' }, err => {
        if (err) {
          console.error(err)
          return
        }
        //file written successfully
      })
    }
    // fs.writeFile('./dataFile/kyberswapV2File.json', JSON.stringify(outArray2),{ flag: 'w+' }, err => {
    //   if (err) {
    //     console.error(err)
    //     return
    //   }
    //   //file written successfully
    // })
  }
  
}
wrapperFunction();


