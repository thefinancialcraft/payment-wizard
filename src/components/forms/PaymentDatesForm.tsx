import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock, RefreshCw } from 'lucide-react';
import { format, parse } from 'date-fns';
import { cn } from '@/lib/utils';

interface FormData {
  paymentDate: string;
  month: string;
  effectiveDate: string;
  nextRenewalDate: string;
  paymentMonth: string;
}

interface PaymentDatesFormProps {
  data: FormData;
  updateData: (data: Partial<FormData>) => void;
  disabledFields?: string[];
}

export function PaymentDatesForm({ data, updateData, disabledFields = [] }: PaymentDatesFormProps) {
  const handleChange = (field: keyof FormData, value: string) => {
    updateData({ [field]: value });
  };

  const handleDateChange = (field: keyof FormData, date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, 'dd/MM/yyyy');
      handleChange(field, formattedDate);

      // Auto-populate month when payment date is selected
      if (field === 'paymentDate') {
        const monthYear = format(date, 'MMM yyyy');
        handleChange('month', monthYear);

        // Auto-fill payment month (full month name for database queries)
        const monthName = date.toLocaleString('en-US', { month: 'long' });
        handleChange('paymentMonth', monthName);

        // Auto-calculate effective date: payment date + 1 month + 7 days
        // Skip if effectiveDate is pre-filled from proposal
        if (!disabledFields.includes('effectiveDate')) {
          const effectiveDate = new Date(date);
          effectiveDate.setMonth(effectiveDate.getMonth() + 1);
          effectiveDate.setDate(effectiveDate.getDate() + 7);
          const formattedEffectiveDate = format(effectiveDate, 'dd/MM/yyyy');
          handleChange('effectiveDate', formattedEffectiveDate);

          // Auto-calculate next renewal date: effective date + 1 year
          const nextRenewalDate = new Date(effectiveDate);
          nextRenewalDate.setFullYear(nextRenewalDate.getFullYear() + 1);
          const formattedNextRenewalDate = format(nextRenewalDate, 'dd/MM/yyyy');
          handleChange('nextRenewalDate', formattedNextRenewalDate);
        }
      }

      // Auto-calculate next renewal date when effective date is selected
      if (field === 'effectiveDate') {
        const nextRenewalDate = new Date(date);
        nextRenewalDate.setFullYear(nextRenewalDate.getFullYear() + 1);
        const formattedNextRenewalDate = format(nextRenewalDate, 'dd/MM/yyyy');
        handleChange('nextRenewalDate', formattedNextRenewalDate);
      }
    }
  };

  const parseDate = (dateString: string): Date | undefined => {
    if (!dateString) return undefined;
    try {
      // Handle both DD/MM/YYYY and YYYY-MM-DD formats
      if (dateString.includes('/')) {
        return parse(dateString, 'dd/MM/yyyy', new Date());
      } else {
        return new Date(dateString);
      }
    } catch {
      return undefined;
    }
  };

  const DatePickerField = ({
    field,
    label,
    icon: Icon,
    iconColor = "text-primary",
    bgColor = "bg-primary/20",
    isCalculated = false
  }: {
    field: keyof FormData;
    label: string;
    icon: any;
    iconColor?: string;
    bgColor?: string;
    isCalculated?: boolean;
  }) => {
    const selectedDate = parseDate(data[field]);
    const isDisabled = disabledFields.includes(field) || (isCalculated && disabledFields.includes('effectiveDate'));

    return (
      <Card className="hover:shadow-card transition-all duration-300" style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <CardContent className="p-4" style={{ background: 'transparent' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <Label className="text-sm font-medium">
              {label}
            </Label>
          </div>
          {isDisabled ? (
            <Input
              value={selectedDate ? format(selectedDate, "dd/MM/yyyy") : ''}
              readOnly
              className="border-border/20 bg-muted/50 cursor-not-allowed"
              style={{ opacity: 0.6 }}
            />
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border-border/20 focus:border-primary",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "dd/MM/yyyy") : `Select ${label.toLowerCase()}`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => handleDateChange(field, date)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-slide-in" style={{ background: 'transparent' }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ background: 'transparent' }}>
        <DatePickerField 
          field="paymentDate"
          label="Payment Date *"
          icon={CalendarIcon}
        />

        <Card className="hover:shadow-card transition-all duration-300" style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent className="p-4" style={{ background: 'transparent' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="paymentMonth" className="text-sm font-medium">
                Payment Month * (Auto-filled)
              </Label>
            </div>
            <Input
              id="paymentMonth"
              placeholder="Auto-populated from payment date"
              value={data.paymentMonth}
              readOnly
              className="border-border/20 bg-muted/50 cursor-not-allowed"
            />
          </CardContent>
        </Card>

        <DatePickerField
          field="effectiveDate"
          label="Effective Date * (Auto-calculated)"
          icon={CalendarIcon}
          iconColor="text-success"
          bgColor="bg-success/20"
        />

        <DatePickerField
          field="nextRenewalDate"
          label="Next Renewal Date * (Auto-calculated)"
          icon={RefreshCw}
          iconColor="text-warning"
          bgColor="bg-warning/20"
          isCalculated={true}
        />
      </div>
      
      <div className="border border-warning/20 rounded-lg p-4" style={{ background: 'transparent' }}>
        <p className="text-sm text-warning-foreground">
          <strong>Important:</strong> Please verify all dates carefully. The effective date should be when coverage begins, and the renewal date determines your next payment cycle.
        </p>
      </div>
    </div>
  );
}