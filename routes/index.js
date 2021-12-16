var express = require("express");
var router = express.Router();
let mongoose = require("mongoose")
let DashboardModel = mongoose.model("DashboardModel")
let UserModel = mongoose.model("UserModel")
let passport = require("passport");
let { getStatstics } = require("../controllers/userControllers");
var sparkles = require("sparkles")();
const chalk = require("chalk");
let moment = require("moment");


function curentTime(offset = 7) {
    return chalk.green(
        new moment().utcOffset(offset).format("YYYY/MM/DD HH:mm:ss Z")
    );
}


let bot_username = "nagakingdom_bot"

sparkles.on("config_change", async () => {
    try {
        let config = await DashboardModel.findOne({ config: 1 });
        bot_username = config.bot_username;
        console.log(curentTime(7), "config updated in index.js");
    } catch (e) {
        console.error("update config have error", e);
    }
});


function authChecker(req, res, next) {
    console.log((req.path));
    if (req.path === "/webhook") next();
    else if (req.path === "/oauth") next();
    else if (req.path === "/fake") next();
    else if (req.path === "/join") next();
    else if (req.path === "/sendcustom") {
        sparkles.emit("sendCustom", { body: req.body });
        res.send("ok");
        return;
    }
    else if (req.isAuthenticated()) next();
    else res.redirect("/login");
}
passport.serializeUser(function (user, cb) {
    cb(null, user._id);
});

passport.deserializeUser(function (id, cb) {
    DashboardModel.findById(id, function (err, user) {
        if (err) {
            return cb(err);
        }
        cb(null, user);
    });
});

router.get("/email_verify", async (req, res) => {
    console.log(req.query);
    if (req.query.code && req.query.telegramID) {
        let { code, telegramID } = req.query;
        code = code.toString().replace(/[^a-zA-Z0-9]/g, "")
        telegramID = telegramID.toString().replace(/\D/g, "");
        console.log({ code, telegramID });
        if (!code || !telegramID) return res.send("bad request, please try again")
        try {
            let user = await UserModel.findOneAndUpdate({
                telegramID, "mail.verifyCode": code, "mail.isVerify": false
            }, {
                $set: {
                    "mail.verifyCode": "",
                    "mail.isVerify": true,
                    "mail.verifiedAt": Date.now(),
                    "registerFollow.passAll": false,
                    "registerFollow.log": "step4",
                    "registerFollow.step4.isPass": true,
                    "registerFollow.step4.isWaitingEnterEmail": false,
                    "registerFollow.step4.isWaitingVerify": false,
                    "registerFollow.step5.isTwitterOK": false,
                    "registerFollow.step5.isWaitingPass": true,
                    "registerFollow.step6.isFacebookOK": false,
                }
            })
            if (user) {
                console.log(telegramID, "was verified with code", code);
                sparkles.emit("email_verify_success", { telegramID });
                return res.redirect("https://t.me/" + bot_username);
            } else {
                return res.send("An error when verify your email, please enter /resend to send email again  or enter /mail to change your mail");
            }
        } catch (e) {
            console.error(e);
        }
    } else {
        console.log("bad request email verify!!!!", req.query);
        res.redirect("https://t.me/nagakingdom_bot");
    }
});

router.get("/statistics", authChecker, async function (req, res, next) {

    const page = parseInt(req.query.page || 1);
    const limit = 200;
    const skip = (page - 1) * limit;
    const totalDocuments = await UserModel.find({
        "registerFollow.step4.isTwitterOK": true,
        "webminarLog.isEnough30min": true
    }).countDocuments();
    const totalPages = Math.ceil(totalDocuments / limit);
    const range = [];
    const rangerForDot = [];
    const detal = 1;
    const left = page - detal;
    const right = page + detal;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= left && i <= right)) {
            range.push(i);
        }
    }
    let temp;
    range.map((i) => {
        if (temp) {
            if (i - temp === 2) {
                rangerForDot.push(i - 1);
            } else if (i - temp !== 1) {
                rangerForDot.push("...");
            }
        }
        temp = i;
        rangerForDot.push(i);
    });

    let users = await UserModel.find({
        "registerFollow.step4.isTwitterOK": true,
        "webminarLog.isEnough30min": true,
    }, {
        telegramID: 1,
        fullName: 1,
        refTelegramID: 1,
        "mail.email": 1,
        "wallet.spl": 1
    }).sort({ "webminarLog.totalTime": -1 }).limit(limit).skip(skip);

    let toSendUsers = [];


    for (let i = 0; i < users.length; i++) {
        let { telegramID, fullName, refTelegramID } = users[i];
        let email = users[i].mail.email;
        let spl = users[i].wallet.spl;
        console.time("one")
        let getStatstics_back = await getStatstics({
            telegramID
        });
        let FTTTotal, totalTime;
        if (!getStatstics_back.result) {
            FTTTotal = 0;
            totalTime = 0;
        } else {
            FTTTotal = getStatstics_back.FTTTotal
            totalTime = (Math.round(getStatstics_back.totalTime / 1000) / 60).toFixed(1);
        }

        let toReturn = {
            telegramID,
            fullName,
            email,
            FTTTotal,
            totalTime,
            refTelegramID,
            spl
        }

        console.log(toReturn);
        console.timeEnd("one")

        toSendUsers.push(toReturn)
    }




    res.render("statistics", {
        users: toSendUsers,
        range: rangerForDot,
        page,
        totalPages,
    });
    return;

});

module.exports = router;
