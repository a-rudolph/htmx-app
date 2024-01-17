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
    email: "",
  },
  {
    id: 2,
    name: "Jane",
    email: "",
  },
  {
    id: 3,
    name: "Joe",
    email: "",
  },
];

app.get("/", (req, res) => {
  res.render("index", {
    title: "index",
  });
});

app.get("/users", (req, res) => {
  res.render("users", {
    title: "users",
    users,
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
