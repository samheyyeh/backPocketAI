import express from "express";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not found. Please set it in your .env file.");
}

// Initialize Express app
const app = express();
app.use(express.json());
app.use(express.static("public"));

// Serve index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Chat endpoint
app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;
    if (!userMessage) {
        return res.status(400).json({ error: "No message provided." });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant for school administrators. Provide knowledgeable and context-aware responses for both daily tasks and complex or crisis situations."
                },
                { role: "user", content: userMessage }
            ],
            temperature: 0.7,
            max_tokens: 1000
        });

        // Extract and return the response
        const botResponse = completion.choices[0].message.content.trim();
        res.json({ response: botResponse });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});