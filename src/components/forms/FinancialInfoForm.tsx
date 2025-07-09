import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Percent, Calculator, Clock } from 'lucide-react';

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
  const handleChange = (field: keyof FormData, value: string) => {
    updateData({ [field]: value });
  };

  const tenureOptions = [
    "1 Year", "2 Years", "3 Years", "5 Years", "10 Years", 
    "15 Years", "20 Years", "25 Years", "30 Years"
  ];

  // Auto-calculate updated premium when discount is applied
  React.useEffect(() => {
    if (data.netPremium && data.discountOffer) {
      const netAmount = parseFloat(data.netPremium) || 0;
      const discount = parseFloat(data.discountOffer) || 0;
      const updated = netAmount - (netAmount * discount / 100);
      updateData({ updatedPremium: updated.toFixed(2) });
    }
  }, [data.netPremium, data.discountOffer]);

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
                Base Premium *
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
                Net Premium *
              </Label>
            </div>
            <Input
              id="netPremium"
              type="number"
              placeholder="Enter net premium amount"
              value={data.netPremium}
              onChange={(e) => handleChange('netPremium', e.target.value)}
              className="border-border/20 focus:border-primary transition-colors"
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
                Discount Offer (%)
              </Label>
            </div>
            <Input
              id="discountOffer"
              type="number"
              placeholder="Enter discount percentage"
              value={data.discountOffer}
              onChange={(e) => handleChange('discountOffer', e.target.value)}
              className="border-border/20 focus:border-primary transition-colors"
              min="0"
              max="100"
              step="0.1"
            />
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
              <div>Net Premium: ₹{data.netPremium || '0'}</div>
              <div>Discount: {data.discountOffer || '0'}%</div>
              <div className="font-medium">Final Amount: ₹{data.updatedPremium || '0'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}