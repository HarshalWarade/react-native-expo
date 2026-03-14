import express from "express";
import { ENV } from "./config/env.js";
import { connectDatabase } from "./config/db.js";

const app = express();

connectDatabase();

app.get("/", (req, res) => {
  res.send("hello from server");
});

app.listen(ENV.PORT, () => console.log("Server is up and running."));
