import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, FileText, Heart, Building2, Edit } from 'lucide-react';

interface FormData {
  insuranceCompany: string;
  planName: string;
  policyType: string;
  healthCheckup: string;
}

interface InsuranceDetailsFormProps {
  data: FormData;
  updateData: (data: Partial<FormData>) => void;
}

export function InsuranceDetailsForm({ data, updateData }: InsuranceDetailsFormProps) {
  const [customCompany, setCustomCompany] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleChange = (field: keyof FormData, value: string) => {
    updateData({ [field]: value });
  };

  const handleCompanyChange = (value: string) => {
    if (value === 'edit-company') {
      setShowCustomInput(true);
      setCustomCompany(data.insuranceCompany);
    } else {
      setShowCustomInput(false);
      handleChange('insuranceCompany', value);
    }
  };

  const handleCustomCompanyChange = (value: string) => {
    setCustomCompany(value);
    handleChange('insuranceCompany', value);
  };

  const insuranceCompanies = [
    "LIC", "HDFC Life", "ICICI Prudential", "SBI Life", "Bajaj Allianz", 
    "Max Life", "Tata AIG", "Star Health", "Religare", "edit-company"
  ];

  const policyTypes = [
    "Term Life", "Whole Life", "Endowment", "ULIP", "Health Insurance", 
    "Motor Insurance", "Travel Insurance", "Home Insurance"
  ];

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-secondary border-border/20 hover:shadow-card transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="insuranceCompany" className="text-sm font-medium">
                Insurance Company *
              </Label>
            </div>
            {showCustomInput ? (
              <div className="space-y-2">
                <Input
                  placeholder="Enter insurance company name"
                  value={customCompany}
                  onChange={(e) => handleCustomCompanyChange(e.target.value)}
                  className="border-border/20 focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => {setShowCustomInput(false); setCustomCompany('');}}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Choose from list instead
                </button>
              </div>
            ) : (
              <Select value={data.insuranceCompany} onValueChange={handleCompanyChange}>
                <SelectTrigger className="border-border/20 focus:border-primary">
                  <SelectValue placeholder="Select insurance company" />
                </SelectTrigger>
                <SelectContent>
                  {insuranceCompanies.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company === 'edit-company' ? (
                        <div className="flex items-center gap-2">
                          <Edit className="w-4 h-4" />
                          Edit Company
                        </div>
                      ) : (
                        company
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-secondary border-border/20 hover:shadow-card transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="planName" className="text-sm font-medium">
                Plan Name *
              </Label>
            </div>
            <Input
              id="planName"
              placeholder="Enter plan name"
              value={data.planName}
              onChange={(e) => handleChange('planName', e.target.value)}
              className="border-border/20 focus:border-primary transition-colors"
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-secondary border-border/20 hover:shadow-card transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="policyType" className="text-sm font-medium">
                Policy Type *
              </Label>
            </div>
            <Select value={data.policyType} onValueChange={(value) => handleChange('policyType', value)}>
              <SelectTrigger className="border-border/20 focus:border-primary">
                <SelectValue placeholder="Select policy type" />
              </SelectTrigger>
              <SelectContent>
                {policyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="bg-gradient-secondary border-border/20 hover:shadow-card transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                <Heart className="w-4 h-4 text-success" />
              </div>
              <Label htmlFor="healthCheckup" className="text-sm font-medium">
                Health Checkup Required
              </Label>
            </div>
            <Select value={data.healthCheckup} onValueChange={(value) => handleChange('healthCheckup', value)}>
              <SelectTrigger className="border-border/20 focus:border-primary">
                <SelectValue placeholder="Select checkup requirement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes - Required</SelectItem>
                <SelectItem value="no">No - Not Required</SelectItem>
                <SelectItem value="completed">Already Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-success/10 border border-success/20 rounded-lg p-4">
        <p className="text-sm text-success-foreground">
          <strong>Coverage Information:</strong> Your selected plan will provide comprehensive coverage based on the policy terms and conditions. Please review all benefits carefully.
        </p>
      </div>
    </div>
  );
}