import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IndianRupee, Percent, Calculator, Clock, X, UserCheck, Users, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface FormData {
  employeeName?: string;
  team?: string;
  paymentDate: string;
  paymentMonth?: string;
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
  paymentMonth?: string;
  disabledFields?: string[];
}

interface AgentTrackRecord {
  employee_name: string;
  team: string;
  gst_offer: boolean;
  '90_weightage': boolean;
}

export function FinancialInfoForm({ data, updateData, paymentMonth, disabledFields = [] }: FinancialInfoFormProps) {
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed' | 'none'>('none');
  const [agentRecords, setAgentRecords] = useState<AgentTrackRecord[]>([]);
  const [employeesByTeam, setEmployeesByTeam] = useState<Record<string, string[]>>({});
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  const currentPaymentMonth = paymentMonth || data.paymentMonth;

  // Fetch employees and their GST / 90% weightage rules based on payment month
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!currentPaymentMonth) {
        setEmployeesByTeam({});
        setAgentRecords([]);
        return;
      }

      setIsLoadingEmployees(true);
      try {
        const { data: records, error } = await supabase
          .from('monthly_track_aps')
          .select('employee_name, team, gst_offer, 90_weightage')
          .eq('month', currentPaymentMonth);

        if (error) throw error;

        const typedRecords = (records || []) as AgentTrackRecord[];
        setAgentRecords(typedRecords);

        // Group employees by team
        const grouped: Record<string, string[]> = {};
        typedRecords.forEach((record) => {
          const team = record.team || 'Uncategorized';
          const employee = record.employee_name;
          if (employee) {
            if (!grouped[team]) {
              grouped[team] = [];
            }
            if (!grouped[team].includes(employee)) {
              grouped[team].push(employee);
            }
          }
        });

        setEmployeesByTeam(grouped);
      } catch (error) {
        console.error('Error fetching employees for financial info:', error);
        setEmployeesByTeam({});
        setAgentRecords([]);
      } finally {
        setIsLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, [currentPaymentMonth]);

  // Handle agent selection and auto-populate team
  const handleEmployeeChange = (employeeName: string) => {
    const matched = agentRecords.find((r) => r.employee_name === employeeName);
    const newTeam = matched?.team || '';
    updateData({
      employeeName,
      team: newTeam,
    });
  };

  // Sync team if employeeName was prefilled (e.g. restored session)
  useEffect(() => {
    if (!data.employeeName || agentRecords.length === 0) return;
    const matched = agentRecords.find((r) => r.employee_name === data.employeeName);
    if (matched && matched.team && matched.team !== data.team) {
      updateData({ team: matched.team });
    }
  }, [data.employeeName, agentRecords, data.team, updateData]);

  // Selected agent's GST Offer & 90% Weightage eligibility
  const selectedAgent = agentRecords.find((r) => r.employee_name === data.employeeName);
  const isGstEligible = Boolean(selectedAgent?.gst_offer);
  const is90WeightageEligible = Boolean(selectedAgent?.['90_weightage']);

  const handleChange = (field: keyof FormData, value: string) => {
    updateData({ [field]: value });

    // Set discount offer to 0 when discount type is "none"
    if (field === 'discountOfferType' && (value === 'None' || value === 'none')) {
      updateData({ discountOffer: '0' });
      setDiscountType('none');
    }
  };

  // Sync discountType with discountOfferType from data
  useEffect(() => {
    if (data.discountOfferType === 'None' || data.discountOfferType === 'none') {
      setDiscountType('none');
    }
  }, [data.discountOfferType]);

  const selectDiscountMode = (mode: 'percentage' | 'fixed') => {
    const nextOfferType = data.discountOfferType === 'Instant PayU'
      ? 'Cashback'
      : 'Instant PayU';

    setDiscountType(mode);
    updateData({ discountOfferType: nextOfferType });
  };

  const tenureOptions = [
    "1 Year", "2 Years", "3 Years"
  ];

  // Auto-calculate net premium from base premium:
  // If agent has gst_offer === true -> Base / 1.18 (GST deduction applies)
  // Else -> Base amount (No GST deduction applies)
  useEffect(() => {
    if (data.premium) {
      const baseAmount = parseFloat(data.premium) || 0;
      const netAmount = isGstEligible ? baseAmount / 1.18 : baseAmount;
      updateData({ netPremium: netAmount.toFixed(2) });
    } else {
      updateData({ netPremium: '' });
    }
  }, [data.premium, isGstEligible, updateData]);

  // Auto-calculate updated premium when discount is applied
  useEffect(() => {
    if (data.netPremium !== undefined && data.netPremium !== '') {
      const netAmount = parseFloat(data.netPremium) || 0;
      const baseAmount = parseFloat(data.premium) || 0;

      // 1. Apply date-specific and 90% weightage rule.
      const [day, month, year] = data.paymentDate.split('/').map(Number);
      const parsedPaymentDate = data.paymentDate.includes('/')
        ? new Date(year, month - 1, day)
        : new Date(data.paymentDate);
      const ninetyPercentRuleStart = new Date(2026, 7, 21);
      const ninetyPercentBeforeDiscountEnd = new Date(2026, 8, 24);
      const tenureRuleEnd = new Date(2026, 8, 8);

      // 90% Rule is ONLY applicable if agent has 90% weightage = true
      const isNinetyPercentRuleApplicable =
        is90WeightageEligible && (!data.paymentDate || parsedPaymentDate >= ninetyPercentRuleStart);
      const isNinetyPercentAfterDiscount =
        is90WeightageEligible &&
        data.paymentDate &&
        parsedPaymentDate >= ninetyPercentRuleStart &&
        parsedPaymentDate < ninetyPercentBeforeDiscountEnd;
      const isTenureRuleApplicable =
        !data.paymentDate || parsedPaymentDate <= tenureRuleEnd;
      let currentAmount = netAmount;

      // 2. Apply 90% before tenure for the current calculation order.
      if (isNinetyPercentRuleApplicable && !isNinetyPercentAfterDiscount) {
        currentAmount *= 0.9;
      }

      // 3. Apply tenure-based percentage
      if (!isTenureRuleApplicable || data.tenure === "1 Year") {
        currentAmount = currentAmount * 1.0; // 100%
      } else if (data.tenure === "2 Years") {
        currentAmount = currentAmount * 0.9; // 90%
      } else if (data.tenure === "3 Years") {
        currentAmount = currentAmount * 0.8; // 80%
      }

      // 4. Apply discount if available
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

      // 5. Between 21 Aug and 23 Sep 2026, 90% is applied after discount.
      if (isNinetyPercentAfterDiscount) {
        currentAmount *= 0.9;
      }

      updateData({ updatedPremium: Math.max(0, currentAmount).toFixed(2) });
    }
  }, [data.netPremium, data.discountOffer, data.tenure, data.premium, data.paymentDate, discountType, is90WeightageEligible, updateData]);

  return (
    <div className="space-y-6 animate-slide-in" style={{ background: 'transparent' }}>
      {/* Agent Name & Team Card at Top of Financial Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ background: 'transparent' }}>
        <Card className="hover:shadow-card transition-all duration-300" style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent className="p-4" style={{ background: 'transparent' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="employeeName" className="text-sm font-medium">
                Agent / Employee Name *
              </Label>
            </div>
            {isLoadingEmployees ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                Loading agents...
              </div>
            ) : currentPaymentMonth ? (
              <>
                {Object.keys(employeesByTeam).length > 0 ? (
                  <Select value={data.employeeName || ''} onValueChange={handleEmployeeChange}>
                    <SelectTrigger id="employeeName" className="border-border/20 focus:border-primary">
                      <SelectValue placeholder="Select agent / employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(employeesByTeam).map(([team, employees]) => (
                        <SelectGroup key={team}>
                          <SelectLabel className="font-semibold text-primary">{team}</SelectLabel>
                          {employees.map((employee) => (
                            <SelectItem key={employee} value={employee}>
                              {employee}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="employeeName"
                    placeholder={`No agents found for ${currentPaymentMonth}`}
                    value=""
                    disabled
                    className="border-border/20 bg-muted/50 cursor-not-allowed"
                  />
                )}
              </>
            ) : (
              <Input
                id="employeeName"
                placeholder="Select payment date first"
                value={data.employeeName || ''}
                disabled
                className="border-border/20 focus:border-primary transition-colors"
              />
            )}

            {/* Agent Eligibility Badges */}
            {data.employeeName && (
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border/10 text-xs">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${
                  isGstEligible
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-muted/40 text-muted-foreground border border-border/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isGstEligible ? 'bg-emerald-400' : 'bg-muted-foreground'}`} />
                  GST Offer: {isGstEligible ? 'Eligible (GST Deducted)' : 'Not Eligible (No GST Off)'}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${
                  is90WeightageEligible
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-muted/40 text-muted-foreground border border-border/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${is90WeightageEligible ? 'bg-emerald-400' : 'bg-muted-foreground'}`} />
                  90% Weightage: {is90WeightageEligible ? 'Eligible (90% Rule ON)' : 'Not Eligible (90% Rule OFF)'}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-all duration-300" style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent className="p-4" style={{ background: 'transparent' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="team" className="text-sm font-medium">
                Team *
              </Label>
            </div>
            <Input
              id="team"
              placeholder={data.team || 'Auto-populated based on agent selection'}
              value={data.team || ''}
              disabled
              className="border-border/20 bg-muted/50 cursor-not-allowed"
            />
          </CardContent>
        </Card>
      </div>

      {/* Pricing / Premium Details Grid */}
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
                Net Premium (Auto-calculated) {isGstEligible ? '(18% GST Out)' : '(No GST Off)'}
              </Label>
            </div>
            <Input
              id="netPremium"
              type="number"
              placeholder={isGstEligible ? "Auto-calculated (Base ÷ 1.18)" : "Auto-calculated (Equal to Base)"}
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
                  onClick={() => selectDiscountMode('percentage')}
                  className="flex items-center gap-1"
                >
                  <Percent className="w-3 h-3" />
                  per.
                </Button>
                <Button
                  type="button"
                  variant={discountType === 'fixed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => selectDiscountMode('fixed')}
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
        const netAmount = parseFloat(data.netPremium) || (baseAmount > 0 ? (isGstEligible ? baseAmount / 1.18 : baseAmount) : 0);
        const netDiff = isGstEligible && baseAmount > 0 ? baseAmount - netAmount : 0;

        const [day, month, year] = data.paymentDate.split('/').map(Number);
        const parsedPaymentDate = data.paymentDate.includes('/')
          ? new Date(year, month - 1, day)
          : new Date(data.paymentDate);
        const ninetyPercentRuleStart = new Date(2026, 7, 21);
        const ninetyPercentBeforeDiscountEnd = new Date(2026, 8, 24);
        const tenureRuleEnd = new Date(2026, 8, 9);

        // 90% Rule is ONLY applied if agent has 90% weightage = true
        const isNinetyPercentRuleApplicable =
          is90WeightageEligible && (!data.paymentDate || parsedPaymentDate >= ninetyPercentRuleStart);
        const isNinetyPercentAfterDiscount =
          is90WeightageEligible &&
          data.paymentDate &&
          parsedPaymentDate >= ninetyPercentRuleStart &&
          parsedPaymentDate < ninetyPercentBeforeDiscountEnd;
        const isTenureRuleApplicable =
          !data.paymentDate || parsedPaymentDate <= tenureRuleEnd;

        let tenureMultiplier = 1.0;
        let tenureText = "100%";
        if (isTenureRuleApplicable && data.tenure === "2 Years") {
          tenureMultiplier = 0.9;
          tenureText = "90% (10% off)";
        } else if (isTenureRuleApplicable && data.tenure === "3 Years") {
          tenureMultiplier = 0.8;
          tenureText = "80% (20% off)";
        } else if (!isTenureRuleApplicable) {
          tenureText = "Not applicable after 8 Sep 2026";
        }
        const amountBeforeTenure = isNinetyPercentAfterDiscount
          ? netAmount
          : isNinetyPercentRuleApplicable
            ? netAmount * 0.9
            : netAmount;
        const amountAfterTenure = amountBeforeTenure * tenureMultiplier;
        const tenureDiff = amountBeforeTenure - amountAfterTenure;

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
        const amountAfterDiscount = Math.max(0, amountAfterTenure - discountAmount);
        const amountAfter90Rule = isNinetyPercentAfterDiscount
          ? amountAfterDiscount * 0.9
          : isNinetyPercentRuleApplicable
            ? netAmount * 0.9
            : netAmount;
        const diff90 = isNinetyPercentAfterDiscount
          ? amountAfterDiscount - amountAfter90Rule
          : isNinetyPercentRuleApplicable
            ? netAmount - amountAfter90Rule
            : 0;
        const finalCalculatedAmount = isNinetyPercentAfterDiscount
          ? amountAfter90Rule
          : amountAfterDiscount;

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
                    <TableCell className="py-2 px-3 text-muted-foreground">
                      {isGstEligible ? 'Base ÷ 1.18 (GST Deducted)' : 'No GST Deduction (Base = Net)'}
                    </TableCell>
                    <TableCell className="py-2 px-3 text-right font-mono text-rose-400">
                      {netDiff > 0 ? `-₹${netDiff.toFixed(2)}` : '₹0.00'}
                    </TableCell>
                    <TableCell className="py-2 px-3 text-right font-mono font-medium">₹{netAmount.toFixed(2)}</TableCell>
                  </TableRow>

                  {/* 3. 90% Rule (Only added if agent has 90% weightage = true) */}
                  {isNinetyPercentRuleApplicable && !isNinetyPercentAfterDiscount && (
                    <TableRow className="border-b border-border/10 hover:bg-muted/10">
                      <TableCell className="py-2 px-3 font-medium">90% Rule</TableCell>
                      <TableCell className="py-2 px-3 text-muted-foreground">
                        Net Premium × 0.9 (90% Weightage Active)
                      </TableCell>
                      <TableCell className="py-2 px-3 text-right font-mono text-rose-400">
                        {diff90 > 0 ? `-₹${diff90.toFixed(2)}` : '₹0.00'}
                      </TableCell>
                      <TableCell className="py-2 px-3 text-right font-mono font-medium">₹{amountAfter90Rule.toFixed(2)}</TableCell>
                    </TableRow>
                  )}

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
                    <TableCell className="py-2 px-3 text-right font-mono font-medium">₹{amountAfterDiscount.toFixed(2)}</TableCell>
                  </TableRow>

                  {/* 90% Rule if applied after discount */}
                  {isNinetyPercentAfterDiscount && (
                    <TableRow className="border-b border-border/10 hover:bg-muted/10">
                      <TableCell className="py-2 px-3 font-medium">90% Rule</TableCell>
                      <TableCell className="py-2 px-3 text-muted-foreground">After discount × 0.9 (90% Weightage Active)</TableCell>
                      <TableCell className="py-2 px-3 text-right font-mono text-rose-400">
                        {diff90 > 0 ? `-₹${diff90.toFixed(2)}` : '₹0.00'}
                      </TableCell>
                      <TableCell className="py-2 px-3 text-right font-mono font-medium">₹{amountAfter90Rule.toFixed(2)}</TableCell>
                    </TableRow>
                  )}

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