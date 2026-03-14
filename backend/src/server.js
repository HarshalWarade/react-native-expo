import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

import userRoutes from "./routes/user.route.js";

import { ENV } from "./config/env.js";
import { connectDatabase } from "./config/db.js";

const app = express();

connectDatabase();

app.use(cors());
app.use(express.json());

app.use(clerkMiddleware());

app.get("/", (req, res) => {
  res.send("hello from server");
});

app.use("/api/users", userRoute);

app.listen(ENV.PORT, () => console.log("Server is up and running."));
