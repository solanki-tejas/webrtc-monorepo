import createError from "http-errors";
import express from "express";
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import cors from "cors";
import { setupSocketIO } from "./utils/socket";

dotenv.config({ path: path.join(__dirname, "../.env") });
import { handleError } from "./helpers/error";
import httpLogger from "./middlewares/httpLogger";
import router from "./routes/index";

const app: express.Application = express();

// Add CORS middleware
app.use(cors());

app.use(httpLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", router);

// catch 404 and forward to error handler
app.use((_req, _res, next) => {
  next(createError(404));
});

// error handler
const errorHandler: express.ErrorRequestHandler = (err, _req, res) => {
  handleError(err, res);
};
app.use(errorHandler);

const port = process.env.PORT || "8000";
app.set("port", port);

const server = http.createServer(app);

// Set up Socket.IO
const io = setupSocketIO(server);

// You can export io if you need to use it elsewhere in your application
export { io };

function onError(error: { syscall: string; code: string }) {
  if (error.syscall !== "listen") {
    throw error;
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(`Port ${port} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`Port ${port} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr?.port}`;
  console.info(`Server is listening on ${bind}`);
}

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);