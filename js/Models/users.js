let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let schemaUsers = new Schema(
    {
        telegramID: { type: String, required: true },
        fullName: { type: String, default: "" },

        wallet: {
            changeWallet: { type: Boolean, default: false },
            solana: { type: String, default: "" },
        },
        refCodeParent: { type: String, default: "" },
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
                isJoinGrouped: { type: Boolean, default: false },
            },
            step3: {
                isVoteOK: { type: Boolean, default: false },
                userName: { type: String, default: "" },
                isWaitingPass: { type: Boolean, default: false },
            },
            refCode: { type: String, default: "" },
            sendAllStep: { type: Boolean, default: false },
            isSnap: { type: Boolean, default: false }
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