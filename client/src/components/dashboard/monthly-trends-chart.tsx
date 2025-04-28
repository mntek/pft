import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface MonthlyTrendsChartProps {
  data?: { month: string; amount: number; isProjected?: boolean }[];
}

export function MonthlyTrendsChart({ data }: MonthlyTrendsChartProps) {
  // Generate sample data if not provided
  const chartData = data || generateSampleData();
  
  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium mb-4">Monthly Trends</h3>
      <CardContent className="p-0">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="month" />
              <YAxis hide />
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Bar 
                dataKey="amount" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
                fillOpacity={(entry) => entry.isProjected ? 0.5 : 1}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function generateSampleData() {
  const currentMonth = new Date().getMonth();
  const monthsToShow = 6;
  
  const data = [];
  for (let i = 0; i < monthsToShow; i++) {
    const monthIndex = (currentMonth - (monthsToShow - 1) + i + 12) % 12;
    data.push({
      month: MONTHS[monthIndex],
      amount: 0,
      isProjected: i >= monthsToShow - 2 // Last two months are projected
    });
  }
  
  return data;
}
