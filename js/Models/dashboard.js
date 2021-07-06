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
        group_id: { type: String, default: "-1001488116455" },
        channel_id: { type: String, default: "-1001566607958" },

        group_invite_link: { type: String, default: "https://t.me/bo_finance_group", },
        channel_invite_link: { type: String, default: "https://t.me/bofinancechannel", },

        redirect_uri: { type: String, default: "https%3A%2F%2Fbo.finance%2Foauth" },
        bot_username: { type: String, default: "bo_finance_bot" },
        domain: { type: String, default: "https://bo.finance" },
        domain_verify_endpoint: {
            type: String,
            default: "https://bot.bo.finance/email_verify",
        },

        bot_text: {
            BOT1_WELCOM_AFTER_START: {
                type: String,
                default: `Welcome USERNAME
Please follow up to get started in the campaign
————————————————————————
Conditions of participation
✅Step 1: Subscribers our Telegram Group
✅Step 2: Subscribers our Telegram Channel
✅Step 3: Access to your email and confirm registration
✅Step 4: Follow our Twitter Channel and Retweet Twitter
✅Step 5: Like Fanpage Facebook and Share
Rewards:
    ▪️ 6 FIBO Tokens reward for completing the 4 steps above
    ▪️ 2 FIBO Tokens reward for each successful referral (the member you referred to must also complete 4 steps of the campaign)
We will send the rewards immediately to your wallet after the end of the campaign.
Thanks for joining!
`
            },
            BOT2_WELCOM_AFTER_START: {
                type: String,
                default: `Welcome USERNAME
Please follow the instructions to get started in the campaign:
————————————————————————
Conditions of participation
✅Step 1: Create a YouTube video with:
    ▪️ 1000 views: You’ll receive 200 FIBO Tokens
    ▪️ 5000 views: You’ll receive 1000 FIBO Tokens
    ▪️ 10000 views: You’ll receive 3000 FIBO Tokens
    ▪️ Over 20000 views: You’ll receive 10000 FIBO Tokens
✅Step 2: Access to our website: www.bo.finance & Connect your BSC wallet
✅Step 3: Send your YouTube video here & Enter your wallet address
Video criteria:
    ▪️ Duration: 2 minutes (minimum)
    ▪️ Topics related decentralized Binary Option & BO.Finance
    ▪️ Including information of FIBO Token, campaigns of BO.Finance & its rewards
    ▪️ Give review with images of BO.Finance
    ▪️ Hashtag: bofinance, fibotoken, bodecentralized
We will send the rewards immediately to your wallet after the end of the campaign
Thanks for joining!
`
            },
            BOT3_WELCOM_AFTER_START: {
                type: String,
                default: `Welcome USERNAME
Please follow up to get started in the campaign
————————————————————————
Conditions of participation
✅Step 1: Write a review about BO.Finance on Medium with: 
    ▪️ 1000 claps: You’ll receive 1000 FIBO Tokens 
    ▪️ 2000 claps: You’ll receive 3000 FIBO Tokens
    ▪️ Over 5000 claps: You’ll receive 10000 FIBO Tokens
✅Step 2: Access to our website: www.bo.finance & Connect your BSC wallet
✅Step 3: Send your Medium post here & Enter your wallet address
Video criteria:
    ▪️ Length: 500 words (minimum)
    ▪️ Topics related decentralized Binary Option & BO.Finance
    ▪️ Including information of FIBO Token, campaigns of BO.Finance & its rewards
    ▪️ Give review with images of BO.Finance
    ▪️ Hashtag: bofinance, fibotoken, bodecentralized
We will send the rewards immediately to your wallet after the end of the campaign.
Thanks for joining!
`
            },
            BOT_DESCRIPTION: {
                type: String,
                default: `🎉🎉🎉  Welcome to our grand Airdrop on BO.Finance!\n
                        —————————————————————-\n
                        BO.Finance - the first decentralized Binary Option platform to:
                            ▪️ Transparently predict price volatility
                            ▪️ Automatic features for pair makers and predictors
                            ▪️ High profits 
                            ▪️ Explicit distribution 
                        —————————————————————-\n
                        🎁 The total reward is up to 200.000 FIBO Token with 3 selective Airdrop Campaigns:\n
                            1. Airdrop Campaign 1: 100000 FIBO Token - Start
                            2. Airdrop Campaign 2: 50000 FIBO Token - Start
                            3. Airdrop Campaign 3: 50000 FIBO Token - Start
                        —————————————————————-\n
                        💎 The value of FIBO Token will reach $1 after being officially listed on PancakeSwap for 1 month.\n
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