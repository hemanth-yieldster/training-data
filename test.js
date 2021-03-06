const Web3 = require("web3");
const moment = require('moment');

// const infura_provider = "wss://mainnet.infura.io/ws/v3/df57c5da4e444a4c94b362aeec143e9e"
const infura_provider = "ws://localhost:8545"
const provider = new Web3.providers.WebsocketProvider(infura_provider, {
    clientConfig: {
        keepalive: true,
        keepaliveInterval: 600000,
    },
    reconnect: {
        auto: true,
        delay: 1500,
        onTimeout: true,
    }
})
let web3 = new Web3(provider);
const toBN = web3.utils.toBN
const uniswapV2Pool = require('./contractABI/Uniswapv2Pool.json');
const balancerV1Pool = require('./contractABI/BalancerV1Pool.json');
const IERC20 = require('./contractABI/ERC20.json').abi
const kyberPool = require("./contractABI/KyberPool.json");
const sushiPool = require("./contractABI/SushiSwapPool.json");
const balanceV2Pool = require("./contractABI/BalancerV2Pool.json");
const balancerVault = require("./contractABI/BalancerVault.json");
const kyberRouter = require("./contractABI/KyberRouter.json");
const sushiSwapRouter = require("./contractABI/SushiSwapRouter.json");
const uniswapRouter = require("./contractABI/UniswapRouter.json");

const uniswapModel = require("./model/uniswapV2Model");
const kyberModel = require("./model/kyberModel");
const sushiSwapModel = require("./model/sushiSwapModel");
const balancerModel = require("./model/balanceModel");
const balancerV2Model = require("./model/balancerV2Model");

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

function to8(n) {
    return (n * (10 ** 8)).toString();
}

function from8(n) {
    return (n / (10 ** 8)).toString();
}

function to2(n) {
    return (n * (10 ** 2)).toString();
}

function from2(n) {
    return (n / (10 ** 2)).toString();
}

const getMonthBlocks = async () => {
    let blocksPerDay = 6500;
    let latestBlock = await web3.eth.getBlockNumber();
    let blockRange = [];
    for (i = 10; i > 0; i--) blockRange.push(latestBlock - i)
    return blockRange.sort()
}

exports.uniswapV2PoolData = (async (req, res) => {
    let blockList = await getMonthBlocks();
    let k = await Promise.all(blockList.map(async x => {
        contract = new web3.eth.Contract(uniswapV2Pool, "0xE1573B9D29e2183B1AF0e743Dc2754979A40D237");
        poolInfo = await contract.methods.getReserves().call({}, x)
        let data = BigInt(toBN(poolInfo._reserve0) * toBN(poolInfo._reserve1))
        let blockData = await web3.eth.getBlock(x);
        var timeStamp = moment((blockData.timestamp) * 1000).format("DD-MMM-YYYY HH:mm:ss");
        const newData = new uniswapModel({
            poolAddress: "0xE1573B9D29e2183B1AF0e743Dc2754979A40D237",
            x: toBN(poolInfo._reserve0),
            y: toBN(poolInfo._reserve1),
            k: data,
            timeStamp: timeStamp
        });
        newData.save()
            .then(() => console.log("added"))
            .catch((err) => console.log(err))
    }));
    res.send("hello ")
})

let balancerPoolData = (async (poolAddress) => {
    let blockList = await getMonthBlocks();
    let K = await Promise.all(blockList.map(async x => {
        let product = 1;
        contract = new web3.eth.Contract(balancerV1Pool, poolAddress);
        let tokenList = await contract.methods.getFinalTokens().call({}, x)
        let balanceList = [];
        let normalizedWeightList = [];
        await Promise.all(tokenList.map(async y => {
            let tokenContract = new web3.eth.Contract(IERC20, y)
            let normalizedWeight = web3.utils.fromWei(await contract.methods.getNormalizedWeight(y).call({}, x))
            let decimal = await tokenContract.methods.decimals().call({}, x)
            let balance = (await contract.methods.getBalance(y).call({}, x)) / 10 ** decimal
            balanceList.push(balance);
            normalizedWeightList.push(normalizedWeight);
            product *= (balance ** parseFloat(normalizedWeight))
        }))
        let blockData = await web3.eth.getBlock(x);
        let timeStamp = moment((blockData.timestamp) * 1000).format("DD-MMM-YYYY HH:mm:ss");
        let newData = new balancerModel({
            poolAddress: poolAddress,
            assetAddress: tokenList,
            assetBalance: balanceList,
            normalizedWeight: normalizedWeightList,
            V: product,
            timeStamp: timeStamp
        });
        newData.save()
            .then(() => console.log("added"))
            .catch((err) => console.log(err))
    }));
})

exports.getBalancerData = (async (req, res) => {
    poolList = ["0x0d88b55317516b84e78fbba7cde3f910d5686901"]
    let a = await Promise.all(poolList.map(async (poolAddress) => {
        await balancerPoolData(poolAddress);
    }))
    res.send("hello")
})

exports.kyberPoolData = (async (req, res) => {
    let contract = new web3.eth.Contract(kyberPool, "0x306121f1344ac5f84760998484c0176d7bfb7134")
    let blockList = await getMonthBlocks()
    let data = await Promise.all(blockList.map(async x => {
        let KASquare = await contract.methods.kLast().call({}, x);
        let tradeInfo = await contract.methods.getTradeInfo().call({}, x)
        let blockData = await web3.eth.getBlock(x);
        let timeStamp = moment((blockData.timestamp) * 1000).format("DD-MMM-YYYY HH:mm:ss");
        let a1 = (toBN(tradeInfo._vReserve0) / toBN(tradeInfo._reserve0))
        let a2 = (toBN(tradeInfo._vReserve1) / toBN(tradeInfo._reserve1))

        let newData = new kyberModel({
            poolAddress: "0x306121f1344ac5f84760998484c0176d7bfb7134",
            a1: a1,
            a2: a2,
            x: tradeInfo._reserve0,
            y: tradeInfo._reserve1,
            kaSquare: KASquare,
            timeStamp: timeStamp
        });
        newData.save()
            .then(() => console.log("added"))
            .catch((err) => console.log(err))
    }))
    res.send("hello")
})

exports.sushiSwapPoolData = (async (req, res) => {
    let poolList = await getMonthBlocks();
    console.log(poolList)
    let contract = new web3.eth.Contract(sushiPool, "0xD86A120a06255Df8D4e2248aB04d4267E23aDfaA");
    let data = await Promise.all(poolList.map(async x => {
        let k = await contract.methods.kLast().call({}, x)
        let token0 = await contract.methods.token0().call({}, x)
        let token1 = await contract.methods.token1().call({}, x)
        let blockData = await web3.eth.getBlock(x);
        let timeStamp = moment((blockData.timestamp) * 1000).format("DD-MMM-YYYY HH:mm:ss");
        const newData = new sushiSwapModel({
            poolAddress: "0xD86A120a06255Df8D4e2248aB04d4267E23aDfaA",
            x: token0,
            y: token1,
            k: k,
            timeStamp: timeStamp
        });
        newData.save()
            .then(() => console.log("added"))
            .catch((err) => console.log(err))
    }))
    res.send("hello")
})

let balancerV2PoolData = (async (poolAddress) => {
    let blockList = await getMonthBlocks();
    let K = await Promise.all(blockList.map(async x => {
        let product = 1;
        contract = new web3.eth.Contract(balanceV2Pool, poolAddress);
        let normalizedWeightList = await contract.methods.getNormalizedWeights().call({}, x)
        let poolId = await contract.methods.getPoolId().call({}, x)
        let vaultAddress = await contract.methods.getVault().call({}, x)
        let vaultContract = new web3.eth.Contract(balancerVault, vaultAddress);
        let poolData = await vaultContract.methods.getPoolTokens(poolId).call({}, x)
        let tokenList = poolData.tokens;
        let balanceList = poolData.balances;
        let newBalanceList = [];
        let newNormalizedWeightList = normalizedWeightList.map(x => {
            return web3.utils.fromWei(x)
        })
        await Promise.all(tokenList.map(async (assetAddress, index) => {
            let tokenContract = new web3.eth.Contract(IERC20, assetAddress)
            let decimal = await tokenContract.methods.decimals().call({}, x)
            let balance = (balanceList[index]) / 10 ** decimal
            newBalanceList.push(balance)
            product *= (balance ** web3.utils.fromWei(normalizedWeightList[index]))
        }))
        let blockData = await web3.eth.getBlock(x);
        let timeStamp = moment((blockData.timestamp) * 1000).format("DD-MMM-YYYY HH:mm:ss");

        let newData = new balancerV2Model({
            poolAddress: poolAddress,
            assetAddress: tokenList,
            assetBalance: newBalanceList,
            normalizedWeight: newNormalizedWeightList,
            V: product,
            timeStamp: timeStamp
        });
        newData.save()
            .then(() => console.log("added"))
            .catch((err) => console.log(err))
    }));
})

exports.getBalancerV2Data = (async (req, res) => {
    poolList = ["0x0b09deA16768f0799065C475bE02919503cB2a35"]
    let a = await Promise.all(poolList.map(async (poolAddress) => {
        await balancerV2PoolData(poolAddress);
    }))
    res.send("hello")
})

// Fuction to execute swap using Kyper swap
exports.executeKyberSwap = (async () => {
    let router = new web3.eth.Contract(kyberRouter, "0x1c87257F5e8609940Bc751a07BB085Bb7f8cDBE6")
    let kyberPoolInstance = new web3.eth.Contract(kyberPool, "0x306121f1344ac5F84760998484c0176d7BFB7134")
    let tokenInstance = new web3.eth.Contract(IERC20, "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48");

    let transaction = {
        from: "0x5091aF48BEB623b3DA0A53F726db63E13Ff91df9",
        to: "0x1c87257F5e8609940Bc751a07BB085Bb7f8cDBE6",
        gas: 1400000,
        data: web3.eth.abi.encodeFunctionCall({
            name: 'swapExactTokensForTokens',
            type: 'function',
            inputs: [{
                type: 'uint256',
                name: 'amountIn'
            }, {
                type: 'uint256',
                name: 'amountOutMin'
            }, {
                type: 'address[]',
                name: 'poolsPath'
            }, {
                type: 'address[]',
                name: 'path'
            }, {
                type: 'address',
                name: 'to'
            }, {
                type: 'uint256',
                name: 'deadline'
            }]
        }, [
            to6("10"),
            to6("0"),
            ["0x306121f1344ac5F84760998484c0176d7BFB7134"],
            ["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", "0xdAC17F958D2ee523a2206206994597C13D831ec7"],
            "0x5091aF48BEB623b3DA0A53F726db63E13Ff91df9",
            1645807260
        ])
    }

    let tokenApprove = await tokenInstance.methods.approve("0x1c87257F5e8609940Bc751a07BB085Bb7f8cDBE6", to6("20")).call({
        from: "0x5091aF48BEB623b3DA0A53F726db63E13Ff91df9"
    });
    console.log("tokenApprove: ", tokenApprove)

    let signPromise = await web3.eth.accounts.signTransaction(
        transaction,
        "63f199a49e62ce84ca7266f30338e46674984b02e20d5a41634fc0fbbd15f4d6"
    );
    const sentTx = web3.eth.sendSignedTransaction(
        signPromise.raw || signPromise.rawTransaction
    );
    sentTx.on("receipt", async (receipt) => {
        console.log(
            `Transaction success! gas:- ${receipt.gasUsed} txnHash:- ${receipt.transactionHash}`
        );
    });
    sentTx.on("error", async (err) => {
        console.log(`Transaction error! Error:- ${err.message}`);
    });
})

// Function to execute swap using sushi swap
exports.executeSushiSwap = (async () => {
    let sushiPoolInstance = new web3.eth.Contract(sushiPool, "0xAaF5110db6e744ff70fB339DE037B990A20bdace");
    let tokenInstance = new web3.eth.Contract(IERC20, "0x6b175474e89094c44da98b954eedeac495271d0f");
    let transaction = {
        from: "0x5091aF48BEB623b3DA0A53F726db63E13Ff91df9",
        to: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
        gas: 1400000,
        data: web3.eth.abi.encodeFunctionCall({
            name: 'swapExactTokensForTokens',
            type: 'function',
            inputs: [{
                type: 'uint256',
                name: 'amountIn'
            }, {
                type: 'uint256',
                name: 'amountOutMin'
            }, {
                type: 'address[]',
                name: 'path'
            }, {
                type: 'address',
                name: 'to'
            }, {
                type: 'uint256',
                name: 'deadline'
            }]
        }, [
            10000000,
            1000000,
            ["0x6b175474e89094c44da98b954eedeac495271d0f", "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"],
            "0x5091aF48BEB623b3DA0A53F726db63E13Ff91df9",
            1645807260
        ])
    }

    // let approve = await sushiPoolInstance.methods.approve("0xAaF5110db6e744ff70fB339DE037B990A20bdace", to18("10")).call({
    //     from: "0x5091aF48BEB623b3DA0A53F726db63E13Ff91df9"
    // });
    // console.log("appr: ", approve)

    let tokenApprove = await tokenInstance.methods.approve("0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F", 10000000).call({
        from: "0x5091aF48BEB623b3DA0A53F726db63E13Ff91df9"
    });
    console.log("tokenApprove: ", tokenApprove)

    let signPromise = await web3.eth.accounts.signTransaction(
        transaction,
        "63f199a49e62ce84ca7266f30338e46674984b02e20d5a41634fc0fbbd15f4d6"
    );
    const sentTx = web3.eth.sendSignedTransaction(
        signPromise.raw || signPromise.rawTransaction
    );
    sentTx.on("receipt", async (receipt) => {
        console.log(
            `Transaction success! gas:- ${receipt.gasUsed} txnHash:- ${receipt.transactionHash}`
        );
    });
    sentTx.on("error", async (err) => {
        console.log(`Transaction error! Error:- ${err.message}`);
    });
})

// Function to execute swap using uniswap
exports.executeUniswapSwap = (async () => {
    let router = new web3.eth.Contract(uniswapRouter, "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45")
    let transaction = {
        from: "0x5091aF48BEB623b3DA0A53F726db63E13Ff91df9",
        to: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
        gas: 1400000,
        data: web3.eth.abi.encodeFunctionCall({
            name: 'swapExactTokensForTokens',
            type: 'function',
            inputs: [{
                type: 'uint256',
                name: 'amountIn'
            }, {
                type: 'uint256',
                name: 'amountOutMin'
            }, {
                type: 'address[]',
                name: 'path'
            }, {
                type: 'address',
                name: 'to'
            }]
        }, [
            web3.utils.toWei("10"),
            to6("0"),
            ["0x6b175474e89094c44da98b954eedeac495271d0f", "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"],
            "0x5091aF48BEB623b3DA0A53F726db63E13Ff91df9",
        ])
    }
    // let approve = await kyberPoolInstance.methods.approve("0x1c87257F5e8609940Bc751a07BB085Bb7f8cDBE6", web3.utils.toWei("10")).call({
    //     from: "0x5091aF48BEB623b3DA0A53F726db63E13Ff91df9"
    // });
    // console.log("appr: ", approve)

    let signPromise = await web3.eth.accounts.signTransaction(
        transaction,
        "63f199a49e62ce84ca7266f30338e46674984b02e20d5a41634fc0fbbd15f4d6"
    );
    const sentTx = web3.eth.sendSignedTransaction(
        signPromise.raw || signPromise.rawTransaction
    );
    sentTx.on("receipt", async (receipt) => {
        console.log(
            `Transaction success! gas:- ${receipt.gasUsed} txnHash:- ${receipt.transactionHash}`
        );
    });
    sentTx.on("error", async (err) => {
        console.log(`Transaction error! Error:- ${err.message}`);
    });
})

// Function to add assets to existing datas
exports.addAssets = (async () => {
    let data = await kyberModel.updateMany({
        poolAddress: "0x20d6b227F4a5a2A13d520329f01bb1F8F9d2d628"
    }, {
        $set: {
            assetAddress: [
                "0x6b175474e89094c44da98b954eedeac495271d0f",
                "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
            ]
        }
    })
    if (data)
        console.log("updated")
})


exports.encodeKyber = (async () => {
    let encodedData = await web3.eth.abi.encodeFunctionCall({
        name: 'swapExactTokensForTokens',
        type: 'function',
        inputs: [{
            type: 'uint256',
            name: 'amountIn'
        }, {
            type: 'uint256',
            name: 'amountOutMin'
        }, {
            type: 'address[]',
            name: 'poolsPath'
        }, {
            type: 'address[]',
            name: 'path'
        }, {
            type: 'address',
            name: 'to'
        }, {
            type: 'uint256',
            name: 'deadline'
        }]
    }, [
        to6("10"),
        to6("0"),
        ["0x306121f1344ac5F84760998484c0176d7BFB7134"],
        ["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", "0xdAC17F958D2ee523a2206206994597C13D831ec7"],
        "0x5091aF48BEB623b3DA0A53F726db63E13Ff91df9",
        1645807260
    ])

    console.log("encodedData: ", encodedData);
})