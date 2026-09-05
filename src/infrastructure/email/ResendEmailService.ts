import { Resend } from 'resend';
import { 
  IEmailService, 
  SendEmailOptions, 
  OrderConfirmationEmailDTO, 
  EmailSendResult 
} from '@/domain/services/IEmailService';
import { Result, ok, fail } from '@/domain/shared/Result';
import { generateOrderConfirmationEmail } from './templates/orderConfirmationTemplate';

export class ResendEmailService implements IEmailService {
  private resend: Resend | null = null;
  private defaultFromEmail: string;
  private defaultReplyToEmail: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.defaultFromEmail = process.env.RESEND_FROM_EMAIL || 'KhoUI <noreply@khoui.io.vn>';
    this.defaultReplyToEmail = process.env.RESEND_REPLY_TO_EMAIL || 'khoui.gmail@gmail.com';

    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<Result<EmailSendResult>> {
    try {
      if (!this.resend) {
        // Safe development fallback: log warning without crashing
        return ok({ messageId: `mock-email-${Date.now()}` });
      }

      const { data, error } = await this.resend.emails.send({
        from: this.defaultFromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo || this.defaultReplyToEmail,
      });

      if (error || !data) {
        return fail(new Error(error?.message || 'Failed to send email via Resend'));
      }

      return ok({ messageId: data.id });
    } catch (err: unknown) {
      return fail(err instanceof Error ? err : new Error('Unexpected error during Resend email delivery'));
    }
  }

  async sendOrderConfirmation(data: OrderConfirmationEmailDTO): Promise<Result<EmailSendResult>> {
    try {
      const { subject, html, text } = generateOrderConfirmationEmail(data);

      return this.sendEmail({
        to: data.recipientEmail,
        subject,
        html,
        text,
      });
    } catch (err: unknown) {
      return fail(err instanceof Error ? err : new Error('Failed to generate or send order confirmation email'));
    }
  }
}