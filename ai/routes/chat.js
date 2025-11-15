import express from "express";
import OpenAI from "openai";

const router = express.Router();
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post("/", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You are LoX Infernal Oracle, the official assistant for the Lucifer Coin ecosystem. You must provide helpful, safe answers related to LoX, crypto, the app, games, and wallet. No illegal behavior. No personal data. No financial guarantees."
        },
        { role: "user", content: userMessage }
      ]
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI Server Error" });
  }
});

export default router;
