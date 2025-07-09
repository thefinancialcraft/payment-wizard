import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Users, UserCheck, FileText, Briefcase, HeartHandshake, Upload, Hash } from 'lucide-react';

interface FormData {
  employeeName: string;
  team: string;
  previousCompany: string;
  applicationNo: string;
  businessType: string;
  assistantTeam: string;
  relationshipManager: string;
  proposalNo: string;
  paymentProof: string;
  paymentProofType: 'file' | 'details';
}

interface BusinessInfoFormProps {
  data: FormData;
  updateData: (data: Partial<FormData>) => void;
}

export function BusinessInfoForm({ data, updateData }: BusinessInfoFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleChange = (field: keyof FormData, value: string) => {
    updateData({ [field]: value });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      handleChange('paymentProof', file.name);
    }
  };

  const handlePaymentProofTypeChange = (type: 'file' | 'details') => {
    handleChange('paymentProofType', type);
    if (type === 'details') {
      setSelectedFile(null);
    }
    handleChange('paymentProof', '');
  };

  const businessTypes = [
    "Individual", "Sole Proprietorship", "Partnership", "Private Limited", 
    "Public Limited", "LLP", "Government", "NGO", "Trust"
  ];

  const teams = [
    "Sales", "Marketing", "Operations", "Customer Service", "Finance", 
    "HR", "IT", "Legal", "Compliance", "Business Development"
  ];

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-secondary border-border/20 hover:shadow-card transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="employeeName" className="text-sm font-medium">
                Employee Name *
              </Label>
            </div>
            <Input
              id="employeeName"
              placeholder="Enter employee name"
              value={data.employeeName}
              onChange={(e) => handleChange('employeeName', e.target.value)}
              className="border-border/20 focus:border-primary transition-colors"
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-secondary border-border/20 hover:shadow-card transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="team" className="text-sm font-medium">
                Team *
              </Label>
            </div>
            <Select value={data.team} onValueChange={(value) => handleChange('team', value)}>
              <SelectTrigger className="border-border/20 focus:border-primary">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="bg-gradient-secondary border-border/20 hover:shadow-card transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
                <Building className="w-4 h-4 text-warning" />
              </div>
              <Label htmlFor="previousCompany" className="text-sm font-medium">
                Previous Company
              </Label>
            </div>
            <Input
              id="previousCompany"
              placeholder="Enter previous company name"
              value={data.previousCompany}
              onChange={(e) => handleChange('previousCompany', e.target.value)}
              className="border-border/20 focus:border-primary transition-colors"
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-secondary border-border/20 hover:shadow-card transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center">
                <FileText className="w-4 h-4 text-info" />
              </div>
              <Label htmlFor="applicationNo" className="text-sm font-medium">
                Application Number *
              </Label>
            </div>
            <Input
              id="applicationNo"
              placeholder="Enter application number"
              value={data.applicationNo}
              onChange={(e) => handleChange('applicationNo', e.target.value)}
              className="border-border/20 focus:border-primary transition-colors"
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-secondary border-border/20 hover:shadow-card transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-success" />
              </div>
              <Label htmlFor="businessType" className="text-sm font-medium">
                Business Type *
              </Label>
            </div>
            <Select value={data.businessType} onValueChange={(value) => handleChange('businessType', value)}>
              <SelectTrigger className="border-border/20 focus:border-primary">
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
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
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="assistantTeam" className="text-sm font-medium">
                Assistant Team
              </Label>
            </div>
            <Select value={data.assistantTeam} onValueChange={(value) => handleChange('assistantTeam', value)}>
              <SelectTrigger className="border-border/20 focus:border-primary">
                <SelectValue placeholder="Select assistant team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="bg-gradient-secondary border-border/20 hover:shadow-card transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <HeartHandshake className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="relationshipManager" className="text-sm font-medium">
                Relationship Manager *
              </Label>
            </div>
            <Input
              id="relationshipManager"
              placeholder="Enter relationship manager name"
              value={data.relationshipManager}
              onChange={(e) => handleChange('relationshipManager', e.target.value)}
              className="border-border/20 focus:border-primary transition-colors"
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-secondary border-border/20 hover:shadow-card transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center">
                <Hash className="w-4 h-4 text-info" />
              </div>
              <Label htmlFor="proposalNo" className="text-sm font-medium">
                Proposal No. *
              </Label>
            </div>
            <Input
              id="proposalNo"
              placeholder="Enter proposal number"
              value={data.proposalNo}
              onChange={(e) => handleChange('proposalNo', e.target.value)}
              className="border-border/20 focus:border-primary transition-colors"
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-gradient-secondary border-border/20 hover:shadow-card transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                <Upload className="w-4 h-4 text-success" />
              </div>
              <Label className="text-sm font-medium">
                Payment Proof *
              </Label>
            </div>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={data.paymentProofType === 'file' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePaymentProofTypeChange('file')}
                  className="flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" />
                  Upload File
                </Button>
                <Button
                  type="button"
                  variant={data.paymentProofType === 'details' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePaymentProofTypeChange('details')}
                  className="flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" />
                  Enter Details
                </Button>
              </div>
              
              {data.paymentProofType === 'file' ? (
                <div className="space-y-2">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  {selectedFile && (
                    <p className="text-xs text-success">Selected: {selectedFile.name}</p>
                  )}
                </div>
              ) : (
                <Input
                  placeholder="Enter UTR/Transaction ID or payment details"
                  value={data.paymentProof}
                  onChange={(e) => handleChange('paymentProof', e.target.value)}
                  className="border-border/20 focus:border-primary transition-colors"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-success/10 border border-success/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <HeartHandshake className="w-5 h-5 text-success mt-0.5" />
          <div>
            <p className="text-sm font-medium text-success-foreground mb-1">Business Partnership Information:</p>
            <p className="text-xs text-success-foreground/80">
              This information helps us provide you with personalized service and ensures smooth processing of your insurance application.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}