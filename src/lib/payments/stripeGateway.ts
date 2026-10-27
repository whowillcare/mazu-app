import { CheckoutInput, CheckoutResult, PaymentGateway, StandardWebhookEvent } from './types';
import { getConfig } from '@/lib/config/configManager';

export class StripePaymentGateway implements PaymentGateway {
  readonly providerName = 'stripe';

  private getApiKey(): string | undefined {
    return getConfig('STRIPE_SECRET_KEY') || process.env.STRIPE_SECRET_KEY || undefined;
  }

  private getWebhookSecret(): string {
    return getConfig('STRIPE_WEBHOOK_SECRET') || process.env.STRIPE_WEBHOOK_SECRET || '';
  }

  async createCheckoutSession(input: CheckoutInput): Promise<CheckoutResult> {
    const apiKey = this.getApiKey();
    const paymentMode = getConfig('PAYMENT_MODE') || (apiKey ? 'stripe' : 'mock');

    if (!apiKey || paymentMode === 'mock') {
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
    const stripe = new Stripe(apiKey);

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
    const apiKey = this.getApiKey();
    if (!apiKey) {
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
    const stripe = new Stripe(apiKey);
    const webhookSecret = this.getWebhookSecret();

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
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return `${returnUrl}?portal=simulated`;
    }
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(apiKey);
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return session.url;
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    const apiKey = this.getApiKey();
    if (!apiKey) return;
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(apiKey);
    await stripe.subscriptions.cancel(subscriptionId);
  }
}
