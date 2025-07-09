import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Percent, Calculator, Clock, IndianRupee } from 'lucide-react';

interface FormData {
  premium: string;
  netPremium: string;
  discountOffer: string;
  updatedPremium: string;
  tenure: string;
}

interface FinancialInfoFormProps {
  data: FormData;
  updateData: (data: Partial<FormData>) => void;
}

export function FinancialInfoForm({ data, updateData }: FinancialInfoFormProps) {
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');

  const handleChange = (field: keyof FormData, value: string) => {
    updateData({ [field]: value });
  };

  const tenureOptions = [
    "1 Year", "2 Years", "3 Years", "5 Years", "10 Years", 
    "15 Years", "20 Years", "25 Years", "30 Years"
  ];

  // Auto-calculate net premium from base premium (divide by 1.18)
  React.useEffect(() => {
    if (data.premium) {
      const baseAmount = parseFloat(data.premium) || 0;
      const netAmount = baseAmount / 1.18;
      updateData({ netPremium: netAmount.toFixed(2) });
    }
  }, [data.premium]);

  // Auto-calculate updated premium when discount is applied
  React.useEffect(() => {
    if (data.netPremium && data.discountOffer) {
      const netAmount = parseFloat(data.netPremium) || 0;
      const discountValue = parseFloat(data.discountOffer) || 0;
      let updatedAmount = netAmount;

      if (discountType === 'percentage') {
        // Calculate discount: discount% of net premium, multiply by 5, subtract from net
        const discountAmount = (netAmount * discountValue / 100) * 5;
        updatedAmount = netAmount - discountAmount;
      } else {
        // Fixed amount: multiply by 5 and subtract from net premium
        const discountAmount = discountValue * 5;
        updatedAmount = netAmount - discountAmount;
      }

      updateData({ updatedPremium: Math.max(0, updatedAmount).toFixed(2) });
    } else if (data.netPremium && !data.discountOffer) {
      updateData({ updatedPremium: data.netPremium });
    }
  }, [data.netPremium, data.discountOffer, discountType]);

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-secondary border-border/20 hover:shadow-card transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="premium" className="text-sm font-medium">
                Base Premium * (₹)
              </Label>
            </div>
            <Input
              id="premium"
              type="number"
              placeholder="Enter base premium amount"
              value={data.premium}
              onChange={(e) => handleChange('premium', e.target.value)}
              className="border-border/20 focus:border-primary transition-colors"
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-secondary border-border/20 hover:shadow-card transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                <Calculator className="w-4 h-4 text-success" />
              </div>
              <Label htmlFor="netPremium" className="text-sm font-medium">
                Net Premium (Auto-calculated)
              </Label>
            </div>
            <Input
              id="netPremium"
              type="number"
              placeholder="Auto-calculated from base premium"
              value={data.netPremium}
              readOnly
              className="border-border/20 bg-muted/50 cursor-not-allowed"
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-secondary border-border/20 hover:shadow-card transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
                <Percent className="w-4 h-4 text-warning" />
              </div>
              <Label htmlFor="discountOffer" className="text-sm font-medium">
                Discount Offer
              </Label>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={discountType === 'percentage' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDiscountType('percentage')}
                  className="flex items-center gap-1"
                >
                  <Percent className="w-3 h-3" />
                  %
                </Button>
                <Button
                  type="button"
                  variant={discountType === 'fixed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDiscountType('fixed')}
                  className="flex items-center gap-1"
                >
                  <IndianRupee className="w-3 h-3" />
                  ₹
                </Button>
              </div>
              <Input
                id="discountOffer"
                type="number"
                placeholder={discountType === 'percentage' ? 'Enter discount %' : 'Enter discount amount ₹'}
                value={data.discountOffer}
                onChange={(e) => handleChange('discountOffer', e.target.value)}
                className="border-border/20 focus:border-primary transition-colors"
                min="0"
                step="0.1"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-secondary border-border/20 hover:shadow-card transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-info" />
              </div>
              <Label htmlFor="updatedPremium" className="text-sm font-medium">
                Updated Premium (Auto-calculated)
              </Label>
            </div>
            <Input
              id="updatedPremium"
              type="number"
              placeholder="Auto-calculated amount"
              value={data.updatedPremium}
              readOnly
              className="border-border/20 bg-muted/50 cursor-not-allowed"
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-gradient-secondary border-border/20 hover:shadow-card transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="tenure" className="text-sm font-medium">
                Policy Tenure *
              </Label>
            </div>
            <Select value={data.tenure} onValueChange={(value) => handleChange('tenure', value)}>
              <SelectTrigger className="border-border/20 focus:border-primary">
                <SelectValue placeholder="Select policy tenure" />
              </SelectTrigger>
              <SelectContent>
                {tenureOptions.map((tenure) => (
                  <SelectItem key={tenure} value={tenure}>
                    {tenure}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-info/10 border border-info/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Calculator className="w-5 h-5 text-info mt-0.5" />
          <div>
            <p className="text-sm font-medium text-info-foreground mb-1">Premium Calculation Summary:</p>
            <div className="text-xs text-info-foreground/80 space-y-1">
              <div>Base Premium: ₹{data.premium || '0'}</div>
              <div>Net Premium: ₹{data.netPremium || '0'} (Base ÷ 1.18)</div>
              <div>Discount: {data.discountOffer || '0'}{discountType === 'percentage' ? '% × 5' : ' × 5'}</div>
              <div className="font-medium">Final Amount: ₹{data.updatedPremium || '0'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}