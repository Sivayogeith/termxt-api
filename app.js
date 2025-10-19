(async () => {
  const express = require("express");
  const app = express();
  const expressWs = require("express-ws")(app);

  const bcrypt = require("bcrypt");
  const sqlite3 = require("sqlite3");
  const { open } = require("sqlite");

  const crypto = require("crypto");
  const winston = require("winston");

  app.use(express.json());

  const logger = winston.createLogger({
    level: "info",
    format: winston.format.simple(),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: "secret.log" }),
    ],
  });

  const db = await open({
    filename: "./users.db",
    driver: sqlite3.Database,
  });

  app.post("/user/register", (req, res, next) => {
    const { username, password } = req.body;
    const code = crypto.randomBytes(16).toString("hex");
    bcrypt.hash(password, 10, (err, hash) => {
      db.run("INSERT INTO users (username,code,password) VALUES (?,?,?)", [
        username,
        code,
        hash,
      ])
        .then(() => {
          logger.info(`user created '${username}'`);
          res
            .status(200)
            .json({ data: { username, code }, error: false, message: "registered, welcome!" });
          next();
        })
        .catch((error) => {
          if (error.errno == 19) {
            logger.info(`user creation failed as '${username}' already exists`);
            res.status(409).json({
              message:
                "username not unique",
              error: true,
            });
            next();
          } else {
            logger.error(
              `user creation RANDOMLY failed!! {username: '${username}', password: '${password}', code: '${code}', encryptedPassword: '${hash}'}`
            );
            res.status(400).json({
              message: "unexpected error! dm @sage for a fix",
              error: true,
            });
            next();
          }
        });
    });
  });
  app.post("/user/login", (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ?", username).then((user) => {
      if (!user) {
        logger.info(`user tried to login with a unknown username: ${username}`);
        return res.status(404).json({ message: "user not found", error: true });
      }

      bcrypt.compare(password, user.password).then((result) => {
        if (result) {
          logger.info(`'${username}' logged in`);
          res.status(200).json({
            message: "logged in",
            error: false,
            data: { username: user.username, code: user.code },
          });
        } else {
          logger.info(`some tried to break into ${username}! (maybe)`);
          res.status(403).json({ message: "wrong password", error: true });
        }
      });
    });
  });

  app.ws("/", (ws, req) => {
    ws.on("message", function (msg) {
      ws.send(msg);
    });
  });

  app.listen(3443, () => {
    console.log("Server listening on 3443!");
  });
})();
