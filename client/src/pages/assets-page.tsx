import React from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { PlusCircle, Loader2, Wallet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { AssetList } from "@/components/assets/asset-list";

export default function AssetsPage() {
  const [, navigate] = useLocation();
  const [assetType, setAssetType] = React.useState("bank");
  
  const { data: assets, isLoading, error } = useQuery({
    queryKey: ["/api/assets"],
  });

  if (isLoading) {
    return (
      <MainLayout title="Asset Management">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Asset Management">
        <div className="text-center py-10">
          <p className="text-destructive">Failed to load assets. Please try again later.</p>
        </div>
      </MainLayout>
    );
  }

  const bankAssets = assets.filter(asset => asset.type === 'bank');
  const nonBankAssets = assets.filter(asset => asset.type === 'non-bank');

  return (
    <MainLayout title="Asset Management">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            onClick={() => navigate("/assets/new")}
            className="flex items-center"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Asset
          </Button>
        </div>

        <Tabs defaultValue="bank" value={assetType} onValueChange={setAssetType} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="bank">Bank Assets</TabsTrigger>
            <TabsTrigger value="non-bank">Non-Bank Assets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bank">
            {bankAssets.length === 0 ? (
              <Card className="p-6">
                <div className="text-center py-12">
                  <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No bank assets yet</h3>
                  <p className="text-muted-foreground mt-2 mb-4">
                    Add your bank accounts, deposits, and investments to track your assets.
                  </p>
                  <Button
                    onClick={() => navigate("/assets/new")}
                    className="flex items-center mx-auto"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Bank Asset
                  </Button>
                </div>
              </Card>
            ) : (
              <AssetList assets={bankAssets} type="bank" />
            )}
          </TabsContent>
          
          <TabsContent value="non-bank">
            {nonBankAssets.length === 0 ? (
              <Card className="p-6">
                <div className="text-center py-12">
                  <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No non-bank assets yet</h3>
                  <p className="text-muted-foreground mt-2 mb-4">
                    Add your cash, crypto, physical gold, and other non-bank assets.
                  </p>
                  <Button
                    onClick={() => navigate("/assets/new")}
                    className="flex items-center mx-auto"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Non-Bank Asset
                  </Button>
                </div>
              </Card>
            ) : (
              <AssetList assets={nonBankAssets} type="non-bank" />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
