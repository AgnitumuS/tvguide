"use strict";

const express = require("express");
const tvGuide = require("./lib/tvGuide");

const app = express();

app.use(express.static('dist'));


const apiRouter = express.Router();

const IP_ADDR = process.env.NODE_IP || 'localhost';
const PORT = process.env.NODE_PORT || 3000;


apiRouter.get("/channels", function(req, res) {
    res.json(tvGuide.channels);
});

apiRouter.get("/programs", function(req, res) {
    let channelId = req.query.channelId;
    if (channelId && tvGuide.programs[channelId]) {
        res.json(tvGuide.programs[channelId]);
    } else {
        res
            .status(404)
            .json({err: "Channel not found"});
    }
});
console.log(`Starting server on ${IP_ADDR}:${PORT}`);
app.listen(PORT, IP_ADDR);
//app.use("/api", apiRouter);

tvGuide.update(() => {
    app.use("/api", apiRouter);
});