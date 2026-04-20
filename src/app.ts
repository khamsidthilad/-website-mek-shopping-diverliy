import express, { Application, Request, Response } from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes";

const app: Application = express();

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("API running...");
});
app.use("/api/users", userRoutes);


export default app;