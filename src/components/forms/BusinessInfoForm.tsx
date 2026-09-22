import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Users, UserCheck, Briefcase, HeartHandshake, Upload, Hash, Loader2, Edit, X, Link } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface FormData {
  employeeName: string;
  team: string;
  previousCompany: string;
  businessType: string;
  assistantTeam: string;
  relationshipManager: string;
  agentCode: string;
  proposalNo: string;
  paymentProof: string;
  grade: string;
  leadSource: string;
}

interface BusinessInfoFormProps {
  data: FormData;
  updateData: (data: Partial<FormData>) => void;
  paymentMonth: string;
  insuranceCompany: string;
  disabledFields?: string[];
}

export function BusinessInfoForm({ data, updateData, paymentMonth, insuranceCompany, disabledFields = [] }: BusinessInfoFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [employeesByTeam, setEmployeesByTeam] = useState<Record<string, string[]>>({});
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [teamDisplayMode, setTeamDisplayMode] = useState<'input' | 'dropdown'>('input');
  const [insuranceCompanies, setInsuranceCompanies] = useState<string[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [customPreviousCompany, setCustomPreviousCompany] = useState('');
  const [showCustomPreviousCompanyInput, setShowCustomPreviousCompanyInput] = useState(false);
  const [relationshipManagers, setRelationshipManagers] = useState<string[]>([]);
  const [isLoadingManagers, setIsLoadingManagers] = useState(false);
  const [customManager, setCustomManager] = useState('');
  const [customAgentCode, setCustomAgentCode] = useState('');
  const [showCustomManagerInput, setShowCustomManagerInput] = useState(false);
  const [faveoData, setFaveoData] = useState<any[]>([]);
  const [isLoadingFaveoData, setIsLoadingFaveoData] = useState(false);
  const [showProposalDropdown, setShowProposalDropdown] = useState(false);
  const [filteredProposals, setFilteredProposals] = useState<any[]>([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleChange = (field: keyof FormData, value: string) => {
    updateData({ [field]: value });
  };

  const handlePreviousCompanyChange = (value: string) => {
    if (value === 'add-new') {
      setShowCustomPreviousCompanyInput(true);
      setCustomPreviousCompany('');
    } else {
      setShowCustomPreviousCompanyInput(false);
      handleChange('previousCompany', value);
    }
  };

  const handleSaveCustomPreviousCompany = async () => {
    if (customPreviousCompany.trim()) {
      // Add to local state
      setInsuranceCompanies([...insuranceCompanies, customPreviousCompany]);
      handleChange('previousCompany', customPreviousCompany);
      setShowCustomPreviousCompanyInput(false);
      setCustomPreviousCompany('');

      // Insert into database with a default plan
      try {
        const { error } = await supabase
          .from('insurance_plans')
          .insert({
            insurance_company: customPreviousCompany,
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

  const handleManagerChange = async (value: string) => {
    if (value === 'add-new') {
      setShowCustomManagerInput(true);
      setCustomManager('');
      setCustomAgentCode('');
    } else {
      setShowCustomManagerInput(false);
      handleChange('relationshipManager', value);

      // Fetch agent code for selected manager
      try {
        const { data: records, error } = await supabase
          .from('agent_codes')
          .select('agent_id')
          .eq('agent_name', value)
          .single();

        if (error) throw error;
        if (records) {
          handleChange('agentCode', records.agent_id);
        }
      } catch (error) {
        console.error('Error fetching agent code:', error);
      }
    }
  };

  const handleSaveCustomManager = async () => {
    if (customManager.trim() && customAgentCode.trim()) {
      // Add to local state
      setRelationshipManagers([...relationshipManagers, customManager]);
      handleChange('relationshipManager', customManager);
      handleChange('agentCode', customAgentCode);
      setShowCustomManagerInput(false);
      setCustomManager('');
      setCustomAgentCode('');

      // Insert into database
      try {
        const { error } = await supabase
          .from('agent_codes')
          .insert({
            agent_id: customAgentCode,
            agent_name: customManager,
            agent_password: '',
            agent_otp_finder: ''
          });

        if (error) {
          console.error('Error inserting manager:', error);
        }
      } catch (error) {
        console.error('Error inserting manager:', error);
      }
    }
  };

  // Fetch employees based on payment month
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!paymentMonth) {
        setEmployeesByTeam({});
        return;
      }

      setIsLoadingEmployees(true);
      try {
        console.log('Fetching employees for month:', paymentMonth);
        const { data: records, error } = await supabase
          .from('monthly_track_aps')
          .select('employee_name, team')
          .eq('month', paymentMonth);

        if (error) throw error;

        console.log('Employee records:', records);

        // Group employees by team
        const grouped: Record<string, string[]> = {};
        records?.forEach((record: any) => {
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
        console.log('Employees grouped by team:', grouped);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setEmployeesByTeam({});
      } finally {
        setIsLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, [paymentMonth]);

  // Fetch insurance companies from database
  useEffect(() => {
    const fetchInsuranceCompanies = async () => {
      setIsLoadingCompanies(true);
      try {
        const { data: records, error } = await supabase
          .from('insurance_plans')
          .select('insurance_company')
          .order('insurance_company');

        if (error) throw error;

        // Extract unique companies
        const uniqueCompanies = Array.from(
          new Set(records?.map((r: any) => r.insurance_company) || [])
        );
        setInsuranceCompanies(uniqueCompanies);
      } catch (error) {
        console.error('Error fetching insurance companies:', error);
        setInsuranceCompanies([]);
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    fetchInsuranceCompanies();
  }, []);

  // Fetch relationship managers from agent_codes table
  useEffect(() => {
    const fetchRelationshipManagers = async () => {
      setIsLoadingManagers(true);
      try {
        const { data: records, error } = await supabase
          .from('agent_codes')
          .select('agent_name')
          .order('agent_name');

        if (error) throw error;

        // Extract unique manager names
        const uniqueManagers = Array.from(
          new Set(records?.map((r: any) => r.agent_name) || [])
        );
        setRelationshipManagers(uniqueManagers);
      } catch (error) {
        console.error('Error fetching relationship managers:', error);
        setRelationshipManagers([]);
      } finally {
        setIsLoadingManagers(false);
      }
    };

    fetchRelationshipManagers();
  }, []);

  // Fetch faveo_data when insurance company is Care Health Insurance
  useEffect(() => {
    const fetchFaveoData = async () => {
      if (insuranceCompany === 'Care Health Insurance' && !data.proposalNo) {
        setIsLoadingFaveoData(true);
        try {
          const { data: records, error } = await supabase
            .from('faveo_data')
            .select('proposal_no, customer_name, payment_amount, proposal_status')
            .not('proposal_status', 'like', '%Mark for Cancellation Task%')
            .order('proposal_no')
            .limit(50);

          if (error) throw error;

          setFaveoData(records || []);
          setFilteredProposals(records || []);
        } catch (error) {
          console.error('Error fetching faveo data:', error);
          setFaveoData([]);
          setFilteredProposals([]);
        } finally {
          setIsLoadingFaveoData(false);
        }
      } else {
        setFaveoData([]);
        setFilteredProposals([]);
        setShowProposalDropdown(false);
      }
    };

    fetchFaveoData();
  }, [insuranceCompany, data.proposalNo]);

  // Filter proposals based on user input
  const handleProposalInputChange = (value: string) => {
    handleChange('proposalNo', value);
    
    if (insuranceCompany === 'Care Health Insurance' && value) {
      const filtered = faveoData.filter(item =>
        item.proposal_no.toLowerCase().includes(value.toLowerCase()) ||
        item.customer_name?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProposals(filtered);
      setShowProposalDropdown(filtered.length > 0);
    } else {
      setShowProposalDropdown(false);
    }
  };

  const handleProposalSelect = (proposalNo: string) => {
    handleChange('proposalNo', proposalNo);
    setShowProposalDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProposalDropdown(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowProposalDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  // Auto-set team when employee is selected
  useEffect(() => {
    if (!data.employeeName || Object.keys(employeesByTeam).length === 0) {
      return;
    }

    // Find the team for the selected employee
    for (const [team, employees] of Object.entries(employeesByTeam)) {
      if (employees.includes(data.employeeName)) {
        console.log(`Employee ${data.employeeName} belongs to team: ${team}`);
        updateData({ team });
        break;
      }
    }
  }, [data.employeeName, employeesByTeam, updateData]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (1MB = 1024 * 1024 bytes)
      const maxSize = 1024 * 1024; // 1MB in bytes
      if (file.size > maxSize) {
        alert('File size must be less than 1MB');
        return;
      }

      setIsUploadingFile(true);

      try {
        // Upload file to Supabase storage
        const fileName = `${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('quotations')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          alert('Error uploading file. Please try again.');
          setIsUploadingFile(false);
          return;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase
          .storage
          .from('quotations')
          .getPublicUrl(fileName);

        setSelectedFile(file);
        handleChange('paymentProof', publicUrl);
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Error uploading file. Please try again.');
      } finally {
        setIsUploadingFile(false);
      }
    }
  };



  const teams = [
    "Saloni Soni",
    "Tanya Bhardwaj",
    "None"
  ];

  return (
    <div className="space-y-6 animate-slide-in" style={{ background: 'transparent' }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ background: 'transparent' }}>
        <Card className="hover:shadow-card transition-all duration-300" style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent className="p-4" style={{ background: 'transparent' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="employeeName" className="text-sm font-medium">
                Employee Name *
              </Label>
            </div>
            {isLoadingEmployees ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading employees...
              </div>
            ) : paymentMonth ? (
              <>
                {Object.keys(employeesByTeam).length > 0 ? (
                  <Select value={data.employeeName} onValueChange={(value) => handleChange('employeeName', value)}>
                    <SelectTrigger className="border-border/20 focus:border-primary">
                      <SelectValue placeholder="Select employee" />
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
                    placeholder={`No employees found for ${paymentMonth}`}
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
                value={data.employeeName}
                disabled
                className="border-border/20 focus:border-primary transition-colors"
              />
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
              placeholder={data.team || 'Auto-populated based on employee selection'}
              value={data.team}
              disabled
              className="border-border/20 bg-muted/50 cursor-not-allowed"
            />
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-all duration-300" style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent className="p-4" style={{ background: 'transparent' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
                <Building className="w-4 h-4 text-warning" />
              </div>
              <Label htmlFor="previousCompany" className="text-sm font-medium">
                Previous Company
              </Label>
            </div>
            {showCustomPreviousCompanyInput ? (
              <div className="space-y-2">
                <Input
                  placeholder="Enter new company name"
                  value={customPreviousCompany}
                  onChange={(e) => setCustomPreviousCompany(e.target.value)}
                  className="border-border/20 focus:border-primary transition-colors"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveCustomPreviousCompany}
                    className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded hover:bg-primary/90 transition-colors"
                  >
                    Add to list
                  </button>
                  <button
                    type="button"
                    onClick={() => {setShowCustomPreviousCompanyInput(false); setCustomPreviousCompany('');}}
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
                  <Select value={data.previousCompany} onValueChange={handlePreviousCompanyChange}>
                    <SelectTrigger className="border-border/20 focus:border-primary">
                      <SelectValue placeholder="Select previous company" />
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
              <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-info" />
              </div>
              <Label htmlFor="businessType" className="text-sm font-medium">
                Business Type *
              </Label>
            </div>
            <Select
              value={data.businessType}
              onValueChange={(value) => handleChange('businessType', value)}
              disabled={true}
            >
              <SelectTrigger className="border-border/20 focus:border-primary" style={{ opacity: 0.6 }}>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Source In">Source In</SelectItem>
                <SelectItem value="In House">In House</SelectItem>
                <SelectItem value="Source Out">Source Out</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-all duration-300" style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent className="p-4" style={{ background: 'transparent' }}>
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

        <Card className="hover:shadow-card transition-all duration-300" style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent className="p-4" style={{ background: 'transparent' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <HeartHandshake className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="relationshipManager" className="text-sm font-medium">
                Relationship Manager *
              </Label>
            </div>
            {showCustomManagerInput ? (
              <div className="space-y-2">
                <Input
                  placeholder="Enter new relationship manager name"
                  value={customManager}
                  onChange={(e) => setCustomManager(e.target.value)}
                  className="border-border/20 focus:border-primary transition-colors"
                />
                <Input
                  placeholder="Enter agent code"
                  value={customAgentCode}
                  onChange={(e) => setCustomAgentCode(e.target.value)}
                  className="border-border/20 focus:border-primary transition-colors"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveCustomManager}
                    className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded hover:bg-primary/90 transition-colors"
                  >
                    Add to list
                  </button>
                  <button
                    type="button"
                    onClick={() => {setShowCustomManagerInput(false); setCustomManager(''); setCustomAgentCode('');}}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {isLoadingManagers ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading managers...
                  </div>
                ) : (
                  <Select
                    value={data.relationshipManager}
                    onValueChange={handleManagerChange}
                    disabled={disabledFields.includes('relationshipManager')}
                  >
                    <SelectTrigger className="border-border/20 focus:border-primary" style={{ opacity: disabledFields.includes('relationshipManager') ? 0.6 : 1 }}>
                      <SelectValue placeholder="Select relationship manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationshipManagers.map((manager) => (
                        <SelectItem key={manager} value={manager}>
                          {manager}
                        </SelectItem>
                      ))}
                      <SelectItem value="add-new" className="text-primary">
                        <div className="flex items-center gap-2">
                          <Edit className="w-4 h-4" />
                          Add new manager
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
              <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center">
                <Hash className="w-4 h-4 text-info" />
              </div>
              <Label htmlFor="agentCode" className="text-sm font-medium">
                Agent Code
              </Label>
            </div>
            <Input
              id="agentCode"
              placeholder="Auto-populated from relationship manager"
              value={data.agentCode}
              readOnly
              className="border-border/20 bg-muted/50 cursor-not-allowed"
            />
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-all duration-300" style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent className="p-4" style={{ background: 'transparent' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center">
                <Hash className="w-4 h-4 text-info" />
              </div>
              <Label htmlFor="grade" className="text-sm font-medium">
                Grade *
              </Label>
            </div>
            <Select value={data.grade} onValueChange={(value) => handleChange('grade', value)}>
              <SelectTrigger className="border-border/20 focus:border-primary">
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Grade 1">Grade 1</SelectItem>
                <SelectItem value="HNI">HNI</SelectItem>
                <SelectItem value="Super HNI">Super HNI</SelectItem>
                <SelectItem value="Grade 1+">Grade 1+</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-all duration-300" style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent className="p-4" style={{ background: 'transparent' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center">
                <Hash className="w-4 h-4 text-info" />
              </div>
              <Label htmlFor="leadSource" className="text-sm font-medium">
                Lead Source *
              </Label>
            </div>
            <Select value={data.leadSource} onValueChange={(value) => handleChange('leadSource', value)}>
              <SelectTrigger className="border-border/20 focus:border-primary">
                <SelectValue placeholder="Select lead source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VK">VK</SelectItem>
                <SelectItem value="NR">NR</SelectItem>
                <SelectItem value="KO">KO</SelectItem>
                <SelectItem value="CE">CE</SelectItem>
                <SelectItem value="ML">ML</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-all duration-300" style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent className="p-4" style={{ background: 'transparent' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center">
                <Hash className="w-4 h-4 text-info" />
              </div>
              <Label htmlFor="proposalNo" className="text-sm font-medium">
                Proposal No. *
              </Label>
            </div>
            <div className="relative" ref={dropdownRef}>
              <Input
                id="proposalNo"
                placeholder={insuranceCompany === 'Care Health Insurance' ? 'Type to search proposals...' : 'Enter proposal number'}
                value={data.proposalNo}
                onChange={(e) => handleProposalInputChange(e.target.value)}
                className="border-border/20 focus:border-primary transition-colors"
                readOnly={insuranceCompany === 'Care Health Insurance' && data.proposalNo !== ''}
              />
              {showProposalDropdown && insuranceCompany === 'Care Health Insurance' && !data.proposalNo && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border/20 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                  {filteredProposals.length > 0 ? (
                    filteredProposals.map((item) => (
                      <div
                        key={item.proposal_no}
                        onClick={() => handleProposalSelect(item.proposal_no)}
                        className="p-3 hover:bg-muted cursor-pointer border-b border-border/10 last:border-0"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{item.proposal_no}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.customer_name} - ₹{item.payment_amount}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-muted-foreground">
                      No matching proposals found
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 hover:shadow-card transition-all duration-300" style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent className="p-4" style={{ background: 'transparent' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                <Upload className="w-4 h-4 text-success" />
              </div>
              <Label className="text-sm font-medium">
                Quotation *
              </Label>
            </div>
            <div className="space-y-2">
              {!selectedFile ? (
                <div
                  className="border-2 border-dashed border-border/20 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      // Create a proper FileList for the event
                      const dataTransfer = new DataTransfer();
                      dataTransfer.items.add(file);
                      const mockEvent = {
                        target: {
                          files: dataTransfer.files
                        }
                      } as unknown as React.ChangeEvent<HTMLInputElement>;
                      handleFileUpload(mockEvent);
                    }
                  }}
                >
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="quotation-upload"
                    disabled={isUploadingFile}
                  />
                  <label htmlFor="quotation-upload" className="cursor-pointer">
                    {isUploadingFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground animate-spin" />
                        <p className="text-sm text-muted-foreground mb-1">
                          Uploading file...
                        </p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-1">
                          Drag and drop your quotation here, or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground/60">
                          Supported formats: PDF, JPG, PNG, DOC, DOCX (Max size: 1MB)
                        </p>
                      </>
                    )}
                  </label>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {selectedFile.type.startsWith('image/') ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                          <img
                            src={data.paymentProof}
                            alt={selectedFile.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                          <Upload className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-800">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Link className="w-3 h-3 text-blue-600" />
                          <p className="text-xs text-blue-600 truncate max-w-[200px]">
                            {data.paymentProof}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        handleChange('paymentProof', '');
                      }}
                      className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="border border-success/20 rounded-lg p-4" style={{ background: 'transparent' }}>
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