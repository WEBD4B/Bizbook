import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/apiWithAuth";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@clerk/clerk-react";
import { useAuthenticatedQuery } from "@/hooks/useAuthenticatedApi";
import { Eye, Edit, Trash2, Package, Printer } from "lucide-react";
import { PurchaseOrderForm } from "./purchase-order-form";
import { useState } from "react";

interface PurchaseOrderListProps {
  vendorId?: string;
  vendorName?: string;
}

export function PurchaseOrderList({ vendorId, vendorName }: PurchaseOrderListProps) {
  const { toast } = useToast();
  const { getToken } = useAuth();
  const [editingPO, setEditingPO] = useState<any>(null);
  
  const { data: purchaseOrders = [], isLoading } = useAuthenticatedQuery(
    ["purchase-orders", vendorId],
    async (token) => {
      const url = vendorId ? `/purchase-orders?vendorId=${vendorId}` : "/purchase-orders";
      const response = await apiRequest(url, {}, token);
      return response.data || [];
    }
  );

  const printPurchaseOrder = (po: any) => {
    const printWindow = window.open('', '', 'height=800,width=1000');
    if (!printWindow) {
      toast({
        title: "Error",
        description: "Could not open print window. Please allow popups.",
        variant: "destructive"
      });
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Purchase Order - ${po.poNumber}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
            }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
              border-bottom: 3px solid #059669; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .logo { 
              display: flex; 
              align-items: center; 
              gap: 10px; 
            }
            .logo-icon { 
              width: 40px; 
              height: 40px; 
              background: linear-gradient(135deg, #10b981, #0d9488); 
              border-radius: 10px; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              color: white; 
              font-weight: bold; 
              font-size: 18px; 
            }
            .logo-text { 
              font-size: 28px; 
              font-weight: bold; 
              background: linear-gradient(135deg, #059669, #0d9488); 
              -webkit-background-clip: text; 
              -webkit-text-fill-color: transparent; 
              background-clip: text; 
            }
            .company-info { 
              text-align: right; 
              font-size: 14px; 
              color: #666; 
            }
            .po-title { 
              font-size: 24px; 
              font-weight: bold; 
              color: #059669; 
              margin-bottom: 20px; 
            }
            .info-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 30px; 
              margin-bottom: 30px; 
            }
            .info-section h3 { 
              font-size: 16px; 
              font-weight: bold; 
              color: #059669; 
              margin-bottom: 10px; 
              border-bottom: 1px solid #e5e7eb; 
              padding-bottom: 5px; 
            }
            .info-section div { 
              margin-bottom: 5px; 
              font-size: 14px; 
            }
            .items-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px; 
            }
            .items-table th { 
              background-color: #f3f4f6; 
              padding: 12px; 
              text-align: left; 
              border: 1px solid #d1d5db; 
              font-weight: bold; 
              color: #374151; 
            }
            .items-table td { 
              padding: 12px; 
              border: 1px solid #d1d5db; 
              font-size: 14px; 
            }
            .items-table .text-right { 
              text-align: right; 
            }
            .items-table .text-center { 
              text-align: center; 
            }
            .total-row { 
              background-color: #f9fafb; 
              font-weight: bold; 
            }
            .status-badge { 
              padding: 4px 12px; 
              border-radius: 20px; 
              font-size: 12px; 
              font-weight: bold; 
              text-transform: uppercase; 
              background-color: #fef3c7; 
              color: #92400e; 
            }
            .footer { 
              margin-top: 40px; 
              padding-top: 20px; 
              border-top: 1px solid #e5e7eb; 
              text-align: center; 
              font-size: 12px; 
              color: #6b7280; 
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">
              <div class="logo-icon">₭</div>
              <div class="logo-text">KashGrip</div>
            </div>
            <div class="company-info">
              <div><strong>Purchase Order</strong></div>
              <div>Date: ${new Date().toLocaleDateString()}</div>
            </div>
          </div>
          
          <div class="po-title">Purchase Order #${po.poNumber}</div>
          
          <div class="info-grid">
            <div class="info-section">
              <h3>Purchase Order Information</h3>
              <div><strong>PO Number:</strong> ${po.poNumber}</div>
              <div><strong>Status:</strong> <span class="status-badge">${po.status || 'Pending'}</span></div>
              <div><strong>Date Created:</strong> ${po.createdAt ? new Date(po.createdAt).toLocaleDateString() : 'N/A'}</div>
              <div><strong>Total Amount:</strong> $${parseFloat(po.totalAmount || '0').toFixed(2)}</div>
            </div>
            
            <div class="info-section">
              <h3>Vendor Information</h3>
              <div><strong>Company:</strong> ${po.vendorName || 'N/A'}</div>
              <div><strong>Address:</strong> ${po.vendorAddress || 'N/A'}</div>
              <div><strong>Phone:</strong> ${po.vendorPhone || 'N/A'}</div>
            </div>
          </div>
          
          ${po.items && po.items.length > 0 ? `
            <h3 style="color: #059669; margin-bottom: 15px;">Items</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="text-center">Quantity</th>
                  <th class="text-right">Unit Price</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${po.items.map((item: any) => `
                  <tr>
                    <td>${item.description || 'N/A'}</td>
                    <td class="text-center">${item.quantity || 0}</td>
                    <td class="text-right">$${parseFloat(item.unitPrice || '0').toFixed(2)}</td>
                    <td class="text-right">$${parseFloat(item.total || '0').toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td colspan="3" class="text-right"><strong>Total Amount:</strong></td>
                  <td class="text-right"><strong>$${parseFloat(po.totalAmount || '0').toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            </table>
          ` : '<p style="color: #6b7280; font-style: italic;">No items found for this purchase order.</p>'}
          
          <div class="footer">
            <div>Generated by KashGrip Financial Management System</div>
            <div>Printed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const deletePO = useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return apiRequest(`/purchase-orders/${id}`, { method: "DELETE" }, token);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Purchase order deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
    onError: (error: any) => {
      // If it's a 404, the item was already deleted, so invalidate cache
      if (error?.status === 404 || error?.message?.includes('404') || error?.message?.includes('not found')) {
        toast({
          title: "Success",
          description: "Purchase order removed successfully"
        });
        queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete purchase order",
          variant: "destructive"
        });
      }
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const token = await getToken();
      return apiRequest(`/purchase-orders/${id}`, { 
        method: "PUT",
        body: JSON.stringify({ status })
      }, token);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Purchase order status updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update purchase order status",
        variant: "destructive"
      });
    }
  });

  const handleStatusChange = (poId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: poId, status: newStatus });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'ordered': return 'bg-purple-100 text-purple-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-gray-100 rounded animate-pulse"></div>
        <div className="h-20 bg-gray-100 rounded animate-pulse"></div>
        <div className="h-20 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  // No need to filter again since we already filter in the API call
  const filteredPOs = purchaseOrders;

  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between flex-shrink-0">
        <h3 className="text-lg font-semibold">
          {vendorName ? `Purchase Orders for ${vendorName}` : 'All Purchase Orders'}
        </h3>
        <div className="text-sm text-muted-foreground">
          {filteredPOs.length} order{filteredPOs.length !== 1 ? 's' : ''}
        </div>
      </div>

      {filteredPOs.length === 0 ? (
        <div className="text-center py-8 text-neutral-500">
          <Package size={48} className="mx-auto mb-4 text-neutral-300" />
          <p className="mb-2">No purchase orders found</p>
          <p className="text-sm">
            {vendorName 
              ? `No purchase orders have been created for ${vendorName} yet`
              : "No purchase orders have been created yet"
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 auto-rows-min">
          {filteredPOs.map((po: any) => (
            <Card key={po.id} className="h-fit">
              <CardContent className="p-3">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{po.poNumber}</h4>
                        <Select
                          value={po.status || 'pending'}
                          onValueChange={(newStatus) => handleStatusChange(po.id, newStatus)}
                          disabled={updateStatusMutation.isPending}
                        >
                          <SelectTrigger className={`w-24 h-6 text-xs ${getStatusColor(po.status)}`}>
                            <SelectValue />
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
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="truncate">Vendor: {po.vendorName}</div>
                        <div>Total: ${parseFloat(po.totalAmount || '0').toFixed(2)}</div>
                        <div>Items: {po.items?.length || 0}</div>
                        <div>{po.createdAt ? new Date(po.createdAt).toLocaleDateString() : 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 pt-2 border-t">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs flex-1" data-testid={`button-view-po-${po.id}`}>
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Purchase Order Details - {po.poNumber}</DialogTitle>
                        </DialogHeader>
                        <PurchaseOrderDetails po={po} />
                      </DialogContent>
                    </Dialog>

                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 px-2 text-xs flex-1"
                      onClick={() => printPurchaseOrder(po)}
                      data-testid={`button-print-po-${po.id}`}
                    >
                      <Printer className="h-3 w-3 mr-1" />
                      Print
                    </Button>

                    <Dialog open={editingPO?.id === po.id} onOpenChange={(open) => !open && setEditingPO(null)}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 px-2 text-xs flex-1" 
                          onClick={() => setEditingPO(po)}
                          data-testid={`button-edit-po-${po.id}`}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Edit Purchase Order - {po.poNumber}</DialogTitle>
                        </DialogHeader>
                        <PurchaseOrderForm 
                          initialData={po}
                          onClose={() => setEditingPO(null)} 
                        />
                      </DialogContent>
                    </Dialog>

                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="h-7 px-2 text-xs"
                      onClick={() => deletePO.mutate(po.id)}
                      disabled={deletePO.isPending}
                      data-testid={`button-delete-po-${po.id}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function PurchaseOrderDetails({ po }: { po: any }) {
  return (
    <div className="space-y-6">
      {/* Header Information */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Purchase Order Information</h3>
          <div className="space-y-1 text-sm">
            <div><strong>PO Number:</strong> {po.poNumber}</div>
            <div><strong>Status:</strong> {po.status || 'Pending'}</div>
            <div><strong>Date Created:</strong> {po.createdAt ? new Date(po.createdAt).toLocaleDateString() : 'N/A'}</div>
            <div><strong>Total Amount:</strong> ${parseFloat(po.totalAmount || '0').toFixed(2)}</div>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Vendor Information</h3>
          <div className="space-y-1 text-sm">
            <div><strong>Name:</strong> {po.vendorName}</div>
            <div><strong>Address:</strong> {po.vendorAddress}</div>
            <div><strong>Phone:</strong> {po.vendorPhone}</div>
          </div>
        </div>
      </div>

      {/* Ship To Information */}
      <div>
        <h3 className="font-semibold mb-2">Ship To Information</h3>
        <div className="space-y-1 text-sm">
          <div><strong>Name:</strong> {po.shipToName}</div>
          <div><strong>Address:</strong> {po.shipToAddress}</div>
          <div><strong>Phone:</strong> {po.shipToPhone}</div>
        </div>
      </div>

      {/* Line Items */}
      <div>
        <h3 className="font-semibold mb-2">Line Items</h3>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-medium">Description</th>
                <th className="text-center p-3 font-medium">Quantity</th>
                <th className="text-right p-3 font-medium">Unit Price</th>
                <th className="text-right p-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {po.items?.map((item: any, index: number) => (
                <tr key={index} className="border-t">
                  <td className="p-3">{item.description}</td>
                  <td className="text-center p-3">{item.quantity}</td>
                  <td className="text-right p-3">${parseFloat(item.unitPrice || '0').toFixed(2)}</td>
                  <td className="text-right p-3">${parseFloat(item.total || '0').toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t">
              <tr>
                <td colSpan={3} className="text-right p-3 font-medium">Total Amount:</td>
                <td className="text-right p-3 font-bold">${parseFloat(po.totalAmount || '0').toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Additional Details */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Shipping & Terms</h3>
          <div className="space-y-1 text-sm">
            <div><strong>Ship Via:</strong> {po.shipVia}</div>
            <div><strong>Terms:</strong> {po.terms}</div>
            <div><strong>FOB:</strong> {po.fob}</div>
          </div>
        </div>
        
        {po.notes && (
          <div>
            <h3 className="font-semibold mb-2">Notes</h3>
            <div className="text-sm bg-gray-50 p-3 rounded">
              {po.notes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}