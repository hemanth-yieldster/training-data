const Web3 = require("web3");
const moment = require("moment");

const infura_provider =
"wss://mainnet.infura.io/ws/v3/af7e2e37cd6545479e7523246fbaaa08";;
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
let base_virtual_price = 0;
let base_cache_updated = 0;
const PRECISION = 10 ** 18;
const N_COINS = 2;
const A_PRECISION = 100;

const curveV2USTPool = require("./contractABI/CurveV2Pool.json");
const curveBasePool = require("./contractABI/curve3pool.json").abi;

const curveV2DataModel = require("./model/curveV2Model");

const getMonthBlocks = async () => {
  let blocksPerDay = 6500;
  let latestBlock = await web3.eth.getBlockNumber();
  let blockRange = [];
  for (i = 50; i > 0; i--) blockRange.push(latestBlock - blocksPerDay * i);
  return blockRange.sort();
};

const vp_rate = async (block_number, contract, base_pool_contract) => {
  let blockData = await web3.eth.getBlock(block_number);
  let blockTimeStamp = await blockData.timestamp;
  const BASE_CACHE_EXPIRES = 10 * 60;
  if (blockTimeStamp > base_cache_updated + BASE_CACHE_EXPIRES) {
    let vprice = await base_pool_contract.methods
      .get_virtual_price()
      .call({}, block_number);
    base_virtual_price = vprice;
    base_cache_updated = blockTimeStamp;
    return vprice;
  } else {
    return base_virtual_price;
  }
};

const getD = async (xp, amp) => {
  let S = 0;
  let Dprev = 0;
  xp.forEach((x) => {
    S += x;
  });

  if (S == 0) return 0;
  let D = S;
  //   console.log("D ", D);
  let Ann = amp * N_COINS;
  for (i = 0; i <= 255; i++) {
    let D_P = D;
    for (j = 0; j < xp.length; j++) {
      D_P = (D_P * D) / (xp[j] * N_COINS);
    }
    Dprev = D;
    D =
      (((Ann * S) / A_PRECISION + D_P * N_COINS) * D) /
      (((Ann - A_PRECISION) * D) / A_PRECISION + (N_COINS + 1) * D_P);
    if (D > Dprev) {
      if (D - Dprev <= 1) {
        // console.log("inside if D: ", D);
        return D;
      } else {
        // console.log("Error first: ", i);
      }
    } else {
      if (Dprev - D <= 1) {
        // console.log("inside else D: ", D);
        return D;
      } else {
        // console.log("Error second: ", i);
      }
    }
  }
};

const xp_mem = (vp_rates, _balances) => {
  let result = [1000000000000000000, 1000000000000000000];
  result[1] = vp_rates;
  [0, 1].forEach((i) => {
    result[i] = (result[i] * _balances[i]) / PRECISION;
  });
  return result;
};

const PoolExchange = async (block_number, contract, base_pool_contract) => {
  let rates = [1000000000000000000, 1000000000000000000];
  const amp = 10000;
  let blockData = await web3.eth.getBlock(block_number);
  let timeStamp = moment(blockData.timestamp * 1000).format(
    "DD-MMM-YYYY HH:mm:ss"
  );
  rates[1] = await vp_rate(block_number, contract, base_pool_contract);
  let old_balances = [];
  old_balances[0] = await contract.methods.balances(0).call({}, block_number);
  old_balances[1] = await contract.methods.balances(1).call({}, block_number);
  let xp = xp_mem(rates[1], old_balances);
  let D_val = await getD(xp, amp);
  return { old_balances, D_val, timeStamp };
};

const curveV2PoolData = async () => {
  let poolList = await getMonthBlocks();
  console.log("reaced curve V2");
  base_pool_contract = new web3.eth.Contract(
    curveBasePool,
    "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7"
  );

  contract = new web3.eth.Contract(
    curveV2USTPool,
    "0x890f4e345B1dAED0367A877a1612f86A1f86985f"
  );

  let values = await Promise.all(
    poolList.map(async (x) => {
      return PoolExchange(x, contract, base_pool_contract);
    })
  );

  values.forEach((value)=>{
    console.log(value.old_balances[0],value.old_balances[1],value.D_val)
  })

  // values.forEach((value, index) => {
  //   if (value.D_val) {
  //     console.log(value);
  //     const newData = new curveV2DataModel({
  //       poolAddress: "0x890f4e345B1dAED0367A877a1612f86A1f86985f",
  //       x: value.old_balances[0],
  //       y: value.old_balances[1],
  //       D: value.D_val,
  //       timeStamp: value.timeStamp,
  //     });
  //     newData
  //       .save()
  //       .then(() => console.log("added"))
  //       .catch((err) => console.log(err));
  //   }
  // });
};
curveV2PoolData();
