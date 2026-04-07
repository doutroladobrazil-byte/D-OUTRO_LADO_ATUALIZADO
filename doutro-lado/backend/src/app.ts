import cors from "cors";
import express from "express";
import morgan from "morgan";
import { handleStripeWebhook } from "./domains/stripe/stripe.controller.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { router } from "./routes/index.js";

export const app = express();

app.use(cors());
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);
app.use(express.json());
app.use(morgan("dev"));
app.use("/api", router);
app.use(errorHandler);
