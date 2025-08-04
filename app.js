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
const db = router.db;
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
      sameSite: "none",
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
    try {
      await axios.post("http://localhost:6543/api/lounges/teams", {
        id: req.session.teamId,
        members: {
          member: {
            name: "John", // decide it before loading
            avatar: "img.png", // decide it before loading
            individualSessionTime: 0,
          },
        },
        todoList: {
          title: "Your To Do",
          tasks: [],
        },
        totalSessionTime: 0,
      });
    } catch (error) {
      if (error.response) {
        console.error("Axios response error:", error.response.data);
      } else {
        console.error("Axios error:", error.message);
      }
      res.status(500).send("Failed to create team");
    }
  }

  res.render("lounge/lounge", {
    tasks: [],
    title: "",
    link: `http://localhost:6543/${req.session.teamId || "failed"}`,
  });
});

app.post("/api/update-task-list", express.json(), (req, res) => {
  const id = req.session.teamId;
  const { newTitle } = req.body;

  if (!id || !newTaskList) {
    return res.status(400).json({ error: "Missing team ID or task" });
  }

  const team = db.get("teams").find({ id }).value();

  if (!team) {
    return res.status(404).json({ error: "Team not found" });
  }

  db.get("teams")
    .find({ id })
    .assign({ todoList: { ...team.todoList, tasks: newTaskList } })
    .write();
  res.json({ success: true, tasks: team.todoList.tasks });
});

app.post("/api/update-title", express.json(), (req, res) => {
  const id = req.session.teamId;
  const { newTitle } = req.body;

  if (!id || !newTitle) {
    return res.status(400).json({ error: "Missing team ID or task" });
  }

  const team = db.get("teams").find({ id }).value();

  if (!team) {
    return res.status(404).json({ error: "Team not found" });
  }

  db.get("teams")
    .find({ id })
    .assign({ todoList: { ...team.todoList, title: newTitle } })
    .write();
  res.json({ success: true, title: team.todoList.title });
});

app.get("/:id", (req, res) => {
  const { id } = req.params;
  const team = db.get("teams").find({ id }).value();

  if (team) {
    res.status(200).render("lounge/lounge", {
      tasks: team.todoList.tasks,
      title: team.todoList.title,
      link: `http://localhost:6543/${team.id}`,
    });
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
