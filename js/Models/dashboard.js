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
        group_id: { type: String, default: "-1001559567692" },

        group_invite_link: { type: String, default: "https://t.me/piggyswapchannel", },

        redirect_uri: { type: String, default: "https%3A%2F%2Fpiggyswap.finance%2Foauth" },
        bot_username: { type: String, default: "PiggySwap_bot" },
        domain: { type: String, default: "https://piggyswap.finance" },
        domain_verify_endpoint: {
            type: String,
            default: "https://bot.piggyswap.finance/email_verify",
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
- You can get to 200 PIGGY tokens by completing all steps and 50 PIGGY tokens for each successful referral.
`
            },
            BOT_DESCRIPTION: {
                type: String,
                default: `🎉🎉🎉  Welcome to the biggest Bounty Campaign on PIGGYSWAP\n
                        —————————————————————-\n
                        PIGGYSWAP is an automatic liquidity yield farming and AMM that supports PIGGY tokens and fans, eliminating disparity between them with the use of advanced technologies.
                        —————————————————————-\n
                        🎁 Users have chance to gain many rewards with the total prize is up to  2,000,000 PIGGY Tokens\n
                        —————————————————————-\n
                        💎 BOUNTY CAMPAIGN REWARDS WILL BE DISTRIBUTED AFTER THE CAMPAIGN\n
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