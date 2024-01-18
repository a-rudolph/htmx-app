const { reloadMagic } = require("./reload-magic.js");

const express = require("express");
const path = require("path");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

const users = [
  {
    id: 1,
    name: "John",
  },
  {
    id: 2,
    name: "Jane",
  },
  {
    id: 3,
    name: "Joe",
  },
];

app.get("/", (req, res) => {
  res.render("index", {
    title: "index",
  });
});

app.get("/users", async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

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
