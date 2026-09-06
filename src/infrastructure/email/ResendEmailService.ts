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
    this.defaultReplyToEmail = process.env.RESEND_REPLY_TO_EMAIL || '';

    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<Result<EmailSendResult>> {
    try {
      if (!this.resend) {
        if (process.env.NODE_ENV === 'development') {
          // Safe development fallback: allow local simulation without throwing
          return ok({ messageId: `mock-email-${Date.now()}` });
        }
        return fail(new Error('Cấu hình gửi email chưa hoàn tất: thiếu RESEND_API_KEY trong môi trường triển khai.'));
      }

      const { data, error } = await this.resend.emails.send({
        from: this.defaultFromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo || this.defaultReplyToEmail || undefined,
      });

      if (error || !data) {
        // Resend Sandbox Restriction Detection:
        // In development with onboarding@resend.dev, Resend forbids sending to arbitrary recipient emails.
        if (
          process.env.NODE_ENV === 'development' &&
          error?.message?.includes('You can only send testing emails to your own email address')
        ) {
          console.warn(
            `[Resend Sandbox Notice]: Đang dùng domain thử nghiệm (${this.defaultFromEmail}). Resend chỉ gửi tới email chủ tài khoản. Đơn hàng và quyền tải source code vẫn được kích hoạt tự động thành công 100%.`
          );
          return ok({ messageId: `sandbox-simulated-${Date.now()}` });
        }
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