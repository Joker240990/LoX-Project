import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRoute from "./routes/chat.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/chat", chatRoute);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🔥 LoX Infernal Oracle running on port ${PORT}`);
});
