const { reloadMagic } = require("./reload-magic.js");
const { connect } = require("./db");

const express = require("express");
const path = require("path");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index", {
    title: "index",
  });
});

app.get("/users", async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const db = await connect();

  res.render("users", {
    title: "users",
    users: await db.users.get(),
  });
});

app.post("/users", async (req, res) => {
  const { name } = req.body;

  const db = await connect();

  const user = {
    name,
  };

  await db.users.post(user);

  const users = await db.users.get();

  // todo: need to try just serving up the new user

  res.render("users", {
    title: "users",
    users,
  });
});

app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  const db = await connect();

  await db.users.remove(Number(id));

  const users = await db.users.get();

  res.render("users", {
    title: "users",
    users,
  });
});

app.get("/reload-magic", (req, res) => {
  res.send(reloadMagic);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
