const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schemaDashboard = new Schema(
    {
        config: { type: Number, default: 1 },
        username: { type: String, default: "admin" },
        password: { type: String, default: "hi" },

        token: {
            access_token: { type: String, default: "" },
            refresh_token: { type: String, default: "" },
            token_refresh_at: { type: Date, default: Date.now() },
            scope: { type: String, default: "" },
            token_type: { type: String, default: "bearer" },
        },

        status: {
            privateChat: { type: Boolean, default: true },
            groupChat: { type: Boolean, default: true },
            switch: { type: Boolean, default: true },
            isPause: { type: Boolean, default: false }
        },

        user_oauth_code: { type: String, default: "VuMT59Uxyj_FUr1m2ZpQDim0r14iB9Mag" },
        app_client_id: { type: String, default: "bpcThYtThGoff_o0g4a9w" },
        app_client_secret: { type: String, default: "tXG7CtViLEA1o6ikow1nSZpSwxK8DtJB" },

        //846 2720 4564 for test
        webinarId: { type: String, default: "84627204564" },

        //-1001417029522  for test group
        //-1001420387772 for main group
        group_id: { type: String, default: "-1001455100944" },

        group_invite_link: { type: String, default: "https://t.me/pixiuswapchannel", },

        redirect_uri: { type: String, default: "https%3A%2F%2Fpixiuswap.org%2Foauth" },
        bot_username: { type: String, default: "PixiuSwap_bot" },
        domain: { type: String, default: "https://pixiuswap.org" },
        domain_verify_endpoint: {
            type: String,
            default: "https://bot.pixiuswap.org/email_verify",
        },

        bot_text: {
            BOT_WELCOM_AFTER_START: {
                type: String,
                default: `Welcome USERNAME
Please follow up to get started in the campaign
————————————————————————
Conditions of participation
✅Step 1: Subscribers our Telegram Channel
✅Step 2: Access to your email and confirm registration
✅Step 3: Follow our Twitter Channel

Rewards:
- 50 PIXIU Tokens rewarded users who finish all 3 steps above.
- 10 PIXIU Tokens rewarded for each successful referral (the member you referred to must also complete 3 steps of the campaign)
`
            },
            BOT_DESCRIPTION: {
                type: String,
                default: `🎉🎉🎉  Welcome to the first Bounty Campaign on PIXIUSWAP - The pioneering automatic liquidity yield farming and AMM on Binance Smart Chain\n
                        —————————————————————-\n
                        🎁 Users have chance to gain many rewards with the total prize is up to 500,000 PIXIU Tokens\n
                        —————————————————————-\n
                        💎 PIXIUSWAP has officially got listed on PancakeSwap => Easy to trade now\n
                        💎 PIXIU tokens will be transferred instantly to your personal wallet when the Campaign ends\n
                        ▶️ Please click on “Start” to join the Campaign.`,
            },
        },
    },

    {
        versionKey: false,
    }
);
console.log("loaded DashboardModel");
mongoose.model("DashboardModel", schemaDashboard, "dashboard");