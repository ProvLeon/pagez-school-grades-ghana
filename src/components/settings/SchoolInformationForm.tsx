
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { School, MapPin, Quote, Phone, Navigation, User } from 'lucide-react';

interface SchoolInformationFormProps {
  formData: {
    school_name: string;
    location: string;
    address_1: string;
    phone: string;
    motto: string;
    headteacher_name: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export const SchoolInformationForm: React.FC<SchoolInformationFormProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <School className="w-5 h-5 text-primary" />
          School Information
        </CardTitle>
        <CardDescription>Update your school's essential details and contact information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Basic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="school_name">School Name *</Label>
              <div className="relative">
                <School className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="school_name"
                  value={formData.school_name}
                  onChange={(e) => onInputChange('school_name', e.target.value)}
                  placeholder="Enter school name"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="headteacher_name">Headteacher Name</Label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="headteacher_name"
                  value={formData.headteacher_name}
                  onChange={(e) => onInputChange('headteacher_name', e.target.value)}
                  placeholder="Enter headteacher's full name"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="motto">School Motto</Label>
            <div className="relative">
              <Quote className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                id="motto"
                value={formData.motto}
                onChange={(e) => onInputChange('motto', e.target.value)}
                placeholder="Enter school motto"
                className="pl-10"
              />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Contact & Location</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location/City</Label>
              <div className="relative">
                <Navigation className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => onInputChange('location', e.target.value)}
                  placeholder="e.g., Accra, Ghana"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => onInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_1">Address</Label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                id="address_1"
                value={formData.address_1}
                onChange={(e) => onInputChange('address_1', e.target.value)}
                placeholder="School address"
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
