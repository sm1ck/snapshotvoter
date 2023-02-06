import express, { Router } from "express";
import expressWs from "@wll8/express-ws";
import path from "path";
import { wsVote, flag } from "./vote/Vote.js";
import { ws_error_obj, ws_info } from "./vote/ws.js";

const __dirname = path.resolve();
const port = process.env.PORT ?? 80;
const wwwDir = process.env.WWWDIR ?? "public";
const apiDir = "/api";
const exApp = expressWs(express());

exApp.app.ws(apiDir, (ws, res) => {
  ws.on("message", (data) => {
    try {
      const json = JSON.parse(data);
      switch (json.type) {
        case "Vote":
          wsVote(ws, json);
          break;
        case "Stop":
          flag.isRunning = false;
          ws_info(ws, "Конец работы", "вы остановили приложение..");
          break;
        default:
          ws.send(
            JSON.stringify({
              type: "undefined",
            })
          );
      }
    } catch (e) {
      ws_error_obj(ws, "Router", e);
    }
  });
  ws.on("close", () => {
    flag.isRunning = false;
  });
});

exApp.app.use(express.static(path.resolve(__dirname, wwwDir)));

exApp.app.use((req, res, next) => {
  next({
    status: 404,
    message: "Not Found",
  });
});

exApp.app.use((err, req, res, next) => {
  switch (err.status) {
    case 404:
      return res.redirect("/");
    case 500:
      return res.status(500).send("An internal error");
    default:
      next();
  }
});

exApp.app.listen(port, () => {
  console.log(`snapshotvoter listening on port: ${port}`);
});
