const mongoose = require("mongoose");


const connectToDatabase = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/training-data", {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            // poolSize:5
        });
        console.log("mongodb is connected!!");
    } catch (err) {
        console.log(err);
    }
};

module.exports = connectToDatabase;