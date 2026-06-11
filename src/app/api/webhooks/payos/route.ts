import { NextRequest, NextResponse } from 'next/server';
import { makeHandlePayOSWebhookUseCase, makePayOSGateway } from '@/infrastructure/supabase/container';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const payosGateway = await makePayOSGateway();
    try {
      // Note: verifyPaymentWebhookData throws an error if the signature is invalid
      const webhookData = await payosGateway.verifyPaymentWebhookData(body);
      
      const useCase = await makeHandlePayOSWebhookUseCase();
      const result = await useCase.execute(webhookData);

      if (!result.success) {
        return NextResponse.json({ success: false, message: result.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: 'Webhook processed' });
    } catch (e: unknown) {
      console.error('PayOS webhook verification failed:', e instanceof Error ? e.message : 'Unknown error');
      return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('Webhook endpoint error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
