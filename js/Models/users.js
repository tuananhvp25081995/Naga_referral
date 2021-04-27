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

        social: {
            twitter: { type: String, default: "" },
            telegram: {
                isBlock: { type: Boolean, default: false }
            }
        },

        wallet: {
            changeWallet: { type: Boolean, default: false },
            bep20: { type: String, default: "click Change Wallet to change this address" },
        },

        inviteDeeplink: { type: String, default: "" },

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
                // queue: {type: Boolean, default: true},
                isJoined: { type: Boolean, default: false },
            },
            step3: {
                isPass: { type: Boolean, default: false },
                isWaitingEnterEmail: { type: Boolean, default: false },
                isWaitingVerify: { type: Boolean, default: false },
            },

            step4: {
                isTwitterOK: { type: Boolean, default: false },
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
console.log("loaded UserModel");

mongoose.model("UserModel", schemaUsers, "users")
