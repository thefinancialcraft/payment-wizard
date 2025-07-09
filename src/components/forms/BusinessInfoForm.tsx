import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Building, Users, UserCheck, FileText, Briefcase, HeartHandshake } from 'lucide-react';

interface FormData {
  employeeName: string;
  team: string;
  previousCompany: string;
  applicationNo: string;
  businessType: string;
  assistantTeam: string;
  relationshipManager: string;
}

interface BusinessInfoFormProps {
  data: FormData;
  updateData: (data: Partial<FormData>) => void;
}

export function BusinessInfoForm({ data, updateData }: BusinessInfoFormProps) {
  const handleChange = (field: keyof FormData, value: string) => {
    updateData({ [field]: value });
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

        <Card className="md:col-span-2 bg-gradient-secondary border-border/20 hover:shadow-card transition-all duration-300">
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