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
}

interface PaymentDatesFormProps {
  data: FormData;
  updateData: (data: Partial<FormData>) => void;
}

export function PaymentDatesForm({ data, updateData }: PaymentDatesFormProps) {
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
    bgColor = "bg-primary/20"
  }: {
    field: keyof FormData;
    label: string;
    icon: any;
    iconColor?: string;
    bgColor?: string;
  }) => {
    const selectedDate = parseDate(data[field]);
    
    return (
      <Card className="bg-gradient-secondary border-border/20 hover:shadow-card transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <Label className="text-sm font-medium">
              {label}
            </Label>
          </div>
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
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DatePickerField 
          field="paymentDate"
          label="Payment Date *"
          icon={CalendarIcon}
        />

        <Card className="bg-gradient-secondary border-border/20 hover:shadow-card transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="month" className="text-sm font-medium">
                Payment Month * (Auto-filled)
              </Label>
            </div>
            <Input
              id="month"
              placeholder="Auto-populated from payment date"
              value={data.month}
              readOnly
              className="border-border/20 bg-muted/50 cursor-not-allowed"
            />
          </CardContent>
        </Card>

        <DatePickerField 
          field="effectiveDate"
          label="Effective Date *"
          icon={CalendarIcon}
          iconColor="text-success"
          bgColor="bg-success/20"
        />

        <DatePickerField 
          field="nextRenewalDate"
          label="Next Renewal Date *"
          icon={RefreshCw}
          iconColor="text-warning"
          bgColor="bg-warning/20"
        />
      </div>
      
      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
        <p className="text-sm text-warning-foreground">
          <strong>Important:</strong> Please verify all dates carefully. The effective date should be when coverage begins, and the renewal date determines your next payment cycle.
        </p>
      </div>
    </div>
  );
}