var express = require("express");
var router = express.Router();
let mongoose = require("mongoose")
let DashboardModel = mongoose.model("DashboardModel")
let UserModel = mongoose.model("UserModel")
let passport = require("passport");
let { getStatstics } = require("../controllers/userControllers");
var sparkles = require("sparkles")();
const chalk = require("chalk");
const fs = require('fs');
var Binary = require("mongodb").Binary;
let moment = require("moment");


function curentTime(offset = 7) {
    return chalk.green(
        new moment().utcOffset(offset).format("YYYY/MM/DD HH:mm:ss Z")
    );
}


let bot_username = "nagakingdombot"

sparkles.on("config_change", async () => {
    try {
        let config = await DashboardModel.findOne({ config: 1 });
        bot_username = config.bot_username;
        console.log(curentTime(7), "config updated in index.js");
    } catch (e) {
        console.error("update config have error", e);
    }
});

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
                    "registerFollow.log": "step5",
                    "registerFollow.step5.isPass": true,
                    "registerFollow.step5.isWaitingEnterEmail": false,
                    "registerFollow.step5.isWaitingVerify": false,
                    "registerFollow.step6.isDiscordOK": false,
                    "registerFollow.step6.isWaitingPass": true,
                    "registerFollow.step7.isFacebookOK": false,
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
        res.redirect("https://t.me/nagakingdombot");
    }
});

router.get("/statistics", async function (req, res, next) {
    // let allUsers = await UserModel.aggregate([{
    //     $match: {
    //         "registerFollow.passAll": true,
    //         "registerFollow.sendAllStep":true,
    //     },
    // },
    // {
    //     $group: {
    //         "_id":"$wallet.spl",
    //     }
    // }, { $sample: { size: 1 } }])
    // allUsers.forEach(async (x) => {
    //     await UserModel.findOneAndUpdate({"wallet.spl":x._id},{
    //         "transferred":true
    //     })
    // })
    // setTimeout(() => {
    //     fs.writeFile("data.txt", JSON.stringify(allUsers), (err) => {
    //         if (err)
    //           console.log(err);
    //         else {
    //           console.log("File written successfully\n");
    //           console.log("The written has the following contents:");
    //           console.log(fs.readFileSync("data.txt", "utf8"));
    //         }
    //       });
    // },5000)
    let dataUser = []
    let allUsers = await UserModel.aggregate([{
            $match: {
                "registerFollow.passAll": true,
                "registerFollow.sendAllStep":true,
            },
        },
        {
            $group: {
                "_id":"$telegramID",
            }
        },{ $sample: { size: 10000 }}])
    allUsers.forEach(async (x) => {
        if (x._id != "") {
            let data = await UserModel.aggregate([{
                $match: {
                    "refTelegramID": x._id,
                },
            }])
            if (data.length > 30) {
                if (data[0].refTelegramID != "" ){
                    const user = await UserModel.aggregate([{
                        $match: {
                            "telegramID": data[0].refTelegramID
                        }
                    },
                        {
                            $group: {
                            "_id":"$wallet.spl",
                        }
                    }])
                    if (user[0]._id != "" ){
                        dataUser.push(user[0]._id)
                    }
                }
                // const c = new Date();
                // let minutess = c.getMinutes();
                // console.log(minutess-minutes)
            }
        }
    }),
    setTimeout(() => {
        dataUser = dataUser.slice(0,1001)
        console.log(dataUser.length)
        fs.writeFile("data.txt", JSON.stringify(dataUser), (err) => {
            if (err)
            console.log(err);
            else {
                console.log("File written successfully\n");
            }
        });
    }, 2000000);
    res.send({message:"OK"})
});

module.exports = router;
