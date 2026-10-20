import { z } from 'zod';
import { PaymentMethod } from '@/shared/types/order';

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

/**
 * Server-side validation for order creation payloads.
 *
 * Prices are validated for shape only. The authoritative price is always
 * re-read from the database in CreateOrderUseCase and create_order_atomic.
 */
export const createOrderSchema = z.object({
  cartItems: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().min(1).optional(),
        quantity: z.number().int().min(1).max(100),
        price: z.number().nonnegative(),
        title: z.string().min(1),
        imageUrl: z.string().optional(),
        variantName: z.string().optional(),
      })
    )
    .min(1),
  shippingAddress: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(3),
    street: z.string().min(1),
    district: z.string().min(1),
    city: z.string().min(1),
    ward: z.string().optional(),
  }),
  paymentMethod: z.nativeEnum(PaymentMethod),
  notes: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
});
