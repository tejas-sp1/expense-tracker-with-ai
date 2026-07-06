import nodemailer from 'nodemailer';
import type { Env } from '../config/env.js';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly env: Env) {
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT ?? 587,
        secure: (env.SMTP_PORT ?? 587) === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    }
  }

  async send(message: EmailMessage): Promise<void> {
    if (!this.transporter) {
      console.log('\n--- Email (dev mode) ---');
      console.log(`To: ${message.to}`);
      console.log(`Subject: ${message.subject}`);
      console.log(message.text ?? message.html);
      console.log('------------------------\n');
      return;
    }

    await this.transporter.sendMail({
      from: this.env.EMAIL_FROM,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
  }
}
