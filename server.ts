import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // OpenRouter Proxy Endpoint
  app.post("/api/ai/generate", async (req, res) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      console.error("AI Proxy Error: OPENROUTER_API_KEY is missing from environment variables.");
      return res.status(500).json({ error: "OPENROUTER_API_KEY is not set on the server. Please add it to your environment variables." });
    }

    console.log(`AI Proxy: Sending request to OpenRouter for model: ${req.body.model}`);

    try {
      const requestBody = { ...req.body };
      if (!requestBody.max_tokens || requestBody.max_tokens > 10000) {
        requestBody.max_tokens = 10000;
      }
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": req.headers.referer || "https://sacred-word.app",
          "X-Title": "Sacred Word"
        },
        body: JSON.stringify(requestBody)
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        console.error(`OpenRouter Error (${response.status}):`, responseText);
        try {
          const errorData = JSON.parse(responseText);
          return res.status(response.status).json(errorData);
        } catch (e) {
          return res.status(response.status).send(responseText);
        }
      }

      try {
        const data = JSON.parse(responseText);
        res.json(data);
      } catch (e) {
        console.error("Failed to parse OpenRouter response as JSON:", responseText);
        res.status(500).json({ error: "Invalid JSON response from OpenRouter." });
      }
    } catch (error: any) {
      console.error("Server AI Proxy Exception:", error);
      res.status(500).json({ error: `Failed to connect to OpenRouter: ${error.message}` });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Serve static files from dist folder (works for both production mode AND network/public access)
  app.use(express.static(path.join(__dirname, "dist")));
  
  // Serve index.html for SPA routing (including network/public URLs)
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
