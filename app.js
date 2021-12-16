require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
let moment = require("moment");
let passport = require("passport");
let mongoose = require("mongoose")
let LocalStrategy = require("passport-local").Strategy;
var cookieSession = require("cookie-session");
var sparkles = require("sparkles")();
const chalk = require("chalk");

require("./js/Models/dashboard")
require("./js/Models/users")
require("./js/datebase").connect();


let indexRouter = require("./routes/index");

require("./bot");
let group_id,
    group_invite_link = null,
    bot_username = null;

let DashboardModel = mongoose.model("DashboardModel")
let UserModel = mongoose.model("UserModel")
let { getStatstics } = require("./controllers/userControllers");

let curentTime = () => {
    return new moment().utcOffset(7).format("YYYY/MM/DD HH:mm:ss Z");
}

sparkles.on("config_change", async () => {
    try {
        let config = await DashboardModel.findOne({ config: 1 });
        group_id = config.group_id;
        group_invite_link = config.group_invite_link;
        bot_username = config.bot_username;
        console.log(curentTime(7), "config updated in app.js");
    } catch (e) {
        console.error("update config have error", e);
    }
});

var app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
logger.token("datee", function (req, res) {
    return chalk.green(
        new moment().utcOffset("+0700").format("YYYY/MM/DD HH:mm:ss Z")
    );
});
app.use(
    logger(
        ":datee :method :url :status :response-time ms - :res[content-length]",
        {
            skip: (req) => {
                if (
                    req.path.startsWith("/assets") ||
                    req.path.startsWith("/js") ||
                    req.path.startsWith("/stylesheets")
                )
                    return true;
                return false;
            },
        }
    )
);

app.use(express.json());
app.use(express.urlencoded({ extended: true, }));
app.use(cookieParser());


app.use("/", indexRouter);


sparkles.on("init", async () => {
    try {
        let config = await DashboardModel.findOne({ config: 1 }).exec();
        if (!config) {
            console.log("start without config, so create default config");
            config = new DashboardModel();
            await config.save();
            sparkles.emit("config_change");
        } else {
            console.log("server config ok!");
            sparkles.emit("config_change");
        }
    } catch (e) {
        console.error(e);
    }
});



app.use(function (req, res, next) {
    res.status(400).send("new feature is being buiding, please patience wait");
});

app.use(function (err, req, res, next) {
    console.error(curentTime(), err);
    return res.status(500).send("new feature is being buiding, please patience wait");
});

sparkles.on("userOnline", ({ userOnline }) => {
    console.log("receive userOnline", userOnline);
    io.sockets.emit("userOnline", {
        userOnline,
    });
});

sparkles.on("totalUsers", ({ totalUsers }) => {
    io.sockets.emit("totalUsers", {
        totalUsers,
    });
});


// var server = require("https").createServer(options, app);
var server = require("http").createServer(app);
server.on("error", onError);
server.on("listening", onListening);
var io = require("socket.io")(server);
let port = process.env.PORT
server.listen(port);

io.on("connection", (socket) => {
    var onevent = socket.onevent;
    socket.onevent = function (packet) {
        var args = packet.data || [];
        onevent.call(this, packet);
        packet.data = ["*"].concat(args);
        onevent.call(this, packet);
    };

    console.log("a user connected");
    socket.broadcast.emit("server_message", {
        result: true,
        message: "connected success",
        id: socket.id,
    });

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });

    socket.on("join", (room) => {
        console.log("receive join event: ", room);
        socket.join(room.toString());
    });

    socket.on("statistics", ({ command, payload }) => {
        if (command === "getAll") {
            handleStatisticsGetAll({
                payload,
            });
            return;
        }
        if (command === "stop") {
            sparkles.emit("statistics", {
                command: "stop",
            });
            return;
        }
        if (command === "again") {
            sparkles.emit("statistics", {
                command: "again",
            });
            return;
        }
        console.log("receive statistics event: ", command);
    });

    socket.on("*", (...parameters) => {
        let event = parameters[0];
        let data = parameters[1];
        console.log("event", event, ": ", data);
    });
});

async function handleStatisticsGetAll({ payload }) {
    console.log(curentTime(), "handleStatisticsGetAll with payload", payload);

    let { tableId } = payload;
    let listUsers = null;
    try {
        listUsers = await UserModel
            .find(
                {
                    "registerFollow.passAll": true,
                    "webminarLog.isEnough30min": true,
                },
                {
                    telegramID: 1,
                    fullName: 1,
                    refTelegramID: 1,
                    "mail.email": 1,
                    "wallet.spl": 1
                }
            )
            .sort({
                joinDate: -1,
            })
            .exec();
    } catch (e) {
        console.error(curentTime(), e);
        return;
    }

    console.log(curentTime(), "listUsers length", listUsers.length);

    if (!listUsers.length) {
        io.to("statistics").emit("statistics", {
            command: "getAllReturn",
            payload: {
                tableId,
                total: 0,
                item: {},
            },
        });
        return;
    }
    let usersLength = listUsers.length;

    for (let i = 0; i < usersLength; i++) {
        let { telegramID, fullName, refTelegramID } = listUsers[i];
        let email = listUsers[i].mail.email;
        let spl = listUsers[i].wallet.spl;
        let getStatstics_back = await getStatstics({
            telegramID,
        });
        if (!getStatstics_back.result) continue;
        let { FTTTotal, totalTime } = getStatstics_back;
        totalTime = (Math.round(totalTime / 1000) / 60).toFixed(1);
        let toEmit = {
            command: "getAllReturn",
            payload: {
                tableId,
                total: usersLength,
                item: {
                    telegramID,
                    fullName,
                    email,
                    FTTTotal,
                    totalTime,
                    refTelegramID,
                    spl
                },
            },
        };
        // console.log(toEmit);
        io.to("statistics").emit("statistics", toEmit);
    }
}

function onListening() {
    var addr = server.address();
    var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
    console.log("Listening on" + bind);
}

function onError(error) {
    if (error.syscall !== "listen") {
        throw error;
    }
    var bind = port.toString();

    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
        default:
            throw error;
    }
}
