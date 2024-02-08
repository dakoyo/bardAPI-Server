import express from "express";
import * as dotenv from "dotenv"
import Bard from "bard-ai";
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.post("/", async (req, res) => {
  if (req.body) {
    const bard = new Bard(process.env.BARD_COOKIE);
    const answer = await bard.ask(req.body.message ?? "こんにちは", req.body.config)
    res.json(answer);
  } else {
    res.send("Hello, world")
  }
});

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;