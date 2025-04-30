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

  return (
    <Card className="p-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>{type === 'bank' ? 'Bank' : 'Location'}</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
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
                <TableCell className="text-right space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/assets/edit/${asset.id}`)}
                    title="Edit asset"
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setAssetToDelete(asset.id)}
                        title="Delete asset"
                      >
                        <Trash className="h-4 w-4 text-muted-foreground" />
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
