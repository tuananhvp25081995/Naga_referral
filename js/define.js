// let { mail_temple } = require("./temple");



let mail_temple = `

<div style="
    align-items: center;
    background-color: #f7f7f7;
    width: 100%;
    height: 100%;
    text-align: center;
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    padding-top: 40px;
    padding-bottom: 40px
  ">
    <div style="padding: 20px">
        <a style="
          padding: 12px;
          text-decoration: none;
          margin: 20px;
          font-size: 25px;
          font-weight: bolder;
        ">
            Naga Kingdom
        </a>
    </div>
    <div style="
      align-items: center;
      background-color: #ffffff;
      border: 0.5px solid #c7c7c7;
      box-sizing: border-box;
      border-radius: 10px;
      padding: 30px;
      width: 80%;
      margin: auto;
    ">
        <p style="font-size: 24px; font-weight: 600; font-size: #262626">
            Hello User!
        </p>
        <div style="line-height: 1.5; font-size: 18px; color: #616161">
            <p style="margin: 0px">You has registered our airdop</p>
            <p style="margin: 0px">Please confirm your email</p>
            <p style="margin: 0px">by click this link.</p>
        </div>
        <div style="margin: 40px">
            <a href="linklinklink" style="
          padding: 12px;
          background-color: #da7526;
          text-decoration: none;
          margin: 20px;
          color: #ffffff;
          font-size: 18px;
          border-radius: 20px;
        ">Verify now</a>
        </div>
        <div style="line-height: 1.5; font-size: 14px; color: #616180">
            <p style="margin: 0px">linklinklink</p>
        </div>
        <div style="line-height: 1.5; font-size: 16px; color: #616161">
            <p style="margin: 0px">You have problem with registration ?</p>
            <p style="margin: 0px">
                No problem - let us know
                <a href="mailto:support@nagakingdom.com">support@nagakingdom.com</a>
            </p>
        </div>
    </div>
</div>

`











// function base64encode(text) {
//     let buff = new Buffer.from(text.toString(), "utf-8");
//     return buff.toString("base64");
// }

// let BOT_PREFIX = "/";
// let BOT_INVITE_STRING_PREFIX = "invite";
// let BOT_LIST_STRING_PREFIX = "list";
// let BOT_COUNT_STRING_PREFIX = "count";
// let BOT_ENCODE_STRING_PREFIX = "encode";
// let BOT_DECODE_STRING_PREFIX = "decode";
// let BOT_GET_GROUPID_PREFIX = "groupid";

// let BOT_USERNAME = "minar80_bot";
// let BOT_ID = "1316284308";

// let BOT_WELCOM_NEW_USER = "Welcom to join our group";

// let GROUP_IDGROUP = "-1001386682491";
// let GROUP_INVITELINK = "https://t.me/FinFineGroup";

// // let APP_OAUTH_AUTHORIZED_USER = "rHyaa36zXW_FUr1m2ZpQDim0r14iB9Mag"
// let APP_CLIENT_ID = "bpcThYtThGoff_o0g4a9w";
// let APP_CLIENT_SECRET = "tXG7CtViLEA1o6ikow1nSZpSwxK8DtJB";

// let APP_AUTHORIZATION_BASIC_STRING =
//     "Basic " + base64encode(APP_CLIENT_ID + ":" + APP_CLIENT_SECRET);
// let APP_REDIRECT_URI = "https://f8d10f0747f4.ngrok.io/oauth_redirect";

// let BOT_WELCOM_AFTER_START =
//     "🎉 Welcom $$$$\n" +
//     "Please follow Campaign details :\n" +
//     "————————————————————————\n" +
//     "Conditions of participation\n" +
//     "✅Step 1: Join the FinFine Telegram Group\n" +
//     "✅Step 2: Enter Email address and access Email to confirm\n" +
//     "✅Step 3: Join in \n" +
//     "✅Step 4: Opening event start at 3:00PM  29th October 2020. Follow it and join event at least 30 minutes to receive reward\n" +
//     "————————————————————————\n" +
//     "Rewards: \n" +
//     "🎁 $20 FFT rewards when compeleting the above 4 conditions \n" +
//     "🎁 Affiliate campaign: $3 FFT rewards each user you invite (their have to compelete all step above) \n" +
//     "Let's get start ✨🎊\n";

// let BOT_DESCRIPTION =
//     "🎉🎉🎉 Chào mừng bạn đến chiến dịch Airdrop cho sự kiện trực tuyến ra mắt trao đổi tiền điện tử Conin - Trao đổi tiền điện tử đầu tiên xử lý trên 5 triệu giao dịch mỗi giây\n" +
//     "—————————————————————-\n" +
//     "🎁 Phần thưởng cho toàn bộ chiến dịch là 1.000.000 FFT\n" +
//     "—————————————————————-\n" +
//     "💎 hiện tại 1 FFT = $0.0143 và sẽ được niêm yết giao dịch trên https://conin.ai";

// let DOMAIN_VERIFY_ENDPOINT = "https://bot.nagakingdom.com/email_verify";
// // let DOMAIN_VERIFY_ENDPOINT = "http://175.41.170.179/email_verify"

// let EMAIL_TEMPLE = "";

module.exports = {
    // BOT_PREFIX,
    // BOT_INVITE_STRING_PREFIX,
    // BOT_LIST_STRING_PREFIX,
    // BOT_COUNT_STRING_PREFIX,
    // BOT_ENCODE_STRING_PREFIX,
    // BOT_DECODE_STRING_PREFIX,
    // BOT_GET_GROUPID_PREFIX,
    // BOT_USERNAME,
    // BOT_ID,

    // BOT_DESCRIPTION,
    // BOT_WELCOM_NEW_USER,
    // BOT_WELCOM_AFTER_START,

    // GROUP_IDGROUP,
    // GROUP_INVITELINK,

    // // APP_OAUTH_AUTHORIZED_USER,
    // APP_CLIENT_ID,
    // APP_CLIENT_SECRET,
    // APP_AUTHORIZATION_BASIC_STRING,
    // APP_REDIRECT_URI,

    MAIL_TEMPLE: mail_temple,

    // DOMAIN_VERIFY_ENDPOINT,
};
