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
        group_id: { type: String, default: "-1001207747128" },

        // https://t.me/istest1 for test group
        // https://t.me/isavewalletgroup for main group
        group_invite_link: { type: String, default: "https://t.me/dogedugroup", },

        redirect_uri: { type: String, default: "https%3A%2F%2Fairdrop.isavewallet.org%2Foauth" },
        bot_username: { type: String, default: "dogedugroup" },
        domain: { type: String, default: "https://airdrop.isavewallet.org" },
        domain_verify_endpoint: {
            type: String,
            default: "https://airdrop.isavewallet.org/email_verify",
        },

        bot_text: {
            BOT_WELCOM_AFTER_START: {
                type: String,
                default: `Welcome USERNAME
Please follow up to get started in the campaign
————————————————————————
Conditions of participation
✅Step 1: Join our Telegram Group
✅Step 2: Access to your email and confirm registration
✅Step 3: Follow our Twitter Channel
- $15 IST token reward for completing the 4 steps above
Rewards:
- $3 IST token reward for each successful referral (the member you referred to must also complete 4 steps of the campaign)
`
            },
            BOT_DESCRIPTION: {
                type: String,
                default: `🎉🎉🎉 Welcome you to Airdrop Campaign for  Isave Wallet Launching Event  – The new and absolutely secure crypto wallet\n
                        —————————————————————-\n
                        🎁 The entire campaign reward is $30000 IST\n
                        —————————————————————-\n
                        💎 Currently 1 FFT = $0.1. Isave Token will be traded on cryptocurrency exchanges by the end of December 2020\n
                        💎 We will distribute IST immediately after the e nd of the campaign\n
                        ▶️ Please click on “Start” to have a look through the campaign`,
            },
        },
    },

    {
        versionKey: false,
    }
);
console.log("loaded DashboardModel");
mongoose.model("DashboardModel", schemaDashboard, "dashboard");