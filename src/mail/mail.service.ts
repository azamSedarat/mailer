import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export type Mail = {
  subject: string;
  body: string;
  to: string;
};

@Injectable()
export class MailService {
  public async sendMail(mail: Mail): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      auth: {
        user: 'me.ehyaie@zohomail.com',
        pass: '123Az123Az',
      },
    });
    const options = {
      from: 'me.ehyaie@zohomail.com',
      to: mail.to,
      subject: mail.subject,
      html: mail.body,
    };
    await transporter.sendMail(options);
  }
}
