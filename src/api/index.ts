import cors from "cors";
import express from "express";
import api from "./app";
import ratelimit from "./app/middlewares/ratelimit";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/", ratelimit({ windowMs: 16000, max: 96 }));
app.use("/", api);

export default app;