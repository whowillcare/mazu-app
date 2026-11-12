import { NextResponse } from 'next/server';
import { getPaymentGateway } from '@/lib/payments/paymentFactory';
import { EntitlementService } from '@/lib/payments/entitlementService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId = 'guest_user',
      userEmail = 'seeker@example.com',
      lotNumber = 1,
      itemType = 'single_report',
      crdWaiverAccepted = false,
      provider = 'stripe',
    } = body;

    if (!crdWaiverAccepted) {
      return NextResponse.json(
        {
          error:
            'You must acknowledge the EU CRD Art. 16(m) digital content waiver to proceed with immediate delivery.',
        },
        { status: 400 }
      );
    }

    const gateway = getPaymentGateway(provider);
    const amountCents = itemType === 'single_report' || itemType === 'master_pack' ? 299 : 999;
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const mappedItemType = itemType === 'master_pack' ? 'single_report' : itemType;

    const sessionResult = await gateway.createCheckoutSession({
      userId,
      userEmail,
      itemType: mappedItemType,
      lotNumber,
      amountCents,
      currency: 'USD',
      crdWaiverConsentTimestamp: new Date().toISOString(),
      successUrl: `${origin}/report?lot=${lotNumber}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/reading?lot=${lotNumber}`,
    });

    // Log EU CRD Art. 16(m) compliance in SQLite audit trail
    EntitlementService.logCrdWaiver(
      userId,
      sessionResult.sessionId,
      lotNumber,
      amountCents,
      request.headers.get('x-forwarded-for') || undefined
    );

    // If simulated session, grant entitlement directly
    if (sessionResult.sessionId.startsWith('cs_test_')) {
      const planId =
        itemType === 'subscription'
          ? 'subscription'
          : itemType === 'master_pack'
          ? `master_pack_${Date.now()}`
          : `lot_report_${lotNumber}`;
      EntitlementService.grantEntitlement(userId, planId, provider, sessionResult.sessionId);
    }

    return NextResponse.json({
      success: true,
      provider: sessionResult.providerName,
      sessionId: sessionResult.sessionId,
      checkoutUrl: sessionResult.checkoutUrl,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Failed to initiate checkout' }, { status: 500 });
  }
}
