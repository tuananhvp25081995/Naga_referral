const mongoose = require("mongoose");
let { v4 } = require("uuid");
let DashboardModel = mongoose.model("DashboardModel")
let UserModel = mongoose.model("UserModel")
let moment = require("moment");

function curentTime(offset = 7) {
    return new moment().utcOffset(offset).format("YYYY/MM/DD HH:mm:ss Z");
}

let handleNewUserNoRef = async (data) => {
    let { telegramID, fullName } = data;

    try {
        let userCheck = await UserModel
            .findOne({ telegramID }).exec();
        if (userCheck) {
            console.log(curentTime(7), userCheck.telegramID, fullName, "user was joined to chat group before");
            //update fullName
            userCheck.fullName = fullName;
            await userCheck.save();
            let toReturn = {
                result: true,
                isNewUser: false,
                user: userCheck,
            };
            return toReturn;
        } 
        else {
            let newUser = new UserModel();
            newUser.telegramID = telegramID;
            newUser.fullName = fullName;
            newUser.joinDate = Date.now();
            newUser.updateAt = Date.now();
            newUser.telegramID = telegramID;
            let result = await newUser.save();
            let toReturn = {
                result: true,
                isNewUser: true,
                user: result,
            };
            console.log(curentTime(), telegramID, fullName, "user joined to chat group");
            return toReturn;
        }
    } catch (e) {
        console.log(
            curentTime(),
            telegramID,
            fullName,
            "has error when handle"
        );
        console.error(e);
        let toReturn = {
            result: false,
        };
        return toReturn;
    }
};

let handleNewUserWithRef = async (data) => {
    let { telegramID, fullName, ref } = data;

    try {
        let userCheck = await UserModel
            .findOne({
                telegramID,
            })
            .exec();

        if (userCheck) {
            console.log(
                curentTime(),
                userCheck.telegramID,
                fullName,
                "user was joined to chat group before"
            );

            //check ref ID and update if it exist
            if (userCheck.refTelegramID === "") {
                userCheck.refTelegramID = await checkAndUpdateRefId(data);
            }

            //update fullName
            userCheck.fullName = fullName;
            await userCheck.save();
            let toReturn = {
                result: true,
                isNewUser: false,
                user: userCheck,
            };
            return toReturn;
        } else {
            let newUser = new UserModel({
                telegramID,
                fullName,
                refTelegramID: await checkAndUpdateRefId(data),
                joinDate: Date.now(),
                updateAt: Date.now(),
            });

            let result = await newUser.save();

            let toReturn = {
                result: true,
                isNewUser: true,
                user: result,
            };
            console.log(
                curentTime(),
                telegramID,
                fullName,
                "user joined to chat group"
            );
            return toReturn;
        }
    } catch (e) {
        console.log(
            curentTime(),
            telegramID,
            fullName,
            "has error when handle"
        );
        console.error(e);
        let toReturn = {
            result: false,
        };
        return toReturn;
    }
};

let checkAndUpdateRefId = async (data) => {
    let { telegramID, ref } = data;
    let refUser = await UserModel
        .findOne({
            telegramID: ref,
        })
        .exec();

    //refId exist, update inviteLogs of refId
    if (refUser) {
        let check = true;
        for (let i = 0; i < refUser.inviteLogs; i++) {
            if (refUser.inviteLogs[i].telegramID === telegramID) {
                check = false;
                break;
            }
        }
        if (check)
            refUser.inviteLogs.push({
                telegramID,
                timestamp: Date.now(),
            });

        await refUser.save();

        return ref.toString();
    } else return null;
};

let isJoinedGroup = async ({ telegramID }) => {
    let user = await UserModel
        .findOne({
            telegramID,
        })
        .exec();
    if (!user || !user.registerFollow.step2.isJoined) {
        return false;
    } else return true;
};

let getStatstics = async ({ telegramID }) => {
    let toReturn = {
        result: true,
    };
    try {
        let user = await UserModel
            .findOne({
                telegramID,
            })
            .exec();
        if (user) {
            let listInviteSuccessCount = await UserModel
                .find({
                    refTelegramID: user.telegramID,
                    "registerFollow.passAll": true,
                    "webminarLog.isEnough30min": true,
                })
                .countDocuments()
                .exec();

            toReturn.FTTTotal = 0;
            if (user.registerFollow.passAll && user.webminarLog.isEnough30min) {
                toReturn.FTTTotal = 15;
                toReturn.FTTTotal =
                    toReturn.FTTTotal + listInviteSuccessCount * 3;
            } else {
                toReturn.FTTTotal = 0;
            }
            toReturn.inviteTotal = user.inviteLogs.length;
            toReturn.ETKREF = 15 + (toReturn.inviteTotal * 3);
            toReturn.inviteGetGiftSuccess = listInviteSuccessCount;
            toReturn.totalTime = user.webminarLog.totalTime;
            return toReturn;
        } else {
            console.error(
                "getStatstics not found user telegramID" + telegramID
            );
            // throw "no user for this id: " +telegramID
            return {
                result: false,
            };
        }
    } catch (e) {
        console.error(
            "getStatstics have error with telegramID" + telegramID,
            e
        );
        return {
            result: false,
        };
    }
};

let isHaveMailAndVerified = async (data) => {
    let { telegramID } = data;
    let user = await UserModel
        .findOne({
            telegramID,
        })
        .exec();
    if (user) {
        let toReturn = {
            email: true,
            isVerify: true,
        };
        if (user.mail.email === "") toReturn.email = false;
        if (!user.mail.isVerify) toReturn.isVerify = false;
        return toReturn;
    }
    return {
        email: false,
        isVerify: false,
    };
};

let setEmailWaitingVerify = async ({ telegramID }, isWaitingVerify) => {
    try {
        let user = await UserModel
            .findOne({
                telegramID,
            })
            .exec();
        if (user) {
            user.registerFollow.step3.isWaitingVerify = isWaitingVerify;
            await user.save();
            return true;
        } else return false;
    } catch (e) {
        console.error(e);
        return false;
    }
};

let setWaitingEnterEmail = async ({ telegramID }, isWaitingEnterEmail) => {
    try {
        let user = await UserModel
            .findOne({
                telegramID,
            })
            .exec();
        if (user) {
            user.registerFollow.step3.isWaitingEnterEmail = isWaitingEnterEmail;
            await user.save();
            return true;
        } else return false;
    } catch (e) {
        console.error(e);
        return false;
    }
};

let setEmailAndUpdate = async ({ telegramID, email }) => {
    console.log(curentTime(), "setEmailAndUpdate", telegramID, email);

    try {
        let user = await UserModel.findOne({ telegramID })

        let checkUsed = await UserModel.findOne({
            "mail.email": email,
            "mail.isVerify": true,
        })


        if (checkUsed) {
            return {
                result: false,
                error: "used",
            };
        }

        if (user) {
            user.mail.email = email.toString().toLowerCase();
            user.mail.isVerify = false;
            user.mail.verifyCode = v4().toString().slice(0, 8);
            user.registerFollow.log === "step3";
            user.registerFollow.step3.isWaitingEnterEmail = false;
            user.registerFollow.step3.isWaitingVerify = true;
            user.registerFollow.passAll = false;
            await user.save();
            return {
                result: true,
                verifyCode: user.mail.verifyCode,
            };
        } else return false;
    } catch (e) {
        console.error("error in setEmailAndUpdate", e);
        return false;
    }
};

let removeEmailandUpdate = async ({ telegramID }) => {
    console.log(curentTime(), "resetEmailandUpdate", telegramID);

    try {
        let user = await UserModel
            .findOne({
                telegramID,
            })
            .exec();
        if (user) {
            user.mail.isVerify = false;
            user.mail.email = "";
            user.mail.isVerify = false;
            user.mail.verifyCode = "";
            user.registerFollow.log === "step3";
            user.registerFollow.step3.isWaitingEnterEmail = true;
            user.registerFollow.step3.isWaitingVerify = false;
            await user.save();
            return true;
        } else return false;
    } catch (e) {
        console.error(e);
        return false;
    }
};

let handleNewUserJoinGroup = async ({ telegramID, fullName }, campaign) => {
    try {
        let user = await UserModel.findOne({ telegramID }).exec();
        if (!user) {
            console.log(curentTime(7), fullName, telegramID, "not found in db");
            return null;
        } else {
            user.registerFollow.step2.isJoinGrouped = true;
            user.campaign1 = true;
        }
        await user.save();
        return user;
    } catch (e) {
        console.error(e);
        return null;
    }
};

let handleNewUserJoinampaign= async (bot, msg, campaign) => {
    try {
        let telegramID = msg.from.id;
        let user = await UserModel.findOne({ telegramID }).exec();
        if (!user) {
            console.log(curentTime(7), fullName, telegramID, "not found in db");
            return null;
        } else {
            switch (campaign) {
                case 2:
                    user.campaign2 = true;
                    break
                case 3:
                    user.campaign3 = true;
                    break
            }
        }
        await user.save();
        return user;
    } catch (e) {
        console.error(e);
        return null;
    }
};

let handleNewUserJoinChannel = async ({ telegramID, fullName }) => {
    try {
        let user = await UserModel.findOne({ telegramID }).exec();
        if (!user) {
            console.log(curentTime(7), fullName, telegramID, "not found in db");
            return null;
        } else {
            user.registerFollow.step3.isJoinChanneled = true;
            if (user.registerFollow.log === "step2") {
                user.registerFollow.log = "step3";
                user.registerFollow.step4.isWaitingEnterEmail = true;
            }
        }
        await user.save();
        return user;
    } catch (e) {
        console.error(e);
        return null;
    }
};

let handleUserWebhook = async ({ id, event }) => {
    try {
        let user = await UserModel
            .findOne({
                "webminar.registrant_id": id,
            })
            .exec();
        if (!user) return;
        if (user.webminarLog.log.length === 0) {
            user.webminarLog.log.push({
                event,
                time: Date.now(),
            });
        } else {
            let lastTime =
                user.webminarLog.log[user.webminarLog.log.length - 1];
            if (lastTime.event === "join" && event === "left") {
                user.webminarLog.totalTime =
                    user.webminarLog.totalTime + (Date.now() - lastTime.time);
                user.webminarLog.log.push({
                    event,
                    time: Date.now(),
                });
            } else if (lastTime.event === "left" && event === "join") {
                user.webminarLog.log.push({
                    event,
                    time: Date.now(),
                });
            } else {
                console.error(
                    "have conflic when handle time, telegramID",
                    user.telegramID,
                    new Date().toDateString()
                );
            }

            if (
                user.webminarLog.totalTime > 1800000 &&
                !user.webminarLog.isEnough30min
            )
                user.webminarLog.isEnough30min = true;
        }

        await user.save();
    } catch (e) {
        console.error(
            "handleUserWebhook have an error when handle with registrant_id:",
            id
        );
        console.error(e);
    }
};

module.exports = {
    isHaveMailAndVerified,
    isJoinedGroup,
    handleNewUserNoRef,
    handleNewUserWithRef,
    setEmailWaitingVerify,
    setWaitingEnterEmail,
    handleNewUserJoinGroup,
    handleNewUserJoinChannel,
    setEmailAndUpdate,
    removeEmailandUpdate,
    handleUserWebhook,
    handleNewUserJoinampaign,
};
