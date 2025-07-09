import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { User, Phone, Mail, Users } from 'lucide-react';

interface FormData {
  policyHolderName: string;
  contactNo: string;
  email: string;
  numberOfMembers: string;
}

interface PersonalInfoFormProps {
  data: FormData;
  updateData: (data: Partial<FormData>) => void;
}

export function PersonalInfoForm({ data, updateData }: PersonalInfoFormProps) {
  const handleChange = (field: keyof FormData, value: string) => {
    updateData({ [field]: value });
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-secondary border-border/20 hover:shadow-card transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="policyHolderName" className="text-sm font-medium">
                Policy Holder Name *
              </Label>
            </div>
            <Input
              id="policyHolderName"
              placeholder="Enter full name"
              value={data.policyHolderName}
              onChange={(e) => handleChange('policyHolderName', e.target.value)}
              className="border-border/20 focus:border-primary transition-colors"
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-secondary border-border/20 hover:shadow-card transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Phone className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="contactNo" className="text-sm font-medium">
                Contact Number *
              </Label>
            </div>
            <Input
              id="contactNo"
              placeholder="Enter phone number"
              value={data.contactNo}
              onChange={(e) => handleChange('contactNo', e.target.value)}
              className="border-border/20 focus:border-primary transition-colors"
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-secondary border-border/20 hover:shadow-card transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address *
              </Label>
            </div>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={data.email}
              onChange={(e) => handleChange('email', e.target.value)}
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
              <Label htmlFor="numberOfMembers" className="text-sm font-medium">
                Number of Members
              </Label>
            </div>
            <Input
              id="numberOfMembers"
              type="number"
              placeholder="Enter number of members"
              value={data.numberOfMembers}
              onChange={(e) => handleChange('numberOfMembers', e.target.value)}
              className="border-border/20 focus:border-primary transition-colors"
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-info/10 border border-info/20 rounded-lg p-4">
        <p className="text-sm text-info-foreground">
          <strong>Note:</strong> Please ensure all information is accurate as it will be used for policy verification and communication.
        </p>
      </div>
    </div>
  );
}