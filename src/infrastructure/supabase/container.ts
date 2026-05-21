import { createClient as makeSupabaseClient } from './server';
export { makeSupabaseClient };
import { SupabaseCartRepository } from './repositories/SupabaseCartRepository';
import { SupabaseCategoryRepository } from './repositories/SupabaseCategoryRepository';
import { SupabaseInventoryRepository } from './repositories/SupabaseInventoryRepository';
import { SupabaseOrderRepository } from './repositories/SupabaseOrderRepository';
import { SupabaseProductRepository } from './repositories/SupabaseProductRepository';
import { SupabaseAuthRepository } from './repositories/SupabaseAuthRepository';

import { AddToCartUseCase } from '@/application/use-cases/cart/AddToCart';
import { MergeCartUseCase } from '@/application/use-cases/cart/MergeCart';
import { CreateCategoryUseCase } from '@/application/use-cases/categories/CreateCategory';
import { DeleteCategoryUseCase } from '@/application/use-cases/categories/DeleteCategory';
import { GetCategoriesUseCase } from '@/application/use-cases/categories/GetCategories';
import { UpdateCategoryUseCase } from '@/application/use-cases/categories/UpdateCategory';
import { CreateOrderUseCase } from '@/application/use-cases/orders/CreateOrder';
import { GetAllOrdersUseCase } from '@/application/use-cases/orders/GetAllOrders';
import { GetOrderDetailUseCase } from '@/application/use-cases/orders/GetOrderDetail';
import { GetUserOrdersUseCase } from '@/application/use-cases/orders/GetUserOrders';
import { UpdateOrderStatusUseCase } from '@/application/use-cases/orders/UpdateOrderStatus';
import { CreateProductUseCase } from '@/application/use-cases/products/CreateProduct';
import { UpdateProductUseCase } from '@/application/use-cases/products/UpdateProduct';
import { GetProductByIdUseCase } from '@/application/use-cases/products/GetProductById';
import { GetProductsUseCase } from '@/application/use-cases/products/GetProducts';
import { ProcessPaymentUseCase } from '@/application/use-cases/payment/ProcessPayment';
import { CODPaymentGateway } from './gateways/CODPaymentGateway';

import { LoginUseCase } from '@/application/use-cases/auth/LoginUseCase';
import { SignupUseCase } from '@/application/use-cases/auth/SignupUseCase';
import { VerifyOtpUseCase } from '@/application/use-cases/auth/VerifyOtpUseCase';
import { ResendOtpUseCase } from '@/application/use-cases/auth/ResendOtpUseCase';
import { SignoutUseCase } from '@/application/use-cases/auth/SignoutUseCase';

// Repository Factories
export async function makeCartRepository() {
  const supabase = await makeSupabaseClient();
  return new SupabaseCartRepository(supabase);
}

export async function makeCategoryRepository() {
  const supabase = await makeSupabaseClient();
  return new SupabaseCategoryRepository(supabase);
}

export async function makeInventoryRepository() {
  const supabase = await makeSupabaseClient();
  return new SupabaseInventoryRepository(supabase);
}

export async function makeOrderRepository() {
  const supabase = await makeSupabaseClient();
  return new SupabaseOrderRepository(supabase);
}

export async function makeProductRepository() {
  const supabase = await makeSupabaseClient();
  return new SupabaseProductRepository(supabase);
}

// Use Case Factories
export async function makeAddToCartUseCase() {
  const repo = await makeCartRepository();
  return new AddToCartUseCase(repo);
}

export async function makeMergeCartUseCase() {
  const repo = await makeCartRepository();
  return new MergeCartUseCase(repo);
}

export async function makeCreateCategoryUseCase() {
  const repo = await makeCategoryRepository();
  return new CreateCategoryUseCase(repo);
}

export async function makeDeleteCategoryUseCase() {
  const repo = await makeCategoryRepository();
  return new DeleteCategoryUseCase(repo);
}

export async function makeGetCategoriesUseCase() {
  const repo = await makeCategoryRepository();
  return new GetCategoriesUseCase(repo);
}

export async function makeUpdateCategoryUseCase() {
  const repo = await makeCategoryRepository();
  return new UpdateCategoryUseCase(repo);
}

export async function makeCreateOrderUseCase() {
  const orderRepo = await makeOrderRepository();
  return new CreateOrderUseCase(orderRepo);
}

export async function makeGetAllOrdersUseCase() {
  const repo = await makeOrderRepository();
  return new GetAllOrdersUseCase(repo);
}

export async function makeGetOrderDetailUseCase() {
  const repo = await makeOrderRepository();
  return new GetOrderDetailUseCase(repo);
}

export async function makeGetUserOrdersUseCase() {
  const repo = await makeOrderRepository();
  return new GetUserOrdersUseCase(repo);
}

export async function makeUpdateOrderStatusUseCase() {
  const repo = await makeOrderRepository();
  return new UpdateOrderStatusUseCase(repo);
}

export async function makeCreateProductUseCase() {
  const repo = await makeProductRepository();
  return new CreateProductUseCase(repo);
}

export async function makeUpdateProductUseCase() {
  const repo = await makeProductRepository();
  return new UpdateProductUseCase(repo);
}

export async function makeGetProductByIdUseCase() {
  const repo = await makeProductRepository();
  return new GetProductByIdUseCase(repo);
}

export async function makeGetProductsUseCase() {
  const repo = await makeProductRepository();
  return new GetProductsUseCase(repo);
}

export async function makeCODPaymentGateway() {
  const supabase = await makeSupabaseClient();
  return new CODPaymentGateway(supabase);
}

export async function makeProcessPaymentUseCase() {
  const gateway = await makeCODPaymentGateway(); // default to COD for now, ideally dynamically chosen
  const orderRepo = await makeOrderRepository();
  return new ProcessPaymentUseCase(gateway, orderRepo);
}

// Auth Factories
export async function makeAuthRepository() {
  const supabase = await makeSupabaseClient();
  return new SupabaseAuthRepository(supabase);
}

export async function makeLoginUseCase() {
  const repo = await makeAuthRepository();
  return new LoginUseCase(repo);
}

export async function makeSignupUseCase() {
  const repo = await makeAuthRepository();
  return new SignupUseCase(repo);
}

export async function makeVerifyOtpUseCase() {
  const repo = await makeAuthRepository();
  return new VerifyOtpUseCase(repo);
}

export async function makeResendOtpUseCase() {
  const repo = await makeAuthRepository();
  return new ResendOtpUseCase(repo);
}

export async function makeSignoutUseCase() {
  const repo = await makeAuthRepository();
  return new SignoutUseCase(repo);
}
