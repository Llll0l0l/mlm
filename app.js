require("dotenv").config();

const express = require("express");
const path = require("path");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// home route
app.get("/", (req, res) => {
  res.render("lounge/home");
});

app.listen(process.env.APP_PORT || 3000, () => {
  console.log("App is listening on port ", process.env.APP_PORT || 3000);
});
