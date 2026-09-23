import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IndianRupee, Percent, Calculator, Clock, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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

    // Set discount offer to 0 when discount type is "none"
    if (field === 'discountOfferType' && (value === 'None' || value === 'none')) {
      updateData({ discountOffer: '0' });
      setDiscountType('none');
    } else if (field === 'discountOfferType' && value !== 'None' && value !== 'none') {
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

      // 1. Apply 90% rule after net premium
      let currentAmount = netAmount * 0.9;

      // 2. Apply tenure-based percentage
      if (data.tenure === "1 Year") {
        currentAmount = currentAmount * 1.0; // 100%
      } else if (data.tenure === "2 Years") {
        currentAmount = currentAmount * 0.9; // 90%
      } else if (data.tenure === "3 Years") {
        currentAmount = currentAmount * 0.8; // 80%
      }

      // 3. Apply discount if available
      if (data.discountOffer && discountType !== 'none' && data.discountOfferType !== 'None' && data.discountOfferType !== 'none') {
        const discountValue = parseFloat(data.discountOffer) || 0;
        let discountAmount = 0;

        if (discountType === 'percentage') {
          // Calculate discount: discount% of base premium, multiply by 5, subtract from amount
          discountAmount = (baseAmount * discountValue / 100) * 5;
        } else if (discountType === 'fixed') {
          // Fixed amount: multiply by 5 and subtract from amount
          discountAmount = discountValue * 5;
        }

        currentAmount = currentAmount - discountAmount;
      }

      updateData({ updatedPremium: Math.max(0, currentAmount).toFixed(2) });
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
            <Select value={data.discountOfferType || 'none'} onValueChange={(value) => handleChange('discountOfferType', value)}>
              <SelectTrigger className="border-border/20 focus:border-primary" style={{ background: 'transparent' }}>
                <SelectValue placeholder="Select discount type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="Instant PayU">Instant PayU</SelectItem>
                <SelectItem value="Cashback">Cashback</SelectItem>
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
                    handleChange('discountOffer', '0');
                    handleChange('discountOfferType', 'none');
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
      
      {(() => {
        const baseAmount = parseFloat(data.premium) || 0;
        const netAmount = parseFloat(data.netPremium) || (baseAmount > 0 ? baseAmount / 1.18 : 0);
        const netDiff = baseAmount > 0 ? baseAmount - netAmount : 0;

        const amountAfter90 = netAmount * 0.9;
        const diff90 = netAmount - amountAfter90;

        let tenureMultiplier = 1.0;
        let tenureText = "100%";
        if (data.tenure === "2 Years") {
          tenureMultiplier = 0.9;
          tenureText = "90% (10% off)";
        } else if (data.tenure === "3 Years") {
          tenureMultiplier = 0.8;
          tenureText = "80% (20% off)";
        }
        const amountAfterTenure = amountAfter90 * tenureMultiplier;
        const tenureDiff = amountAfter90 - amountAfterTenure;

        let discountAmount = 0;
        let discountDetail = "None (₹0)";
        if (data.discountOffer && discountType !== 'none' && data.discountOfferType !== 'None' && data.discountOfferType !== 'none') {
          const discountVal = parseFloat(data.discountOffer) || 0;
          if (discountType === 'percentage') {
            discountAmount = (baseAmount * discountVal / 100) * 5;
            discountDetail = `${discountVal}% of Base × 5`;
          } else if (discountType === 'fixed') {
            discountAmount = discountVal * 5;
            discountDetail = `₹${discountVal} × 5`;
          }
        }
        const finalCalculatedAmount = Math.max(0, amountAfterTenure - discountAmount);

        return (
          <div className="border border-info/20 rounded-lg p-4 space-y-3" style={{ background: 'transparent' }}>
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-info" />
              <p className="text-sm font-semibold text-info-foreground">Premium Calculation Summary</p>
            </div>

            <div className="rounded-md border border-border/20 overflow-hidden overflow-x-auto">
              <Table className="w-full text-xs">
                <TableHeader className="bg-muted/20">
                  <TableRow className="border-b border-border/20">
                    <TableHead className="py-2.5 px-3 font-semibold text-foreground">Rule / Step</TableHead>
                    <TableHead className="py-2.5 px-3 font-semibold text-foreground">Formula / Details</TableHead>
                    <TableHead className="py-2.5 px-3 font-semibold text-right text-foreground">Diff / Deduction</TableHead>
                    <TableHead className="py-2.5 px-3 font-semibold text-right text-foreground">After Amount Premium</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* 1. Base Premium */}
                  <TableRow className="border-b border-border/10 hover:bg-muted/10">
                    <TableCell className="py-2 px-3 font-medium">Base Premium</TableCell>
                    <TableCell className="py-2 px-3 text-muted-foreground">Original input</TableCell>
                    <TableCell className="py-2 px-3 text-right text-muted-foreground">-</TableCell>
                    <TableCell className="py-2 px-3 text-right font-mono font-medium">₹{baseAmount.toFixed(2)}</TableCell>
                  </TableRow>

                  {/* 2. Net Premium */}
                  <TableRow className="border-b border-border/10 hover:bg-muted/10">
                    <TableCell className="py-2 px-3 font-medium">Net Premium</TableCell>
                    <TableCell className="py-2 px-3 text-muted-foreground">Base ÷ 1.18</TableCell>
                    <TableCell className="py-2 px-3 text-right font-mono text-rose-400">
                      {netDiff > 0 ? `-₹${netDiff.toFixed(2)}` : '₹0.00'}
                    </TableCell>
                    <TableCell className="py-2 px-3 text-right font-mono font-medium">₹{netAmount.toFixed(2)}</TableCell>
                  </TableRow>

                  {/* 3. 90% Rule */}
                  <TableRow className="border-b border-border/10 hover:bg-muted/10">
                    <TableCell className="py-2 px-3 font-medium">90% Rule</TableCell>
                    <TableCell className="py-2 px-3 text-muted-foreground">Net Premium × 0.9</TableCell>
                    <TableCell className="py-2 px-3 text-right font-mono text-rose-400">
                      {diff90 > 0 ? `-₹${diff90.toFixed(2)}` : '₹0.00'}
                    </TableCell>
                    <TableCell className="py-2 px-3 text-right font-mono font-medium">₹{amountAfter90.toFixed(2)}</TableCell>
                  </TableRow>

                  {/* 4. Tenure Rate */}
                  <TableRow className="border-b border-border/10 hover:bg-muted/10">
                    <TableCell className="py-2 px-3 font-medium">Tenure Rate</TableCell>
                    <TableCell className="py-2 px-3 text-muted-foreground">{data.tenure || '1 Year'}: {tenureText}</TableCell>
                    <TableCell className="py-2 px-3 text-right font-mono text-rose-400">
                      {tenureDiff > 0 ? `-₹${tenureDiff.toFixed(2)}` : '₹0.00'}
                    </TableCell>
                    <TableCell className="py-2 px-3 text-right font-mono font-medium">₹{amountAfterTenure.toFixed(2)}</TableCell>
                  </TableRow>

                  {/* 5. Discount */}
                  <TableRow className="border-b border-border/10 hover:bg-muted/10">
                    <TableCell className="py-2 px-3 font-medium">Discount</TableCell>
                    <TableCell className="py-2 px-3 text-muted-foreground">{discountDetail}</TableCell>
                    <TableCell className="py-2 px-3 text-right font-mono text-rose-400">
                      {discountAmount > 0 ? `-₹${discountAmount.toFixed(2)}` : '₹0.00'}
                    </TableCell>
                    <TableCell className="py-2 px-3 text-right font-mono font-medium">₹{finalCalculatedAmount.toFixed(2)}</TableCell>
                  </TableRow>

                  {/* Final Row */}
                  <TableRow className="bg-info/10 font-bold border-t border-info/30">
                    <TableCell className="py-2.5 px-3 text-info-foreground font-bold">Final Amount</TableCell>
                    <TableCell className="py-2.5 px-3 text-xs text-muted-foreground">Total Payable Amount</TableCell>
                    <TableCell className="py-2.5 px-3 text-right font-mono text-rose-400 font-semibold">
                      {baseAmount > finalCalculatedAmount ? `-₹${(baseAmount - finalCalculatedAmount).toFixed(2)}` : '₹0.00'}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-right font-mono text-emerald-400 text-sm font-bold">
                      ₹{data.updatedPremium || finalCalculatedAmount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        );
      })()}
    </div>
  );
}