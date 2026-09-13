import { z } from 'zod';
import { PaymentMethod } from '@/domain/entities/Order';

export function createDigitalCheckoutSchema(messages?: {
  nameMin?: string;
  emailInvalid?: string;
  contactMin?: string;
}) {
  return z.object({
    fullName: z.string().min(2, messages?.nameMin || "Họ tên phải có ít nhất 2 ký tự"),
    email: z.string().email(messages?.emailInvalid || "Địa chỉ email không hợp lệ để nhận mã nguồn"),
    contactHandle: z.string().min(3, messages?.contactMin || "Vui lòng cung cấp link Facebook hoặc số Zalo để nhận hỗ trợ kỹ thuật"),
    notes: z.string().optional(),
    paymentMethod: z.nativeEnum(PaymentMethod),
  });
}

export const digitalCheckoutSchema = createDigitalCheckoutSchema();
