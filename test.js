const Web3 = require("web3");
const moment = require('moment');

const infura_provider = "wss://mainnet.infura.io/ws/v3/af7e2e37cd6545479e7523246fbaaa08"
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

const uniswapModel = require("./model/uniswapV2Model");
const kyberModel = require("./model/kyberModel");
const sushiSwapModel = require("./model/sushiSwapModel");
const balancerModel = require("./model/balanceModel");
const balancerV2Model = require("./model/balancerV2Model");

const getMonthBlocks = async () => {
    let blocksPerDay = 6500;
    let latestBlock = await web3.eth.getBlockNumber();
    let blockRange = [];
    for (i = 180; i > 0; i--) blockRange.push(latestBlock - (blocksPerDay * i))
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
    poolList = ["0x69d460e01070A7BA1bc363885bC8F4F0daa19Bf5"]
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

exports.sushiSwapPoolData = (async () => {
    let poolList = await getMonthBlocks();
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