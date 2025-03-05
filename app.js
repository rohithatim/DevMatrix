const express = require("express");

const app = express();

app.use("/test", (req, res) => {
  res.send("testing");
});

app.use("/fire", (req, res) => {
  res.send("fire");
});

app.listen(3000, () => {
  console.log("running");
});
