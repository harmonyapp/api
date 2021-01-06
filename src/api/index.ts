import cors from "cors";
import express, { Router } from "express";
import v1 from "./v1";
import ratelimit from "./v1/middlewares/ratelimit";

const app = express();
const api = Router();

app.use(express.json());
app.use(cors());

api.use("/v1", v1);
app.use("/api", ratelimit({ windowMs: 5000, max: 8 }));
app.use("/api", api);

export default app;