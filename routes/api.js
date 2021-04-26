var express = require("express");
var router = express.Router();
let mongoose = require("mongoose")
let DashboardModel = mongoose.model("DashboardModel")
let UserModel = mongoose.model("UserModel")
var sparkles = require("sparkles")();
let {
    handleUserWebhook,
    botRemindReset,
} = require("../controllers/userControllers");
let moment = require("moment");
const chalk = require("chalk");

let remind = {
    hour: "stoped",
    day: "stoped",
};
let faker = require("faker");
let userOnline = 0;
let BOT_STATUS_SWITCH = null;

function curentTime(offset = "+0000") {
    return chalk.green(
        new moment().utcOffset(offset).format("YYYY/MM/DD HH:mm:ss Z")
    );
}

sparkles.on("remind", ({ type, status }) => {
    console.log(type, status);
    if (type === "hour") remind.hour = status;
    if (type === "day") remind.day = status;
});

sparkles.on("config_change", async () => {
    try {
        let config = await DashboardModel.findOne({ config: 1 });
        BOT_STATUS_SWITCH = config.status.switch;
        console.log(curentTime(7), "config updated in api.js");
    } catch (e) {
        console.error("update config have error", e);
    }
});

router.get("/getalluser", async function (req, res, next) {
    let start = Date.now();
    try {
        let users = await UserModel.find().sort({ joinDate: -1 }).exec();
        users = users.map((item) => {
            return {
                telegramID: item.telegramID,
                fullName: item.fullName,
                email: item.mail.email,
                isVerify: item.mail.isVerify ? "Verified" : "Not yet",
                inviteLogsCount: item.inviteLogs.length,
                refTelegramID: item.refTelegramID,
                joinDate: moment(item.joinDate).format("YYYY/MM/DD h:mm:ss a"),
                erc20: item.wallet.erc20,
                totalTime:
                    (Math.round(item.webminarLog.totalTime / 1000) / 60).toFixed(1) + " min",
                isEnough30min: item.webminarLog.isEnough30min,
            };
        });
        res.send({ result: users, requestResult: true });
        console.log((Date.now() - start) / 1000 + " s");
    } catch (e) {
        console.error(e);
        res.send({ result: [], requestResult: false });
    }
});

// router.post("/fake", async (req, res) => {
//     let a = [];
//     let c = 0;
//     for (let i = 0; i <= 50000; i++) {
//         let one = {
//             telegramID: i.toString(),
//             fullName: faker.name.findName(),
//             mail: {
//                 email: faker.internet.email(),
//                 isVerify: faker.random.boolean(),
//             },
//             inviteLogsCount: faker.random.number(2000),
//             refTelegramID: faker.random.number(20234500),
//             registerFollow: {
//                 passAll: faker.random.boolean()
//             },
//             joinDate: moment(Date.now()).format("YYYY/MM/DD h:mm:ss a"),
//             totalTime: (Math.round(234891275 / 1000) / 60).toFixed(1) + " min",
//             webminarLog: {
//                 isEnough30min: faker.random.boolean(),
//             }
//         };
//         a.push(one);
//         if (c > 10000 || i === 100000) {
//             c = 0;
//             await UserModel.insertMany(a);
//             a = []
//         }
//         c++;
//         console.log("save", i);
//     }

//     res.send("ok");
// })

router.get("/config", async function (req, res, next) {
    try {
        let config = await DashboardModel.findOne({ config: 1 });
        if (!config) {
            console.log("api/config no config found!");
            sparkles.emit("init");
            res.status(500).send({
                requestResult: false,
                error: "api/config no config found!",
            });
            return;
        }

        let toSend = {
            requestResult: true,
            result: {
                access_token: config.token.access_token,
                refresh_token: config.token.refresh_token,
                user_oauth_code: config.user_oauth_code,
                app_client_id: config.app_client_id,
                app_client_secret: config.app_client_secret,
                webinarId: config.webinarId,
                group_id: config.group_id,
                appInstallLink: config.appInstallLink,
                redirect_uri: config.redirect_uri,
            },
        };

        res.send(toSend);
    } catch (e) {
        console.error(e);
        res.send({ requestResult: false });
    }
});

router.post("/config", async (req, res) => {
    let config = null;
    // console.log(req.body)
    try {
        config = await DashboardModel.findOne({ config: 1 });
        if (config.user_oauth_code != req.body.user_oauth_code) {
            console.log("new user_oauth_code, so update it");
            await handleOauthRedirectUri({ code: req.body.user_oauth_code });
        } else {
            if (req.body.access_token)
                config.access_token = req.body.access_token;
            if (req.body.refresh_token)
                config.refresh_token = req.body.refresh_token;
        }
        if (req.body.app_client_id)
            config.app_client_id = req.body.app_client_id;
        if (req.body.app_client_secret)
            config.app_client_secret = req.body.app_client_secret;
        if (req.body.webinarId)
            config.webinarId = req.body.webinarId
                .toString()
                .match(/\d+/g)
                .join([]);
        if (req.body.group_id) config.group_id = req.body.group_id;
        if (req.body.redirect_uri) config.redirect_uri = req.body.redirect_uri;
        // console.log(config);
        await config.save();
        sparkles.emit("config_change");
        res.send({ requestResult: true });
    } catch (e) {
        console.error(e);
        res.send({ requestResult: false, error: e });
    }
});

router.get("/botconfig", async function (req, res, next) {
    try {
        let config = await DashboardModel.findOne({ config: 1 });
        if (!config) {
            console.log("api/config no config found!");
            sparkles.emit("init");
            res.status(500).send({
                requestResult: false,
                error: "api/config no config found!",
            });
            return;
        }
        let toSend = {
            requestResult: true,
            result: {
                BOT_WELCOM_AFTER_START: config.bot_text.BOT_WELCOM_AFTER_START,
                BOT_DESCRIPTION: config.bot_text.BOT_DESCRIPTION,
                bot_username: config.bot_username,
                group_invite_link: config.group_invite_link,
                domain_verify_endpoint: config.domain_verify_endpoint,
            },
        };
        res.send(toSend);
    } catch (e) {
        console.error(e);
        res.send({ requestResult: false });
    }
});

router.post("/botconfig", async (req, res) => {
    try {
        // console.log(req.body);
        config = await DashboardModel.findOne({ config: 1 });
        if (req.body.bot_username) config.bot_username = req.body.bot_username;
        if (req.body.BOT_WELCOM_AFTER_START)
            config.bot_text.BOT_WELCOM_AFTER_START =
                req.body.BOT_WELCOM_AFTER_START;
        if (req.body.BOT_DESCRIPTION)
            config.bot_text.BOT_DESCRIPTION = req.body.BOT_DESCRIPTION;
        if (req.body.group_invite_link)
            config.group_invite_link = req.body.group_invite_link;
        if (req.body.domain_verify_endpoint)
            config.domain_verify_endpoint = req.body.domain_verify_endpoint;
        await config.save();
        sparkles.emit("config_change");
        res.send({ requestResult: true });
    } catch (e) {
        console.error(e);
        res.send({ requestResult: false, error: e });
    }
});

router.get("/botremind", async function (req, res) {
    try {
        let config = await DashboardModel.findOne({ config: 1 });
        let totalUser = await UserModel.find({ "social.telegram.isBlock": false, "webminar.join_url": { $ne: "" } }).countDocuments().exec();
        let beforeHourCount = await UserModel
            .find({ "remind.isBeforeHour": true, "social.telegram.isBlock": false })
            .countDocuments()
            .exec();
        let beforeDayCount = await UserModel
            .find({ "remind.isBeforeDay": true, "social.telegram.isBlock": false })
            .countDocuments()
            .exec();

        if (!config) {
            console.log("api/config no config found!");
            sparkles.emit("init");
            res.status(500).send({
                requestResult: false,
                error: "api/config no config found!",
            });
            return;
        }
        let toSend = {
            requestResult: true,
            result: {
                beforeHour: config.remind.beforeHour,
                beforeHourCount:
                    beforeHourCount.toString() + "/" + totalUser.toString(),
                beforeDay: config.remind.beforeDay,
                beforeDayCount:
                    beforeDayCount.toString() + "/" + totalUser.toString(),
                // beforeDayCount.toString() + "/" + (await UserModel.find({ "webminarLog.totalTime": { $gte: 1, $lt: 1800000 } }).countDocuments().exec()).toString(),
                day: remind.day,
                hour: remind.hour,
            },
        };

        res.send(toSend);
    } catch (e) {
        console.error(e);
        res.send({ requestResult: false });
    }
});

router.post("/botremind", async (req, res) => {
    try {
        config = await DashboardModel.findOne({ config: 1 });
        if (req.body.beforeHour) config.remind.beforeHour = req.body.beforeHour;
        if (req.body.beforeDay) config.remind.beforeDay = req.body.beforeDay;
        await config.save();
        sparkles.emit("config_change");
        res.send({ requestResult: true });
    } catch (e) {
        console.error(e);
        res.send({ requestResult: false, error: e });
    }
});

router.post("/botremindsend", async (req, res) => {
    if (req.body.beforeHour === "true") {
        sparkles.emit("sendRemindHour");
    }
    if (req.body.beforeDay === "true") {
        sparkles.emit("sendRemindDay");
    }
    res.send({ requestResult: true });
});

router.post("/botremindreset", async (req, res) => {
    if (req.body.beforeHourReset === "true") {
        botRemindReset({ event: "beforeHourReset" })
            .then(({ result }) => {
                if (result) res.send({ requestResult: true });
                else res.send({ requestResult: false });
            })
            .catch((e) => {
                console.error(e);
                res.send({ requestResult: false });
            });
    }
    if (req.body.beforeDayReset === "true") {
        botRemindReset({ event: "beforeDayReset" })
            .then(({ result }) => {
                if (result) {
                    res.send({ requestResult: true });
                } else res.send({ requestResult: false });
            })
            .catch((e) => {
                console.error(e);
                res.send({ requestResult: false });
            });
    }
});

router.post("/botremindstopsend", async (req, res) => {
    if (req.body.beforeHourStop === "true") {
        sparkles.emit("sendRemindHour_Cancel");
    }
    if (req.body.beforeDayStop === "true") {
        sparkles.emit("sendRemindDay_Cancel");
    }

    res.send({ requestResult: true });
});

router.get("/oauth_redirect", async function (req, res) {
    console.log("/api/oauth_redirect", req.query);
    try {
        let { result } = await handleOauthRedirectUri({
            code: req.query.code,
        });
        res.redirect("/settings");
    } catch (e) {
        console.error(e);
        res.redirect("/settings");
    }
});

router.get("/userOnline", async (req, res) => {
    try {
        let totalUsers = await UserModel
            .find({ "registerFollow.step4.isTwitterOK": true })
            .countDocuments()
            .exec();
        let toSend = {
            requestResult: true,
            result: {
                userOnline,
                totalUsers,
            },
        };
        res.send(toSend);
    } catch (e) {
        console.error(e);
        res.send({ requestResult: false });
    }
});

router.get("/botstatus", (req, res) =>
    res.send({ result: true, BOT_STATUS_SWITCH })
);

router.post("/botstatus", async (req, res) => {
    try {
        let statusSwitch = req.BOT_STATUS_SWITCH === "true" ? true : false;
        await DashboardModel.findOneAndUpdate(
            { config: 1 },
            { $set: { "status.switch": statusSwitch } }
        ).exec();
        sparkles.emit("config_change");
        res.send({ requestResult: true, BOT_STATUS_SWITCH: statusSwitch });
    } catch (e) {
        res.send({ requestResult: false, BOT_STATUS_SWITCH: !statusSwitch });
    }
});

router.post("/webhook", async function (req, res) {
    let event = req.body.event;

    if (event === "webinar.participant_joined") {
        console.log(req.body)
        userOnline++;
        let { id, user_name, join_time } = req.body.payload.object.participant;
        console.log("participant_joined", id, user_name, join_time);
        await handleUserWebhook({ id, event: "join" });
        sparkles.emit("userOnline", { userOnline });
        console.log(userOnline);
        res.send("ok");
        return;
    } else if (event === "webinar.participant_left") {
        console.log(req.body)
        userOnline = userOnline === 0 ? 0 : userOnline - 1;
        let { id, user_name, leave_time } = req.body.payload.object.participant;
        console.log("participant_left", id, user_name, leave_time);
        await handleUserWebhook({ id, event: "left" });
        console.log(userOnline);
        sparkles.emit("userOnline", { userOnline });
        res.send("ok");
        return;
    } else if (event === "webinar.started" || event === "webinar.ended") {
        userOnline = 0;
        console.log(req.body);
        res.send("ok");
        return;
    } else if (event === "webinar.registration_created") {
        console.log(req.body.payload.object);
        res.send("ok");
        return;
    } else {
        console.log(req.body)
        res.send("ok");
    }
});

router.post("/new", function (req, res, next) {
    console.log(req.body);
    res.json(req.body);
});

module.exports = router;
