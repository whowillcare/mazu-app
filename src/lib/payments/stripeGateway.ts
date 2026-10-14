import { CheckoutInput, CheckoutResult, PaymentGateway, StandardWebhookEvent } from './types';

export class StripePaymentGateway implements PaymentGateway {
  readonly providerName = 'stripe';
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.STRIPE_SECRET_KEY;
  }

  async createCheckoutSession(input: CheckoutInput): Promise<CheckoutResult> {
    if (!this.apiKey) {
      // Development Simulator Mode (Permits full testing without live Stripe keys)
      const mockSessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const mockUrl = `${input.successUrl}?session_id=${mockSessionId}&simulated=true`;

      return {
        providerName: this.providerName,
        sessionId: mockSessionId,
        checkoutUrl: mockUrl,
        clientSecret: `pi_test_secret_${mockSessionId}`,
      };
    }

    // When live STRIPE_SECRET_KEY is provided:
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(this.apiKey);

    const session = await stripe.checkout.sessions.create({
      customer_email: input.userEmail,
      line_items: [
        {
          price_data: {
            currency: input.currency.toLowerCase(),
            product_data: {
              name: `Personalized Lot Report #${input.lotNumber || '01'}`,
              description: 'Four Pillars BaZi interaction, annual timing, and heirloom PDF',
            },
            unit_amount: input.amountCents,
          },
          quantity: 1,
        },
      ],
      mode: input.itemType === 'single_report' ? 'payment' : 'subscription',
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: {
        userId: input.userId,
        lotNumber: String(input.lotNumber || 1),
        crdWaiverConsentTimestamp: input.crdWaiverConsentTimestamp,
      },
    });

    return {
      providerName: this.providerName,
      sessionId: session.id,
      checkoutUrl: session.url || undefined,
    };
  }

  async handleWebhook(rawBody: string | Buffer, signature: string): Promise<StandardWebhookEvent> {
    if (!this.apiKey) {
      // Mock simulation event
      return {
        type: 'PAYMENT_SUCCEEDED',
        userId: 'simulated_user',
        provider: this.providerName,
        providerTransactionId: `tx_${Date.now()}`,
        amountCents: 299,
        currency: 'usd',
        planId: 'single_report',
        timestamp: new Date().toISOString(),
      };
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(this.apiKey);
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as {
        metadata?: Record<string, string>;
        id: string;
        amount_total?: number | null;
        currency?: string | null;
      };
      return {
        type: 'PAYMENT_SUCCEEDED',
        userId: session.metadata?.userId || '',
        provider: this.providerName,
        providerTransactionId: session.id,
        amountCents: session.amount_total || 299,
        currency: session.currency || 'usd',
        planId: session.metadata?.itemType || 'single_report',
        timestamp: new Date().toISOString(),
      };
    }

    return {
      type: 'PAYMENT_SUCCEEDED',
      userId: '',
      provider: this.providerName,
      providerTransactionId: event.id,
      amountCents: 0,
      currency: 'usd',
      timestamp: new Date().toISOString(),
    };
  }

  async createCustomerPortalSession(customerId: string, returnUrl: string): Promise<string> {
    if (!this.apiKey) {
      return `${returnUrl}?portal=simulated`;
    }
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(this.apiKey);
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return session.url;
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    if (!this.apiKey) return;
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(this.apiKey);
    await stripe.subscriptions.cancel(subscriptionId);
  }
}
