import React from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Asset } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Pencil, Trash } from "lucide-react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ASSET_COLORS: Record<string, string> = {
  "Checking": "#3b82f6", // blue
  "Savings": "#10b981", // green
  "Time Deposit": "#8b5cf6", // purple
  "Stocks": "#ef4444", // red
  "Cash": "#f59e0b", // yellow
  "Crypto": "#6366f1", // indigo
  "Physical Gold": "#f59e0b", // yellow
};

interface AssetListProps {
  assets: Asset[];
  type: 'bank' | 'non-bank';
}

export function AssetList({ assets, type }: AssetListProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [assetToDelete, setAssetToDelete] = React.useState<number | null>(null);
  const [sortConfig, setSortConfig] = React.useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);
  
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/assets/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Asset deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setAssetToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete asset: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (assetToDelete !== null) {
      deleteMutation.mutate(assetToDelete);
    }
  };
  
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedAssets = React.useMemo(() => {
    const sortableItems = [...assets];
    if (sortConfig !== null) {
      sortableItems.sort((a: any, b: any) => {
        // Handle special cases for different column types
        if (sortConfig.key === 'amount') {
          return sortConfig.direction === 'ascending' 
            ? Number(a.amount) - Number(b.amount)
            : Number(b.amount) - Number(a.amount);
        } else if (sortConfig.key === 'lastUpdated') {
          return sortConfig.direction === 'ascending' 
            ? new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()
            : new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        } else {
          // Default string comparison for other columns
          const aValue = a[sortConfig.key] || '';
          const bValue = b[sortConfig.key] || '';
          
          if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        }
      });
    }
    return sortableItems;
  }, [assets, sortConfig]);

  return (
    <Card className="p-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => requestSort('name')}
              >
                Name {sortConfig?.key === 'name' && (
                  <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => requestSort('institution')}
              >
                {type === 'bank' ? 'Bank' : 'Location'} {sortConfig?.key === 'institution' && (
                  <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => requestSort('assetType')}
              >
                Type {sortConfig?.key === 'assetType' && (
                  <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => requestSort('currency')}
              >
                Currency {sortConfig?.key === 'currency' && (
                  <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => requestSort('amount')}
              >
                Amount {sortConfig?.key === 'amount' && (
                  <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => requestSort('lastUpdated')}
              >
                Last Updated {sortConfig?.key === 'lastUpdated' && (
                  <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAssets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell>
                  <div className="flex items-center">
                    <div
                      className="flex-shrink-0 h-8 w-8 rounded flex items-center justify-center text-white"
                      style={{ backgroundColor: ASSET_COLORS[asset.assetType] || "#6b7280" }}
                    >
                      <span className="text-xs font-bold">
                        {asset.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{asset.name}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{asset.institution || "—"}</TableCell>
                <TableCell className="text-sm">{asset.assetType}</TableCell>
                <TableCell className="text-sm">{asset.currency}</TableCell>
                <TableCell className="font-mono text-green-500">
                  {formatCurrency(Number(asset.amount), asset.currency)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(asset.lastUpdated)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/assets/edit/${asset.id}`)}
                      className="flex items-center"
                    >
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAssetToDelete(asset.id)}
                          className="flex items-center text-destructive border-destructive hover:bg-destructive/10"
                        >
                          <Trash className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Asset</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this asset? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setAssetToDelete(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
