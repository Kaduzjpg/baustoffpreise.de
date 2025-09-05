"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = void 0;
exports.sendMail = sendMail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("./env");
exports.transporter = nodemailer_1.default.createTransport({
    host: env_1.env.SMTP_HOST,
    port: Number(env_1.env.SMTP_PORT),
    secure: false,
    auth: {
        user: env_1.env.SMTP_USER,
        pass: env_1.env.SMTP_PASS
    }
});
async function sendMail(options) {
    const info = await exports.transporter.sendMail({
        from: env_1.env.FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
        replyTo: options.replyTo,
        attachments: options.attachments
    });
    return info.messageId;
}
