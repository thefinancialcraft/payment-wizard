ALTER TABLE IF EXISTS public.payment_bookings
  ADD COLUMN IF NOT EXISTS payment_mode text,
  ADD COLUMN IF NOT EXISTS payu_ref_id text;

CREATE INDEX IF NOT EXISTS idx_payment_bookings_payment_mode
  ON public.payment_bookings (payment_mode);

CREATE INDEX IF NOT EXISTS idx_payment_bookings_payu_ref_id
  ON public.payment_bookings (payu_ref_id);

COMMENT ON COLUMN public.payment_bookings.payment_mode IS 'Payment mode used for the booking (e.g. UPI, Card, Net Banking, PayU)';
COMMENT ON COLUMN public.payment_bookings.payu_ref_id IS 'PayU reference ID received from the payment gateway';
