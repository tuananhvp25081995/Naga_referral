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
        group_id: { type: String, default: "-1001664361592" },

        group_invite_link: { type: String, default: "https://t.me/nagasarapet", },
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
                default: `🎉🎉 Welcome to NAGA REFERRAL #AIRDROP in Naga Kingdom!
⬇️ Please perform the tasks below to receive $50 NFT

About NAGA Nine-Tailed Soul:
    ▪️ It is among the most essential NFTs in Naga Kingdom & created only in this Airdrop.
    ▪️ Players can use it to minimize the time spent to get USDC; or sell it on Marketplace.
————————————————————————
🎉 Please perform the following tasks (required):

✅Step 1: Join Naga Kingdom Affiliate group on Telegram.
✅Step 2: Tweet & Retweet Naga Kingdom on Twitter.
✅Step 3:  Enter Naga Kingdom through here & Connect your Solana wallet.
✅Step 4: Enter your Solana wallet address.
✅Step 5: Share your Affiliate link to at least 01 friend & Enter your Affiliate link here.
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

—————————————————————-
⚡️ Note:
    - We do NOT accept any BSC or ETH addresses, be alert!
    - Your referral must register and own at least 01 NFT in Naga Kingdom.
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