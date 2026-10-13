import { PaymentGateway } from './types';
import { StripePaymentGateway } from './stripeGateway';

const gatewayRegistry: Record<string, PaymentGateway> = {
  stripe: new StripePaymentGateway(),
};

export function getPaymentGateway(providerName = 'stripe'): PaymentGateway {
  const gateway = gatewayRegistry[providerName.toLowerCase()];
  if (!gateway) {
    throw new Error(`Unsupported payment provider: ${providerName}. Supported: ${Object.keys(gatewayRegistry).join(', ')}`);
  }
  return gateway;
}

export function registerPaymentGateway(gateway: PaymentGateway): void {
  gatewayRegistry[gateway.providerName.toLowerCase()] = gateway;
}
