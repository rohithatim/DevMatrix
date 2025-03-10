const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://cppsec:Qq123432@nodejs.412he.mongodb.net/?retryWrites=true&w=majority&appName=Nodejs"
  );
};

connectDB()
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log("error connecting to database");
  });

module.exports = connectDB;
