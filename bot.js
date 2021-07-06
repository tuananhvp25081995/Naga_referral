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

let sendFrom = "BOFinance Airdrop <no_reply@bo.finance>"
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
    BOT1_WELCOM_AFTER_START = "",
    BOT2_WELCOM_AFTER_START = "",
    BOT3_WELCOM_AFTER_START = "",
    BOT_STATUS_SWITCH = true;

let BOT_STEP_1 = "🍓 Step 1: Join the BO Finance Group by clicking this:\n";
let BOT_STEP_2 = "🍓 Step 2: Join the BO Finance Channel by clicking this:\n"
let BOT_STEP_3 = "🍓 Step 3: Enter your email to confirm registration:";
let BOT_WRONG_EMAIL = "Your email is invalid. Please check and enter your email again.";
let BOT_EMAIL_SUCCESS = "Email is successfully verified.";
let BOT_STEP_4 = `Step 4:
🌹 Follow and Tweet our Channel [Twitter](https://twitter.com/finance_bo)
🌹 Then input your twitter profile link`
let BOT_STEP_5 = `Step 5:
🌹 Like and Share our Fanpage [Facebook](https://www.facebook.com/BOFinance-109795821367052)
🌹 Then input your facebook profile link`
// The reward is 2,000,000 Tokens for the entire campaign.Let's share the campaign to receive bonuses by press 'Share' button
let BOT_STEP_6 = "✨ You have successfully completed all steps to gain the rewards . Please wait for our latest notice via this bot to receive your prize.";
let BOT_CHANGE_WALLET = "✨Truy cập trang web: https://www.bo.finnace, connect địa chỉ ví bsc của bạn và dán địa chỉ ví mà bạn đã connect vào đây:\n(ex: 0xa9CdF87D7f988c0ae5cc24754C612D3cff029F80).\nNote:The wallet must support Binance Smart Chain and BEP-20 assets"

let BOT_Statstics_Temple = `🎁Estimated Balance: Tokens FIBO
Total Balance: $TOKENS FIBO
Tokens for airdop event will be updated after verifying manually by bounty manager at the end of airdrop.\n 
📎Referral link: REFLINK
👬Referrals: REFCOUNT
-------------------\nYour details: 
Email: EMAIL 
Telegram ID: TELEGRAM  
FIBO Tokens wallet address: \n`


let inviteTemple = `
🔊🔊BO Finance Opening Airdrop
⏰ Time: 07/15/2021 -  08/30/2021
💲 Total Airdrop Reward:  300.000 FIBO Tokens
🔖 Start now: URL\n
🎁Reward: 
- You can get to 6 FIBO tokens by completing all steps and 2 FIBO tokens for each successful referral.

BO Finance: https://www.bo.finance
`


let BOT_EVENT_END = `Hello our value user.\nThe number of participants in the finfine ecosystem launch event has reached the limit, you cannot participate in this airdrop. We thank you for contacting us.\nPlease keep in touch, we will inform you of the latest airdrop.`
let emailDomainAllow = ["aol.com", "gmail.com", "hotmail.com", "hotmail.co.uk", "live.com", "yahoo.com", "yahoo.co.uk", "yandex.com", "hotmail.it"];

//07:00 08/30/2021 GMT+7
let timeEnd = 1630281600000

sparkles.on("config_change", async () => {
    try {
        let config = await DashboardModel.findOne({ config: 1 });
        group_id = config.group_id;
        channel_id = config.channel_id;
        group_invite_link = config.group_invite_link;
        channel_invite_link = config.channel_invite_link,
        bot_username = config.bot_username;
        domain_verify_endpoint = config.domain_verify_endpoint;
        BOT1_WELCOM_AFTER_START = config.bot_text.BOT1_WELCOM_AFTER_START;
        BOT2_WELCOM_AFTER_START = config.bot_text.BOT2_WELCOM_AFTER_START;
        BOT3_WELCOM_AFTER_START = config.bot_text.BOT3_WELCOM_AFTER_START;
        BOT_STATUS_PRIVATE_CHAT = config.status.privateChat;
        BOT_STATUS_GROUP_CHAT = config.status.groupChat;
        isPause = config.status.isPause
        BOT_STATUS_SWITCH = config.status.switch;
        CONFIG_webinarId = config.webinarId;
        console.log(curentTime(7), "config updated in bot.js");
    } catch (e) {
        console.error("update config have error", e);
    }
});

let welcome_keyboard = {
    keyboard: [[{ text: "Campaign 1"}, { text: "Campaign 2"}, { text: "Campaign 3"}]],
    resize_keyboard: true,
};

let reply_markup_keyboard_check = {
    keyboard: [[{ text: "Check Join Channel"}]],
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
        console.log(`${curentTime(7)} ${chalk.blue(title)}(${chatId}) receive from ${chalk.blue(fullName)}(${telegramID}): ${text} `);
        return;
    }
    if (type === "sticker") {
        console.log(`${curentTime(7)} ${chalk.blue(title)}(${chatId}) receive sticker from ${chalk.blue(fullName)}(${telegramID}): ${msg.sticker.set_name} `);
        return
    }
    if (type === "new_chat_members") {
        console.log(`${curentTime(7)} ${chalk.blue(fullName)}(${telegramID}) joined ${chalk.blue(title)}(${chatId})`);
    }
    else if (type === "left_chat_member") {
        console.log(`${curentTime(7)} ${chalk.blue(fullName)}(${telegramID}) left ${chalk.blue(title)}(${chatId})`);
    } else {
        console.log(curentTime(7), "undifine type", type, msg)
    }
}


bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"
    bot.sendMessage(chatId, resp);
});

let limit = {}
let data = []
let datas = []
bot.on("message", async (...parameters) => {
    let msg = parameters[0];
    let type = parameters[1].type;
    let chatId = msg.chat.id;
    let telegramID = msg.from.id;
    let { first_name, last_name } = msg.from;
    let fullName = (first_name ? first_name : "") + " " + (last_name ? last_name : "");
    logMsg(msg, type);
    let text = "";
    if (type === "text") text = msg.text.toLowerCase();

    if (!BOT_STATUS_SWITCH) {
        console.log(curentTime(7), "BOT_STATUS_SWITCH: off");
        return;
    }

    if (limit[telegramID] !== undefined) {
        if (Date.now() - limit[telegramID].last < 300) {
            console.log("reach rate limit 3msg/sec: ", telegramID, fullName);
            limit[telegramID].last = Date.now()
            return
        } else limit[telegramID].last = Date.now()
    } limit[telegramID] = { last: Date.now() }

    if (isPause) {
        console.log("stop", telegramID);
        return bot.sendMessage(telegramID, "Airdrop will temporary pause to mantain for good experience.\nAirdrop will resume soon. Sorry for inconvenient.")
    }

    //this is text message
    if (type === "text") {
        console.log(msg.chat.type)
        if (msg.chat.type === "private") {
            let user = await UserModel.findOne({ telegramID }, { mail:1, registerFollow: 1, social: 1, wallet: 1 }).exec();
            if (Date.now() > timeEnd) {
                if (!user || !user.registerFollow.step4.isTwitterOK) {
                    console.log(curentTime(7), fullName, telegramID, "End event. With text:", text);
                    // bot.sendMessage(telegramID, BOT_EVENT_END, {reply_markup: reply_markup_keyboard_end}).catch(e => { console.log(e) })
                    return;
                }
            }
            //user didn't have in database
            if (text.startsWith("/start")) {
                msg.text = msg.text.slice(0,6);
                //handle for new user without ref invite
                if (msg.text === "/start") {
                    bot.sendMessage(telegramID, "Please select the Campaign to continue", {reply_markup: welcome_keyboard},)
                    .catch(e => { console.log("error in first start!", e) })
                    return handleStart(bot, msg, null);
                }
                //handle with ref invite
                let id = text.slice(7).replace(/\D/g, "");
                if (!id) {
                    console.log(curentTime(7), telegramID, fullName, "invite link is not valid");
                    return handleStart(bot, msg, null);
                } else {
                    return handleStart(bot, msg, id.toString());
                }
            }
            if (msg.text === "Campaign 1" && !user.registerFollow.passAll) {
                let campaign = parseInt(text.slice(7).replace(/\D/g, ""));
                data.pop()
                datas.push(campaign)
                bot.sendMessage(telegramID,
                    BOT1_WELCOM_AFTER_START.replace("USERNAME", `[${fullName}](tg://user?id=${telegramID})`),
                    { parse_mode: "Markdown" }).catch(e => { console.log("error in first start!", e) })
                return handleCampaign(bot, msg, campaign);
            }

            if (msg.text === "Campaign 2") {
                let campaign = parseInt(text.slice(7).replace(/\D/g, ""));
                data.pop()
                data.push(campaign)
                bot.sendMessage(telegramID,
                    BOT2_WELCOM_AFTER_START.replace("USERNAME", `[${fullName}](tg://user?id=${telegramID})`),
                    { parse_mode: "Markdown" }).catch(e => { console.log("error in first start!", e) })
                setTimeout(() => {
                    bot.sendMessage(telegramID, "Then send your YouTube video here:")
                }, 500);
                return handleNewUserJoinampaign(bot, msg, campaign);
            }

            if (msg.text === "Campaign 3") {
                let campaign = parseInt(text.slice(7).replace(/\D/g, ""));
                data.pop()
                data.push(campaign)
                bot.sendMessage(telegramID,
                    BOT3_WELCOM_AFTER_START.replace("USERNAME", `[${fullName}](tg://user?id=${telegramID})`),
                    { parse_mode: "Markdown" }).catch(e => { console.log("error in first start!", e) })
                setTimeout(() => {
                    bot.sendMessage(telegramID, "Then send your Medium post here:")
                }, 500);
                return handleNewUserJoinampaign(bot, msg, campaign);
            }

            if (!user) {
                console.log(curentTime(7), fullName, telegramID, "No user in db. With text:", text);
                return bot.sendMessage(telegramID,
                    "Have an error when handle your request.\nPlease click /start to start again.", {
                    reply_markup: {
                        remove_keyboard: true
                    }
                })
            }
            let campaign = data[0]
            if (user && campaign==2 && user.wallet.bep20 == "" && user.social.youtube != "" ) {
                var valid = WAValidator.validate(text, 'ETH');
                console.log(curentTime(), fullName, telegramID, "in changeWallet text:", text);
                if (valid) {
                    await UserModel.updateOne({ telegramID }, { "wallet.changeWallet": false, "wallet.bep20": text.toUpperCase() });
                    bot.sendMessage(telegramID, "You have successfully completed all steps to gain the rewards . Please wait for our latest notice via this bot to receive your prize");
                    return setTimeout(() => {
                        bot.sendMessage(telegramID, "Please select the Campaign to continue", {reply_markup: welcome_keyboard},)
                            .catch(e => { console.log("error in first start!", e) })
                    }, 500);
                } else {
                    await UserModel.updateOne({ telegramID }, { "wallet.changeWallet": false });
                    return
                }
            }
            if (user && campaign==2 && user.wallet.bep20 != "" && user.social.youtube != "") {
                return bot.sendMessage(telegramID, "You have successfully registered !");
            }
            if (user && campaign==2 && user.social.youtube == "") {
                let textYoube = msg.text.toString()
                let checkYoutube = null
                try {
                    checkYoutube = await parse(textYoube, true);
                } catch (e) {
                    console.log("have err in checkYoube", e);
                }
                if (checkYoutube.hostname === "www.youtube.com" || checkYoutube.hostname === "youtu.be") {
                    data.pop()
                    data.push(campaign)
                    await UserModel.updateOne({ telegramID }, { "social.youtube": textYoube}).exec();
                    if (user.wallet.bep20 == "") {
                        return bot.sendMessage(telegramID, BOT_CHANGE_WALLET)
                    } else {
                        bot.sendMessage(telegramID, "You have successfully completed all steps to gain the rewards . Please wait for our latest notice via this bot to receive your prize");
                        return setTimeout(() => {
                            bot.sendMessage(telegramID, "Please select the Campaign to continue", {reply_markup: welcome_keyboard},)
                                .catch(e => { console.log("error in first start!", e) })
                        }, 500);
                    }
                } else {
                    data.pop()
                    data.push(campaign)
                    return bot.sendMessage(telegramID, "Invalid link. Please enter your YouTube link again.")
                }
            }
            if (user && user.wallet.bep20 == "" && campaign==3 && user.social.medium != "" ) {
                var valid = WAValidator.validate(text, 'ETH');
                console.log(curentTime(), fullName, telegramID, "in changeWallet text:", text);
                if (valid) {
                    await UserModel.updateOne({ telegramID }, { "wallet.changeWallet": false, "wallet.bep20": text.toUpperCase() });
                    bot.sendMessage(telegramID, "You have successfully completed all steps to gain the rewards . Please wait for our latest notice via this bot to receive your prize");
                    return setTimeout(() => {
                        bot.sendMessage(telegramID, "Please select the Campaign to continue", {reply_markup: welcome_keyboard},)
                            .catch(e => { console.log("error in first start!", e) })
                    }, 500);
                } else {
                    await UserModel.updateOne({ telegramID }, { "wallet.changeWallet": false });
                    return
                }
            }
            if (user && campaign==3 && user.wallet.bep20 != "" && user.social.medium != "") {
                return bot.sendMessage(telegramID, "You have successfully registered !");
            }
            if (user && campaign==3 && user.social.medium == "") {
                let textMedium = msg.text.toString()
                let checkMedium = null
                try {
                    checkMedium = await parse(textMedium, true);
                } catch (e) {
                    console.log("have err in checkYoube", e);
                }
                if (checkMedium.hostname === "medium.com") {
                    data.pop()
                    data.push(campaign)
                    await UserModel.updateOne({ telegramID }, { "social.medium": textMedium}).exec();
                    if (user.wallet.bep20 == "") {
                        return bot.sendMessage(telegramID, BOT_CHANGE_WALLET)
                    } else {
                        bot.sendMessage(telegramID, "You have successfully completed all steps to gain the rewards . Please wait for our latest notice via this bot to receive your prize");
                        return setTimeout(() => {
                            bot.sendMessage(telegramID, "Please select the Campaign to continue", {reply_markup: welcome_keyboard},)
                                .catch(e => { console.log("error in first start!", e) })
                        }, 500);
                    }
                } else {
                    data.pop()
                    data.push(campaign)
                    return bot.sendMessage(telegramID, "Invalid link. Please enter your YouTube link again.")
                }
            }
            let campaigns = datas[0]
                //have this user in database. check it out
            if (user && !user.registerFollow.passAll) {

                if (!user.registerFollow.step2.isJoinGrouped) {
                    datas.pop()
                    datas.push(campaign)
                    return handleCampaign(bot, msg, campaigns);
                }

                if (!user.registerFollow.step3.isJoinChanneled) {
                    datas.pop()
                    datas.push(campaign)
                    return handleCampaign(bot, msg, campaigns);
                }

                if (text === "change email" && !user.registerFollow.passAll) {
                    return handleReEnterEmailAgain(bot, msg);
                }

                if (text === "resend email" && user.registerFollow.step4.isWaitingVerify) {
                    return handleReSendEmailAgain(bot, msg);
                }

                if (user.registerFollow.step4.isWaitingEnterEmail) {
                    console.log(curentTime(7), telegramID, "email receive from user typeing:", text);
                    if (user.registerFollow.log === "step3" && user.registerFollow.step4.isWaitingVerify) {
                        return bot.sendMessage(telegramID, "Access the email to confirm registration",
                            { reply_markup: reply_markup_keyboard_verify_email }
                        ).catch(e => console.log("have error in send email noti!", e))
                    }
                    if (user.mail.isVerify == false && user.mail.email == "") {
                        return handleEnterEmail(bot, msg);
                    }
                }
                if (user && !user.registerFollow.step5.isTwitterOK) {
                    console.log("in step5 ok with text link", telegramID, fullName, text);
                    let checkTwitter = null
                    try {
                        checkTwitter = await parse(text, true);
                    } catch (e) {
                        console.log("have err in checkTwitter", e);
                    }
                    if (checkTwitter.hostname === "twitter.com" || checkTwitter.hostname === "mobile.twitter.com") {
                        await UserModel.updateOne({ telegramID }, { "registerFollow.step5.isTwitterOK": true, "social.twitter": text, "wallet.changeWallet": false }).exec();
                        await sendStep5_Finish({ telegramID, msg });
                    } else {
                        bot.sendMessage(telegramID, "You have entered an invalid link profile, please submit again twitter profile ")
                        return setTimeout(() => { sendStep3_Twitter({telegramID})},1000)
                    }
                }
                if (user && !user.registerFollow.step6.isFacebookOK) {
                    console.log("in step6 ok with text link", telegramID, fullName, text);
                    let checkFacebook = null
                    try {
                        checkFacebook = await parse(text, true);
                    } catch (e) {
                        console.log("have err in checkFacebook", e);
                    }
                    if (checkFacebook.hostname === "www.facebook.com" || checkFacebook.hostname === "m.facebook.com") {
                        await UserModel.updateOne({ telegramID }, { "registerFollow.step6.isFacebookOK": true,"registerFollow.passAll": true, "social.facebook": text, "wallet.changeWallet": true }).exec();
                        return bot.sendMessage(telegramID, BOT_CHANGE_WALLET);
                    } else {
                        return setTimeout(() => {sendStep4_Facebook({telegramID})},1000)
                    }
                } else {
                    return console.log(curentTime(7), fullName, fullName, telegramID, "have not dont registerFollow with text", text);
                }
            };
        
            if (user && user.wallet.changeWallet) {
                var valid = WAValidator.validate(text, 'ETH');
                console.log(curentTime(), fullName, telegramID, "in changeWallet text:", text);
                if (valid) {
                    await UserModel.updateOne({ telegramID }, { "wallet.changeWallet": false, "wallet.bep20": text.toUpperCase() });

                    if (!user.registerFollow.sendAllStep) {
                        await UserModel.findOneAndUpdate({ telegramID }, { "registerFollow.sendAllStep": true });
                        await sendStep6_Finish({ telegramID, msg });
                        return;
                    }
                    return bot.sendMessage(telegramID, "Your wallet was updated.");
                } else {
                    if (!user.registerFollow.sendAllStep && !user.registerFollow.step6.isFacebookOK) {
                        return sendStep4_Facebook({telegramID})
                        // return bot.sendMessage(telegramID, "Oops !!!\nYou have entered an invalid wallet address. Press submit wallet address again");
                    }
                    await UserModel.updateOne({ telegramID }, { "wallet.changeWallet": false });
                }
            }

            //switch commands without payload
            if (BOT_STATUS_SWITCH && user.registerFollow.step5.isTwitterOK) {
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
                    default:
                        bot.sendMessage(telegramID, "You have successfully completed all steps to gain the rewards . Please wait for our latest notice via this bot to receive your prize");
                        setTimeout(() => {
                            bot.sendMessage(telegramID, "Please select the Campaign to continue", {reply_markup: welcome_keyboard},)
                                .catch(e => { console.log("error in first start!", e) })
                        }, 500);
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
        console.log(`${curentTime(7)} ${chalk.blue(fullName)}(${telegramID}) joined ${chalk.blue(msg.chat.title)}(${msg.chat.id}): joined mess was deleted`)
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
    console.log(curentTime(7), id, fullName, "left group chat, starting delete them in database");
    try {

        await UserModel.findOneAndUpdate(
            { telegramID: id },
            { $set: { "isLeftGroup": true } },
            { useFindAndModify: false }
        ).exec();

        let totalUsers = await UserModel.find({ "registerFollow.step4.isTwitterOK": true }).countDocuments().exec();
        sparkles.emit("totalUsers", { totalUsers });
        console.log(msg.chat.id, msg.message_id)
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

async function sendStep5_Finish({ telegramID, msg }) {
    let user = await UserModel.findOne({ telegramID }).exec();
    if (!user) return;
    user.registerFollow.step5.isTwitterOK = true;
    await user.save();

    try {
        let totalUsers = await UserModel.find({ "registerFollow.step5.isTwitterOK": true }).countDocuments().exec();
        sparkles.emit("totalUsers", { totalUsers });
    } catch (e) {
        console.error(e);
    }

}

async function sendStep6_Finish({ telegramID, msg }) {

    let user = await UserModel.findOne({ telegramID }).exec();
    if (!user) return;
    user.registerFollow.step5.isTwitterOK = true;
    await user.save();

    // await UserModel.findOneAndUpdate({ telegramID }, { "user.registerFollow.step4.isTwitterOK": true }, { useFindAndModify: false }).exec();

    await bot.sendMessage(telegramID, BOT_STEP_6, {
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
        let totalUsers = await UserModel.find({ "registerFollow.step6.isFacebookOK": true }).countDocuments().exec();
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
            console.log("have error when handle resend email:", msg.from);
            return bot.sendMessage(telegramID, "have error when handle your request, please contact support support@bo.finance!")
        }
        let email = user.mail.email;
        let verifyCode = user.mail.verifyCode;
        let href = domain_verify_endpoint + "?code=" + verifyCode + "&telegramID=" + telegramID;
        console.log(curentTime(7), href);

        let msg = {
            to: email,
            from: sendFrom,
            subject: 'Please confirm your email to join Airdrop event',
            html: MAIL_TEMPLE.split("linklinklink").join(href)
        }

        transporter.sendMail(msg).catch(e => {
            console.log("have error in send email again", e);
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
        console.log(curentTime(7), href);
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
        console.log(curentTime(), telegramID, msg.text, "this mail have been used");
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
    bot.sendMessage(telegramID, BOT_STEP_1 + group_invite_link);
    return;
}

async function sendStep2_1({ telegramID }, bot) {
    bot.sendMessage(telegramID, BOT_STEP_2 + channel_invite_link);
    setTimeout(() => {
        return bot.sendMessage(telegramID, `Please click "Check Join Channel" to continue`, {
            reply_markup: reply_markup_keyboard_check
        })
    },5000)
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
        console.log(curentTime(7), "handleStart with ref id", telegramID, fullName, ref);
        bot.sendMessage(ref.toString(), "🎉You have one person joined with your referral.\n Each person joins and finishes all steps required, you will get 2 FIBO tokens bonus.\Keep going sir🎉")
        .then((a) => console.log(curentTime(), "send to parent ref ok")).catch(e => { console.log(curentTime(), "send to parent ref fail!", e); })
        result = await handleNewUserWithRef({ telegramID, fullName, ref });
    }
    //without ref id
    else {
        console.log(curentTime(7), "handleStart without ref id", telegramID, fullName);
        result = await handleNewUserNoRef({ telegramID, fullName });
    }
    if (!result.result) {
        console.log(curentTime(), "result false in handleStart");
        console.error(result);
        return;
    }

    console.log(curentTime(), "handleStart done", telegramID, fullName);
}
async function handleCampaign(bot, msg, campaign) {
    let telegramID = msg.from.id;
    let { first_name, last_name } = msg.from;
    let fullName = (first_name ? first_name : "") + " " + (last_name ? last_name : "");
    let user = await UserModel.findOne({ telegramID }, { registerFollow: 1, social: 1, wallet: 1 }).exec();
    if (user && !user.registerFollow.step2.isJoinGrouped) {
        console.log(curentTime(), "handleStart done", telegramID, fullName);
        let getChatMember = await bot.getChatMember(group_id.toString(), telegramID);
        if (getChatMember.status === "member") {
            console.log("user already in group but in db still false, so update it");
            await handleNewUserJoinGroup({ telegramID, fullName }, campaign);
            await sendStep2_1({ telegramID }, bot);
            return;
        } else {
            await sendStep1({ telegramID }, bot);
            return;
        }
    }
    console.log(campaign,10000)
    if (campaign==1 && user && user.registerFollow.step2.isJoinGrouped) {
        console.log(curentTime(), "handleStart done", telegramID, fullName);
        let getChatMember = await bot.getChatMember(channel_id.toString(), telegramID);
        if (getChatMember.status === "member") {
            console.log("user already in group but in db still false, so update it");
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

function handleInvite(bot, msg, first = false) {

    let toSend = "🎉🎢 Share your referral link to get 2 FIBO Tokens each user completed all step above:\n";
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
        bot.sendMessage(msg.from.id, "Please click on /start to join the Campaigns.")
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
