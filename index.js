const express = require("express");
const req = require("express/lib/request");
const app = express();

app.use(
  express.json({
    limit: "10mb",
  })
);

//connect to database
const connectToDatabase = require("./connectToDB");
connectToDatabase();

const testFile = require("./test");
const curveV2File = require("./curveV2Functions");

app.get("/test", testFile.getBalancerData);
app.get("/curveV2", curveV2File.curveV2PoolData);

const PORT = process.env.PORT || 8050;
app.listen(PORT, () => console.log(`Server listening on port : ${PORT} `));
