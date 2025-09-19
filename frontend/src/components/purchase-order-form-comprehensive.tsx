import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useVendors } from "@/hooks/useApi";
import { useAuth } from "@clerk/clerk-react";
import { apiRequest } from "@/lib/apiWithAuth";
import { useQueryClient } from "@tanstack/react-query";

interface PurchaseOrderFormComprehensiveProps {
  onClose: () => void;
  selectedVendorId?: string | null;
}

export function PurchaseOrderFormComprehensive({ onClose, selectedVendorId }: PurchaseOrderFormComprehensiveProps) {
  const { toast } = useToast();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { data: vendors = [] } = useVendors();

  const [formData, setFormData] = useState({
    vendorId: selectedVendorId || '',
    poNumber: `PO-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
    status: 'pending',
    vendorName: '',
    vendorAddress: '',
    vendorPhone: '',
    shipToAddress: '',
    vendorMessage: '',
    products: [{
      productName: '',
      description: '',
      bin: '',
      quantity: '',
      unitOfMeasure: 'each',
      productRate: '',
      customer: '',
      manufacturingDate: '',
      class: '',
      amount: ''
    }]
  });

  // Auto-populate vendor details when selectedVendorId is provided
  useEffect(() => {
    if (selectedVendorId && vendors.length > 0) {
      const selectedVendor = vendors.find((v: any) => v.id === selectedVendorId);
      if (selectedVendor) {
        setFormData(prev => ({
          ...prev,
          vendorId: selectedVendorId,
          vendorName: selectedVendor.companyName || '',
          vendorAddress: selectedVendor.address || '',
          vendorPhone: selectedVendor.phone || ''
        }));
      }
    }
  }, [selectedVendorId, vendors]);

  const orderMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Starting purchase order creation...', data.poNumber);
      
      const { products, ...orderData } = data;
      const totalAmount = products.reduce((sum: number, product: any) => sum + parseFloat(product.amount || '0'), 0);

      const token = await getToken();
      
      console.log('Creating purchase order with data:', {
        ...orderData,
        status: orderData.status,
        totalAmount: totalAmount.toString(),
        subtotal: totalAmount.toString(),
        taxAmount: '0',
        shippingAmount: '0',
        notes: orderData.vendorMessage
      });
      
      const orderResponse = await apiRequest("/purchase-orders", {
        method: "POST",
        body: JSON.stringify({
          ...orderData,
          status: orderData.status,
          totalAmount: totalAmount.toString(),
          subtotal: totalAmount.toString(),
          taxAmount: '0',
          shippingAmount: '0',
          notes: orderData.vendorMessage // Map vendorMessage to notes field
        })
      }, token);
      const order = orderResponse.data;
      console.log('Purchase order created successfully:', order.id);

      // Create order items using product data
      console.log('Creating order items for', products.length, 'products');
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        if (product.productName && product.description) {
          await apiRequest("/purchase-order-items", {
            method: "POST",
            body: JSON.stringify({
              purchaseOrderId: order.id,
              lineNumber: i + 1,
              description: `${product.productName} - ${product.description}`,
              quantity: product.quantity || '0',
              unitPrice: product.productRate || '0',
              totalPrice: product.amount || '0',
              partNumber: product.bin || '',
              unitOfMeasure: product.unitOfMeasure || 'each'
            })
          }, token);
          console.log(`Created order item ${i + 1}`);
        }
      }

      // Automatically create business expense for the purchase order
      console.log('Creating business expense');
      const expenseData = {
        amount: totalAmount.toString(),
        description: `Purchase Order ${orderData.poNumber} - ${orderData.vendorName}`,
        vendor: orderData.vendorName,
        category: "Purchase Orders",
        expenseDate: new Date().toISOString().split('T')[0], // Fix: use expenseDate instead of date
        notes: `Auto-generated from PO ${orderData.poNumber}. ${orderData.vendorMessage || ''}`,
        purchaseOrderId: order.id
      };
      
      console.log('Business expense data:', expenseData);
      
      await apiRequest("/business-expenses", {
        method: "POST",
        body: JSON.stringify(expenseData)
      }, token);
      
      console.log('Business expense created successfully');

      return order;
    },
    retry: false, // Disable automatic retries to prevent duplicate calls
    onSuccess: () => {
      console.log('Purchase order creation completed successfully');
      toast({
        title: "Success",
        description: "Purchase order created and added to business expenses"
      });
      // Invalidate all purchase order queries (both with and without vendor filter)
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      // Also invalidate business expenses
      queryClient.invalidateQueries({ queryKey: ["business-expenses"] });
      // Invalidate vendor queries in case vendors list needs updating
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      onClose(); // This should close the modal
    },
    onError: (error: any) => {
      console.error('Purchase Order Creation Error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create purchase order",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted, mutation pending:', orderMutation.isPending);
    
    // Prevent multiple submissions
    if (orderMutation.isPending) {
      console.log('Submission prevented - already pending');
      return;
    }
    
    // Validate required fields
    if (!formData.vendorId) {
      toast({
        title: "Error",
        description: "Please select a vendor first",
        variant: "destructive"
      });
      return;
    }

    // Validate that at least one product exists with required fields
    const validProducts = formData.products.filter(p => p.productName && p.description);
    if (validProducts.length === 0) {
      toast({
        title: "Error", 
        description: "Please add at least one product with name and description",
        variant: "destructive"
      });
      return;
    }

    // Submit with valid products only
    const submissionData = {
      ...formData,
      products: validProducts
    };

    console.log('Submitting purchase order with PO number:', submissionData.poNumber);
    orderMutation.mutate(submissionData);
  };

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, {
        productName: '',
        description: '',
        bin: '',
        quantity: '',
        unitOfMeasure: 'each',
        productRate: '',
        customer: '',
        manufacturingDate: '',
        class: '',
        amount: ''
      }]
    }));
  };

  const updateProduct = (index: number, field: string, value: string) => {
    const newProducts = [...formData.products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    
    // Auto-calculate amount when quantity or productRate changes
    if (field === 'quantity' || field === 'productRate') {
      const quantity = parseFloat(newProducts[index].quantity || '0');
      const productRate = parseFloat(newProducts[index].productRate || '0');
      newProducts[index].amount = (quantity * productRate).toFixed(2);
    }
    
    setFormData(prev => ({ ...prev, products: newProducts }));
  };

  const removeProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto">
      <div>
        <Label htmlFor="po-number">PO Number</Label>
        <Input
          id="po-number"
          value={formData.poNumber}
          onChange={(e) => setFormData(prev => ({ ...prev, poNumber: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Vendor Information</h3>
        <div>
          <Label htmlFor="vendor-select">Select Vendor</Label>
          <Select 
            value={formData.vendorId} 
            onValueChange={(value) => {
              const selectedVendor = vendors.find(v => v.id === value);
              if (selectedVendor) {
                setFormData(prev => ({ 
                  ...prev, 
                  vendorId: value,
                  vendorName: selectedVendor.companyName,
                  vendorAddress: selectedVendor.address || '',
                  vendorPhone: selectedVendor.phone || ''
                }));
              }
            }}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder={vendors.length === 0 ? "No vendors available" : "Select a vendor"} />
            </SelectTrigger>
            <SelectContent>
              {vendors.length === 0 ? (
                <SelectItem value="none" disabled>
                  No vendors available. Please add a vendor first.
                </SelectItem>
              ) : (
                vendors.map((vendor: any) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.companyName}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {vendors.length === 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              You need to add vendors before creating purchase orders. Go to the Office tab to add vendors.
            </p>
          )}
        </div>
        {formData.vendorId && (
          <>
            <div>
              <Label>Vendor Address (auto-filled)</Label>
              <Textarea
                value={formData.vendorAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, vendorAddress: e.target.value }))}
                placeholder="Vendor address will be auto-filled when you select a vendor"
              />
            </div>
            <div>
              <Label>Vendor Phone (auto-filled)</Label>
              <Input
                value={formData.vendorPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, vendorPhone: e.target.value }))}
                placeholder="Vendor phone will be auto-filled when you select a vendor"
              />
            </div>
          </>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Purchase Order Status</h3>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="ordered">Ordered</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Ship To Address</h3>
        <div>
          <Label htmlFor="ship-to-address">Ship To Address</Label>
          <Textarea
            id="ship-to-address"
            value={formData.shipToAddress}
            onChange={(e) => setFormData(prev => ({ ...prev, shipToAddress: e.target.value }))}
            placeholder="Enter shipping address"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Vendor Message</h3>
        <div>
          <Label htmlFor="vendor-message">Message to Vendor</Label>
          <Textarea
            id="vendor-message"
            value={formData.vendorMessage}
            onChange={(e) => setFormData(prev => ({ ...prev, vendorMessage: e.target.value }))}
            placeholder="Any special instructions or messages for the vendor"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Products</h3>
          <Button type="button" onClick={addProduct} variant="outline">
            Add Product
          </Button>
        </div>
        
        {formData.products.map((product, index) => (
          <div key={index} className="border p-4 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Product {index + 1}</h4>
              {formData.products.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removeProduct(index)}
                  variant="destructive"
                  size="sm"
                >
                  Remove
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Product Name *</Label>
                <Input
                  value={product.productName}
                  onChange={(e) => updateProduct(index, 'productName', e.target.value)}
                  placeholder="Product name"
                  required
                />
              </div>
              <div>
                <Label>Description *</Label>
                <Input
                  value={product.description}
                  onChange={(e) => updateProduct(index, 'description', e.target.value)}
                  placeholder="Product description"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Bin</Label>
                <Input
                  value={product.bin}
                  onChange={(e) => updateProduct(index, 'bin', e.target.value)}
                  placeholder="Bin location"
                />
              </div>
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={product.quantity}
                  onChange={(e) => updateProduct(index, 'quantity', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Unit of Measure</Label>
                <Select 
                  value={product.unitOfMeasure} 
                  onValueChange={(value) => updateProduct(index, 'unitOfMeasure', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="each">Each</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                    <SelectItem value="case">Case</SelectItem>
                    <SelectItem value="dozen">Dozen</SelectItem>
                    <SelectItem value="kg">Kilogram</SelectItem>
                    <SelectItem value="lb">Pound</SelectItem>
                    <SelectItem value="meter">Meter</SelectItem>
                    <SelectItem value="ft">Feet</SelectItem>
                    <SelectItem value="liter">Liter</SelectItem>
                    <SelectItem value="gallon">Gallon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Product Rate</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={product.productRate}
                  onChange={(e) => updateProduct(index, 'productRate', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Customer</Label>
                <Input
                  value={product.customer}
                  onChange={(e) => updateProduct(index, 'customer', e.target.value)}
                  placeholder="Customer name"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Manufacturing Date</Label>
                <Input
                  type="date"
                  value={product.manufacturingDate}
                  onChange={(e) => updateProduct(index, 'manufacturingDate', e.target.value)}
                />
              </div>
              <div>
                <Label>Class</Label>
                <Input
                  value={product.class}
                  onChange={(e) => updateProduct(index, 'class', e.target.value)}
                  placeholder="Product class"
                />
              </div>
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={product.amount}
                  onChange={(e) => updateProduct(index, 'amount', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        ))}
        
        <div className="text-right">
          <div className="text-xl font-bold">
            Total Amount: $
            {formData.products.reduce((sum, product) => sum + parseFloat(product.amount || '0'), 0).toFixed(2)}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={orderMutation.isPending}>
          {orderMutation.isPending ? "Creating..." : "Create Purchase Order"}
        </Button>
      </div>
    </form>
  );
}