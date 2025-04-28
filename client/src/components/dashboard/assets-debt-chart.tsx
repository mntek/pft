import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { calculatePercentage } from "@/lib/utils";

interface AssetsDebtChartProps {
  totalAssets: number;
  totalDebt: number;
}

export function AssetsDebtChart({ totalAssets, totalDebt }: AssetsDebtChartProps) {
  const assetsPercentage = calculatePercentage(totalAssets, totalAssets + totalDebt);
  const debtPercentage = calculatePercentage(totalDebt, totalAssets + totalDebt);
  
  const data = [
    { name: `Assets (${assetsPercentage}%)`, value: totalAssets },
    { name: `Debt (${debtPercentage}%)`, value: totalDebt },
  ];
  
  const COLORS = ['#10b981', '#f43f5e'];
  
  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium mb-4">Assets vs Debt</h3>
      <CardContent className="p-0">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                innerRadius={40}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
