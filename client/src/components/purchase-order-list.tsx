import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Eye, Edit, Trash2, Package } from "lucide-react";
import { PurchaseOrderForm } from "./purchase-order-form";

interface PurchaseOrderListProps {
  vendorId?: string;
  vendorName?: string;
}

export function PurchaseOrderList({ vendorId, vendorName }: PurchaseOrderListProps) {
  const { toast } = useToast();
  
  const { data: purchaseOrders = [], isLoading } = useQuery({
    queryKey: ["/api/purchase-orders", vendorId],
    queryFn: async () => {
      const url = vendorId ? `/api/purchase-orders?vendorId=${vendorId}` : "/api/purchase-orders";
      const response = await fetch(url);
      return response.json();
    }
  });

  const deletePO = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/purchase-orders/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Purchase order deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete purchase order",
        variant: "destructive"
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'sent': return 'bg-purple-100 text-purple-800';
      case 'received': return 'bg-green-100 text-green-800';
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

  const filteredPOs = vendorId 
    ? purchaseOrders.filter((po: any) => po.vendorId === vendorId)
    : purchaseOrders;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
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
        <div className="grid gap-4">
          {filteredPOs.map((po: any) => (
            <Card key={po.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{po.poNumber}</h4>
                      <Badge className={getStatusColor(po.status)}>
                        {po.status || 'Pending'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div>Vendor: {po.vendorName}</div>
                      <div>Total: ${po.totalAmount?.toFixed(2) || '0.00'}</div>
                      <div>Created: {po.createdAt ? new Date(po.createdAt).toLocaleDateString() : 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" data-testid={`button-view-po-${po.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Purchase Order Details - {po.poNumber}</DialogTitle>
                        </DialogHeader>
                        <PurchaseOrderDetails po={po} />
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" data-testid={`button-edit-po-${po.id}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Edit Purchase Order - {po.poNumber}</DialogTitle>
                        </DialogHeader>
                        <PurchaseOrderForm 
                          initialData={po}
                          onClose={() => {}} 
                        />
                      </DialogContent>
                    </Dialog>

                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => deletePO.mutate(po.id)}
                      data-testid={`button-delete-po-${po.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {po.items && po.items.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-sm text-muted-foreground">
                      Items: {po.items.map((item: any) => item.description).join(', ')}
                    </div>
                  </div>
                )}
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
            <div><strong>Total Amount:</strong> ${po.totalAmount?.toFixed(2) || '0.00'}</div>
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
                  <td className="text-right p-3">${item.unitPrice?.toFixed(2) || '0.00'}</td>
                  <td className="text-right p-3">${item.total?.toFixed(2) || '0.00'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t">
              <tr>
                <td colSpan={3} className="text-right p-3 font-medium">Total Amount:</td>
                <td className="text-right p-3 font-bold">${po.totalAmount?.toFixed(2) || '0.00'}</td>
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