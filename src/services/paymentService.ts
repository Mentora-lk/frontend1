import api from '@/lib/api';

// Fields PayHere's checkout SDK needs, returned by the backend once it has
// staged the ad (in `poatad`) and opened a `tutor_payments` order for it.
export interface AdPaymentOrder {
  adId: number;
  orderId: string;
  amount: string;
  currency: string;
  hash: string;
  merchantId: string;
  items: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  notifyUrl: string;
  returnUrl: string;
  cancelUrl: string;
}

// POST /api/payments/ad/initiate — stages the ad and opens a PayHere order.
// `formData` is the same multipart payload post-ad/page.tsx already builds
// (title/subject/grade/medium/fee/description/schedule/banner).
export const initiateAdPayment = async (formData: FormData): Promise<AdPaymentOrder> => {
  const { data } = await api.post('/payments/ad/initiate', formData);
  return data;
};

export type AdPaymentStatusValue = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface AdPaymentStatus {
  status: AdPaymentStatusValue;
  course_id: number | null;
  ad_id: number;
}

// GET /api/payments/ad/status/:orderId — polled while waiting for PayHere's
// notify webhook to confirm the payment server-side.
export const getAdPaymentStatus = async (orderId: string): Promise<AdPaymentStatus> => {
  const { data } = await api.get(`/payments/ad/status/${orderId}`);
  return data;
};

// POST /api/payments/ad/dev-complete/:orderId — LOCAL DEVELOPMENT ONLY.
// The backend 404s this itself once NODE_ENV=production, so it's safe to
// call from here; the post-ad page additionally only renders the button
// that triggers this when process.env.NODE_ENV !== 'production'.
export const devCompleteAdPayment = async (orderId: string): Promise<AdPaymentStatus> => {
  const { data } = await api.post(`/payments/ad/dev-complete/${orderId}`);
  return data;
};

export const paymentService = {
  initiateAdPayment,
  getAdPaymentStatus,
  devCompleteAdPayment,
};

export default paymentService;
