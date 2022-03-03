const Web3 = require("web3");
const moment = require("moment");
const ERC20 = require('./contractABI/IERC20.json').abi;

const infura_provider =
  "ws://localhost:8545";
const provider = new Web3.providers.WebsocketProvider(infura_provider, {
  clientConfig: {
    keepalive: true,
    keepaliveInterval: 60000,
  },
  reconnect: {
    auto: true,
    delay: 1500,
    onTimeout: true,
  },
});
let web3 = new Web3(provider);

function to18(n) {
    return web3.utils.toWei(n, "ether");
  }
  
  function from18(n) {
    return web3.utils.fromWei(n, "ether");
  }
  
  function to6(n) {
    return web3.utils.toWei(n, "Mwei");
  }
  
  function from6(n) {
    return web3.utils.fromWei(n, "Mwei");
  }

  const dai = new web3.eth.Contract(
    ERC20,
    "0x6B175474E89094C44Da98b954EedeAC495271d0F"
  );
  const usdt = new web3.eth.Contract(
    ERC20,
    "0xdAC17F958D2ee523a2206206994597C13D831ec7"
  );
  const usdc = new web3.eth.Contract(
    ERC20,
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
  );

const CurveEncodeFunction = async()=>{
    let msgSender = "0xed4676ad9A0Cf24d2e504C2e3DAD23B836DE455e";

    console.log("dai  : ", await dai.methods.balanceOf(msgSender).call())
    
    let _spender = "0x306121f1344ac5F84760998484c0176d7BFB7134";
    let _amount = to6("10");

    if (usdc.methods.allowance(msgSender, _spender) > 0) {
        usdc.methods.approve(_spender, 0).call({from:msgSender});
        usdc.methods.approve(_spender, _amount).call({from:msgSender});
    } else usdc.methods.approve(_spender, _amount).call({from:msgSender});



    let instruction = await web3.eth.abi.encodeFunctionCall({
        name: "swapExactTokensForTokens",
        type: "function",
        inputs: [
            {
                type: "uint256",
                name: "amountIn"
            },
            {
                type: "uint256",
                name: "amountOutMin"
            },
            {
                type: "address[]",
                name: "poolsPath"
            },
            {
                type: "address[]",
                name: "path"
            },
            {
                type: "address",
                name: "to"
            },
            {
                type: "uint256",
                name: "deadline"
            }
        ]
    }, [to6("10"),to6("1"),["0x306121f1344ac5F84760998484c0176d7BFB7134"],["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48","0xdAC17F958D2ee523a2206206994597C13D831ec7"],"0xA99B2Ec4a6E12300825aFa87B5770530beb69C14",1646256514]);

    

    console.log("instruction",instruction)

    // web3.eth.sendTransaction()
    
     let instNew = "0xceb757d5000000000000000000000000000000000000000000000000000000000098968000000000000000000000000000000000000000000000000000000000000f424000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000920595a400c2211564be2363a38786e0ab3db6d00000000000000000000000000000000000000000000000000000000621fe1820000000000000000000000000000000000000000000000000000000000000001000000000000000000000000306121f1344ac5f84760998484c0176d7bfb71340000000000000000000000000000000000000000000000000000000000000002000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7"
     if(instNew == instruction.toString()){
         console.log("same")
     }

    

    
    
}

CurveEncodeFunction();