// Minimal typing for PayHere's Checkout JS SDK (https://www.payhere.lk/lib/payhere.js).
// Loaded at runtime via usePayhereScript(); not an npm package.
export interface PayhereCheckoutPayment {
  sandbox?: boolean;
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  amount: string;
  currency: string;
  hash: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

export interface PayhereSdk {
  startPayment: (payment: PayhereCheckoutPayment) => void;
  onCompleted?: (orderId: string) => void;
  onDismissed?: () => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    payhere?: PayhereSdk;
  }
}
