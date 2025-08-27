import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCreateVendor, useUpdateVendor } from "@/hooks/useApi";

interface VendorFormProps {
  onClose: () => void;
  initialData?: any;
}

export function VendorForm({ onClose, initialData }: VendorFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    companyName: initialData?.companyName || "",
    contactPerson: initialData?.contactPerson || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    zipCode: initialData?.zipCode || "",
    country: initialData?.country || "US",
    vendorType: initialData?.vendorType || "",
    paymentTerms: initialData?.paymentTerms || "Net 30",
    isActive: initialData?.isActive ?? true,
  });

  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
      updateVendor.mutate({ id: initialData.id, data: formData }, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Vendor updated successfully",
          });
          onClose();
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update vendor",
            variant: "destructive",
          });
        }
      });
    } else {
      createVendor.mutate(formData, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Vendor added successfully",
          });
          onClose();
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to add vendor",
            variant: "destructive",
          });
        }
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            placeholder="e.g., ABC Supplies Inc."
            value={formData.companyName}
            onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
            required
            data-testid="input-vendor-company-name"
          />
        </div>

        <div>
          <Label htmlFor="contactPerson">Contact Person</Label>
          <Input
            id="contactPerson"
            placeholder="e.g., John Smith"
            value={formData.contactPerson}
            onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
            data-testid="input-vendor-contact-person"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="contact@company.com"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            data-testid="input-vendor-email"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            placeholder="(555) 123-4567"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            data-testid="input-vendor-phone"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          placeholder="123 Business St"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          data-testid="textarea-vendor-address"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            placeholder="New York"
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            data-testid="input-vendor-city"
          />
        </div>

        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            placeholder="NY"
            value={formData.state}
            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
            data-testid="input-vendor-state"
          />
        </div>

        <div>
          <Label htmlFor="zipCode">ZIP Code</Label>
          <Input
            id="zipCode"
            placeholder="10001"
            value={formData.zipCode}
            onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
            data-testid="input-vendor-zip"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vendorType">Vendor Type</Label>
          <Select value={formData.vendorType} onValueChange={(value) => setFormData(prev => ({ ...prev, vendorType: value }))}>
            <SelectTrigger data-testid="select-vendor-type">
              <SelectValue placeholder="Select vendor type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Office Supplies">Office Supplies</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Services">Services</SelectItem>
              <SelectItem value="Manufacturing">Manufacturing</SelectItem>
              <SelectItem value="Construction">Construction</SelectItem>
              <SelectItem value="Professional Services">Professional Services</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Utilities">Utilities</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="paymentTerms">Payment Terms</Label>
          <Select value={formData.paymentTerms} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentTerms: value }))}>
            <SelectTrigger data-testid="select-payment-terms">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
              <SelectItem value="Net 10">Net 10</SelectItem>
              <SelectItem value="Net 15">Net 15</SelectItem>
              <SelectItem value="Net 30">Net 30</SelectItem>
              <SelectItem value="Net 45">Net 45</SelectItem>
              <SelectItem value="Net 60">Net 60</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={createVendor.isPending || updateVendor.isPending}
          data-testid="button-submit-vendor"
        >
          {(createVendor.isPending || updateVendor.isPending) 
            ? "Saving..." 
            : initialData ? "Update Vendor" : "Add Vendor"
          }
        </Button>
      </div>
    </form>
  );
}