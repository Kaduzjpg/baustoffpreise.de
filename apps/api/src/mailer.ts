import nodemailer from 'nodemailer';
import { env } from './env';

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  }
});

export async function sendMail(options: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const info = await transporter.sendMail({
    from: env.FROM_EMAIL,
    to: options.to,
    subject: options.subject,
    html: options.html,
    replyTo: options.replyTo
  });
  return info.messageId;
}


