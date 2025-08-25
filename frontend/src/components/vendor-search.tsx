import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Building2, Receipt, Eye } from "lucide-react";
import { PurchaseOrderForm } from "./purchase-order-form";
import { PurchaseOrderList } from "./purchase-order-list";
import { useVendors, usePurchaseOrders } from "@/hooks/useApi";

export function VendorSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: vendors = [], isLoading } = useVendors();
  const { data: purchaseOrders = [] } = usePurchaseOrders();

  // Filter vendors based on search term
  const filteredVendors = vendors.filter(vendor => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      vendor.companyName?.toLowerCase().includes(term) ||
      vendor.contactPerson?.toLowerCase().includes(term) ||
      vendor.email?.toLowerCase().includes(term) ||
      vendor.vendorType?.toLowerCase().includes(term) ||
      vendor.phone?.toLowerCase().includes(term)
    );
  });

  // Filter purchase orders based on search term (including items)
  const filteredPOs = purchaseOrders.filter(po => {
    if (!searchTerm) return false; // Only show POs when actively searching
    
    const term = searchTerm.toLowerCase();
    return (
      po.poNumber?.toLowerCase().includes(term) ||
      po.vendorName?.toLowerCase().includes(term) ||
      po.status?.toLowerCase().includes(term) ||
      po.notes?.toLowerCase().includes(term) ||
      po.items?.some((item: any) => 
        item.description?.toLowerCase().includes(term)
      )
    );
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search Vendors & Purchase Orders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by vendor name, contact, PO number, item description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-vendors-pos"
          />
        </div>

        {searchTerm && (
          <div className="text-sm text-muted-foreground">
            Found {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''} and {filteredPOs.length} purchase order{filteredPOs.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Search Results */}
        {searchTerm && (
          <div className="space-y-6">
            {/* Vendor Results */}
            {filteredVendors.length > 0 && (
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Vendors ({filteredVendors.length})
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {filteredVendors.map((vendor: any) => (
                    <div key={vendor.id} className="p-4 border rounded-lg bg-white">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{vendor.companyName}</h4>
                        <Badge variant="outline">{vendor.vendorType || 'General'}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1 mb-3">
                        <div>{vendor.contactPerson}</div>
                        <div>{vendor.email}</div>
                        <div>{vendor.phone}</div>
                        <div>Terms: {vendor.paymentTerms}</div>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="flex-1">
                              <Receipt className="h-4 w-4 mr-2" />
                              Create PO
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Create Purchase Order for {vendor.companyName}</DialogTitle>
                            </DialogHeader>
                            <PurchaseOrderForm 
                              selectedVendorId={vendor.id}
                              onClose={() => {}} 
                            />
                          </DialogContent>
                        </Dialog>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="flex-1">
                              <Eye className="h-4 w-4 mr-2" />
                              View POs
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-6xl max-h-[90vh]">
                            <DialogHeader>
                              <DialogTitle>Purchase Orders for {vendor.companyName}</DialogTitle>
                            </DialogHeader>
                            <PurchaseOrderList 
                              vendorId={vendor.id}
                              vendorName={vendor.companyName}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Purchase Order Results */}
            {filteredPOs.length > 0 && (
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Purchase Orders ({filteredPOs.length})
                </h3>
                <div className="grid gap-3">
                  {filteredPOs.map((po: any) => (
                    <div key={po.id} className="p-4 border rounded-lg bg-white">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{po.poNumber}</h4>
                          <div className="text-sm text-muted-foreground">
                            Vendor: {po.vendorName}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={po.status === 'pending' ? 'secondary' : 'outline'}>
                            {po.status || 'Pending'}
                          </Badge>
                          <div className="text-right text-sm">
                            <div className="font-medium">${po.totalAmount?.toFixed(2) || '0.00'}</div>
                            <div className="text-muted-foreground">
                              {po.createdAt ? new Date(po.createdAt).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Show matching items */}
                      {po.items && po.items.length > 0 && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <div className="font-medium mb-1">Items:</div>
                          {po.items
                            .filter((item: any) => 
                              !searchTerm || item.description?.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((item: any, index: number) => (
                              <div key={index} className="flex justify-between">
                                <span>{item.description}</span>
                                <span>Qty: {item.quantity} × ${item.unitPrice?.toFixed(2)} = ${item.total?.toFixed(2)}</span>
                              </div>
                            ))
                          }
                        </div>
                      )}
                      
                      <div className="flex gap-2 mt-3">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" data-testid={`button-view-po-${po.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Purchase Order Details - {po.poNumber}</DialogTitle>
                            </DialogHeader>
                            <PurchaseOrderDetails po={po} />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {filteredVendors.length === 0 && filteredPOs.length === 0 && (
              <div className="text-center py-8 text-neutral-500">
                <Search size={48} className="mx-auto mb-4 text-neutral-300" />
                <p className="mb-2">No results found</p>
                <p className="text-sm">
                  Try searching for vendor names, contact information, PO numbers, or item descriptions
                </p>
              </div>
            )}
          </div>
        )}

        {/* Instructions when no search term */}
        {!searchTerm && (
          <div className="text-center py-8 text-neutral-500">
            <Search size={48} className="mx-auto mb-4 text-neutral-300" />
            <p className="mb-2">Search for vendors and purchase orders</p>
            <p className="text-sm">
              Enter vendor names, contact info, PO numbers, or item descriptions to find what you're looking for
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Reuse the PurchaseOrderDetails component from purchase-order-list
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