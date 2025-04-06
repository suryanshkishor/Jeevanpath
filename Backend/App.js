import Express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

import db from "./db.js";

dotenv.config();

const App = Express();
const port = process.env.PORT || 3000;
const GeminiApi = process.env.GEMINI_API;

App.use(Express.urlencoded({ extended: true }));
App.use(Express.static("Public"));
App.use(Express.json());
App.use(cors());


App.post("/generate-response", async (req, res) => {
  const { userMessage } = req.body;

  if (!GeminiApi) {
    return res.status(500).json({ error: "API key is missing" });
  }

  try {
    const generativeAI = new GoogleGenerativeAI(GeminiApi);
    const model = generativeAI.getGenerativeModel({ model: "gemini-2.0-pro-exp-02-05" });

    const chat = await model.startChat({ history: [{ role: "user", parts: [{ text: userMessage }] }] });
    const result = await chat.sendMessage([{ text: userMessage }]);

    const responseText = result.response.text();

    const reponseDb = responseText.trim("**");

    db.execute(`INSERT INTO records(input, response) VALUES(?, ?)`,[userMessage, reponseDb],  (err, res) => {
      if (err) {
        console.error("Error inserting data:", err.message);
        return;
      }
      console.log("Inserted ID:", res.insertId);
    });

    return res.json({ response: responseText });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to generate AI response" });
  }
});

App.listen(port, () => {
  console.log(`Listening on Port ${port}`);
  console.log(`http://localhost:${port}/`);
});