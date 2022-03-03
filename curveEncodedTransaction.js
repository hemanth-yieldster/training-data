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

const CurveEncodeFunction = async()=>{
    // let msgSender = "0xed4676ad9A0Cf24d2e504C2e3DAD23B836DE455e";

    // console.log("dai  : ", await dai.methods.balanceOf(msgSender).call())
    
    // let _spender = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7";
    // let _amount = to18("10");

    // if (dai.methods.allowance(msgSender, _spender) > 0) {
    //     dai.methods.approve(_spender, 0).call({from:msgSender});
    //     dai.methods.approve(_spender, _amount).call({from:msgSender});
    // } else dai.methods.approve(_spender, _amount).call({from:msgSender});


    let instruction = await web3.eth.abi.encodeFunctionCall({
        name: "exchange",
        type: "function",
        inputs: [
            {
                type: "int128",
                name: "i"
            },
            {
                type: "int128",
                name: "j"
            },
            {
                type: "uint256",
                name: "dx"
            },
            {
                type: "uint256",
                name: "min_dy"
            }
        ]
    }, [1,0,to6("10"),to18("1")]);

    console.log("instruction ",instruction);
                //0x3df021240000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000000de0b6b3a7640000

    let instNew = "0x3df021240000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000000de0b6b3a7640000"
    if(instNew == instruction.toString()){
      console.log("same")
  }

    
}

CurveEncodeFunction();