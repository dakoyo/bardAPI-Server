import express from "express";
import * as dotenv from "dotenv"
dotenv.config();
import Bard from "./bardAPI.js";
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

const apiKeys = process.env.APIKEYS?.split(",") ?? ["debug-api-key"];

const bard = new Bard(process.env.BARD_COOKIE);

app.get("/", (req, res) => {
  res.send("Hello, world");
})

app.post("/api", async (req, res) => {
  const authHeader = req.headers.authorization;
  const condition = {
    imageURL: false,
    conversationId: false,
  };
  if (typeof authHeader !== "string") {
    res.status(500).json({
      error: "header error",
      description: "Specify the appropriate API key."
    })
    return;
  }
  if (authHeader.split(" ")[0] !== "Bearer") {
    res.status(500).json({
      error: "header format error",
      description: `Specify the API key in the Authorization header as "Bearer {apikey}".`
    })
    return;
  }
  if (!apiKeys.includes(authHeader.split(" ")[1])) {
    res.status(500).json({
      error: "authorization error",
      description: "Invalid API key."
    })
    return;
  }
  if (!req.body) {
    res.status(500).json({
      error: "body error",
      description: "No body."
    })
    return;
  }
  if (typeof req.body.message !== "string") {
    res.status(500).json({
      error: "body error",
      description: "The message property must be a string type."
    });
    return;
  }
  condition.conversationId = req.body.conversationId && typeof req.body.conversationId == "string"
  if (req.body.conversationId && typeof req.body.conversationId !== "string") {
    res.status(500).json({
      error: "body error",
      description: "The conversationId property must be a string type."
    });
    return;
  }
  if (req.body.imageURL && typeof req.body.imageURL !== "string") {
    res.status(500).json({
      error: "body error",
      description: "The imageURL property must be a string type."
    });
  }
  try {
    if (req.body.imageURL) {
      new URL(req.body.imageURL)
      condition.imageURL = true;
    }
  } catch (e) {
    res.status(500).json({
      error: "body error",
      description: "Invalid URL for imageURL property."
    });
    return;
  }
  
  try {
    let ids;
    if (condition.conversationId) {
      const bodyIds = req.body.conversationId.split("-");
      if (bodyIds.length !== 4) {
        res.status(500).json({
          error: "body format error",
          description: "Invalid conversation id format."
        });
        return;
      }
      ids = {
        conversationID: bodyIds[0],
        responseID: bodyIds[1],
        choiceID: bodyIds[2],
        _reqID: bodyIds[3]
      }
    }
    let imageBuffer;
    if (condition.imageURL) {
      try {
        const imageData = await fetch(req.body.imageURL);
        imageBuffer = await imageData.arrayBuffer();
      } catch {
        res.status(500).json({
          error: "body format error",
          description: "Invalid image URL."
        });
        return;
      }
    }
    const answer = await bard.ask(req.body.message, {
      format: "json",
      ids,
      image: imageBuffer
    }) 
    const result = {
      message: answer.content,
      conversationId: Object.values(answer.ids).join("-")
    };
    res.json(result);
  } catch (e) {
    console.warn(e);
    res.status(500).json({
      error: "server error",
      description: "An unknown error has occurred on the server side."
    });
    return;
  }
})

app.listen(port);