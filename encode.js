const Web3 = require("web3");
const infura_provider = "ws://localhost:8545"
const provider = new Web3.providers.WebsocketProvider(infura_provider, {
	clientConfig: {
		keepalive: true,
		keepaliveInterval: 60000,
	},
	reconnect: {
		auto: true,
		delay: 1500,
		onTimeout: true,
	}
})
let web3 = new Web3(provider);

const encodeFunction = async()=>{


    const encodedData = web3.eth.abi.encodeFunctionCall({
        name: 'setVaultSmartStrategy',
        type: 'function',
        inputs: [{
            type: 'address',
            name: '_smartStrategyAddress'
        },{
            type: 'uint256',
            name: '_type' 
        }]
    }, ["0x167D3f5E9D36F9f465aaaE1b486f51a88C56ce60",2])

    console.log("encoded data.............    ",encodedData)

    let transaction = {
        from :"0xe140e91e48b0fab5a36bda64870213eaf202e4e4",
        to: "0x02FB737B01dd3Dfc4eF006969b4211487afdd06a", 
        data: encodedData
        
    }
    
    const sentTx =await web3.eth.sendTransaction(
        transaction
      );
    // console.log("sentttttttttt",sentTx);


    //withdrawingggggggggggg

    await web3.eth.sendTransaction({to:"0xe749839f9D47b5ee50c2873b862E2Ed986B31E23", from:"0xed4676ad9A0Cf24d2e504C2e3DAD23B836DE455e", value: web3.utils.toWei('1')})
    // console.log("transfered ether...........")

    try{

        const encodedData2 = web3.eth.abi.encodeFunctionCall({
            name: 'withdraw',
            type: 'function',
            inputs: [{
                type: 'uint256',
                name: '_shares' 
            }]
        }, [web3.utils.toWei('2838896.091369803665330299')])

        // console.log("newly encoded ",encodedData2)

        let transactionNew = {
            from :"0xe749839f9D47b5ee50c2873b862E2Ed986B31E23",
            to: "0x02FB737B01dd3Dfc4eF006969b4211487afdd06a", 
            data: encodedData2,
            gas:10000000
            
        }
        
        const sentTx2 =await web3.eth.sendTransaction(
            transactionNew
          );
        // console.log("withdrawwwwwwwww",sentTx2)

    }catch(err){
        console.log("error ",err)
    }

    

    
}


encodeFunction();