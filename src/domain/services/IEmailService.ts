import { Result } from '@/domain/shared/Result';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface LicenseItemDTO {
  productId: string;
  productTitle: string;
  licenseKey: string;
  sourceCodeUrl?: string;
  price: number;
}

export interface OrderConfirmationEmailDTO {
  orderId: string;
  recipientEmail: string;
  customerName?: string;
  totalAmount: number;
  locale: 'vi' | 'en';
  items: LicenseItemDTO[];
}

export interface EmailSendResult {
  messageId: string;
}

export interface IEmailService {
  sendEmail(options: SendEmailOptions): Promise<Result<EmailSendResult>>;
  sendOrderConfirmation(data: OrderConfirmationEmailDTO): Promise<Result<EmailSendResult>>;
}