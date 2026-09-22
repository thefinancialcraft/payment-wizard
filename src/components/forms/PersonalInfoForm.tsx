import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { User, Phone, Mail, Users, MapPin, Search } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface FormData {
  policyHolderName: string;
  contactNo: string;
  email: string;
  numberOfMembers: string;
  pincode: string;
  city: string;
  district: string;
  state: string;
  country: string;
}

interface PersonalInfoFormProps {
  data: any;
  updateData: (data: any) => void;
  disabledFields?: string[];
  locationFetched?: boolean;
  setLocationFetched?: (fetched: boolean) => void;
}

export function PersonalInfoForm({ data, updateData, disabledFields = [], locationFetched, setLocationFetched }: PersonalInfoFormProps) {
  const [emailError, setEmailError] = useState('');
  const [contactError, setContactError] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  const [locationDetails, setLocationDetails] = useState<{
    city: string;
    district: string;
    state: string;
    country: string;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const lastSearchedPincode = useRef<string>('');

  // Initialize Supabase client
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  // Auto-trigger search when pincode becomes 6 digits
  useEffect(() => {
    console.log('Pincode changed in useEffect:', data.pincode, 'Length:', data.pincode?.length, 'Last searched:', lastSearchedPincode.current);

    if (data.pincode && data.pincode.length === 6 && data.pincode !== lastSearchedPincode.current) {
      console.log('6 digits detected and different from last search, triggering search');
      setPincodeError('');
      lastSearchedPincode.current = data.pincode;
      // Small delay to ensure state is updated
      setTimeout(() => {
        handlePincodeSearch();
      }, 50);
    }
  }, [data.pincode]);

  const handleChange = (field: keyof FormData, value: string) => {
    updateData({ [field]: value });
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validateContact = (contact: string) => {
    const contactRegex = /^\d{10}$/;
    if (!contactRegex.test(contact)) {
      setContactError('Contact number must be exactly 10 digits');
      return false;
    }
    setContactError('');
    return true;
  };

  const validatePincode = (pincode: string) => {
    const pincodeRegex = /^\d{6}$/;
    console.log('Validating pincode:', pincode, 'Length:', pincode.length, 'Regex test:', pincodeRegex.test(pincode));

    if (pincodeRegex.test(pincode)) {
      setPincodeError('');
      return true;
    }
    // Only show error for incomplete pincodes
    if (pincode.length > 0 && pincode.length < 6) {
      setPincodeError('Pincode must be exactly 6 digits');
    } else {
      setPincodeError('');
    }
    return false;
  };

  const handleEmailChange = (value: string) => {
    handleChange('email', value);
    if (value) validateEmail(value);
  };

  const handleContactChange = (value: string) => {
    // Remove any non-numeric characters
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 10) {
      handleChange('contactNo', numericValue);
      if (numericValue) validateContact(numericValue);
    }
  };

  const handlePincodeChange = (value: string) => {
    // Remove any non-numeric characters
    const numericValue = value.replace(/\D/g, '');
    console.log('Pincode change:', numericValue, 'Length:', numericValue.length, 'Error:', pincodeError);

    if (numericValue.length <= 6) {
      handleChange('pincode', numericValue);
      // Clear location details when pincode changes
      setLocationDetails(null);

      // Validate pincode
      if (numericValue) {
        validatePincode(numericValue);
      }
    }
  };

  const handlePincodeSearch = async () => {
    if (!data.pincode || pincodeError) {
      return;
    }

    // Check if location already fetched
    if (locationFetched && locationDetails) {
      console.log('Location already fetched, skipping API call');
      return;
    }

    setIsLoadingLocation(true);
    setLocationDetails(null);

    try {
      // Use environment variable for API key
      const MAPPLS_API_KEY = import.meta.env.VITE_MAPPLS_API_KEY || 'YOUR_MAPPLS_API_KEY';

      console.log('API Key:', MAPPLS_API_KEY);
      console.log('Pincode:', data.pincode);

      if (MAPPLS_API_KEY === 'YOUR_MAPPLS_API_KEY') {
        console.error('Please set VITE_MAPPLS_API_KEY in your .env file');
        setIsLoadingLocation(false);
        return;
      }

      let responseData;
      if (import.meta.env.DEV) {
        // Development: Use Vite proxy
        const url = "/api/search/address/geocode";
        const params = new URLSearchParams({
          address: data.pincode,
          podFilter: "pincode",
          access_token: MAPPLS_API_KEY
        });
        const response = await fetch(`${url}?${params}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        responseData = await response.json();
      } else {
        // Production: Use Supabase Edge Function
        const { data: supabaseData, error } = await supabase.functions.invoke('geocode', {
          body: {
            address: data.pincode,
            podFilter: "pincode",
            access_token: MAPPLS_API_KEY
          }
        });

        if (error) {
          throw new Error(`Supabase function error: ${error.message}`);
        }
        responseData = supabaseData;
      }

      console.log('Response data:', responseData);

      const cop = responseData.copResults;

      if (!cop) {
        throw new Error('Pincode not found');
      }

      const locationData = {
        city: cop.city || 'N/A',
        district: cop.district || 'N/A',
        state: cop.state || 'N/A',
        country: cop.country || 'India'
      };

      // Set default country to India if not provided
      if (!locationData.country) {
        locationData.country = 'India';
      }

      setLocationDetails(locationData);
      setLocationFetched(true); // Mark as fetched

      // Update form data with location details
      updateData({
        city: locationData.city,
        district: locationData.district,
        state: locationData.state,
        country: locationData.country
      });

    } catch (error) {
      console.error('Error fetching location:', error);
      alert('Error: No data found for this pincode. Please enter a valid 6-digit pincode.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-in" style={{ background: 'transparent' }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ background: 'transparent' }}>
        <Card className="hover:shadow-card transition-all duration-300" style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent className="p-4" style={{ background: 'transparent' }}>
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
              disabled={disabledFields.includes('policyHolderName')}
              className="border-border/20 focus:border-primary transition-colors"
              style={{ opacity: disabledFields.includes('policyHolderName') ? 0.6 : 1, background: 'transparent' }}
            />
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-all duration-300" style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent className="p-4" style={{ background: 'transparent' }}>
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
              placeholder="Enter 10-digit phone number"
              value={data.contactNo}
              onChange={(e) => handleContactChange(e.target.value)}
              className={`border-border/20 focus:border-primary transition-colors ${contactError ? 'border-destructive' : ''}`}
              maxLength={10}
              style={{ background: 'transparent' }}
            />
            {contactError && (
              <p className="text-xs text-destructive mt-1">{contactError}</p>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-all duration-300" style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent className="p-4" style={{ background: 'transparent' }}>
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
              placeholder="Enter email address (e.g., abc@domain.com)"
              value={data.email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className={`border-border/20 focus:border-primary transition-colors ${emailError ? 'border-destructive' : ''}`}
              style={{ background: 'transparent' }}
            />
            {emailError && (
              <p className="text-xs text-destructive mt-1">{emailError}</p>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-all duration-300" style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent className="p-4" style={{ background: 'transparent' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="pincode" className="text-sm font-medium">
                Pincode *
              </Label>
            </div>
            <div className="relative">
              <Input
                id="pincode"
                placeholder="Enter 6-digit pincode"
                value={data.pincode}
                onChange={(e) => handlePincodeChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && data.pincode.length === 6) {
                    e.preventDefault();
                    setPincodeError('');
                    handlePincodeSearch();
                  }
                }}
                className={`border-border/20 focus:border-primary transition-colors pr-10 ${pincodeError ? 'border-destructive' : ''}`}
                maxLength={6}
                style={{ background: 'transparent' }}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                onClick={handlePincodeSearch}
                disabled={isLoadingLocation || !data.pincode || !!pincodeError}
              >
                {isLoadingLocation ? (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
              {pincodeError && (
                <p className="text-xs text-destructive mt-1">{pincodeError}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {locationDetails && (
          <Card className="hover:shadow-card transition-all duration-300" style={{ background: 'rgba(20, 20, 20, 0.0)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <CardContent className="p-4" style={{ background: 'transparent' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <Label className="text-sm font-medium">
                  Location Details
                </Label>
              </div>
              <div className="text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">City:</span>
                  <span className="font-medium">{locationDetails.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">District:</span>
                  <span className="font-medium">{locationDetails.district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">State:</span>
                  <span className="font-medium">{locationDetails.state}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Country:</span>
                  <span className="font-medium">{locationDetails.country}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="hover:shadow-card transition-all duration-300" style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent className="p-4" style={{ background: 'transparent' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="numberOfMembers" className="text-sm font-medium">
                Number of Members
              </Label>
            </div>
            <Select
              value={data.numberOfMembers}
              onValueChange={(value) => handleChange('numberOfMembers', value)}
              disabled={disabledFields.includes('numberOfMembers')}
            >
              <SelectTrigger className="border-border/20 focus:border-primary" style={{ opacity: disabledFields.includes('numberOfMembers') ? 0.6 : 1, background: 'transparent' }}>
                <SelectValue placeholder="Select number of members" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'Member' : 'Members'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
      
      <div className="border border-info/20 rounded-lg p-4" style={{ background: 'transparent' }}>
        <p className="text-sm text-info-foreground">
          <strong>Note:</strong> Please ensure all information is accurate as it will be used for policy verification and communication.
        </p>
      </div>
    </div>
  );
}