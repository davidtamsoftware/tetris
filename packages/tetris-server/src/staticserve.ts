import express from "express";
import http from "http";

const app = express();
app.use(express.static(__dirname + "/../../tetris/build"));
const server = http.createServer(app);

server.listen(process.env.PORT || 8081);
