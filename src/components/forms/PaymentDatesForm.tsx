import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, RefreshCw } from 'lucide-react';

interface FormData {
  paymentDate: string;
  month: string;
  effectiveDate: string;
  nextRenewalDate: string;
}

interface PaymentDatesFormProps {
  data: FormData;
  updateData: (data: Partial<FormData>) => void;
}

export function PaymentDatesForm({ data, updateData }: PaymentDatesFormProps) {
  const handleChange = (field: keyof FormData, value: string) => {
    updateData({ [field]: value });
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-secondary border-border/20 hover:shadow-card transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="paymentDate" className="text-sm font-medium">
                Payment Date *
              </Label>
            </div>
            <Input
              id="paymentDate"
              type="date"
              value={data.paymentDate}
              onChange={(e) => handleChange('paymentDate', e.target.value)}
              className="border-border/20 focus:border-primary transition-colors"
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-secondary border-border/20 hover:shadow-card transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="month" className="text-sm font-medium">
                Payment Month *
              </Label>
            </div>
            <Input
              id="month"
              type="month"
              value={data.month}
              onChange={(e) => handleChange('month', e.target.value)}
              className="border-border/20 focus:border-primary transition-colors"
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-secondary border-border/20 hover:shadow-card transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-success" />
              </div>
              <Label htmlFor="effectiveDate" className="text-sm font-medium">
                Effective Date *
              </Label>
            </div>
            <Input
              id="effectiveDate"
              type="date"
              value={data.effectiveDate}
              onChange={(e) => handleChange('effectiveDate', e.target.value)}
              className="border-border/20 focus:border-primary transition-colors"
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-secondary border-border/20 hover:shadow-card transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-warning" />
              </div>
              <Label htmlFor="nextRenewalDate" className="text-sm font-medium">
                Next Renewal Date *
              </Label>
            </div>
            <Input
              id="nextRenewalDate"
              type="date"
              value={data.nextRenewalDate}
              onChange={(e) => handleChange('nextRenewalDate', e.target.value)}
              className="border-border/20 focus:border-primary transition-colors"
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
        <p className="text-sm text-warning-foreground">
          <strong>Important:</strong> Please verify all dates carefully. The effective date should be when coverage begins, and the renewal date determines your next payment cycle.
        </p>
      </div>
    </div>
  );
}