require("dotenv").config();

const express = require("express");
const path = require("path");

const jsonServer = require("json-server");
const app = express();
const router = jsonServer.router("db/db.json");
const middlewares = jsonServer.defaults();
const { nanoid } = require("nanoid");
const axios = require("axios");
const session = require("express-session");
const cookieParser = require("cookie-parser");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.sessionSecret || "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 365 * 24 * 60 * 60 * 1000,
    },
  })
);
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// home route
app.get("/", async (req, res) => {
  if (!req.session.teamId) {
    req.session.teamId = nanoid();
    console.log(req.session.teamId);
    try {
      // await axios.post("http://localhost:6543/api/lounges/teams", {
      //   id: req.session.teamId,
      //   members: {
      //     member: {
      //       name: "John", // decide it before loading
      //       avatar: "img.png", // decide it before loading
      //       individualSessionTime: 0,
      //     },
      //   },
      //   todoList: {
      //     title: "Your To Do",
      //     tasks: [],
      //   },
      //   totalSessionTime: 0,
      // });
    } catch (error) {
      if (error.response) {
        console.error("Axios response error:", error.response.data);
      } else {
        console.error("Axios error:", error.message);
      }
      res.status(500).send("Failed to create team");
    }
  }

  console.log(req.session.teamId);

  res.render("lounge/lounge", {
    tasks: [],
    title: "",
    link: `http://localhost:6543/teams/${req.session.teamId || "failed"}`,
  });
});

app.get("/teams/:id", (req, res) => {
  const { id } = req.params;
  const db = router.db;
  const team = db.get("teams").find({ id }).value();

  if (team) {
    res.json(team);
  } else {
    res.status(404).render("err/404");
  }
});

// add time
app.post("/api/add-time", express.json(), (req, res) => {
  const { seconds } = req.body;
  console.log("Time received:", seconds, "seconds");
  // Save to DB, session, etc.
  res.sendStatus(200);
});

app.use("/api/lounges", middlewares, router); // mount under /api

app.use((req, res) => {
  res.status(404).render("err/404");
});

app.listen(process.env.APP_PORT || 3000, () => {
  console.log("App is listening on port ", process.env.APP_PORT || 3000);
});
