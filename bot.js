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
    setWaitingEnterEmail,
    setEmailAndUpdate,
    removeEmailandUpdate,
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

let sendFrom = "Dogedu Airdrop <no_reply@dogedu.org>"
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
    isPause = false,
    group_invite_link = null,
    bot_username = null,
    domain_verify_endpoint = null,
    BOT_WELCOM_AFTER_START = "",
    BOT_STATUS_SWITCH = true;

let BOT_STEP_1 = "🎄 Step 1: Join the Dogedu Group by clicking this:\n";
let BOT_STEP_2 = "🎄 Step 2: Enter your email to confirm registration:";
let BOT_WRONG_EMAIL = "Your email is invalid. Please check and enter your email again.";
let BOT_EMAIL_SUCCESS = "Email is successfully verified.";
let BOT_STEP_3 = `Step 3:
🧨 Follow our [Twitter](https://twitter.com/EduDogu)
🧨 And input your twitter profile link`
// The reward is 1, 000, 000 Tokens for the entire campaign.Let's share the campaign to receive bonuses by press 'Share' button
let BOT_STEP_5 = "✨ You have successfully completed 3 steps to gain the rewards . Please wait for our latest notice via this bot to receive your prize.";
let BOT_CHANGE_WALLET = "✨ Enter your DOGU Tokens address to claim airdrop:\n(ex: 0xa9CdF87D7f988c0ae5cc24754C612D3cff029F80).\nNote:The wallet must support Binance Smart Chain and BEP-20 assets"

let BOT_Statstics_Temple = `🎁Estimated Balance: Tokens DOGU
Total Balance: $TOKEN DOGU 
Tokens for airdop event will be updated after verifying manually by bounty manager at the end of airdrop.\n 
📎Referral link: REFLINK
👬Referrals: REFCOUNT
-------------------\nYour details: 
Email: EMAIL 
Telegram ID: TELEGRAM  
Twitter: TWITTER  
Tokens DOGU wallet address: \n`


let inviteTemple = `
🔊🔊Dogedu Opening Airdrop
🎉 Time: 28/04/2021  -->  01/05/2021
💲 Total Airdrop Reward: 1000 Billions DOGU Tokens
🔖 Start now: URL\n
🎁Reward: 
- 10,000,000 DOGU Tokens reward for completing the 3 steps above
- 5,000,000 DOGU Tokens reward for each successful referral (the member you referred to must also complete 3 steps of the campaign)
Dogedu: https://dogedu.org
`


let BOT_EVENT_END = `Hello our value user.\nThe number of participants in the finfine ecosystem launch event has reached the limit, you cannot participate in this airdrop. We thank you for contacting us.\nPlease keep in touch, we will inform you of the latest airdrop.`
let emailDomainAllow = ["aol.com", "gmail.com", "hotmail.com", "hotmail.co.uk", "live.com", "yahoo.com", "yahoo.co.uk", "yandex.com", "hotmail.it"];

//07:00 09/15/2021 GMT+7
let timeEnd = 1631638800000

sparkles.on("config_change", async () => {
    try {
        let config = await DashboardModel.findOne({ config: 1 });
        group_id = config.group_id;
        group_invite_link = config.group_invite_link;
        bot_username = config.bot_username;
        domain_verify_endpoint = config.domain_verify_endpoint;
        BOT_WELCOM_AFTER_START = config.bot_text.BOT_WELCOM_AFTER_START;
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

let reply_markup_keyboard = {
    keyboard: [[{ text: "Share" }, { text: "Change Wallet" }]],
    resize_keyboard: true,
};

let reply_markup_keyboard_end = {
    keyboard: [[{ text: "START" }]],
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
            let user = await UserModel.findOne({ telegramID }, { registerFollow: 1, social: 1, wallet: 1 }).exec();
            if (Date.now() > timeEnd) {
                if (!user || !user.registerFollow.step4.isTwitterOK) {
                    console.log(curentTime(7), fullName, telegramID, "End event. With text:", text);
                    bot.sendMessage(telegramID, BOT_EVENT_END, {reply_markup: reply_markup_keyboard_end}).catch(e => { console.log(e) })
                    return;
                }
            }
            //user didn't have in database
            if (!user && text.startsWith("/start")) {
                bot.sendMessage(telegramID,
                    BOT_WELCOM_AFTER_START.replace("USERNAME", `[${fullName}](tg://user?id=${telegramID})`),
                    { parse_mode: "Markdown" }).catch(e => { console.log("error in first start!", e) })

                //handle for new user without ref invite
                if (msg.text === "/start") {
                    return handleStart(bot, msg, null);
                }

                //handle with ref invite
                let id = text.slice(7).replace(/\D/g, "");
                if (!id) {
                    console.log(curentTime(7), telegramID, fullName, "invite link is not valid");
                    return handleStart(bot, msg, null);
                } else return handleStart(bot, msg, id.toString());
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

            //have this user in database. check it out
            if (user && !user.registerFollow.passAll) {

                if (!user.registerFollow.step2.isJoined) {
                    return bot.sendMessage(telegramID, "Please join telegram group in Step 1 Click ").catch(e => { console.log("error in check first step!", e) });
                }

                if (text === "change email" && !user.registerFollow.passAll) {
                    return handleReEnterEmailAgain(bot, msg);
                }

                if (text === "resend email" && user.registerFollow.step3.isWaitingVerify) {
                    return handleReSendEmailAgain(bot, msg);
                }

                if (user.registerFollow.step3.isWaitingEnterEmail) {
                    console.log(curentTime(7), telegramID, "email receive from user typeing:", text);
                    return handleEnterEmail(bot, msg);
                }

                if (user.registerFollow.log === "step3" && user.registerFollow.step3.isWaitingVerify) {
                    return bot.sendMessage(telegramID, "Access the email to confirm registration",
                        { reply_markup: reply_markup_keyboard_verify_email }
                    ).catch(e => console.log("have error in send email noti!", e))
                }
                if (user && !user.registerFollow.step4.isTwitterOK) {
                    console.log("in step4 ok with text link", telegramID, fullName, text);
                    let checkTwitter = null
                    try {
                        console.log(text)
                        checkTwitter = await parse(text, true);
                    } catch (e) {
                        console.log("have err in checkTwitter", e);
                    }
                    console.log(checkTwitter,1000)
                    if (checkTwitter.hostname === "twitter.com" || checkTwitter.hostname === "mobile.twitter.com") {
                        await UserModel.updateOne({ telegramID }, { "registerFollow.step4.isTwitterOK": true,"registerFollow.passAll": true, "social.twitter": text, "wallet.changeWallet": true }).exec();
                        return bot.sendMessage(telegramID, BOT_CHANGE_WALLET);
                    } else {
                        bot.sendMessage(telegramID, "You have entered an invalid link profile, please submit again: ")
                        setTimeout(() => {sendStep3_Twitter({telegramID})},1000)
                    }
                }
                else {
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
                        await sendStep4_Finish({ telegramID, msg });
                        return;
                    }
                    return bot.sendMessage(telegramID, "Your wallet was updated.");
                } else {
                    if (!user.registerFollow.sendAllStep) {
                        return bot.sendMessage(telegramID, "Oops !!!\nYou have entered an invalid wallet address. Press submit wallet address again");
                    }
                    await UserModel.updateOne({ telegramID }, { "wallet.changeWallet": false });
                    return bot.sendMessage(telegramID, "Oops !!!\nYou have entered an invalid wallet address. Press *Change Wallet* to change again", { parse_mode: "markdown", });
                }
            }

            //switch commands without payload
            if (BOT_STATUS_SWITCH && user.registerFollow.step4.isTwitterOK) {
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
                        bot.sendMessage(telegramID, "You have successfully completed 3 steps to gain the rewards . Please wait for our latest notice via this bot to receive your prize");
                }
            }

        }


    } else if (type === "left_chat_member") {
        handleLeftChatMember(bot, msg);
    } else if (type === "new_chat_members") {
        handleNewChatMember(bot, msg);
    }
});

bot.on("error", (...parameters) => {
    console.error(parameters);
});

bot.on("polling_error", (error) => {
    console.log(curentTime(), error); // => 'EFATAL'
});

async function handleNewChatMember(bot, msg) {
    try {
        await bot.deleteMessage(msg.chat.id, msg.message_id);
        console.log(`${curentTime(7)} ${chalk.blue(fullName)}(${telegramID}) joined ${chalk.blue(msg.chat.title)}(${msg.chat.id}): joined mess was deleted`)
    } catch (e) {
        console.log("was deleted")
    }
    let telegramID = msg.from.id;
    let { first_name, last_name, id } = msg.from;
    let fullName = (first_name ? first_name : "") + " " + (last_name ? last_name : "");
    // console.log(curentTime(7), telegramID, fullName, "join group chat", msg.chat.title);
    let user = await handleNewUserJoinGroup({ telegramID, fullName });

    if (user) {
        if (user.registerFollow.log === "step3") {
            if (user.registerFollow.step3.isWaitingEnterEmail) {
                await sendStep3_1({ telegramID }, bot);
            }
        }
    }

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
    await bot.sendMessage(telegramID, BOT_STEP_3, {
        parse_mode: "Markdown", disable_web_page_preview: true, reply_markup: {
            remove_keyboard: true
        }
    });
}

async function sendStep4_Finish({ telegramID }) {

    let user = await UserModel.findOne({ telegramID }).exec();
    if (!user) return;
    user.registerFollow.step4.isTwitterOK = true;
    await user.save();

    // await UserModel.findOneAndUpdate({ telegramID }, { "user.registerFollow.step4.isTwitterOK": true }, { useFindAndModify: false }).exec();

    await bot.sendMessage(telegramID, BOT_STEP_5, {
        disable_web_page_preview: true,
        reply_markup: reply_markup_keyboard,
    });


    let msg = {
        from: {
            id: telegramID
        }
    };

    handleInvite(bot, msg, true)

    try {
        let totalUsers = await UserModel.find({ "registerFollow.step4.isTwitterOK": true }).countDocuments().exec();
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

async function handleStatstics(bot, msg) {
    let telegramID = msg.from.id;
    let back = await getStatstics({ telegramID });

    let user = await UserModel.findOne({ telegramID });
    if (!user) return;
    let url = "https://t.me/" + bot_username + "?start=" + telegramID;



    if (back.result && user) {
        let toSend = BOT_Statstics_Temple.toString()
            .replace("EMAIL", user.mail.email.toString())
            .replace("WALLET", user.wallet.bep20.toString())
            .replace("TELEGRAM", telegramID)
            .replace("ETKREF", back.ETKREF.toString())
            .replace("TOKEN", back.FTTTotal.toString())
            .replace("REFCOUNT", back.inviteTotal.toString())
            .replace("REFCOUNT", back.inviteGetGiftSuccess.toString())
            .replace("REFLINK", url.toString())
            .replace("TWITTER", user.social.twitter.toString())

        bot.sendMessage(telegramID, toSend, { disable_web_page_preview: true, reply_markup: reply_markup_keyboard })
            .catch(e => console.log(e))

    }
}

async function handleReSendEmailAgain(bot, msg) {
    let telegramID = msg.from.id;
    try {
        let user = await UserModel.findOne({ telegramID, "mail.isVerify": false }, { mail: 1 }).exec();
        if (!user) {
            console.log("have error when handle resend email:", msg.from);
            return bot.sendMessage(telegramID, "have error when handle your request, please contact support support@dogedu.org!")
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
async function sendStep3_1({ telegramID }, bot) {
    bot.sendMessage(telegramID, BOT_STEP_2);
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
        bot.sendMessage(ref.toString(), "🎉You have one person joined with your referral.\n Each person joins and finishes all steps required, you will get $3 IST bonus.\Keep going sir🎉")
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


    let getChatMember = await bot.getChatMember(group_id.toString(), telegramID);
    if (getChatMember.status === "member") {
        console.log("user already in group but in db still false, so update it");
        await handleNewUserJoinGroup({ telegramID, fullName });
        await sendStep3_1({ telegramID }, bot);
        return;
    } else {
        await sendStep1({ telegramID }, bot);
        return;
    }


}

function handleInvite(bot, msg, first = false) {

    let toSend = "🎉🎢 Share your referral link to get 5.000.000 DOGU each user completed all step above:\n";
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
