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
        bot_username: { type: String, default: "nagakingdombot" },
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
✅Step 1: Vote for Naga Kingdom on Solana (proof of voting by screenshot): 3 tickets
✅Step 2: Join Naga Kingdom Telegram Group: 1 ticket
✅Step 3: Join Naga Kingdom Telegram Channel: 1 ticket
✅Step 4: Enter your email to confirm registration
✅Step 5: Join Naga Kingdom Discord Group: 3 tickets
✅Step 6: Like & Share Naga Kingdom on Facebook Fanpage: 3 tickets
✅Step 7: Follow & Retweet Naga Kingdom on Twitter (with proof of voting as attached image & hashtag #nagakingdom): 3 tickets
✅Step 8: Join & Share Naga Kingdom on Reddit (with proof of voting as attached image & hashtag #nagakingdom): 2 tickets
✅Step 9: Subscribe Naga Kingdom on Youtube: 2 tickets
✅Step 10: Share video of you playing the free version of Naga Kingdom on social media (with hashtag #nagakingdom): 5 tickets
✅Step 11: Enter Solana Address (create at Solflare, Trust, coin98, Exodu)
🎁Rewards: 1000 IGO Whitelist tickets (01 ticket: 1000 NAGA Tokens)
    ▪️ 500,000 NAGA tokens for 5,000 wallet addresses that have the most tickets by completing the campaign requirements
    ▪️ 200,000 NAGA tokens for 10,000 random wallet addresses joining the campaign
    ▪️ 300,000 NAGA tokens for 1000 top members with +50 successful referrals
    ▪️ 1000 IGO Whitelist tickets for top members with +100 successful referrals
—————————————————————-
We will send the rewards immediately to your wallet after the end of the campaign.
Thanks for joining!
`
            },
            BOT_DESCRIPTION: {
                type: String,
                default: `🎉🎉🎉 Welcome to the first Airdrop Campaign in Naga Kingdom!
                        —————————————————————-\n
                        The total reward is up to 1,000,000 NAGA Tokens & 1000 IGO Whitelist tickets. 
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