import { PaymentBookingForm } from '@/components/PaymentBookingForm';
import { useLocation } from 'react-router-dom';

const Index = () => {
  const location = useLocation();
  return <PaymentBookingForm locationState={location.state} />;
};

export default Index;
