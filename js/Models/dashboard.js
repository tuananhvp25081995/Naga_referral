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
        group_id: { type: String, default: "-1001627215619" },
        channel_id: { type: String, default: "-1001680013176" },

        group_invite_link: { type: String, default: "https://t.me/nagakingdom", },
        channel_invite_link: { type: String, default: "https://t.me/naga_kingdom", },

        redirect_uri: { type: String, default: "https%3A%2F%2Fnagakingdom.com%2Foauth" },
        bot_username: { type: String, default: "nagakingdom_bot" },
        domain: { type: String, default: "https://nagakingdom.com" },
        domain_verify_endpoint: {
            type: String,
            default: "https://bot.nagakingdom.com/email_verify",
        },

        bot_text: {
            BOT_WELCOM_AFTER_START: {
                type: String,
                default: `Welcome USERNAME to the first community-based Airdrop Campaign in Naga Kingdom!
Please follow up to get started in the campaign
————————————————————————
Conditions of participation
✅Step 1: Joining Naga Kingdom Telegram Group
✅Step 2: Joining Naga Kingdom Telegram Channel
✅Step 3: Access to your email and confirm registration
✅Step 4: Following Naga Kingdom on Twitter
✅Step 5: Following Naga Kingdom on Facebook
✅Step 6: Following Naga Kingdom on Youtube
✅Step 7: Following Naga Kingdom on Reddit
🎁Rewards:
    ▪️ 30,000 NAGA tokens for 3,000 winners
    ▪️ 30,000 NAGA tokens for 300 winners with over 10 successful referrals
    ▪️ 1,000 NFT Adventure Skins in Naga Kingdom for 1,000 winners with over 30 successful referrals
    ▪️ 40,000 NAGA Tokens for 100 best videos
—————————————————————-
We will send the rewards immediately to your wallet after the end of the campaign.
Thanks for joining!
`
            },
            BOT_DESCRIPTION: {
                type: String,
                default: `🎉🎉🎉 Welcome to the first Airdrop Campaign in Naga Kingdom!
                        —————————————————————-\n
                        The total reward is up to 100,000 NAGA Tokens & 1000 limited editions of NFT Snake. 
                        —————————————————————-\n
                        Naga Kingdom is the legendary snake game built on the Solana Blockchain.
                        In addition, the Gameplay is open to new features and different playing modes, including Freeplay, Arena and P2E Mode.
                        —————————————————————-\n
                        `
            },
        },
    },

    {
        versionKey: false,
    }
);
console.log("loaded DashboardModel");
mongoose.model("DashboardModel", schemaDashboard, "dashboard");