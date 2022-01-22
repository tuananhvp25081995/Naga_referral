require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
var faker = require("faker");
let moment = require("moment");
const Joi = require("joi");
let mongoose = require("mongoose")
let DashboardModel = mongoose.model("DashboardModel")
let UserModel = mongoose.model("UserModel")
let sparkles = require("sparkles")();
let nodemailer = require("nodemailer");
let WAValidator = require('wallet-address-validator');
let parse = require('url-parse');
const chalk = require("chalk");
const queryString = require('query-string');

let {
    handleNewUserNoRef,
    handleNewUserWithRef,
    handleNewUserJoinGroup,
    handleNewUserJoinChannel,
    setWaitingEnterEmail,
    setEmailAndUpdate,
    removeEmailandUpdate,
    handleNewUserJoinampaign,
    getStatstics,
} = require("./controllers/userControllers");

const { MAIL_TEMPLE } = require("./js/define");

let bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true, });

let MAIL_SERVER_HOST, MAIL_SERVER_USER, MAIL_SERVER_PASS

if (process.env.MAIL_SERVER === "smtp2go") {
    MAIL_SERVER_HOST = process.env.MAIL_SERVER_HOST_1
    MAIL_SERVER_USER = process.env.MAIL_SERVER_USER_1
    MAIL_SERVER_PASS = process.env.MAIL_SERVER_PASS_1
} else {
    MAIL_SERVER_HOST = process.env.MAIL_SERVER_HOST_2
    MAIL_SERVER_USER = process.env.MAIL_SERVER_USER_2
    MAIL_SERVER_PASS = process.env.MAIL_SERVER_PASS_2
}

let sendFrom = "Naga Kingdom Airdrop <no_reply@nagakingdom.com>"
let transporter = nodemailer.createTransport({
    host: MAIL_SERVER_HOST,
    port: 587,
    secure: false,
    auth: {
        user: MAIL_SERVER_USER,
        pass: MAIL_SERVER_PASS,
    },
});
let group_id,
    channel_id,
    isPause = false,
    group_invite_link = null,
    channel_invite_link = null,
    bot_username = null,
    domain_verify_endpoint = null,
    BOT_WELCOM_AFTER_START = "",
    BOT_STATUS_SWITCH = true;

let BOT_STEP_1 = "🍓 Step 1: Join Naga Kingdom Telegram Group by clicking this:\n";
let BOT_STEP_2 = "🍓 Step 2: Join Naga Kingdom Telegram Channel by clicking this:\n"
let BOT_STEP_3 = "🍓 Step 3: Enter your email to confirm registration:";
let BOT_WRONG_EMAIL = "Your email is invalid. Please check and enter your email again.";
let BOT_EMAIL_SUCCESS = "Email is successfully verified.";
let BOT_STEP_4 = `Step 4:
🌹 Follow and Tweet our Channel [Twitter](https://twitter.com/NagaKingdom)
🌹 And retweet Campaign [Twitter](https://twitter.com/NagaKingdom/status/1472904659815698432?s=20)
🌹 Then enter your twitter profile link`
let BOT_STEP_5 = `Step 5:
🌹 Follow Naga Kingdom on [Facebook](https://www.facebook.com/NagaKingdomGame)
🌹 Then enter your facebook profile link`
let BOT_STEP_6 = `Step 6:
🌹 Subscribe our [Youtube](https://www.youtube.com/channel/UCeZ7o_P_ubd7LhCHqx28kew)
🌹 Then enter your youtube profile link`
let BOT_STEP_7 = `Step 7:
🌹 Join Naga Kingdom on [Reddit](https://www.reddit.com/r/nagakingdom)
🌹 Then enter your reddit profile link`
let BOT_STEP_8 = `✨ You have successfully completed all steps to gain the rewards.
The rewards will be sent directly to your wallet once the campaign ends.
Thanks for joining!
`;
let BOT_STEP_9 = `✨Other instructions to follow (optional, up to 40,000 NAGA):
🌹Play Naga Kingdom at [Naga Kingdom](https://nagakingdom.com/game), record and post on your social media.
🌹Then enter the link of your video (at least 100 views) via this Bot`
let BOT_CHANGE_WALLET = "✨Enter your Solana Address here (create at Solflare, Trust, coin98, Exodus):\n(ex: 76j4T2MASV6KjrEde57zKbok5gXctDTRNiYY1UhwRTLQ).\nNote:We do NOT accept any BSC or ETH addresses, be alert! Naga Kingdom is developed on Solana Blockchain. Smart contracts are being audited and will be published soon."

let inviteTemple = `
🔊🔊Naga Kingdom Opening Airdrop
⏰ Time (UTC): 00:00, Dec 21, 2021 - 00:00, Jan 05, 2022
💲 Total Airdrop Reward:  100,000 NAGA Tokens and 1,000 NFT Adventure Skins
🔖 Start now: URL\n
🎁Reward: 
- 30,000 NAGA tokens for 1,000 winners
- 30,000 NAGA tokens for 300 winners with +10 successful referrals
- 1,000 NFT Adventure Skins for 1,000 winners with over 30 successful referrals
- 40,000 NAGA Tokens for 100 best videos
`


let BOT_EVENT_END = `Hello our value user.\nThe number of participants in the finfine ecosystem launch event has reached the limit, you cannot participate in this airdrop. We thank you for contacting us.\nPlease keep in touch, we will inform you of the latest airdrop.`
let emailDomainAllow = ["aol.com", "gmail.com", "hotmail.com", "hotmail.co.uk", "live.com", "yahoo.com", "yahoo.co.uk", "yandex.com", "hotmail.it"];

//00:00, Jan 05, 2022
let timeEnd = 1641340800000

sparkles.on("config_change", async () => {
    try {
        let config = await DashboardModel.findOne({ config: 1 });
        group_id = config.group_id;
        channel_id = config.channel_id;
        group_invite_link = config.group_invite_link;
        channel_invite_link = config.channel_invite_link,
        bot_username = config.bot_username;
        domain_verify_endpoint = config.domain_verify_endpoint;
        BOT_WELCOM_AFTER_START = config.bot_text.BOT_WELCOM_AFTER_START;
        BOT_STATUS_PRIVATE_CHAT = config.status.privateChat;
        BOT_STATUS_GROUP_CHAT = config.status.groupChat;
        isPause = config.status.isPause
        BOT_STATUS_SWITCH = config.status.switch;
        CONFIG_webinarId = config.webinarId;
    } catch (e) {
        console.error("update config have error", e);
    }
});


let reply_markup_keyboard_check = {
    keyboard: [[{ text: "Check Join Channel"}]],
    resize_keyboard: true,
};

let reply_markup_keyboard_checks = {
    keyboard: [[{ text: "Check Join Group"}]],
    resize_keyboard: true,
};

let reply_markup_keyboard = {
    keyboard: [[{ text: "Share" }, { text: "Change Wallet" }, { text: "/start" }]],
    resize_keyboard: true,
};

let reply_markup_keyboard_end = {
    keyboard: [[{ text: "/start" }]],
    resize_keyboard: true,
};


let reply_markup_keyboard_verify_email = {
    keyboard: [[{ text: "Change email" }, { text: "Resend email" }]],
    resize_keyboard: true,
};

const schemaEmail = Joi.object({
    email: Joi.string().email({
        minDomainSegments: 1,
        tlds: { allow: ["com", "net", "dev", "uk", "it"] },
    }),
});

function curentTime(offset = 7) {
    return chalk.green(
        new moment().utcOffset(offset).format("YYYY/MM/DD HH:mm:ss Z")
    );
}


async function logMsg(msg, type = "text") {
    let { id, first_name, last_name } = msg.from;
    let telegramID = id;
    let chatId = msg.chat.id;
    let title = msg.chat.title ? msg.chat.title : "";
    let fullName = (first_name ? first_name : "") + " " + (last_name ? last_name : "");

    if (type === "text") {
        text = msg.text;
        text = text.toString().split("\n").join(" ");
        return;
    }
    if (type === "sticker") {
        return
    }
    if (type === "new_chat_members") {
    }
    else if (type === "left_chat_member") {
    } else {
    }
}


bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"
    bot.sendMessage(chatId, resp);
});

let limit = {}
bot.on("message", async (...parameters) => {
    let msg = parameters[0];
    let type = parameters[1].type;
    let chatId = msg.chat.id;
    let telegramID = msg.from.id;
    let { first_name, last_name } = msg.from;
    let fullName = (first_name ? first_name : "") + " " + (last_name ? last_name : "");
    logMsg(msg, type);
    let text = "";
    if (type === "text") text = msg.text;

    if (!BOT_STATUS_SWITCH) {
        return;
    }

    if (limit[telegramID] !== undefined) {
        if (Date.now() - limit[telegramID].last < 300) {
            limit[telegramID].last = Date.now()
            return
        } else limit[telegramID].last = Date.now()
    } limit[telegramID] = { last: Date.now() }

    if (isPause) {
        return bot.sendMessage(telegramID, "Airdrop will temporary pause to mantain for good experience.\nAirdrop will resume soon. Sorry for inconvenient.")
    }

    //this is text message
    if (type === "text") {
        if (msg.chat.type === "private") {
            let user = await UserModel.findOne({ telegramID }, { mail:1, registerFollow: 1, social: 1, wallet: 1 }).exec();
            if (Date.now() > timeEnd) {
                if (!user || !user.registerFollow.step4.isTwitterOK) {
                    // bot.sendMessage(telegramID, BOT_EVENT_END, {reply_markup: reply_markup_keyboard_end}).catch(e => { console.log(e) })
                    return;
                }
            }
            //user didn't have in database
            if (text.startsWith("/start")) {
                const url = 'images/banner.png';
                await bot.sendPhoto(telegramID, url);
                await bot.sendMessage(telegramID, BOT_WELCOM_AFTER_START.replace("USERNAME", `[${fullName}](tg://user?id=${telegramID})`),
                    { parse_mode: "Markdown" }).catch(e => { console.log("error in first start!", e) })
                //handle for new user without ref invite
                if (msg.text === "/start") {
                    return handleStart(bot, msg, null);
                }

                //handle with ref invite
                let id = text.slice(7).replace(/\D/g, "");
                if (!id) {
                    return handleStart(bot, msg, null);
                } else return handleStart(bot, msg, id.toString());
            }
            if (msg.text === "Check Join Channel" && !user.registerFollow.passAll) {
                return handleJoinChannel(bot, msg);
            }

            // if (msg.text === "Resend email" && user.registerFollow.step2 && user.registerFollow.step3) {
            //     return sendStep3_1({ telegramID }, bot);
            // }

            if (!user) {
                return bot.sendMessage(telegramID,
                    "Have an error when handle your request.\nPlease click /start to start again.", {
                    reply_markup: {
                        remove_keyboard: true
                    }
                })
            }
            // if (user && user.wallet.spl == "" && user.social.youtube != "" ) {
            //     var valid = WAValidator.validate(text, 'ETH');
            //     console.log(curentTime(), fullName, telegramID, "in changeWallet text:", text);
            //     if (valid) {
            //         await UserModel.updateOne({ telegramID }, { "wallet.changeWallet": false, "wallet.spl": text.toUpperCase() });
            //         bot.sendMessage(telegramID, "You have successfully completed all steps to gain the rewards . Please wait for our latest notice via this bot to receive your prize");
            //         return setTimeout(() => {
            //             bot.sendMessage(telegramID, "Please select the Campaign to continue", {reply_markup: welcome_keyboard},)
            //                 .catch(e => { console.log("error in first start!", e) })
            //         }, 500);
            //     } else {
            //         await UserModel.updateOne({ telegramID }, { "wallet.changeWallet": false });
            //         return
            //     }
            // }
            // if (user &&  user.wallet.spl != "" && user.social.youtube != "") {
            //     return bot.sendMessage(telegramID, "You have successfully registered !");
            // }

            // if (user && user.social.youtube == "") {
            //     let textYoube = msg.text.toString()
            //     let checkYoutube = null
            //     try {
            //         checkYoutube = await parse(textYoube, true);
            //     } catch (e) {
            //         console.log("have err in checkYoube", e);
            //     }
            //     if (checkYoutube.hostname === "www.youtube.com" || checkYoutube.hostname === "youtu.be") {
            //         await UserModel.updateOne({ telegramID }, { "social.youtube": textYoube}).exec();
            //         if (user.wallet.spl == "") {
            //             return bot.sendMessage(telegramID, BOT_CHANGE_WALLET)
            //         } else {
            //             bot.sendMessage(telegramID, "You have successfully completed all steps to gain the rewards . Please wait for our latest notice via this bot to receive your prize");
            //             return setTimeout(() => {
            //                 bot.sendMessage(telegramID, "Please select the Campaign to continue", {reply_markup: welcome_keyboard},)
            //                     .catch(e => { console.log("error in first start!", e) })
            //             }, 500);
            //         }
            //     } else {
            //         return bot.sendMessage(telegramID, "Invalid link. Please enter your YouTube link again.")
            //     }
            // }

            // if (user && user.wallet.spl == ""  && user.social.medium != "" ) {
            //     var valid = WAValidator.validate(text, 'ETH');
            //     console.log(curentTime(), fullName, telegramID, "in changeWallet text:", text);
            //     if (valid) {
            //         await UserModel.updateOne({ telegramID }, { "wallet.changeWallet": false, "wallet.spl": text.toUpperCase() });
            //         bot.sendMessage(telegramID, "You have successfully completed all steps to gain the rewards . Please wait for our latest notice via this bot to receive your prize");
            //         return setTimeout(() => {
            //             bot.sendMessage(telegramID, "Please select the Campaign to continue", {reply_markup: welcome_keyboard},)
            //                 .catch(e => { console.log("error in first start!", e) })
            //         }, 500);
            //     } else {
            //         await UserModel.updateOne({ telegramID }, { "wallet.changeWallet": false });
            //         return
            //     }
            // }
            // if (user  && user.wallet.spl != "" && user.social.medium != "") {
            //     return bot.sendMessage(telegramID, "You have successfully registered !");
            // }
            // if (user && user.social.medium == "") {
            //     let textMedium = msg.text.toString()
            //     let checkMedium = null
            //     try {
            //         checkMedium = await parse(textMedium, true);
            //     } catch (e) {
            //         console.log("have err in checkYoube", e);
            //     }
            //     if (checkMedium.hostname === "medium.com") {
            //         await UserModel.updateOne({ telegramID }, { "social.medium": textMedium}).exec();
            //         if (user.wallet.spl == "") {
            //             return bot.sendMessage(telegramID, BOT_CHANGE_WALLET)
            //         } else {
            //             bot.sendMessage(telegramID, "You have successfully completed all steps to gain the rewards . Please wait for our latest notice via this bot to receive your prize");
            //             return setTimeout(() => {
            //                 bot.sendMessage(telegramID, "Please select the Campaign to continue", {reply_markup: welcome_keyboard},)
            //                     .catch(e => { console.log("error in first start!", e) })
            //             }, 500);
            //         }
            //     } else {
            //         return bot.sendMessage(telegramID, "Invalid link. Please enter your YouTube link again.")
            //     }
            // }
                //have this user in database. check it out
            if (user && !user.registerFollow.passAll) {
                if (!user.registerFollow.step2.isJoinGrouped) {
                    return handleStart(bot, msg, null);
                }

                if (!user.registerFollow.step3.isJoinChanneled) {
                    return sendStep2_1({ telegramID }, bot);
                }

                if (text === "Change email" && !user.registerFollow.passAll) {
                    return handleReEnterEmailAgain(bot, msg);
                }

                if (text === "Resend email" && user.registerFollow.step4.isWaitingVerify) {
                    return handleReSendEmailAgain(bot, msg);
                }
                if (user.registerFollow.step2  && user.registerFollow.step3 && user.registerFollow.step4.isWaitingEnterEmail) {
                    if (user.registerFollow.log === "step3" && user.registerFollow.step4.isWaitingVerify && user.mail.email != "") {
                        return bot.sendMessage(telegramID, "Access the email to confirm registration",
                        { reply_markup: reply_markup_keyboard_verify_email }
                        ).catch(e => console.log("have error in send email noti!", e))
                    }
                    if (user.mail.isVerify == false && user.mail.email == "") {
                        return handleEnterEmail(bot, msg);
                    }
                }
                if (user && !user.registerFollow.step5.isTwitterOK) {
                    let checkTwitter = null
                    try {
                        checkTwitter = await parse(text, true);
                    } catch (e) {
                    }
                    if (checkTwitter.hostname === "twitter.com" || checkTwitter.hostname === "mobile.twitter.com") {
                        const linkT = text.slice(text.length - 5, text.length)
                        if (linkT != ".com" && linkT != ".com/" && text != "https://twitter.com/nagakingdom" && text != "https://mobile.twitter.com/nagakingdom") {
                            await UserModel.updateOne({ telegramID }, { "registerFollow.step5.isTwitterOK": true, "social.twitter": text, "wallet.changeWallet": false }).exec();
                            await sendStep5_Finish({ telegramID, msg });
                            return sendStep4_Facebook({telegramID})
                        } else {
                            return bot.sendMessage(telegramID, "You have entered an invalid link profile, please submit again twitter profile ")
                        }
                    }        
                    if (!user.registerFollow.step5.isWaitingPass) {
                        return setTimeout(() => { sendStep3_Twitter({telegramID})},1000)
                    } else {
                        bot.sendMessage(telegramID, "You have entered an invalid link profile, please submit again twitter profile ")
                        return setTimeout(() => { sendStep3_Twitter({telegramID})},1000)
                    }
                }
                if (user && !user.registerFollow.step6.isFacebookOK ) {
                    let checkFacebook = null
                    try {
                        checkFacebook = await parse(text, true);
                    } catch (e) {

                    }
                    if (checkFacebook.hostname === "www.facebook.com" || checkFacebook.hostname === "m.facebook.com" || checkFacebook.hostname === "facebook.com") {
                        const linkF = text.slice(text.length - 5, text.length)
                        if (linkF != ".com" && linkF != ".com/" && text != "https://www.facebook.com/NagaKingdomGame" && text != "https://facebook.com/NagaKingdomGame" && text != "https://m.facebook.com/NagaKingdomGame") {
                            await UserModel.updateOne({ telegramID }, { "registerFollow.step6.isFacebookOK": true, "social.facebook": text, "wallet.changeWallet": false }).exec();
                            await sendStep6_Finish({ telegramID, msg });
                            return sendStep5_Youtube({telegramID})
                        } else {
                            return bot.sendMessage(telegramID, "You have entered an invalid link profile, please submit again facebook profile ")
                        }
                    } 
                    if (!user.registerFollow.step6.isWaitingPass) {
                        return setTimeout(() => {sendStep4_Facebook({telegramID})},1000)
                    } else {
                        bot.sendMessage(telegramID, "You have entered an invalid link profile, please submit again facebook profile ")
                        return setTimeout(() => {sendStep4_Facebook({telegramID})},1000)
                    }
                }

                if (user && !user.registerFollow.step7.isYoutubeOK) {
                    let checkYoutube = null
                    try {
                        checkYoutube = await parse(text, true);
                    } catch (e) {
                        console.log("have err in checkYoutube", e);
                    }
                    if (checkYoutube.hostname === "www.youtube.com" || checkYoutube.hostname === "youtube.com") {
                        const linkY = text.slice(text.length - 5, text.length)
                        if (linkY != ".com" && linkY != ".com/" && text != "https://www.youtube.com/channel/UCeZ7o_P_ubd7LhCHqx28kew" && text != "https://youtube.com/channel/UCeZ7o_P_ubd7LhCHqx28kew") {
                            await UserModel.updateOne({ telegramID }, { "registerFollow.step7.isYoutubeOK": true, "social.youtube": text, "wallet.changeWallet": false }).exec();
                            await sendStep7_Finish({ telegramID, msg });
                            return sendStep6_Reddit({telegramID})
                        } else {
                            return bot.sendMessage(telegramID, "You have entered an invalid link profile, please submit again youtube profile ")
                        }
                    }
                    if (!user.registerFollow.step7.isWaitingPass) {
                        return setTimeout(() => {sendStep5_Youtube({telegramID})},1000)
                    } else {
                        bot.sendMessage(telegramID, "You have entered an invalid link profile, please submit again youtube profile ")
                        return setTimeout(() => {sendStep5_Youtube({telegramID})},1000)
                    }
                }
                if (user && !user.registerFollow.step8.isRedditOK) {
                    let checkReddit = null
                    try {
                        checkReddit = await parse(text, true);
                    } catch (e) {
                        console.log("have err in checkReddit", e);
                    }
                    if (checkReddit.hostname === "www.reddit.com" || checkReddit.hostname === "www.m.reddit.com") {
                        const linkR = text.slice(text.length - 5, text.length)
                        if (linkR != ".com" && linkR != ".com/" && text != "https://www.reddit.com/user/NagaKingdom" && text != "https://reddit.com/user/NagaKingdom") {
                            await UserModel.updateOne({ telegramID }, { "registerFollow.step8.isRedditOK": true, "registerFollow.passAll": true, "social.reddit": text, "wallet.changeWallet": true }).exec();
                            return bot.sendMessage(telegramID, BOT_CHANGE_WALLET);
                        } else {
                            return bot.sendMessage(telegramID, "You have entered an invalid link profile, please submit again reddit profile ")
                        }
                    } 
                    if (!user.registerFollow.step8.isWaitingPass) {
                        return setTimeout(() => {sendStep6_Reddit({telegramID})},1000)
                    } else {
                        bot.sendMessage(telegramID, "You have entered an invalid link profile, please submit again reddit profile ")
                        return setTimeout(() => {sendStep6_Reddit({telegramID})},1000)
                    }

                } else {
                    return console.log(curentTime(7), fullName, fullName, telegramID, "have not dont registerFollow with text", text);
                }
            };
        
            if (user && user.wallet.changeWallet) {
                var valid = WAValidator.validate(text, 'ETH');
                if (!valid) {
                    await UserModel.updateOne({ telegramID }, { "wallet.changeWallet": false, "wallet.spl": text });

                    if (!user.registerFollow.sendAllStep) {
                        await UserModel.findOneAndUpdate({ telegramID }, { "registerFollow.sendAllStep": true });
                        await sendStep8_Finish({ telegramID, msg });
                        return;
                    }
                    return bot.sendMessage(telegramID, "Your wallet was updated.");
                } else {
                    if (!user.registerFollow.sendAllStep && user.registerFollow.passAll) {
                        // return sendStep6_Reddit({telegramID})
                        bot.sendMessage(telegramID, "You've completed all steps.");
                        return setTimeout(() => bot.sendMessage(telegramID, "Oops!!!\nYou have entered an invalid wallet address. Press submit wallet address again."),500) ;
                    }
                    await UserModel.updateOne({ telegramID }, { "wallet.changeWallet": false });
                }
            }

            //switch commands without payload
            if (BOT_STATUS_SWITCH && user.registerFollow.step8.isRedditOK) {
                switch (text) {
                    case "share":
                    case "/share":
                        handleInvite(bot, msg);
                        break;
                    case "news":
                        bot.sendMessage(telegramID,
                            "Currently do not have any news yet, we will notify for you in futher news.\nHope you have a nice day",
                            { disable_web_page_preview: true }
                        );
                        break;
                    case "change wallet":
                        await UserModel.updateOne({ telegramID }, { "wallet.changeWallet": true });
                        bot.sendMessage(telegramID, BOT_CHANGE_WALLET, { disable_web_page_preview: true, reply_markup: reply_markup_keyboard });
                        break;

                    case "/check":
                        bot.sendMessage(telegramID, "ok", {
                            reply_markup: reply_markup_keyboard
                        })
                        break;
                    default:
                        let checkVideoYoutube = null
                        try {
                            checkVideoYoutube = await parse(text, true);
                        } catch (e) {
                        }
                        if (checkVideoYoutube.hostname === "www.youtube.com" || checkVideoYoutube.hostname === "youtube.com") {
                            const linkY = text.slice(text.length - 5, text.length)
                            if ( linkY != ".com/" && text != ".com") {
                                await UserModel.updateOne({ telegramID }, { "social.video_youtube": text}).exec();
                                return bot.sendMessage(telegramID, BOT_STEP_8, {
                                    disable_web_page_preview: true,
                                    reply_markup: reply_markup_keyboard,
                                });
                            } else {
                                return bot.sendMessage(telegramID, "You have entered an invalid link profile, please submit again youtube profile ")
                            }
                        }
                        handleInvite(bot, msg, true, user.social.video_youtube);
                        break;
                }
            }
        }
    }else if (text === "left_chat_member") {
        handleLeftChatMember(bot, msg);
    } else if (type === "new_chat_members") {
        handleNewChatMember(bot, msg, 1);
    }
});

bot.on("error", (...parameters) => {
    console.error(parameters);
});

bot.on("polling_error", (error) => {
    console.log(curentTime(), error); // => 'EFATAL'
});

async function handleNewChatMember(bot, msg, campaign) {
    try {
        await bot.deleteMessage(msg.chat.id, msg.message_id);
    } catch (e) {
        console.log("was deleted")
    }
    let telegramID = msg.from.id;
    let { first_name, last_name, id } = msg.from;
    let fullName = (first_name ? first_name : "") + " " + (last_name ? last_name : "");
    await handleNewUserJoinGroup({ telegramID, fullName }, campaign);
    await sendStep2_1({ telegramID }, bot);
}



let handleLeftChatMember = async (bot, msg) => {
    let { first_name, last_name, id } = msg.from;
    let fullName = (first_name ? first_name : "") + " " + (last_name ? last_name : "");
    try {

        await UserModel.findOneAndUpdate(
            { telegramID: id },
            { $set: { "isLeftGroup": true } },
            { useFindAndModify: false }
        ).exec();

        let totalUsers = await UserModel.find({ "registerFollow.step4.isRedditOK": true }).countDocuments().exec();
        sparkles.emit("totalUsers", { totalUsers });
        // await bot.deleteMessage(msg.chat.id, msg.message_id);
        await bot.sendMessage(id, "Warning: you left group, your ref will be delete.", {
            reply_markup: {
                remove_keyboard: true
            }
        });
    } catch (e) {
        console.error(e);
    }
};

async function sendStep3_Twitter({ telegramID }) {
    await bot.sendMessage(telegramID, BOT_STEP_4, {
        parse_mode: "Markdown", disable_web_page_preview: true, reply_markup: {
            remove_keyboard: true
        }
    });
}

async function sendStep4_Facebook({ telegramID }) {
    await bot.sendMessage(telegramID, BOT_STEP_5, {
        parse_mode: "Markdown", disable_web_page_preview: true, reply_markup: {
            remove_keyboard: true
        }
    });
}

async function sendStep5_Youtube({ telegramID }) {
    await bot.sendMessage(telegramID, BOT_STEP_6, {
        parse_mode: "Markdown", disable_web_page_preview: true, reply_markup: {
            remove_keyboard: true
        }
    });
}

async function sendStep6_Reddit({ telegramID }) {
    await bot.sendMessage(telegramID, BOT_STEP_7, {
        parse_mode: "Markdown", disable_web_page_preview: true, reply_markup: {
            remove_keyboard: true
        }
    });
}

async function sendStep5_Finish({ telegramID, msg }) {
    let user = await UserModel.findOne({ telegramID }).exec();
    if (!user) return;
    user.registerFollow.step5.isTwitterOK = true;
    user.registerFollow.log = "step5";
    user.registerFollow.step6.isWaitingPass = true;
    await user.save();

}

async function sendStep6_Finish({ telegramID, msg }) {

    let user = await UserModel.findOne({ telegramID }).exec();
    if (!user) return;
    user.registerFollow.step6.isFacebookOK = true;
    user.registerFollow.log = "step6";
    user.registerFollow.step7.isWaitingPass = true;
    await user.save();
}

async function sendStep7_Finish({ telegramID, msg }) {
    let user = await UserModel.findOne({ telegramID }).exec();
    if (!user) return;
    user.registerFollow.step7.isYoutubeOK = true;
    user.registerFollow.log = "step8";
    user.registerFollow.step8.isWaitingPass = true;
    await user.save();
}

async function sendStep8_Finish({ telegramID, msg }) {
    let user = await UserModel.findOne({ telegramID }).exec();
    if (!user) return;
    user.registerFollow.step8.isRedditOK = true;
    user.registerFollow.log = "step8";
    await user.save();
    
    await bot.sendMessage(telegramID, BOT_STEP_8, {
        disable_web_page_preview: true,
        reply_markup: reply_markup_keyboard,
    });

    let msgs = {
        from: {
            id: telegramID
        }
    };
    handleInvite(bot, msgs, true)

    try {
        let totalUsers = await UserModel.find({ "registerFollow.step8.isRedditOK": true }).countDocuments().exec();
        sparkles.emit("totalUsers", { totalUsers });
    } catch (e) {
        console.error(e);
    }

}

sparkles.on("email_verify_success", async ({ telegramID }) => {
    await bot.sendMessage(telegramID, BOT_EMAIL_SUCCESS);
    sendStep3_Twitter({ telegramID });
    return;

});

async function handleReSendEmailAgain(bot, msg) {
    let telegramID = msg.from.id;
    try {
        let user = await UserModel.findOne({ telegramID, "mail.isVerify": false }, { mail: 1 }).exec();
        if (!user) {
            return bot.sendMessage(telegramID, "have error when handle your request, please contact support support@nagakingdom.com!")
        }
        let email = user.mail.email;
        let verifyCode = user.mail.verifyCode;
        let href = domain_verify_endpoint + "?code=" + verifyCode + "&telegramID=" + telegramID;

        let msg = {
            to: email,
            from: sendFrom,
            subject: 'Please confirm your email to join Airdrop event',
            html: MAIL_TEMPLE.split("linklinklink").join(href)
        }

        transporter.sendMail(msg).catch(e => {
        })

        bot.sendMessage(telegramID, "Email verify was resent to you, please check it out");
    } catch (e) {
        console.error(e);
    }
}

async function handleEnterEmail(bot, msg) {
    let telegramID = msg.from.id;

    let listMail = "";
    emailDomainAllow.forEach((item, index) => {
        let toJoin = "@" + item;
        if (index !== emailDomainAllow.length - 1) toJoin += ", ";
        listMail += toJoin
    })
    let toSend = BOT_WRONG_EMAIL + "\n Only accept: " + listMail;

    let { value, error } = schemaEmail.validate({ email: msg.text });
    if (error) {
        await bot.sendMessage(msg.from.id, toSend);
        return;
    }

    let email = value.email;
    let domain = email.split("@")[1];
    if (!emailDomainAllow.includes(domain)) {
        await bot.sendMessage(msg.from.id, toSend);
        return;
    }

    let back = await setEmailAndUpdate({ telegramID, email: value.email });

    if (back.result) {
        let href = domain_verify_endpoint + "?code=" + back.verifyCode + "&telegramID=" + telegramID;
        let msg = {
            to: value.email,
            from: sendFrom,
            subject: 'Please confirm your email to join Airdrop event',
            html: MAIL_TEMPLE.split("linklinklink").join(href)

        }

        transporter.sendMail(msg).catch(e => { console.log("have error when send mail to", value.email) })
        return bot.sendMessage(telegramID, "🎄 Please check your email to confirm!",
            { reply_markup: reply_markup_keyboard_verify_email }
        );

    } else if (back.error === "used") {
        bot.sendMessage(telegramID, "Your email you type have been used, please use different email");
    }
}

async function handleReEnterEmailAgain(bot, msg) {
    let telegramID = msg.from.id;

    let back = await removeEmailandUpdate({ telegramID });
    if (back) {
        bot.sendMessage(
            telegramID,
            "Enter your new email to receive email confirm"
        );
        return;
    } else {
        console.error("handleReEnterEmailAgain has an error");
    }
}



async function sendStep1({ telegramID }, bot) {
    bot.sendMessage(telegramID, BOT_STEP_1 + group_invite_link, {
        reply_markup: reply_markup_keyboard_checks
    });
    return;
}

async function sendStep2_1({ telegramID }, bot) {
    bot.sendMessage(telegramID, BOT_STEP_2 + channel_invite_link);
    setTimeout(() => {
        return bot.sendMessage(telegramID, `Please click "Check Join Channel" to continue`, {
            reply_markup: reply_markup_keyboard_check
        })
    },3000)
    return;
}

async function sendStep3_1({ telegramID }, bot) {
    bot.sendMessage(telegramID, BOT_STEP_3);
    await setWaitingEnterEmail({ telegramID }, true);
    return;
}

async function handleStart(bot, msg, ref) {
    let telegramID = msg.from.id;
    let { first_name, last_name } = msg.from;
    let fullName = (first_name ? first_name : "") + " " + (last_name ? last_name : "");
    let result = null;

    //with ref id
    if (ref) {
        bot.sendMessage(ref.toString(), "🎉You have one person joined with your referral.\n You'll be regarded as a successful referral once the member referred complete all the steps of the campaign .\Keep going sir🎉")
            .then((a) => console.log(curentTime(), "send to parent ref ok")).catch(e => { console.log(curentTime(), "send to parent ref fail!", e); })
        result = await handleNewUserWithRef({ telegramID, fullName, ref });
    }
    //without ref id
    else {
        result = await handleNewUserNoRef({ telegramID, fullName });
    }

    if (!result.result) {
        console.error(result);
        return;
    }


    let getChatMember = await bot.getChatMember(group_id.toString(), telegramID);
    console.log(curentTime(), getChatMember.status);
    if (getChatMember.status === "member") {
        await handleNewUserJoinGroup({ telegramID, fullName });
        await sendStep2_1({ telegramID }, bot);
        return;
    } else {
        await sendStep1({ telegramID }, bot);
        return;
    }
}

async function handleJoinChannel(bot, msg, campaign) {
    let telegramID = msg.from.id;
    let { first_name, last_name } = msg.from;
    let fullName = (first_name ? first_name : "") + " " + (last_name ? last_name : "");
    let user = await UserModel.findOne({ telegramID }, { registerFollow: 1, social: 1, wallet: 1 }).exec();
    if (user && user.registerFollow.step2.isJoinGrouped) {
        let getChatMember = await bot.getChatMember(channel_id.toString(), telegramID);
        if (getChatMember.status === "member") {
            let user = await handleNewUserJoinChannel({ telegramID, fullName });
            if (user) {
                if (user.registerFollow.log === "step3") {
                    if (user.registerFollow.step4.isWaitingEnterEmail) {
                        await sendStep3_1({ telegramID }, bot);
                    }
                }
            }
            return;
        } else {
            await sendStep2_1({ telegramID }, bot);
            return;
        }
    }


}

function handleInvite(bot, msg, first = false, videoFacebook) {

    let toSend = "🎉🎢 Share your referral link. You'll be regarded as a successful referral once the member referred complete all the steps of the campaign:\n";
    let url = "https://t.me/" + bot_username + "?start=" + msg.from.id;
    toSend += url;
    let full = inviteTemple.replace("URL", url)
    if (first) {
        bot.sendMessage(
            msg.from.id,
            toSend,
            {
                disable_web_page_preview: true,
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Click to share",
                                url:
                                    "https://t.me/share/url?url=" +
                                    url +
                                    "&text=Join Airdrop event to claim free gift 🎁🎁",
                            },
                        ],
                    ],
                    ...reply_markup_keyboard
                },
            }
        );
        if (!videoFacebook) {
            bot.sendMessage(msg.from.id, BOT_STEP_9,{
                parse_mode: "Markdown", disable_web_page_preview: true, reply_markup: {
                    remove_keyboard: true
                }
            });
        }
    } else {
        bot.sendMessage(
            msg.from.id,
            full,
            {
                disable_web_page_preview: true,
            }
        );
    }
    return;
}
