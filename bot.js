require("dotenv").config();
const axios = require("axios").default;
const TelegramBot = require("node-telegram-bot-api");
var faker = require("faker");
let moment = require("moment");
var request = require('request')
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



const { Canvas, Image } = require("canvas");
const mergeImages = require("merge-images");
const fs = require("fs");
const path = require("path");
const sizeOf = require("image-size");
const { getMeta } = require("./src/lib/getSizeOfImage.js");
const { MESSAGE } = require("./src/bot//enum.js")
const resizeImg = require ("resize-img")

const OPTION = {
  YES: "yes",
  NO: "no",
};



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
let BOT_STEP_3 = `🍓 Step 3: Vote for Naga Kingdom on [Product Hunt](https://www.producthunt.com/posts/naga-kingdom?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-naga&#0045;kingdom).\n
🌹 Then copy your username and paste it here
(ex: @nagakingdom)`;
let BOT_STEP_4 = "🍓 Step 4: Enter your Solana wallet address.(You can create wallet here: https://solflare.com/)";
let BOT_STEP_6 = `✨ You have successfully completed all steps to gain the rewards.
The rewards will be sent directly to your wallet once the campaign ends.
Thanks for joining!
`;

let inviteTemple = `
🔊🔊Naga Referral Opening Airdrop
⏰ Time (UTC): 18 August - 30 September, 2022
💲 Total Airdrop Reward: $50 - $100,000
🔖 Share your affiliate link URL with your friend.\n
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
    keyboard: [[{ text: "Share" }, { text: "Check Info" }, { text: "Naga Snap" }]],
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
    if (type === "text" || type === "photo") {
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
                if (!user) {
                    await bot.sendMessage(telegramID, BOT_WELCOM_AFTER_START.replace("USERNAME", `[${fullName}](tg://user?id=${telegramID})`),
                        { parse_mode: "Markdown" }).catch(e => { console.log("error in first start!", e) })
                }
                //handle for new user without ref invite
                if (msg.text === "/start") {
                    return handleStart(bot, msg, null,null);
                }

                //handle with ref invite

                let id = text.slice(7).slice(0,text.slice(7).length-8)
                const refCode = text.slice(7).substr(text.slice(7).length - 8)
                if (!id) {
                    return handleStart(bot, msg, null,null);
                } else return handleStart(bot, msg, id.toString(),refCode.toString());
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
            
            // if (getChatMember.status === "member" && msg.text === "Check Join Group" && !user.registerFollow.passAll) {
            //     await handleNewUserJoinGroup({telegramID, fullName});
            //     await sendStep2_1({ telegramID }, bot);
            //     return
            // }

            // if (getChatMember.status != "member" && msg.text === "Check Join Group" && !user.registerFollow.passAll) {
            //     await sendStep1({ telegramID }, bot);
            //     return;
            // }

            //have this user in database. check it out
            if (user && !user.registerFollow.passAll) {
                if (!user.registerFollow.step2.isJoinGrouped) {
                    return handleStart(bot, msg, null,null);
                }

                if (!user.registerFollow.step3.isVoteOK && user.wallet.solana == "") {
                    axios
                        .get((process.env.GET_USER_URL).toString()+text.toString(), {
                            headers: {
                                'Content-Type': 'application/json',
                                'chain': process.env.CHAIN
                            },
                        })
                        .then(async function (response) {
                            if (response.data.data.userFound) {
                                await UserModel.updateOne({ telegramID }, { "wallet.changeWallet": false, "wallet.solana": response.data.data.user.publicKey ,"registerFollow.log": "step5","registerFollow.refCode":response.data.data.user.referralCode}).exec();
                                return sendStep3_1({telegramID},bot)
                            } else {
                                return bot.sendMessage(telegramID, "Oops!!!\nYou have entered an invalid wallet address or wallet does not exist in the system. Press submit wallet address again.");
                            }
                        })
                        .catch(function (error) {
                            console.log("error", error.message)
                            return bot.sendMessage(telegramID, "Oops!!!\nYou have entered an invalid wallet address or wallet does not exist in the system. Press submit wallet address again.") ;
                        });
                }

                if (user.registerFollow.step2.isJoinGrouped && user.wallet.solana != "" && !user.registerFollow.step3.isVoteOK) {
                    if (text.indexOf("@") != -1) {
                        await UserModel.updateOne({ telegramID }, {"registerFollow.step3.isVoteOK": true, "registerFollow.step3.userName": text, "registerFollow.step3.isWaitingPass": true,"registerFollow.log": "step4"}).exec();
                        await sendStep6_Finish({ telegramID }, bot);
                    }else {
                        return bot.sendMessage(telegramID, "You have entered an invalid username , please submit again username (ex:@alex)")
                    }
                }
            
                // if (user.wallet.solana != "" && user.registerFollow.step3.isVoteOK && !user.registerFollow.step4.isShareOK) {
                //     let checkIsVoted = null
                //     try {
                //         checkIsVoted = await parse(text, true);
                //     } catch (e) {
                //     }
                //     if (checkIsVoted.href.indexOf("https://nagakingdom.com") != -1 || checkIsVoted.href.indexOf("https://naga.gg") != -1) {
                //         if (checkIsVoted.query.refCode != undefined && checkIsVoted.query.refCode.length == 8) {
                //             await UserModel.updateOne({ telegramID }, { "registerFollow.step4.refCode": checkIsVoted.query.refCode ,"registerFollow.step4.isWaitingPass": true}).exec();
                //             return sendStep6_Finish({telegramID},bot)
                //         } else {
                //             return bot.sendMessage(telegramID, "You have entered an invalid link Affiliate, please submit again")
                //         }
                //     } else {
                //         return bot.sendMessage(telegramID, "You have entered an invalid link Affiliate, please submit again")
                //     }
                // }
            };
            if (user.registerFollow.isSnap && user.wallet.solana != "" && user.registerFollow.passAll) {
                let chatId = msg.chat.id;
                const directory = `static/${chatId}`
                const caption = {
                caption:
                    MESSAGE.CHOOSE_FRAME,
                };

                const media = [
                {
                    type: "photo",
                    media:
                    "https://png.pngtree.com/png-clipart/20210702/ourlarge/pngtree-gold-plated-photo-frame-design-png-image_3542960.jpg",
                    ...caption,
                },
                {
                    type: "photo",
                    media:
                    "https://png.pngtree.com/png-vector/20200428/ourlarge/pngtree-elegent-rectangle-golden-picture-and-photo-frame-vector-png-image_2195345.jpg",
                },
                {
                    type: "photo",
                    media:
                    "https://khungtranhre.com/wp-content/uploads/2020/08/khung-anh-png-19.jpg",
                },
                {
                    type: "photo",
                    media:
                    "https://i.pinimg.com/originals/95/e1/06/95e10601f0521ec7c455f464e48c68dc.png",
                },
                {
                    type: "photo",
                    media:
                    "https://png.pngtree.com/png-clipart/20190119/ourlarge/pngtree-vintage-old-time-photo-frame-vintage-paper-old-yellow-vintage-background-png-image_468660.jpg",
                },
                ];

                if (msg.photo) {
                try {
                    const file_id = msg.photo[msg.photo.length - 1].file_id;
                    const link = await bot.getFileLink(file_id);
                    const response = await axios({
                    url: link,
                    method: "GET",
                    responseType: "stream",
                    });

                    const Path = path.resolve(__dirname, `./${directory}`)
                    if (!fs.existsSync(Path)) {
                    fs.mkdirSync(directory)
                    }
                    const writer = fs.createWriteStream(Path + "/image.png");
                    response.data.pipe(writer);
                    return bot.sendMediaGroup(chatId, media);
                } catch (error) {
                    return bot.sendMessage(chatId, MESSAGE.ERROR)
                }
                } else if (!isNaN(parseInt(msg.text))) {
                const index = parseInt(msg.text);
                const frame = media[index - 1];
                if (!frame)
                    return bot.sendMessage(chatId, MESSAGE.FRAME_NOT_FOUND);
                else {
                    const img1 = frame.media;
                    try {
                    const metaData = await getMeta(img1);
                    const frame_data = {
                        x: metaData.width,
                        y: metaData.height,
                    };
                    const Path = path.resolve(__dirname, `./${directory}`, "image.png");
                    if (fs.existsSync(Path)) {
                        const img2 = fs.readFileSync(Path)
                        const dimensions2 = sizeOf(Path);
                        const photo_data = {
                        x: dimensions2.width,
                        y: dimensions2.height,
                        };
                        let b64
                        if(frame_data.x> photo_data.x && frame_data.y> photo_data.y){
                        b64=await mergeImages(
                            [
                            {
                                src: img1,
                            },
                            {
                                src: img2,
                                x: frame_data.x / 2 - photo_data.x / 2,
                                y: frame_data.y / 2 - photo_data.y / 2,
                            },
                            ],
                            {
                            Canvas: Canvas,
                            Image: Image,
                            }
                        )
                        }else{
                        const resizeWidth = frame_data.x*0.8
                        const resizeHeight = frame_data.y*0.8
                        const resize_Image=await resizeImg(img2,{
                            width:resizeWidth,
                            height:resizeHeight
                        })
                        b64=await mergeImages(
                            [
                            {
                                src: img1,
                            },
                            {
                                src: resize_Image,
                                x: frame_data.x / 2 - resizeWidth/ 2,
                                y: frame_data.y / 2 - resizeHeight / 2,
                            },
                            ],
                            {
                            Canvas: Canvas,
                            Image: Image,
                            }
                        )
                        }
                        const file_option = {
                        filename: "merge image",
                        contentType: "image/jpg",
                        };
                        await bot.sendMessage(chatId, MESSAGE.WH_QUESTION,{ disable_web_page_preview: true, reply_markup: reply_markup_keyboard });
                        await UserModel.updateOne({ telegramID }, {"registerFollow.isSnap": false}).exec();
                        return bot.sendPhoto(
                        chatId,
                        Buffer.from(b64.substr(21), "base64"),
                        file_option
                        );
                    } else {
                        return bot.sendMessage(chatId, MESSAGE.PICTURE_NOT_FOUND);
                    }
                    } catch (error) {
                        return bot.sendMessage(chatId, MESSAGE.ERROR)
                    }
                }
                } else {
                try {
                    if (msg.text.toString().toLocaleLowerCase().includes(OPTION.YES)) {
                    const Path = path.resolve(__dirname, `./${directory}`, "image.png");
                    if (fs.existsSync(Path)) {
                        fs.unlinkSync(Path)
                        fs.rmdirSync(directory)
                    }
                    } else if (msg.text.toString().toLocaleLowerCase().includes(OPTION.NO)) {
                        return bot.sendMediaGroup(chatId, media);
                    } else {
                        return bot.sendMessage(chatId, MESSAGE.POST_PHOTO);
                    }
                } catch (error) {
                    return bot.sendMessage(chatId, MESSAGE.ERROR)
                }
                }
            }

            //switch commands without payload
            if (BOT_STATUS_SWITCH && user.registerFollow.sendAllStep && user.wallet.solana != "") {
                let user = await UserModel.findOne({telegramID})
                switch (text) {
                    case "share":
                    case "Share":
                        handleInvite(bot, msg);
                        break;
                    case "Check Info":
                        const myWallet = user.wallet.solana
                        axios
                        .get((process.env.GET_F1_URL).toString()+myWallet.toString(), {
                            headers: {
                                'Content-Type': 'application/json',
                                'chain': process.env.CHAIN
                            },
                        })
                        .then(async function (response) {
                            if (response.data) {
                                bot.sendMessage(telegramID, "Total Referrals: \n" + JSON.stringify(response.data.data.f1s), { disable_web_page_preview: true, reply_markup: reply_markup_keyboard });
                            } else {
                                return bot.sendMessage(telegramID, "User does not exist");
                            }
                        })
                        .catch(function (error) {
                            console.log("error", error.message)
                            return bot.sendMessage(telegramID, "User does not exist") ;
                        });

                        break;
                    case "Naga Snap":
                        await UserModel.updateOne({ telegramID }, {"registerFollow.isSnap": true}).exec();
                        await bot.sendMessage(telegramID, MESSAGE.POST_PHOTO);
                        break
                    default:
                        if (text != "Naga Snap" && !user.registerFollow.isSnap) {
                            bot.sendMessage(telegramID, BOT_STEP_6, { disable_web_page_preview: true, reply_markup: reply_markup_keyboard });
                            break
                        }
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
    await sendStep3_1({ telegramID }, bot);
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

async function sendStep3_1({ telegramID }, bot) {
    let user = await UserModel.findOne({ telegramID }).exec();
    if (!user) return;
    user.registerFollow.log = "step3";
    await user.save();
    bot.sendMessage(telegramID, BOT_STEP_3 , {
        parse_mode: "Markdown", disable_web_page_preview: true, reply_markup: {
            remove_keyboard: true
        }
    });
    return;
}

async function sendStep2_1({ telegramID }, bot) {
    let refCode;
    let user = await UserModel.findOne({ telegramID }, {refCodeParent:1}).exec();
    if (user.refCodeParent == "") {
        refCode = "c0VeGl6a"
    } else {
        refCode = user.refCodeParent
    }
    let BOT_STEP_2 = `🍓 Step 2: Enter Naga Kingdom through [here](https://naga.gg/?refCode=${refCode}) & Connect your Solana wallet.\n`;
    await bot.sendMessage(telegramID, BOT_STEP_2, {
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

async function sendStep6_Finish({ telegramID, msg }) {
    let user = await UserModel.findOne({ telegramID }).exec();
    if (!user) return;
    user.registerFollow.passAll = true
    user.registerFollow.sendAllStep = true
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
        let totalUsers = await UserModel.find({ "registerFollow.passAll": true }).countDocuments().exec();
        sparkles.emit("totalUsers", { totalUsers });
    } catch (e) {
        console.error(e);
    }

}

async function handleStart(bot, msg, ref,refCode) {
    let telegramID = msg.from.id;
    let { first_name, last_name } = msg.from;
    let fullName = (first_name ? first_name : "") + " " + (last_name ? last_name : "");
    let result = null;
    //with ref id
    if (ref) {
        bot.sendMessage(ref.toString(), "🎉You have one person joined with your referral.\n You'll be regarded as a successful referral once the member referred registers and owns 01 NFT in Naga Kingdom. \Keep going sir🎉")
        .then((a) => console.log(curentTime(), "send to parent ref ok")).catch(e => { console.log(curentTime(), "send to parent ref fail!", e); })
        result = await handleNewUserWithRef({ telegramID, fullName, ref, refCode });
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
        return setTimeout(() => { sendStep4_1({telegramID},bot)},1000)
    }

    if (getChatMember.status === "member" && user.registerFollow.step2.isJoinGrouped  && user.wallet.solana == "") {
        await handleNewUserJoinGroup({ telegramID, fullName });
        await sendStep2_1({ telegramID }, bot);
        return setTimeout(() => { sendStep4_1({telegramID},bot)},1000)
    } else if (!user.registerFollow.step2.isJoinGrouped && user.wallet.solana == "") {
        await sendStep1({ telegramID }, bot);
        return;
    }

    if (user.registerFollow.step2.isJoinGrouped && user.wallet.solana != "" && !user.registerFollow.step3.isVoteOK) {
        return sendStep3_1({ telegramID }, bot);
    }

    if (user.registerFollow.passAll&&user.registerFollow.sendAllStep &&user.wallet.solana != "" && user.registerFollow.step3.isVoteOK) {
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
    let url = "https://t.me/" + bot_username + "?start=" + msg.from.id + user.registerFollow.refCode;
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
