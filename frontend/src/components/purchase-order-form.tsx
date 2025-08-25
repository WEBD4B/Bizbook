import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Trash2 } from "lucide-react";
import { useVendors } from "@/hooks/useApi";

interface PurchaseOrderFormProps {
  onClose: () => void;
  initialData?: any;
  selectedVendorId?: string;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export function PurchaseOrderForm({ onClose, initialData, selectedVendorId }: PurchaseOrderFormProps) {
  const { toast } = useToast();
  
  const { data: vendors = [] } = useVendors();

  // Generate auto PO number
  const generatePONumber = () => {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `PO-${year}-${timestamp}`;
  };

  const [formData, setFormData] = useState({
    vendorId: selectedVendorId || initialData?.vendorId || "",
    poNumber: initialData?.poNumber || generatePONumber(),
    vendorName: initialData?.vendorName || "",
    vendorAddress: initialData?.vendorAddress || "",
    vendorPhone: initialData?.vendorPhone || "",
    shipToName: initialData?.shipToName || "My Business",
    shipToAddress: initialData?.shipToAddress || "",
    shipToPhone: initialData?.shipToPhone || "",
    requisitioner: initialData?.requisitioner || "",
    shipVia: initialData?.shipVia || "Standard Shipping",
    fob: initialData?.fob || "Destination",
    terms: initialData?.terms || "Net 30",
    notes: initialData?.notes || "",
  });

  const [lineItems, setLineItems] = useState<LineItem[]>(
    initialData?.items || [
      { id: "1", description: "", quantity: 1, unitPrice: 0, total: 0 }
    ]
  );

  // Auto-fill vendor details when vendor is selected
  const handleVendorChange = (vendorId: string) => {
    const vendor = vendors.find((v: any) => v.id === vendorId);
    if (vendor) {
      setFormData(prev => ({
        ...prev,
        vendorId,
        vendorName: vendor.companyName,
        vendorAddress: `${vendor.address}, ${vendor.city}, ${vendor.state} ${vendor.zipCode}`,
        vendorPhone: vendor.phone || "",
        terms: vendor.paymentTerms || "Net 30"
      }));
    }
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(items => 
      items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "quantity" || field === "unitPrice") {
            updated.total = updated.quantity * updated.unitPrice;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const createPurchaseOrder = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/purchase-orders", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Purchase order created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create purchase order",
        variant: "destructive",
      });
    },
  });

  const updatePurchaseOrder = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", `/api/purchase-orders/${initialData.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Purchase order updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update purchase order",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);
    
    const mutation = initialData ? updatePurchaseOrder : createPurchaseOrder;
    mutation.mutate({
      ...formData,
      items: lineItems,
      totalAmount,
      status: initialData?.status || "pending"
    });
  };

  const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="poNumber">PO Number *</Label>
          <Input
            id="poNumber"
            value={formData.poNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, poNumber: e.target.value }))}
            required
            data-testid="input-po-number"
          />
        </div>

        <div>
          <Label htmlFor="vendor">Vendor *</Label>
          <Select value={formData.vendorId} onValueChange={handleVendorChange}>
            <SelectTrigger data-testid="select-vendor">
              <SelectValue placeholder="Select vendor" />
            </SelectTrigger>
            <SelectContent>
              {vendors.map((vendor: any) => (
                <SelectItem key={vendor.id} value={vendor.id}>
                  {vendor.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Vendor Information */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="vendorName">Vendor Name</Label>
            <Input
              id="vendorName"
              value={formData.vendorName}
              onChange={(e) => setFormData(prev => ({ ...prev, vendorName: e.target.value }))}
              data-testid="input-vendor-name"
            />
          </div>
          <div>
            <Label htmlFor="vendorAddress">Vendor Address</Label>
            <Textarea
              id="vendorAddress"
              value={formData.vendorAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, vendorAddress: e.target.value }))}
              data-testid="textarea-vendor-address"
            />
          </div>
          <div>
            <Label htmlFor="vendorPhone">Vendor Phone</Label>
            <Input
              id="vendorPhone"
              value={formData.vendorPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, vendorPhone: e.target.value }))}
              data-testid="input-vendor-phone"
            />
          </div>
        </CardContent>
      </Card>

      {/* Ship To Information */}
      <Card>
        <CardHeader>
          <CardTitle>Ship To Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="shipToName">Ship To Name</Label>
            <Input
              id="shipToName"
              value={formData.shipToName}
              onChange={(e) => setFormData(prev => ({ ...prev, shipToName: e.target.value }))}
              data-testid="input-ship-to-name"
            />
          </div>
          <div>
            <Label htmlFor="shipToAddress">Ship To Address</Label>
            <Textarea
              id="shipToAddress"
              value={formData.shipToAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, shipToAddress: e.target.value }))}
              data-testid="textarea-ship-to-address"
            />
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Line Items</CardTitle>
          <Button type="button" onClick={addLineItem} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {lineItems.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5">
                <Label>Description</Label>
                <Input
                  placeholder="Item description"
                  value={item.description}
                  onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                  data-testid={`input-item-description-${index}`}
                />
              </div>
              <div className="col-span-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                  data-testid={`input-item-quantity-${index}`}
                />
              </div>
              <div className="col-span-2">
                <Label>Unit Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.unitPrice}
                  onChange={(e) => updateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                  data-testid={`input-item-price-${index}`}
                />
              </div>
              <div className="col-span-2">
                <Label>Total</Label>
                <Input
                  value={`$${item.total.toFixed(2)}`}
                  readOnly
                  className="bg-gray-100"
                  data-testid={`text-item-total-${index}`}
                />
              </div>
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeLineItem(item.id)}
                  disabled={lineItems.length === 1}
                  data-testid={`button-remove-item-${index}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          <div className="flex justify-end pt-4 border-t">
            <div className="text-right">
              <Label>Total Amount</Label>
              <div className="text-2xl font-bold text-green-600">
                ${totalAmount.toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Details */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="shipVia">Ship Via</Label>
          <Input
            id="shipVia"
            value={formData.shipVia}
            onChange={(e) => setFormData(prev => ({ ...prev, shipVia: e.target.value }))}
            data-testid="input-ship-via"
          />
        </div>
        <div>
          <Label htmlFor="terms">Terms</Label>
          <Input
            id="terms"
            value={formData.terms}
            onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
            data-testid="input-terms"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes or instructions"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          data-testid="textarea-notes"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={createPurchaseOrder.isPending || updatePurchaseOrder.isPending || !formData.vendorId}
          data-testid="button-submit-purchase-order"
        >
          {(createPurchaseOrder.isPending || updatePurchaseOrder.isPending) 
            ? "Saving..." 
            : initialData ? "Update Purchase Order" : "Create Purchase Order"
          }
        </Button>
      </div>
    </form>
  );
}