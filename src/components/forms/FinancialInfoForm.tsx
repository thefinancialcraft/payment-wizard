import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IndianRupee, Percent, Calculator, Clock, X } from 'lucide-react';

interface FormData {
  premium: string;
  netPremium: string;
  discountOffer: string;
  discountOfferType: string;
  updatedPremium: string;
  tenure: string;
}

interface FinancialInfoFormProps {
  data: FormData;
  updateData: (data: Partial<FormData>) => void;
  disabledFields?: string[];
}

export function FinancialInfoForm({ data, updateData, disabledFields = [] }: FinancialInfoFormProps) {
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed' | 'none'>('none');

  const handleChange = (field: keyof FormData, value: string) => {
    updateData({ [field]: value });

    // Clear discount offer when discount type is "None"
    if (field === 'discountOfferType' && value === 'None') {
      updateData({ discountOffer: '' });
      setDiscountType('none');
    } else if (field === 'discountOfferType' && value !== 'None') {
      setDiscountType('percentage');
    }
  };

  // Sync discountType with discountOfferType from data
  React.useEffect(() => {
    if (data.discountOfferType === 'None' || data.discountOfferType === 'none') {
      setDiscountType('none');
    } else if (data.discountOfferType) {
      setDiscountType('percentage');
    }
  }, [data.discountOfferType]);

  const tenureOptions = [
    "1 Year", "2 Years", "3 Years"
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
    if (data.netPremium) {
      const netAmount = parseFloat(data.netPremium) || 0;
      const baseAmount = parseFloat(data.premium) || 0;
      let finalAmount = netAmount;

      // Apply tenure-based percentage
      if (data.tenure === "1 Year") {
        finalAmount = netAmount * 1.0; // 100%
      } else if (data.tenure === "2 Years") {
        finalAmount = netAmount * 0.9; // 90%
      } else if (data.tenure === "3 Years") {
        finalAmount = netAmount * 0.8; // 80%
      }

      // Apply discount if available
      if (data.discountOffer && discountType !== 'none' && data.discountOfferType !== 'None') {
        const discountValue = parseFloat(data.discountOffer) || 0;
        let discountAmount = 0;

        if (discountType === 'percentage') {
          // Calculate discount: discount% of base premium, multiply by 5, subtract from final amount
          discountAmount = (baseAmount * discountValue / 100) * 5;
        } else if (discountType === 'fixed') {
          // Fixed amount: multiply by 5 and subtract from final amount
          discountAmount = discountValue * 5;
        }

        finalAmount = finalAmount - discountAmount;
      }

      // Apply final 90% rule
      finalAmount = finalAmount * 0.9;

      updateData({ updatedPremium: Math.max(0, finalAmount).toFixed(2) });
    }
  }, [data.netPremium, data.discountOffer, data.tenure, data.premium, discountType, updateData]);

  return (
    <div className="space-y-6 animate-slide-in" style={{ background: 'transparent' }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ background: 'transparent' }}>
        <Card className="hover:shadow-card transition-all duration-300" style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent className="p-4" style={{ background: 'transparent' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <IndianRupee className="w-4 h-4 text-primary" />
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
              disabled={disabledFields.includes('premium')}
              className="border-border/20 focus:border-primary transition-colors"
              style={{ opacity: disabledFields.includes('premium') ? 0.6 : 1, background: 'transparent' }}
            />
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-all duration-300" style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent className="p-4" style={{ background: 'transparent' }}>
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
              style={{ background: 'transparent' }}
            />
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-all duration-300" style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent className="p-4" style={{ background: 'transparent' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="tenure" className="text-sm font-medium">
                Policy Tenure *
              </Label>
            </div>
            <Select value={data.tenure} onValueChange={(value) => handleChange('tenure', value)}>
              <SelectTrigger className="border-border/20 focus:border-primary" style={{ background: 'transparent' }}>
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

        <Card className="hover:shadow-card transition-all duration-300" style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent className="p-4" style={{ background: 'transparent' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
                <Percent className="w-4 h-4 text-warning" />
              </div>
              <Label htmlFor="discountOfferType" className="text-sm font-medium">
                Discount Type
              </Label>
            </div>
            <Select value={data.discountOfferType} onValueChange={(value) => handleChange('discountOfferType', value)}>
              <SelectTrigger className="border-border/20 focus:border-primary" style={{ background: 'transparent' }}>
                <SelectValue placeholder="Select discount type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Instant PayU">Instant PayU</SelectItem>
                <SelectItem value="Cashback">Cashback</SelectItem>
                <SelectItem value="None">None</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-all duration-300" style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent className="p-4" style={{ background: 'transparent' }}>
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
                  per.
                </Button>
                <Button
                  type="button"
                  variant={discountType === 'fixed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDiscountType('fixed')}
                  className="flex items-center gap-1"
                >
                  <IndianRupee className="w-3 h-3" />
                  amt.
                </Button>
                <Button
                  type="button"
                  variant={discountType === 'none' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setDiscountType('none');
                    handleChange('discountOffer', '');
                    handleChange('discountOfferType', 'None');
                  }}
                  className="flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  none
                </Button>
              </div>
              {discountType !== 'none' && (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {discountType === 'fixed' ? '₹' : '%'}
                  </span>
                  <Input
                    id="discountOffer"
                    type="number"
                    placeholder={discountType === 'percentage' ? 'Enter discount % of Base Premium' : 'Enter fixed discount amount'}
                    value={data.discountOffer}
                    onChange={(e) => handleChange('discountOffer', e.target.value)}
                    className="border-border/20 focus:border-primary transition-colors pl-8"
                    min="0"
                    step="0.1"
                    style={{ background: 'transparent' }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-all duration-300" style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent className="p-4" style={{ background: 'transparent' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center">
                <IndianRupee className="w-4 h-4 text-info" />
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
              style={{ background: 'transparent' }}
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="border border-info/20 rounded-lg p-4" style={{ background: 'transparent' }}>
        <div className="flex items-start gap-3">
          <Calculator className="w-5 h-5 text-info mt-0.5" />
          <div>
            <p className="text-sm font-medium text-info-foreground mb-1">Premium Calculation Summary:</p>
            <div className="text-xs text-info-foreground/80 space-y-1">
              <div>Base Premium: ₹{data.premium || '0'}</div>
              <div>Net Premium: ₹{data.netPremium || '0'} (Base ÷ 1.18)</div>
              <div>Tenure Rate: {data.tenure === "1 Year" ? "100%" : data.tenure === "2 Years" ? "90%" : data.tenure === "3 Years" ? "80%" : "N/A"}</div>
              <div>Discount: {discountType === 'none' ? 'None (₹0)' : `${data.discountOffer || '0'}${discountType === 'percentage' ? '%' : '₹'} ${discountType === 'percentage' ? 'of Base Premium × 5' : '× 5'} = ₹${data.premium && data.discountOffer ? (discountType === 'percentage' ? ((parseFloat(data.premium) * parseFloat(data.discountOffer) / 100) * 5) : (parseFloat(data.discountOffer) * 5)).toFixed(2) : '0'}`}</div>
              <div>Final 90% Rule: After discount × 0.9</div>
              <div className="font-medium">Final Amount: ₹{data.updatedPremium || '0'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}