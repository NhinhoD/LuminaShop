import { createClient as makeSupabaseClient } from '@/infrastructure/supabase/server';
export { makeSupabaseClient };

// Repositories & Services
import { SupabaseCartRepository } from '@/infrastructure/supabase/repositories/SupabaseCartRepository';
import { SupabaseCategoryRepository } from '@/infrastructure/supabase/repositories/SupabaseCategoryRepository';
import { SupabaseInventoryRepository } from '@/infrastructure/supabase/repositories/SupabaseInventoryRepository';
import { SupabaseOrderRepository } from '@/infrastructure/supabase/repositories/SupabaseOrderRepository';
import { SupabaseProductRepository } from '@/infrastructure/supabase/repositories/SupabaseProductRepository';
import { SupabaseAuthRepository } from '@/infrastructure/supabase/repositories/SupabaseAuthRepository';
import { SupabaseLanguageRepository } from '@/infrastructure/supabase/repositories/SupabaseLanguageRepository';
import { SupabaseTranslationRepository } from '@/infrastructure/supabase/repositories/SupabaseTranslationRepository';
import { SupabaseDashboardRepository } from '@/infrastructure/supabase/repositories/SupabaseDashboardRepository';
import { SupabasePaymentRepository } from '@/infrastructure/supabase/repositories/SupabasePaymentRepository';
import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { ResendEmailService } from '@/infrastructure/email/ResendEmailService';
import { IEmailService } from '@/domain/services/IEmailService';
import { HttpLocationRepository } from '@/infrastructure/repositories/HttpLocationRepository';

// Gateways
import { CODPaymentGateway } from '@/infrastructure/supabase/gateways/CODPaymentGateway';
import { PayOSGateway } from '@/infrastructure/supabase/gateways/PayOSGateway';
import { CompositePaymentGateway } from '@/infrastructure/supabase/gateways/CompositePaymentGateway';

// Use Cases - Cart
import { AddToCartUseCase } from '@/application/use-cases/cart/AddToCart';
import { MergeCartUseCase } from '@/application/use-cases/cart/MergeCart';
import { GetCartUseCase } from '@/application/use-cases/cart/GetCart';
import { UpdateCartItemUseCase } from '@/application/use-cases/cart/UpdateCartItem';
import { RemoveCartItemUseCase } from '@/application/use-cases/cart/RemoveCartItem';

// Use Cases - Category
import { CreateCategoryUseCase } from '@/application/use-cases/categories/CreateCategory';
import { DeleteCategoryUseCase } from '@/application/use-cases/categories/DeleteCategory';
import { GetCategoriesUseCase } from '@/application/use-cases/categories/GetCategories';
import { UpdateCategoryUseCase } from '@/application/use-cases/categories/UpdateCategory';

// Use Cases - Orders
import { CreateOrderUseCase } from '@/application/use-cases/orders/CreateOrder';
import { GetAllOrdersUseCase } from '@/application/use-cases/orders/GetAllOrders';
import { GetOrderDetailUseCase } from '@/application/use-cases/orders/GetOrderDetail';
import { GetUserOrdersUseCase } from '@/application/use-cases/orders/GetUserOrders';
import { UpdateOrderStatusUseCase } from '@/application/use-cases/orders/UpdateOrderStatus';
import { ApproveManualPaymentUseCase } from '@/application/use-cases/orders/ApproveManualPayment';
import { SendOrderConfirmationEmailUseCase } from '@/application/use-cases/orders/SendOrderConfirmationEmail';
import { GetUserPurchasedTemplatesUseCase } from '@/application/use-cases/orders/GetUserPurchasedTemplates';
import { CheckProductPurchasedUseCase } from '@/application/use-cases/orders/CheckProductPurchased';

// Use Cases - Products
import { CreateProductUseCase } from '@/application/use-cases/products/CreateProduct';
import { UpdateProductUseCase } from '@/application/use-cases/products/UpdateProduct';
import { DeleteProductUseCase } from '@/application/use-cases/products/DeleteProduct';
import { GetProductByIdUseCase } from '@/application/use-cases/products/GetProductById';
import { GetProductsUseCase } from '@/application/use-cases/products/GetProducts';

// Use Cases - Translations & Languages
import { AddTranslationUseCase } from '@/application/use-cases/translations/AddTranslation';
import { UpdateTranslationUseCase } from '@/application/use-cases/translations/UpdateTranslation';
import { DeleteTranslationUseCase } from '@/application/use-cases/translations/DeleteTranslation';
import { GetTranslationsUseCase } from '@/application/use-cases/translations/GetTranslations';
import { GetPaginatedTranslationsUseCase } from '@/application/use-cases/translations/GetPaginatedTranslations';
import { SyncTranslationsUseCase } from '@/application/use-cases/translations/SyncTranslations';
import { GetLanguagesUseCase } from '@/application/use-cases/languages/GetLanguages';
import { SetDefaultLanguageUseCase } from '@/application/use-cases/languages/SetDefaultLanguage';

// Use Cases - Admin
import { GetDashboardMetricsUseCase } from '@/application/use-cases/admin/GetDashboardMetrics';
import { GetAdminCustomersUseCase } from '@/application/use-cases/admin/GetAdminCustomers';

// Use Cases - Payment
import { ProcessPaymentUseCase } from '@/application/use-cases/payment/ProcessPayment';
import { HandlePayOSWebhookUseCase } from '@/application/use-cases/payment/HandlePayOSWebhook';
import { VerifyOrderPaymentUseCase } from '@/application/use-cases/payment/VerifyOrderPayment';

// Use Cases - Auth
import { LoginUseCase } from '@/application/use-cases/auth/LoginUseCase';
import { SignupUseCase } from '@/application/use-cases/auth/SignupUseCase';
import { VerifyOtpUseCase } from '@/application/use-cases/auth/VerifyOtpUseCase';
import { ResendOtpUseCase } from '@/application/use-cases/auth/ResendOtpUseCase';
import { SignoutUseCase } from '@/application/use-cases/auth/SignoutUseCase';
import { ForgotPasswordUseCase } from '@/application/use-cases/auth/ForgotPasswordUseCase';
import { UpdatePasswordUseCase } from '@/application/use-cases/auth/UpdatePasswordUseCase';
import { ChangePasswordUseCase } from '@/application/use-cases/auth/ChangePasswordUseCase';
import { UpdateProfileUseCase } from '@/application/use-cases/auth/UpdateProfileUseCase';
import { GetCustomerCheckoutInfoUseCase } from '@/application/use-cases/auth/GetCustomerCheckoutInfo';
import { GetCurrentUserUseCase } from '@/application/use-cases/auth/GetCurrentUser';
import { GetProfileUseCase } from '@/application/use-cases/auth/GetProfile';
import { getDictionary, Dictionary } from '@/i18n/getDictionary';

// Use Cases - Location
import { GetProvincesUseCase } from '@/application/use-cases/location/GetProvinces';
import { GetDistrictsUseCase } from '@/application/use-cases/location/GetDistricts';
import { GetWardsUseCase } from '@/application/use-cases/location/GetWards';
import { LocationProvider } from '@/application/di/LocationProvider';

// ==========================================
// Repository Factories
// ==========================================
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

export async function makeLanguageRepository() {
  const supabase = await makeSupabaseClient();
  return new SupabaseLanguageRepository(supabase);
}

export async function makeTranslationRepository() {
  const supabase = await makeSupabaseClient();
  return new SupabaseTranslationRepository(supabase);
}

export async function makeDashboardRepository() {
  const supabase = await makeSupabaseClient();
  return new SupabaseDashboardRepository(supabase);
}

export async function makePaymentRepository() {
  const supabase = await makeSupabaseClient();
  return new SupabasePaymentRepository(supabase);
}

// ==========================================
// Use Case Factories
// ==========================================
export async function makeAddToCartUseCase() {
  const repo = await makeCartRepository();
  return new AddToCartUseCase(repo);
}

export async function makeMergeCartUseCase() {
  const repo = await makeCartRepository();
  return new MergeCartUseCase(repo);
}

export async function makeGetCartUseCase() {
  const repo = await makeCartRepository();
  return new GetCartUseCase(repo);
}

export async function makeUpdateCartItemUseCase() {
  const repo = await makeCartRepository();
  return new UpdateCartItemUseCase(repo);
}

export async function makeRemoveCartItemUseCase() {
  const repo = await makeCartRepository();
  return new RemoveCartItemUseCase(repo);
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

export async function makeApproveManualPaymentUseCase() {
  const orderRepo = await makeOrderRepository();
  const emailUseCase = await makeSendOrderConfirmationEmailUseCase();
  return new ApproveManualPaymentUseCase(orderRepo, emailUseCase);
}

export async function makeGetUserPurchasedTemplatesUseCase() {
  const orderRepo = await makeOrderRepository();
  return new GetUserPurchasedTemplatesUseCase(orderRepo);
}

export async function makeCheckProductPurchasedUseCase() {
  const orderRepo = await makeOrderRepository();
  return new CheckProductPurchasedUseCase(orderRepo);
}

export async function makeCreateProductUseCase() {
  const repo = await makeProductRepository();
  return new CreateProductUseCase(repo);
}

export async function makeUpdateProductUseCase() {
  const repo = await makeProductRepository();
  return new UpdateProductUseCase(repo);
}

export async function makeDeleteProductUseCase() {
  const repo = await makeProductRepository();
  return new DeleteProductUseCase(repo);
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

export async function makePayOSGateway() {
  const supabase = await makeSupabaseClient();
  return new PayOSGateway(supabase);
}

// ==========================================
// Test Factory Overrides
// ==========================================
let customAuthRepositoryFactory: (() => Promise<IAuthRepository>) | null = null;
let customProcessPaymentUseCaseFactory: (() => Promise<ProcessPaymentUseCase>) | null = null;
let customVerifyOrderPaymentUseCaseFactory: (() => Promise<VerifyOrderPaymentUseCase>) | null = null;

export function setCustomAuthRepositoryFactoryForTesting(factory: (() => Promise<IAuthRepository>) | null) {
  customAuthRepositoryFactory = factory;
}

export function setCustomProcessPaymentUseCaseFactoryForTesting(factory: (() => Promise<ProcessPaymentUseCase>) | null) {
  customProcessPaymentUseCaseFactory = factory;
}

export function setCustomVerifyOrderPaymentUseCaseFactoryForTesting(factory: (() => Promise<VerifyOrderPaymentUseCase>) | null) {
  customVerifyOrderPaymentUseCaseFactory = factory;
}

export async function makeProcessPaymentUseCase() {
  if (customProcessPaymentUseCaseFactory) {
    return customProcessPaymentUseCaseFactory();
  }
  const codGateway = await makeCODPaymentGateway();
  const payosGateway = await makePayOSGateway();
  
  const compositeGateway = new CompositePaymentGateway({
    cod: codGateway,
    payos: payosGateway
  });

  const orderRepo = await makeOrderRepository();
  const emailUseCase = await makeSendOrderConfirmationEmailUseCase();
  return new ProcessPaymentUseCase(compositeGateway, orderRepo, emailUseCase);
}

export async function makeHandlePayOSWebhookUseCase() {
  const orderRepo = await makeOrderRepository();
  const paymentRepo = await makePaymentRepository();
  const emailUseCase = await makeSendOrderConfirmationEmailUseCase();
  return new HandlePayOSWebhookUseCase(orderRepo, paymentRepo, emailUseCase);
}

export async function makeVerifyOrderPaymentUseCase() {
  if (customVerifyOrderPaymentUseCaseFactory) {
    return customVerifyOrderPaymentUseCaseFactory();
  }
  const orderRepo = await makeOrderRepository();
  const paymentRepo = await makePaymentRepository();
  const payosGateway = await makePayOSGateway();
  const emailUseCase = await makeSendOrderConfirmationEmailUseCase();
  return new VerifyOrderPaymentUseCase(orderRepo, paymentRepo, payosGateway, emailUseCase);
}

// Language Factories
export async function makeGetLanguagesUseCase() {
  const repo = await makeLanguageRepository();
  return new GetLanguagesUseCase(repo);
}

export async function makeSetDefaultLanguageUseCase() {
  const repo = await makeLanguageRepository();
  return new SetDefaultLanguageUseCase(repo);
}

// Dashboard & Admin Factories
export async function makeGetDashboardMetricsUseCase() {
  const repo = await makeDashboardRepository();
  return new GetDashboardMetricsUseCase(repo);
}

export async function makeGetAdminCustomersUseCase() {
  const repo = await makeDashboardRepository();
  return new GetAdminCustomersUseCase(repo);
}

// Translation Factories
export async function makeGetTranslationsUseCase() {
  const repo = await makeTranslationRepository();
  return new GetTranslationsUseCase(repo);
}

export async function makeGetPaginatedTranslationsUseCase() {
  const repo = await makeTranslationRepository();
  return new GetPaginatedTranslationsUseCase(repo);
}

export async function makeSyncTranslationsUseCase() {
  const repo = await makeTranslationRepository();
  return new SyncTranslationsUseCase(repo);
}

export async function makeAddTranslationUseCase() {
  const repo = await makeTranslationRepository();
  return new AddTranslationUseCase(repo);
}

export async function makeUpdateTranslationUseCase() {
  const repo = await makeTranslationRepository();
  return new UpdateTranslationUseCase(repo);
}

export async function makeDeleteTranslationUseCase() {
  const repo = await makeTranslationRepository();
  return new DeleteTranslationUseCase(repo);
}

// Auth Factories
export async function makeAuthRepository(): Promise<IAuthRepository> {
  if (customAuthRepositoryFactory) {
    return customAuthRepositoryFactory();
  }
  const supabase = await makeSupabaseClient();
  return new SupabaseAuthRepository(supabase);
}

export async function makeLoginUseCase(): Promise<LoginUseCase> {
  const repo = await makeAuthRepository();
  return new LoginUseCase(repo);
}

export async function makeSignupUseCase(): Promise<SignupUseCase> {
  const repo = await makeAuthRepository();
  return new SignupUseCase(repo);
}

export async function makeVerifyOtpUseCase(): Promise<VerifyOtpUseCase> {
  const repo = await makeAuthRepository();
  return new VerifyOtpUseCase(repo);
}

export async function makeResendOtpUseCase(): Promise<ResendOtpUseCase> {
  const repo = await makeAuthRepository();
  return new ResendOtpUseCase(repo);
}

export async function makeSignoutUseCase(): Promise<SignoutUseCase> {
  const repo = await makeAuthRepository();
  return new SignoutUseCase(repo);
}

export async function makeForgotPasswordUseCase(): Promise<ForgotPasswordUseCase> {
  const repo = await makeAuthRepository();
  return new ForgotPasswordUseCase(repo);
}

export async function makeUpdatePasswordUseCase(): Promise<UpdatePasswordUseCase> {
  const repo = await makeAuthRepository();
  return new UpdatePasswordUseCase(repo);
}

export async function makeChangePasswordUseCase(): Promise<ChangePasswordUseCase> {
  const repo = await makeAuthRepository();
  return new ChangePasswordUseCase(repo);
}

export async function makeUpdateProfileUseCase(): Promise<UpdateProfileUseCase> {
  const repo = await makeAuthRepository();
  return new UpdateProfileUseCase(repo);
}

export async function makeGetCustomerCheckoutInfoUseCase(): Promise<GetCustomerCheckoutInfoUseCase> {
  const repo = await makeAuthRepository();
  return new GetCustomerCheckoutInfoUseCase(repo);
}

export async function makeGetCurrentUserUseCase(): Promise<GetCurrentUserUseCase> {
  const repo = await makeAuthRepository();
  return new GetCurrentUserUseCase(repo);
}

export async function makeGetProfileUseCase(): Promise<GetProfileUseCase> {
  const repo = await makeAuthRepository();
  return new GetProfileUseCase(repo);
}

export async function getAppDictionary(): Promise<Dictionary> {
  const repo = await makeLanguageRepository();
  return getDictionary(repo);
}

// Location Factories
export function makeLocationRepository(): HttpLocationRepository {
  return new HttpLocationRepository();
}

export function makeGetProvincesUseCase(): GetProvincesUseCase {
  const repo = makeLocationRepository();
  return new GetProvincesUseCase(repo);
}

export function makeGetDistrictsUseCase(): GetDistrictsUseCase {
  const repo = makeLocationRepository();
  return new GetDistrictsUseCase(repo);
}

export function makeGetWardsUseCase(): GetWardsUseCase {
  const repo = makeLocationRepository();
  return new GetWardsUseCase(repo);
}

LocationProvider.registerProvincesFactory(makeGetProvincesUseCase);
LocationProvider.registerDistrictsFactory(makeGetDistrictsUseCase);
LocationProvider.registerWardsFactory(makeGetWardsUseCase);

// Email Factories
export function makeEmailService(): IEmailService {
  return new ResendEmailService();
}

export async function makeSendOrderConfirmationEmailUseCase(): Promise<SendOrderConfirmationEmailUseCase> {
  const orderRepo = await makeOrderRepository();
  const productRepo = await makeProductRepository();
  const emailService = makeEmailService();
  return new SendOrderConfirmationEmailUseCase(orderRepo, productRepo, emailService);
}
