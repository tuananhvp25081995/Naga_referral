let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let schemaUsers = new Schema(
    {
        telegramID: { type: String, required: true },
        fullName: { type: String, default: "" },

        mail: {
            email: { type: String, default: "" },
            isVerify: { type: Boolean, default: false },
            verifiedAt: { type: Date, default: Date.now() },
            verifyCode: { type: String, default: "" },
        },

        wallet: {
            changeWallet: { type: Boolean, default: false },
            spl: { type: String, default: "" },
        },

        transferred: { type: Boolean, default: false },

        inviteLogs: [
            {
                telegramID: { type: String, require: true },
                timestamp: { type: Date, default: Date.now() },
            },
        ],

        refTelegramID: { type: String, default: "" },

        registerFollow: {
            passAll: { type: Boolean, default: false },

            joinFrom: { type: String, default: "private" },

            log: { type: String, default: "step2" },

            step1: {
                createDb: { type: Boolean, default: true },
            },
            step2: {
                isVoted: {type: Boolean, default: false}
            },
            step3: {
                isJoinGrouped: { type: Boolean, default: false },
            },
            step4: {
                isJoinChanneled: { type: Boolean, default: false },
            },
            step5: {
                isPass: { type: Boolean, default: false },
                isWaitingEnterEmail: { type: Boolean, default: false },
                isWaitingVerify: { type: Boolean, default: true },
            },

            step6: {
                isDiscordOK: { type: Boolean, default: false },
                linkProfile: { type: String, default: "" },
                isWaitingPass: { type: Boolean, default: false },
                isPass: { type: Boolean, default: false },
            },
            step7: {
                isFacebookOK: { type: Boolean, default: false },
                linkProfile: { type: String, default: "" },
                isWaitingPass: { type: Boolean, default: false },
                isPass: { type: Boolean, default: false },
            },
            step8: {
                isTwitterOK: { type: Boolean, default: false },
                linkProfile: { type: String, default: "" },
                isWaitingPass: { type: Boolean, default: false },
                isPass: { type: Boolean, default: false },
            },
            step9: {
                isRedditOK: { type: Boolean, default: false },
                linkProfile: { type: String, default: "" },
                isWaitingPass: { type: Boolean, default: false },
                isPass: { type: Boolean, default: false },
            },
            step10: {
                isYoutubeOK: { type: Boolean, default: false },
                linkProfile: { type: String, default: "" },
                isWaitingPass: { type: Boolean, default: false },
                isPass: { type: Boolean, default: false },
            },
            step11 :{
                isSocialOK: { type: Boolean, default: false },
                linkSocial: { type: String, default: "" },
                isWaitingPass: { type: Boolean, default: false },
                isPass: { type: Boolean, default: false },
            },
            sendAllStep: { type: Boolean, default: false }
        },
        joinDate: { type: Date, default: Date.now() },
        updateAt: { type: Date, default: Date.now() },
        isLeftGroup: { type: Boolean, default: false }
    },
    {
        versionKey: false,
    }
);

mongoose.model("UserModel", schemaUsers, "users")
