export interface CheckoutInput {
  userId: string;
  userEmail: string;
  itemType: 'single_report' | 'monthly_membership' | 'annual_membership';
  lotNumber?: number;
  amountCents: number;
  currency: string;
  crdWaiverConsentTimestamp: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CheckoutResult {
  providerName: string;
  sessionId: string;
  checkoutUrl?: string;
  clientSecret?: string;
}

export interface StandardWebhookEvent {
  type: 'PAYMENT_SUCCEEDED' | 'PAYMENT_FAILED' | 'SUBSCRIPTION_ACTIVE' | 'SUBSCRIPTION_CANCELED';
  userId: string;
  provider: string;
  providerTransactionId: string;
  amountCents: number;
  currency: string;
  planId?: string;
  timestamp: string;
}

export interface PaymentGateway {
  readonly providerName: string;
  createCheckoutSession(input: CheckoutInput): Promise<CheckoutResult>;
  handleWebhook(rawBody: string | Buffer, signature: string): Promise<StandardWebhookEvent>;
  createCustomerPortalSession(customerId: string, returnUrl: string): Promise<string>;
  cancelSubscription(subscriptionId: string): Promise<void>;
}
