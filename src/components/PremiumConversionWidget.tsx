'use client';

import React, { useState } from 'react';
import {
  Calculator,
  IndianRupee,
  Percent,
  Clock,
  ArrowLeft,
  RotateCcw,
  Copy,
  Check,
  TrendingDown,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { useToast } from '@/hooks/use-toast';

export interface CalculatedData {
  premium: string;
  netPremium: string;
  tenure: string;
  discountOffer: string;
  discountOfferType: string;
  updatedPremium: string;
}

interface PremiumConversionWidgetProps {
  onCancel: () => void;
  onApplyToBooking?: (data: CalculatedData) => void;
  initialBasePremium?: string;
  paymentDate?: string;
}

export function PremiumConversionWidget({
  onCancel,
  onApplyToBooking,
  initialBasePremium = '',
  paymentDate = '',
}: PremiumConversionWidgetProps) {
  const { toast } = useToast();

  const [basePremium, setBasePremium] =
    useState<string>(initialBasePremium);

  const [tenure, setTenure] = useState<string>('1 Year');

  const [discountType, setDiscountType] = useState<
    'none' | 'percentage' | 'fixed'
  >('none');

  const [discountValue, setDiscountValue] =
    useState<string>('0');

  const [copied, setCopied] = useState<boolean>(false);

  // =========================================================
  // CALCULATIONS
  // =========================================================

  const baseAmount = parseFloat(basePremium) || 0;

  // 1. Remove 18% GST
  const netAmount =
    baseAmount > 0 ? baseAmount / 1.18 : 0;

  const netDiff =
    baseAmount > 0 ? baseAmount - netAmount : 0;

  // 2. 90% Rule: dates before 21 August 2026 are exempt.
  const parsedPaymentDate = paymentDate
    ? paymentDate.includes('/')
      ? (() => {
          const [day, month, year] = paymentDate.split('/').map(Number);
          return new Date(year, month - 1, day);
        })()
      : new Date(paymentDate)
    : undefined;
  const ninetyPercentRuleStart = new Date(2026, 7, 21);
  const ninetyPercentBeforeDiscountStart = new Date(2026, 7, 21);
  const ninetyPercentBeforeDiscountEnd = new Date(2026, 8, 24);
  const isNinetyPercentRuleApplicable =
    !parsedPaymentDate || parsedPaymentDate >= ninetyPercentRuleStart;
  const isNinetyPercentAfterDiscount =
    parsedPaymentDate !== undefined &&
    parsedPaymentDate >= ninetyPercentBeforeDiscountStart &&
    parsedPaymentDate < ninetyPercentBeforeDiscountEnd;
  const tenureRuleEnd = new Date(2026, 8, 9);
  const isTenureRuleApplicable =
    !parsedPaymentDate || parsedPaymentDate <= tenureRuleEnd;

  // 3. Tenure Rate
  let tenureMultiplier = 1.0;
  let tenureText = '100%';

  if (isTenureRuleApplicable && tenure === '2 Years') {
    tenureMultiplier = 0.9;
    tenureText = '90% (10% off)';
  } else if (isTenureRuleApplicable && tenure === '3 Years') {
    tenureMultiplier = 0.8;
    tenureText = '80% (20% off)';
  } else if (!isTenureRuleApplicable) {
    tenureText = 'Not applicable after 9 Sep 2026';
  }

  const amountBeforeTenure = isNinetyPercentAfterDiscount
    ? netAmount
    : isNinetyPercentRuleApplicable
      ? netAmount * 0.9
      : netAmount;
  const amountAfterTenure = amountBeforeTenure * tenureMultiplier;
  const tenureDiff = amountBeforeTenure - amountAfterTenure;

  // 4. Discount
  let discountAmount = 0;
  let discountDetail = 'None (₹0)';

  if (discountType !== 'none') {
    const dVal =
      parseFloat(discountValue) || 0;

    if (discountType === 'percentage') {
      discountAmount =
        (baseAmount * dVal / 100) * 5;

      discountDetail =
        `${dVal}% of Base × 5`;
    } else if (discountType === 'fixed') {
      discountAmount =
        dVal * 5;

      discountDetail =
        `₹${dVal} × 5`;
    }
  }

  const amountAfterDiscount = Math.max(0, amountAfterTenure - discountAmount);
  const amountAfter90 = isNinetyPercentAfterDiscount
    ? amountAfterDiscount * 0.9
    : amountAfterDiscount;
  const diff90 = isNinetyPercentAfterDiscount
    ? amountAfterDiscount - amountAfter90
    : isNinetyPercentRuleApplicable
      ? netAmount - netAmount * 0.9
      : 0;
  const finalAmount = isNinetyPercentAfterDiscount
    ? amountAfter90
    : amountAfterDiscount;

  const totalSavings =
    baseAmount > finalAmount
      ? baseAmount - finalAmount
      : 0;

  // =========================================================
  // RESET
  // =========================================================

  const handleReset = () => {
    setBasePremium('');
    setTenure('1 Year');
    setDiscountType('none');
    setDiscountValue('0');
  };

  // =========================================================
  // COPY SUMMARY
  // =========================================================

  const handleCopySummary = () => {
    if (baseAmount === 0) return;

    const text = `Premium Calculation Summary:
• Base Premium: ₹${baseAmount.toFixed(2)}
• Net Premium: ₹${netAmount.toFixed(2)} (Base ÷ 1.18)
• 90% Rule: ₹${amountAfter90.toFixed(2)} (Net × 0.9)
• Tenure Rate (${tenure}): ₹${amountAfterTenure.toFixed(2)} (${tenureText})
• Discount: ₹${discountAmount.toFixed(2)} (${discountDetail})
• Total Savings: ₹${totalSavings.toFixed(2)}
• Final Amount: ₹${finalAmount.toFixed(2)}`;

    navigator.clipboard.writeText(text);

    setCopied(true);

    toast({
      title: 'Copied to Clipboard',
      description:
        'Premium calculation summary copied successfully.',
    });

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  // =========================================================
  // APPLY
  // =========================================================

  const handleApply = () => {
    if (onApplyToBooking) {
      onApplyToBooking({
        premium: basePremium,
        netPremium: netAmount.toFixed(2),
        tenure,
        discountOffer:
          discountType === 'none'
            ? '0'
            : discountValue,

        discountOfferType:
          discountType === 'percentage'
            ? 'Instant PayU'
            : discountType === 'fixed'
              ? 'Cashback'
              : 'none',

        updatedPremium:
          finalAmount.toFixed(2),
      });
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="flex items-start sm:items-center justify-center min-h-screen p-0 m-0 relative z-20">

      {/* MAIN TRANSPARENT WIDGET */}
      <div
        className="conversion-widget-shell w-full max-w-3xl p-0 m-0 animate-fade-in-up widget-transition bg-transparent border-0 shadow-none rounded-none"
      >
        <style>{`
          .conversion-widget-shell.widget-transition {
            animation-duration: 650ms;
            animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
          }
          @media (prefers-reduced-motion: reduce) {
            .conversion-widget-shell.widget-transition { animation: none; }
          }
        `}</style>

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-white/[0.07]">

          <div className="flex items-center gap-3">

            <div
              className="
                w-9
                h-9
                sm:w-10
                sm:h-10
                shrink-0
                rounded-xl
                bg-cyan-400/[0.07]
                border
                border-cyan-400/[0.15]
                flex
                items-center
                justify-center
                text-cyan-400
              "
            >
              <Calculator className="w-5 h-5" />
            </div>

            <div>
              <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2 leading-tight">
                <span className="sm:hidden">Premium Calculator</span>
                <span className="hidden sm:inline">Premium Conversion Calculator</span>

            
              </h2>

             
            </div>

          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="
                text-white/60
                hover:text-white
                hover:bg-white/[0.05]
                text-xs
                h-8
                px-2.5
                flex-1 sm:flex-none
              "
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="
                border-white/[0.10]
                text-white/80
                hover:bg-white/[0.05]
                text-xs
                h-8
                px-3
                flex-1 sm:flex-none
              "
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back
            </Button>

          </div>
        </div>

        {/* =====================================================
            INPUT CONTROLS
        ====================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 my-4 sm:my-6">

          {/* BASE PREMIUM */}

          <Card
            className="
              bg-white/[0.018]
              border-white/[0.07]
              hover:border-cyan-500/[0.30]
              transition-colors
            "
          >
            <CardContent className="p-3 sm:p-4 space-y-2">

              <div className="flex items-center gap-2 text-cyan-400">

                <IndianRupee className="w-4 h-4" />

                <Label
                  htmlFor="conv-base"
                  className="
                    text-xs
                    font-semibold
                    text-white
                    uppercase
                    tracking-wider
                  "
                >
                  Base Premium *
                </Label>

              </div>

              <Input
                id="conv-base"
                type="number"
                placeholder="e.g. 48479"
                value={basePremium}
                onChange={(e) =>
                  setBasePremium(e.target.value)
                }
                className="
                  bg-white/[0.015]
                  border-white/[0.08]
                  text-white
                  placeholder:text-white/25
                  focus:border-cyan-400
                  font-mono
                  text-base
                "
                min="0"
                step="1"
                autoFocus
              />

              <span className="text-[11px] text-white/35 block">
                <span className="sm:hidden">Policy quote</span>
                <span className="hidden sm:inline">Gross payable / policy quote</span>
              </span>

            </CardContent>
          </Card>

          {/* TENURE */}

          <Card
            className="
              bg-white/[0.018]
              border-white/[0.07]
              hover:border-purple-500/[0.30]
              transition-colors
            "
          >
            <CardContent className="p-3 sm:p-4 space-y-2">

              <div className="flex items-center gap-2 text-purple-400">

                <Clock className="w-4 h-4" />

                <Label
                  className="
                    text-xs
                    font-semibold
                    text-white
                    uppercase
                    tracking-wider
                  "
                >
                  Policy Tenure
                </Label>

              </div>

              <Select
                value={tenure}
                onValueChange={setTenure}
              >
                <SelectTrigger
                  className="
                    bg-white/[0.015]
                    border-white/[0.08]
                    text-white
                    focus:border-purple-400
                    text-sm
                  "
                >
                  <SelectValue placeholder="Select tenure" />
                </SelectTrigger>

                <SelectContent
                  className="
                    bg-neutral-950/95
                    backdrop-blur-xl
                    border-white/[0.10]
                    text-white
                  "
                >
                  <SelectItem value="1 Year">
                    1 Year (100% Rate)
                  </SelectItem>

                  <SelectItem value="2 Years">
                    2 Years (90% Rate)
                  </SelectItem>

                  <SelectItem value="3 Years">
                    3 Years (80% Rate)
                  </SelectItem>
                </SelectContent>
              </Select>

              <span className="text-[11px] text-white/35 block">
                <span className="sm:hidden">After 90% rule</span>
                <span className="hidden sm:inline">Multiplier applied after 90% rule</span>
              </span>

            </CardContent>
          </Card>

          {/* DISCOUNT */}

          <Card
            className="
              bg-white/[0.018]
              border-white/[0.07]
              hover:border-amber-500/[0.30]
              transition-colors
            "
          >
            <CardContent className="p-3 sm:p-4 space-y-2">

              <div className="flex items-center gap-2 text-amber-400">

                <Percent className="w-4 h-4" />

                <Label
                  className="
                    text-xs
                    font-semibold
                    text-white
                    uppercase
                    tracking-wider
                  "
                >
                  Discount Offer
                </Label>

              </div>

              {/* DISCOUNT BUTTONS */}

              <div className="flex gap-1.5">

                <Button
                  type="button"
                  size="sm"
                  variant={
                    discountType === 'none'
                      ? 'default'
                      : 'outline'
                  }
                  onClick={() => {
                    setDiscountType('none');
                    setDiscountValue('0');
                  }}
                  className={`
                    h-7
                    px-2
                    text-xs
                    flex-1
                    ${
                      discountType === 'none'
                        ? 'bg-white/[0.10] text-white border-white/[0.15]'
                        : 'bg-transparent border-white/[0.07] text-white/60 hover:bg-white/[0.04]'
                    }
                  `}
                >
                  None
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant={
                    discountType === 'percentage'
                      ? 'default'
                      : 'outline'
                  }
                  onClick={() =>
                    setDiscountType('percentage')
                  }
                  className={`
                    h-7
                    px-2
                    text-xs
                    flex-1
                    ${
                      discountType === 'percentage'
                        ? 'bg-amber-500/[0.15] text-amber-300 border-amber-500/[0.30]'
                        : 'bg-transparent border-white/[0.07] text-white/60 hover:bg-white/[0.04]'
                    }
                  `}
                >
                  %
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant={
                    discountType === 'fixed'
                      ? 'default'
                      : 'outline'
                  }
                  onClick={() =>
                    setDiscountType('fixed')
                  }
                  className={`
                    h-7
                    px-2
                    text-xs
                    flex-1
                    ${
                      discountType === 'fixed'
                        ? 'bg-amber-500/[0.15] text-amber-300 border-amber-500/[0.30]'
                        : 'bg-transparent border-white/[0.07] text-white/60 hover:bg-white/[0.04]'
                    }
                  `}
                >
                  ₹
                </Button>

              </div>

              {discountType !== 'none' ? (

                <div className="relative">

                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40 text-xs">
                    {discountType === 'fixed'
                      ? '₹'
                      : '%'}
                  </span>

                  <Input
                    type="number"
                    placeholder={
                      discountType === 'percentage'
                        ? 'Discount %'
                        : 'Discount ₹'
                    }
                    value={discountValue}
                    onChange={(e) =>
                      setDiscountValue(e.target.value)
                    }
                    className="
                      bg-white/[0.015]
                      border-white/[0.08]
                      text-white
                      pl-6
                      text-xs
                      h-8
                      font-mono
                    "
                    min="0"
                    step="0.1"
                  />

                </div>

              ) : (

                <span className="text-[11px] text-white/35 block">
                  <span className="sm:hidden">No discount</span>
                  <span className="hidden sm:inline">No discount applied</span>
                </span>

              )}

            </CardContent>
          </Card>

        </div>

        {/* =====================================================
            RESULT CARDS
        ====================================================== */}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">

          {/* BASE */}

          <div
            className="
              rounded-xl
              bg-white/[0.012]
              border
              border-white/[0.07]
              p-2.5 sm:p-3
            "
          >
            <span className="text-[11px] text-white/45 uppercase block font-medium">
              Base Premium
            </span>

            <span className="text-sm sm:text-base font-bold text-white font-mono break-words">
              ₹
              {baseAmount.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* NET */}

          <div
            className="
              rounded-xl
              bg-cyan-400/[0.015]
              border
              border-cyan-400/[0.10]
              p-2.5 sm:p-3
            "
          >
            <span className="text-[11px] text-cyan-400 uppercase block font-medium">
              Net Premium
            </span>

            <span className="text-sm sm:text-base font-bold text-cyan-300 font-mono break-words">
              ₹
              {netAmount.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>

            <span className="text-[10px] text-white/35 block">
              Base ÷ 1.18
            </span>
          </div>

          {/* SAVINGS */}

          <div
            className="
              rounded-xl
              bg-rose-400/[0.015]
              border
              border-rose-400/[0.08]
              p-2.5 sm:p-3
            "
          >
            <span className="text-[11px] text-rose-400 uppercase block font-medium">
              <span className="sm:hidden">Saved</span>
              <span className="hidden sm:inline">Total Saved (Diff)</span>
            </span>

            <span className="text-sm sm:text-base font-bold text-rose-300 font-mono break-words">
              -₹
              {totalSavings.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>

            <span className="text-[10px] text-white/35 block">
              Overall reduction
            </span>
          </div>

          {/* FINAL */}

          <div
            className="
              rounded-xl
              bg-emerald-400/[0.035]
              border
              border-emerald-400/[0.15]
              p-2.5 sm:p-3
            "
          >
            <span className="text-[11px] text-emerald-400 uppercase block font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Final Amount
            </span>

            <span className="text-base sm:text-lg font-extrabold text-emerald-300 font-mono break-words">
              ₹
              {finalAmount.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>

            <span className="text-[10px] text-emerald-400/60 block">
              After all rules applied
            </span>
          </div>

        </div>

        {/* =====================================================
            TABLE
        ====================================================== */}

        <div
          className="
            rounded-xl
            border
            border-white/[0.08]
            overflow-hidden
            mb-6
            bg-white/[0.008]
          "
        >

          {/* TABLE HEADER */}

          <div
            className="
              bg-white/[0.018]
              px-3
                py-2.5
                flex
                items-center
                justify-between
                gap-2
              border-b
              border-white/[0.07]
            "
          >

            <span
              className="
                text-[11px]
                sm:text-xs
                font-semibold
                text-white/80
                uppercase
                tracking-wider
                flex
                min-w-0
                items-center
                gap-1.5
              "
            >
              <TrendingDown className="w-3.5 h-3.5 text-cyan-400" />
              <span className="sm:hidden">Rule Breakdown</span>
              <span className="hidden sm:inline">Step-by-Step Rule Breakdown & Difference</span>
            </span>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopySummary}
              disabled={baseAmount === 0}
              className="
                text-white/50
                hover:text-white
                hover:bg-white/[0.04]
                h-7
                px-2
                text-xs
                shrink-0
              "
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  <span className="text-emerald-400">
                    Copied
                  </span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy Table
                </>
              )}
            </Button>

          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">

            <Table className="min-w-[620px] w-full text-xs">

              <TableHeader className="bg-white/[0.012]">

                <TableRow className="border-b border-white/[0.07]">

                  <TableHead className="py-2.5 px-3 font-semibold text-white/70">
                    Rule / Step
                  </TableHead>

                  <TableHead className="py-2.5 px-3 font-semibold text-white/70">
                    <span className="sm:hidden">Formula</span>
                    <span className="hidden sm:inline">Formula / Calculation</span>
                  </TableHead>

                  <TableHead className="py-2.5 px-3 font-semibold text-right text-white/70">
                    <span className="sm:hidden">Diff</span>
                    <span className="hidden sm:inline">Diff / Deduction</span>
                  </TableHead>

                  <TableHead className="py-2.5 px-3 font-semibold text-right text-white/70">
                    <span className="sm:hidden">Final</span>
                    <span className="hidden sm:inline">After Amount Premium</span>
                  </TableHead>

                </TableRow>

              </TableHeader>

              <TableBody>

                {/* 1 BASE */}

                <TableRow className="border-b border-white/[0.045] hover:bg-white/[0.015]">

                  <TableCell className="py-2.5 px-3 font-medium text-white">
                    1. Base Premium
                  </TableCell>

                  <TableCell className="py-2.5 px-3 text-white/50">
                    Original policy quote entered
                  </TableCell>

                  <TableCell className="py-2.5 px-3 text-right text-white/30">
                    -
                  </TableCell>

                  <TableCell className="py-2.5 px-3 text-right font-mono font-medium text-white">
                    ₹{baseAmount.toFixed(2)}
                  </TableCell>

                </TableRow>

                {/* 2 NET */}

                <TableRow className="border-b border-white/[0.045] hover:bg-white/[0.015]">

                  <TableCell className="py-2.5 px-3 font-medium text-white">
                    2. Net Premium
                  </TableCell>

                  <TableCell className="py-2.5 px-3 text-white/50">
                    <span className="sm:hidden">GST removed</span>
                    <span className="hidden sm:inline">Base ÷ 1.18 (18% GST out)</span>
                  </TableCell>

                  <TableCell className="py-2.5 px-3 text-right font-mono text-rose-400">
                    {netDiff > 0
                      ? `-₹${netDiff.toFixed(2)}`
                      : '₹0.00'}
                  </TableCell>

                  <TableCell className="py-2.5 px-3 text-right font-mono font-medium text-cyan-300">
                    ₹{netAmount.toFixed(2)}
                  </TableCell>

                </TableRow>

                {/* 3 90% */}

                <TableRow className="border-b border-white/[0.045] hover:bg-white/[0.015]">

                  <TableCell className="py-2.5 px-3 font-medium text-white">
                    3. 90% Rule
                  </TableCell>

                  <TableCell className="py-2.5 px-3 text-white/50">
                    {isNinetyPercentRuleApplicable ? (
                      <>
                        <span className="sm:hidden">90% of net</span>
                        <span className="hidden sm:inline">Net Premium × 0.9 (10% standard rule)</span>
                      </>
                    ) : (
                      <>
                        <span className="sm:hidden">Not applicable</span>
                        <span className="hidden sm:inline">Not applicable before 21 Aug 2026</span>
                      </>
                    )}
                  </TableCell>

                  <TableCell className="py-2.5 px-3 text-right font-mono text-rose-400">
                    {diff90 > 0
                      ? `-₹${diff90.toFixed(2)}`
                      : '₹0.00'}
                  </TableCell>

                  <TableCell className="py-2.5 px-3 text-right font-mono font-medium text-white">
                    ₹{amountAfter90.toFixed(2)}
                  </TableCell>

                </TableRow>

                {/* 4 TENURE */}

                <TableRow className="border-b border-white/[0.045] hover:bg-white/[0.015]">

                  <TableCell className="py-2.5 px-3 font-medium text-white">
                    4. Tenure Rate ({tenure})
                  </TableCell>

                  <TableCell className="py-2.5 px-3 text-white/50">
                    <span className="sm:hidden">{tenureText}</span>
                    <span className="hidden sm:inline">{tenureText} applied on 90% amount</span>
                  </TableCell>

                  <TableCell className="py-2.5 px-3 text-right font-mono text-rose-400">
                    {tenureDiff > 0
                      ? `-₹${tenureDiff.toFixed(2)}`
                      : '₹0.00'}
                  </TableCell>

                  <TableCell className="py-2.5 px-3 text-right font-mono font-medium text-white">
                    ₹{amountAfterTenure.toFixed(2)}
                  </TableCell>

                </TableRow>

                {/* 5 DISCOUNT */}

                <TableRow className="border-b border-white/[0.045] hover:bg-white/[0.015]">

                  <TableCell className="py-2.5 px-3 font-medium text-white">

                    5. Discount (
                    {discountType === 'none'
                      ? 'None'
                      : discountType === 'percentage'
                        ? `${discountValue}%`
                        : `₹${discountValue}`}
                    )

                  </TableCell>

                  <TableCell className="py-2.5 px-3 text-white/50">
                    {discountDetail}
                  </TableCell>

                  <TableCell className="py-2.5 px-3 text-right font-mono text-rose-400">
                    {discountAmount > 0
                      ? `-₹${discountAmount.toFixed(2)}`
                      : '₹0.00'}
                  </TableCell>

                  <TableCell className="py-2.5 px-3 text-right font-mono font-medium text-white">
                    ₹{finalAmount.toFixed(2)}
                  </TableCell>

                </TableRow>

                {/* FINAL */}

                <TableRow
                  className="
                    bg-emerald-400/[0.025]
                    font-bold
                    border-t
                    border-emerald-400/[0.15]
                  "
                >

                  <TableCell className="py-3 px-3 text-emerald-300 font-bold text-sm">
                    Final Converted Amount
                  </TableCell>

                  <TableCell className="py-3 px-3 text-xs text-white/60">
                    <span className="sm:hidden">Payable</span>
                    <span className="hidden sm:inline">Total Payable Amount</span>
                  </TableCell>

                  <TableCell className="py-3 px-3 text-right font-mono text-rose-400 font-bold text-sm">
                    {totalSavings > 0
                      ? `-₹${totalSavings.toFixed(2)}`
                      : '₹0.00'}
                  </TableCell>

                  <TableCell className="py-3 px-3 text-right font-mono text-emerald-300 text-base font-extrabold">
                    ₹{finalAmount.toFixed(2)}
                  </TableCell>

                </TableRow>

              </TableBody>

            </Table>

          </div>
        </div>

        {/* =====================================================
            FOOTER ACTIONS
        ====================================================== */}


      </div>
    </div>
  );
}