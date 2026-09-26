import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, FileText, Heart, Building2, Edit, Gift, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface FormData {
  insuranceCompany: string;
  planName: string;
  policyType: string;
  previousCompany: string;
  healthCheckup: string;
  extraBonus: string;
}

interface InsuranceDetailsFormProps {
  data: FormData;
  updateData: (data: Partial<FormData>) => void;
  disabledFields?: string[];
}

export function InsuranceDetailsForm({ data, updateData, disabledFields = [] }: InsuranceDetailsFormProps) {
  const [customCompany, setCustomCompany] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customPlan, setCustomPlan] = useState('');
  const [showCustomPlanInput, setShowCustomPlanInput] = useState(false);
  const [insuranceCompanies, setInsuranceCompanies] = useState<string[]>([]);
  const [companyPlans, setCompanyPlans] = useState<Record<string, string[]>>({});
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);

  // Fetch insurance companies and plans from database
  useEffect(() => {
    const fetchInsuranceData = async () => {
      setIsLoadingCompanies(true);
      setIsLoadingPlans(true);
      try {
        console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
        console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
        console.log('Fetching insurance data from database...');

        const { data: records, error } = await supabase
          .from('insurance_plans')
          .select('insurance_company, plan_name')
          .order('insurance_company, plan_name');

        console.log('Supabase response:', { records, error });

        if (error) throw error;

        // Extract unique companies
        const uniqueCompanies = Array.from(
          new Set(records?.map((r: any) => r.insurance_company) || [])
        );
        console.log('Unique companies:', uniqueCompanies);
        setInsuranceCompanies(uniqueCompanies);

        // Group plans by company
        const grouped: Record<string, string[]> = {};
        records?.forEach((record: any) => {
          const company = record.insurance_company;
          const plan = record.plan_name;
          if (!grouped[company]) {
            grouped[company] = [];
          }
          grouped[company].push(plan);
        });
        console.log('Grouped plans:', grouped);
        setCompanyPlans(grouped);
      } catch (error) {
        console.error('Error fetching insurance data:', error);
      } finally {
        setIsLoadingCompanies(false);
        setIsLoadingPlans(false);
      }
    };

    fetchInsuranceData();
  }, []);



  const handleChange = (field: keyof FormData, value: string) => {
    updateData({ [field]: value });
  };

  const handlePolicyTypeChange = (value: string) => {
    updateData({
      policyType: value,
      ...(value === 'NEWBUSINESS'
        ? { previousCompany: 'None' }
        : data.previousCompany === 'None'
          ? { previousCompany: '' }
          : {})
    });
  };

  const handleCompanyChange = (value: string) => {
    if (value === 'add-new') {
      setShowCustomInput(true);
      setCustomCompany('');
    } else {
      setShowCustomInput(false);
      handleChange('insuranceCompany', value);
      // Clear plan name when company changes
      handleChange('planName', '');
    }
  };

  const handleCustomCompanyChange = (value: string) => {
    setCustomCompany(value);
    handleChange('insuranceCompany', value);
  };

  const handleSaveCustomCompany = async () => {
    if (customCompany.trim()) {
      // Add new company to the list
      setInsuranceCompanies([...insuranceCompanies, customCompany]);
      // Initialize empty plans for new company
      setCompanyPlans({
        ...companyPlans,
        [customCompany]: ['Default Plan']
      });
      handleChange('insuranceCompany', customCompany);
      setShowCustomInput(false);
      setCustomCompany('');

      // Insert into database with a default plan name
      try {
        const { error } = await supabase
          .from('insurance_plans')
          .insert({
            insurance_company: customCompany,
            plan_name: 'Default Plan'
          });

        if (error) {
          console.error('Error inserting company:', error);
        }
      } catch (error) {
        console.error('Error inserting company:', error);
      }
    }
  };

  const handlePlanChange = (value: string) => {
    if (value === 'add-new-plan') {
      setShowCustomPlanInput(true);
      setCustomPlan('');
    } else {
      setShowCustomPlanInput(false);
      handleChange('planName', value);
    }
  };

  const handleSaveCustomPlan = async () => {
    if (customPlan.trim()) {
      const currentCompany = data.insuranceCompany;
      if (currentCompany) {
        // Add new plan to the current company's plans locally
        const updatedPlans = [...(companyPlans[currentCompany] || []), customPlan];
        setCompanyPlans({
          ...companyPlans,
          [currentCompany]: updatedPlans
        });
        handleChange('planName', customPlan);

        // Insert into database
        try {
          const { error } = await supabase
            .from('insurance_plans')
            .insert({
              insurance_company: currentCompany,
              plan_name: customPlan
            });

          if (error) {
            console.error('Error inserting plan:', error);
          }
        } catch (error)
        
        {
          console.error('Error inserting plan:', error);
        }
      }
      setShowCustomPlanInput(false);
      setCustomPlan('');
    }
  };

  const policyTypes = [
    "NEWBUSINESS",
    "PORTABILITY"
  ];

  return (
    <div className="space-y-6 animate-slide-in" style={{ background: 'transparent' }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ background: 'transparent' }}>
        <Card className="hover:shadow-card transition-all duration-300" style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent className="p-4" style={{ background: 'transparent' }}>
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
                  placeholder="Enter new insurance company name"
                  value={customCompany}
                  onChange={(e) => handleCustomCompanyChange(e.target.value)}
                  className="border-border/20 focus:border-primary transition-colors"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveCustomCompany}
                    className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded hover:bg-primary/90 transition-colors"
                  >
                    Add to list
                  </button>
                  <button
                    type="button"
                    onClick={() => {setShowCustomInput(false); setCustomCompany('');}}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {isLoadingCompanies ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading companies...
                  </div>
                ) : (
                  <Select
                    value={data.insuranceCompany}
                    onValueChange={handleCompanyChange}
                    disabled={true}
                  >
                    <SelectTrigger className="border-border/20 focus:border-primary" style={{ opacity: 0.6 }}>
                      <SelectValue placeholder="Select insurance company" />
                    </SelectTrigger>
                    <SelectContent>
                      {insuranceCompanies.map((company) => (
                        <SelectItem key={company} value={company}>
                          {company}
                        </SelectItem>
                      ))}
                      <SelectItem value="add-new" className="text-primary">
                        <div className="flex items-center gap-2">
                          <Edit className="w-4 h-4" />
                          Add new company
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-all duration-300" style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent className="p-4" style={{ background: 'transparent' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="planName" className="text-sm font-medium">
                Plan Name *
              </Label>
            </div>
            {showCustomPlanInput ? (
              <div className="space-y-2">
                <Input
                  placeholder="Enter new plan name"
                  value={customPlan}
                  onChange={(e) => setCustomPlan(e.target.value)}
                  className="border-border/20 focus:border-primary transition-colors"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveCustomPlan}
                    className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded hover:bg-primary/90 transition-colors"
                  >
                    Add to list
                  </button>
                  <button
                    type="button"
                    onClick={() => {setShowCustomPlanInput(false); setCustomPlan('');}}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : data.insuranceCompany ? (
              <>
                {isLoadingPlans ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading plans...
                  </div>
                ) : (
                  <Select
                    value={data.planName}
                    onValueChange={handlePlanChange}
                    disabled={disabledFields.includes('planName')}
                  >
                    <SelectTrigger className="border-border/20 focus:border-primary" style={{ opacity: disabledFields.includes('planName') ? 0.6 : 1 }}>
                      <SelectValue placeholder="Select plan name" />
                    </SelectTrigger>
                    <SelectContent>
                      {companyPlans[data.insuranceCompany]?.map((plan) => (
                        <SelectItem key={plan} value={plan}>
                          {plan}
                        </SelectItem>
                      ))}
                      <SelectItem value="add-new-plan" className="text-primary">
                        <div className="flex items-center gap-2">
                          <Edit className="w-4 h-4" />
                          Add new plan
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </>
            ) : (
              <Input
                id="planName"
                placeholder="Select insurance company first"
                value={data.planName}
                readOnly
                className="border-border/20 bg-muted/50 cursor-not-allowed"
              />
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-all duration-300" style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent className="p-4" style={{ background: 'transparent' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="policyType" className="text-sm font-medium">
                Policy Type *
              </Label>
            </div>
            <Select
              value={data.policyType}
              onValueChange={handlePolicyTypeChange}
              disabled={disabledFields.includes('policyType')}
            >
              <SelectTrigger className="border-border/20 focus:border-primary" style={{ opacity: disabledFields.includes('policyType') ? 0.6 : 1 }}>
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

        <Card className="hover:shadow-card transition-all duration-300" style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent className="p-4" style={{ background: 'transparent' }}>
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
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-all duration-300" style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent className="p-4" style={{ background: 'transparent' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Gift className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="extraBonus" className="text-sm font-medium">
                Extra Bonus (Super/Booster/Infinity)
              </Label>
            </div>
            <Select value={data.extraBonus} onValueChange={(value) => handleChange('extraBonus', value)}>
              <SelectTrigger className="border-border/20 focus:border-primary">
                <SelectValue placeholder="Select extra bonus option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
      
      <div className="border border-success/20 rounded-lg p-4" style={{ background: 'transparent' }}>
        <p className="text-sm text-success-foreground">
          <strong>Coverage Information:</strong> Your selected plan will provide comprehensive coverage based on the policy terms and conditions. Please review all benefits carefully.
        </p>
      </div>
    </div>
  );
}