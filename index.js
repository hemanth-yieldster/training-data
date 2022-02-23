const express = require("express");
const app = express();

app.use(
    express.json({
        limit: '10mb'
    })
);

//connect to database
const connectToDatabase = require("./connectToDB");
connectToDatabase();

const testFile = require("./test");

app.get("/test", testFile.getBalancerData)

const PORT = process.env.PORT || 8050;
app.listen(PORT, () => console.log(`Server listening on port : ${PORT} `));