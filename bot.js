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
const { PublicKey } = require('@solana/web3.js');

let {
    handleNewUserNoRef,
    handleNewUserWithRef,
    handleNewUserJoinGroup,
    getStatstics,
} = require("./controllers/userControllers");

const { MAIL_TEMPLE } = require("./js/define");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true, });

let group_id,
    isPause = false,
    group_invite_link = null,
    channel_invite_link = null,
    bot_username = null,
    BOT_WELCOM_AFTER_START = "",
    BOT_STATUS_SWITCH = true;

let BOT_STEP_1 = `🍓 Step 1: Join [Naga Kingdom Affiliate group](https://t.me/nagasarapet) on Telegram.`;
let BOT_STEP_2 = `🍓 Step 2: Tweet & Retweet Naga Kingdom on [Twitter](https://twitter.com/NagaKingdom).\n
🌹 Then copy your username and paste it here`;
let BOT_STEP_3 = "🍓 Step 3: Enter Naga Kingdom through [here](https://naga.gg/?refCode=c0VeGl6a) & Connect your Solana wallet.\n";
let BOT_STEP_4 = "🍓 Step 4: Enter your Solana wallet address.";
let BOT_STEP_5 = `🍓 Step 5: Share your Affiliate link to at least 01 friend & Enter your Affiliate link here. \n
⚡️ Note: You'll be regarded as a successful referral once the member referred registers and owns 01 NFT in Naga Kingdom`;
let BOT_STEP_6 = `✨ You have successfully completed all steps to gain the rewards.
The rewards will be sent directly to your wallet once the campaign ends.
Thanks for joining!
`;
let BOT_CHANGE_WALLET = "✨Enter your Solana Address here (create at Solflare, Trust, coin98, Exodus):\n(ex: 76j4T2MASV6KjrEde57zKbok5gXctDTRNiYY1UhwRTLQ).\nNote:We do NOT accept any BSC or ETH addresses, be alert! Naga Kingdom is developed on Solana Blockchain. Smart contracts are being audited and will be published soon."

let inviteTemple = `
🔊🔊Naga Referral Opening Airdrop
⏰ Time (UTC): 18 August - 30 September, 2022
💲 Total Airdrop Reward: $50 - $100,000
🔖 Start now: URL\n
🎁 Referral Rewards (Nine-Tailed Soul): For each new referral, you’ll get $50
For example:
    - $50 for 1 successful referral
    - $500 for 10 successful referrals
    - $5,000 for 100 successful referrals
    - $50,000 for 1000 successful referrals

🎁 Bonus Rewards - Top Rank Referral Rewards (USDC):
    - 500 USDC for +100 successful referrals
    - 3,000 USDC for +500 successful referrals
    - 8,000 USDC for +1,000 successful referrals
    - 50,000 USDC for +5,000 successful referrals

🎁Airdrop rewards will be distributed shortly after the results are published.
`

let BOT_EVENT_END = `Hello our value user.\nThe number of participants in the finfine ecosystem launch event has reached the limit, you cannot participate in this airdrop. We thank you for contacting us.\nPlease keep in touch, we will inform you of the latest airdrop.`
//00:00, 30 September, 2022
let timeEnd = 1664470800000

sparkles.on("config_change", async () => {
    try {
        let config = await DashboardModel.findOne({ config: 1 });
        group_id = config.group_id;
        group_invite_link = config.group_invite_link;
        channel_invite_link = config.channel_invite_link,
        bot_username = config.bot_username;
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

function Valication(address) {
    try {
        const publicKeyInUint8 = new PublicKey(address).toBytes();
        let  isSolana =  PublicKey.isOnCurve(publicKeyInUint8)
        return isSolana
    } catch (error) {
        return false
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
            let user = await UserModel.findOne({ telegramID }, { registerFollow: 1, wallet: 1 }).exec();
            if (Date.now() > timeEnd) {
                if (!user) {
                    bot.sendMessage(telegramID, BOT_EVENT_END, {reply_markup: reply_markup_keyboard_end}).catch(e => { console.log(e) })
                    return;
                }
            }
            //user didn't have in database
            if (text.startsWith("/start")) {
                if (user && !user.registerFollow.passAll) {
                    await bot.sendMessage(telegramID, BOT_WELCOM_AFTER_START.replace("USERNAME", `[${fullName}](tg://user?id=${telegramID})`),
                        { parse_mode: "Markdown" }).catch(e => { console.log("error in first start!", e) })
                }
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

            if (!user) {
                return bot.sendMessage(telegramID,
                    "Have an error when handle your request.\nPlease click /start to start again.", {
                    reply_markup: {
                        remove_keyboard: true
                    }
                })
            }

            let getChatMember = await bot.getChatMember(group_id.toString(), telegramID);
            
            if (getChatMember.status === "member" && msg.text === "Check Join Group" && !user.registerFollow.passAll) {
                await handleNewUserJoinGroup({telegramID, fullName});
                await sendStep2_1({ telegramID }, bot);
                return
            }

            if (getChatMember.status != "member" && msg.text === "Check Join Group" && !user.registerFollow.passAll) {
                await sendStep1({ telegramID }, bot);
                return;
            }

            //have this user in database. check it out
            if (user && !user.registerFollow.passAll) {
                if (!user.registerFollow.step2.isJoinGrouped) {
                    return handleStart(bot, msg, null);
                }

                if (user.registerFollow.step2.isJoinGrouped && !user.registerFollow.step3.isTwitterOK) {
                    if (text.indexOf("@") != -1) {
                        await UserModel.updateOne({ telegramID }, {"registerFollow.step3.isTwitterOK": true, "registerFollow.step3.userName": text, "registerFollow.step3.isWaitingPass": true,"registerFollow.log": "step4"}).exec();
                        await sendStep3_1({ telegramID }, bot);
                        return setTimeout(() => { sendStep4_1({telegramID},bot)},1000)
                    }else {
                        return bot.sendMessage(telegramID, "You have entered an invalid username , please submit again username (ex:@alex)")
                    }
                }

                if (user.registerFollow.step3.isTwitterOK && user.wallet.solana == "") {
                    var valid = Valication(text)
                    if (valid) {
                        await UserModel.updateOne({ telegramID }, { "wallet.changeWallet": false, "wallet.solana": text ,"registerFollow.log": "step5"}).exec();
                        return sendStep5_1({telegramID},bot)
                    } else {
                        return setTimeout(() => bot.sendMessage(telegramID, "Oops!!!\nYou have entered an invalid wallet address. Press submit wallet address again."),500) ;
                    }
                }

                if (user.wallet.solana != "" && user.registerFollow.step3.isTwitterOK && !user.registerFollow.step4.isShareOK) {
                    let checkIsVoted = null
                    try {
                        checkIsVoted = await parse(text, true);
                    } catch (e) {
                    }
                    if (checkIsVoted.href.indexOf("https://nagakingdom.com") != -1 || checkIsVoted.href.indexOf("https://naga.gg") != -1) {
                        if (checkIsVoted.query.refCode != undefined) {
                            await UserModel.updateOne({ telegramID }, { "registerFollow.step4.refCode": checkIsVoted.query.refCode ,"registerFollow.step4.isWaitingPass": true}).exec();
                            return sendStep6_Finish({telegramID},bot)
                        }
                    } else {
                        return bot.sendMessage(telegramID, "You have entered an invalid link Affiliate, please submit again")
                    }
                }
            };
        
            if (user && user.wallet.changeWallet) {
                var valid = Valication(text)
                if (valid) {
                    await UserModel.updateOne({ telegramID }, { "wallet.changeWallet": false, "wallet.solana": text });

                    if (!user.registerFollow.sendAllStep) {
                        await UserModel.findOneAndUpdate({ telegramID }, { "registerFollow.sendAllStep": true });
                        await sendStep6_Finish({ telegramID, msg });
                        return;
                    }
                    return bot.sendMessage(telegramID, "Your wallet was updated.");
                } else {
                    if (user.registerFollow.passAll) {
                        return setTimeout(() => bot.sendMessage(telegramID, "Oops!!!\nYou have entered an invalid wallet address. Press submit wallet address again."),500) ;
                    }
                    await UserModel.updateOne({ telegramID }, { "wallet.changeWallet": false });
                }
            }

            //switch commands without payload
            if (BOT_STATUS_SWITCH && user.registerFollow.sendAllStep) {
                switch (text) {
                    case "share":
                    case "Share":
                        handleInvite(bot, msg);
                        break;
                    case "news":
                        bot.sendMessage(telegramID,
                            "Currently do not have any news yet, we will notify for you in futher news.\nHope you have a nice day",
                            { disable_web_page_preview: true }
                        );
                        break;
                    case "Change Wallet":
                        await UserModel.updateOne({ telegramID }, { "wallet.changeWallet": true });
                        bot.sendMessage(telegramID, BOT_CHANGE_WALLET, { disable_web_page_preview: true, reply_markup: reply_markup_keyboard });
                        break;
                    default:
                        bot.sendMessage(telegramID, BOT_STEP_6, { disable_web_page_preview: true, reply_markup: reply_markup_keyboard });
                        break
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

async function sendStep1({ telegramID }, bot) {
    bot.sendMessage(telegramID, BOT_STEP_1, {
        parse_mode: "Markdown",
        disable_web_page_preview: true,
        reply_markup: reply_markup_keyboard_checks
    });
    setTimeout(() => {
        return bot.sendMessage(telegramID, `Please click "Check Join Group" to continue`)
    },1000)
    return;
}

async function sendStep2_1({ telegramID }, bot) {
    let user = await UserModel.findOne({ telegramID }).exec();
    if (!user) return;
    user.registerFollow.log = "step3";
    await user.save();
    bot.sendMessage(telegramID, BOT_STEP_2 , {
        parse_mode: "Markdown", disable_web_page_preview: true, reply_markup: {
            remove_keyboard: true
        }
    });
    return;
}

async function sendStep3_1({ telegramID }, bot) {
    await bot.sendMessage(telegramID, BOT_STEP_3, {
        parse_mode: "Markdown", disable_web_page_preview: true, reply_markup: {
            remove_keyboard: true
        }
    });
}

async function sendStep4_1({ telegramID }, bot) {
    await bot.sendMessage(telegramID, BOT_STEP_4, {
        parse_mode: "Markdown", disable_web_page_preview: true, reply_markup: {
            remove_keyboard: true
        }
    });
}

async function sendStep5_1({ telegramID }, bot) {
    await bot.sendMessage(telegramID, BOT_STEP_5, {
        parse_mode: "Markdown", disable_web_page_preview: true, reply_markup: {
            remove_keyboard: true
        }
    });
}

async function sendStep6_Finish({ telegramID, msg }) {
    let user = await UserModel.findOne({ telegramID }).exec();
    if (!user) return;
    user.registerFollow.passAll = true
    user.registerFollow.sendAllStep = true
    user.registerFollow.step4.isShareOK = true;
    user.registerFollow.log = "step6";
    await user.save();
    
    await bot.sendMessage(telegramID, BOT_STEP_6, {
        disable_web_page_preview: true,
        reply_markup: reply_markup_keyboard,
    });

    let msgs = {
        from: {
            id: telegramID
        }
    };
    handleInvite(bot, msgs)

    try {
        let totalUsers = await UserModel.find({ "registerFollow.step4.isShareOK": true }).countDocuments().exec();
        sparkles.emit("totalUsers", { totalUsers });
    } catch (e) {
        console.error(e);
    }

}


async function handleStart(bot, msg, ref) {
    let telegramID = msg.from.id;
    let { first_name, last_name } = msg.from;
    let fullName = (first_name ? first_name : "") + " " + (last_name ? last_name : "");
    let result = null;
    
    //with ref id
    if (ref) {
        bot.sendMessage(ref.toString(), "🎉You have one person joined with your referral.\n You'll be regarded as a successful referral once the member referred registers and owns 01 NFT in Naga Kingdom. \Keep going sir🎉")
        .then((a) => console.log(curentTime(), "send to parent ref ok")).catch(e => { console.log(curentTime(), "send to parent ref fail!", e); })
        result = await handleNewUserWithRef({ telegramID, fullName, ref });
    }
    //without ref id
    else {
        result = await handleNewUserNoRef({ telegramID, fullName });
    }

    let user = await UserModel.findOne({ telegramID }, { registerFollow: 1, wallet:1}).exec();

    if (!result.result) {
        console.error(result);
        return;
    }
    let getChatMember = await bot.getChatMember(group_id.toString(), telegramID);
    if (getChatMember.status === "member" && msg.text == "Check Join Group") {
        await handleNewUserJoinGroup({ telegramID, fullName });
        await sendStep2_1({ telegramID }, bot);
        return;
    }

    if (getChatMember.status === "member" && user.registerFollow.step2.isJoinGrouped  && !user.registerFollow.step3.isTwitterOK) {
        await handleNewUserJoinGroup({ telegramID, fullName });
        await sendStep2_1({ telegramID }, bot);
        return;
    } else if (!user.registerFollow.step2.isJoinGrouped && !user.registerFollow.step3.isTwitterOK) {
        await sendStep1({ telegramID }, bot);
        return;
    }

    if (getChatMember.status === "member" && user.registerFollow.step3.isTwitterOK && user.wallet.solana == "") {
        await sendStep3_1({ telegramID }, bot);
        return setTimeout(() => { sendStep4_1({telegramID},bot)},1000)
    }

    if (getChatMember.status === "member" && user.wallet.solana != "" && !user.registerFollow.step4.isShareOK) {
        await sendStep5_1({ telegramID }, bot);
        return
    }

    if (user.registerFollow.step4.isShareOK && user.registerFollow.passAll&&user.registerFollow.sendAllStep &&user.wallet.solana != "") {
        await sendStep6_Finish({ telegramID })
        return;
    } else if (user){
        return setTimeout(() => {sendStep1({telegramID},bot)},1000)
    }
    // let getChatMember = await bot.getChatMember(group_id.toString(), telegramID);
    // console.log(curentTime(), getChatMember.status);
    // if (getChatMember.status === "member") {
    //     await handleNewUserJoinGroup({ telegramID, fullName });
    //     await sendStep2_1({ telegramID }, bot);
    //     return;
    // } else {
    //     await sendStep1({ telegramID }, bot);
    //     return;
    // }
}

async function handleInvite(bot, msg) {
    let user = await UserModel.findOne({ telegramID:msg.from.id }, { registerFollow: 1}).exec();
    let toSend = "🎉🎢 Share your affiliate  link. You'll be regarded as a successful referral once the member referred registers and owns 01 NFT in Naga Kingdom.:\n";
    let url = "https://nagakingdom.com"+"?refCode=" + user.registerFollow.step4.refCode;
    toSend += url;
    let full = inviteTemple.replace("URL", url)

        bot.sendMessage(
            msg.from.id,
            full,
            {
                disable_web_page_preview: true,
            }
        );
    return;
}
