
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { useStock } from "../context/StockContext";

interface StatsCardProps {
  title: string;
  backgroundColor: string;
  textColor?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  backgroundColor, 
  textColor = "text-white" 
}) => {
  const { items, categories } = useStock();
  
  // Count items per category for the chart data
  const chartData = categories.map(category => {
    const count = items.filter(item => item.category_id === category.id).length;
    return {
      name: category.name,
      value: count,
    };
  }).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5 categories by item count
  
  // Total number of items
  const totalItems = items.length;
  
  // Calculate in-stock and out-of-stock (simplified version)
  const inStock = totalItems;
  
  // Generate colors for bars
  const getBarColor = (index: number) => {
    const colors = ['#FFD166', '#06D6A0', '#118AB2', '#073B4C', '#EF476F'];
    return colors[index % colors.length];
  };

  return (
    <Card 
      className={`w-full overflow-hidden mb-4 ${textColor}`}
      style={{ backgroundColor }}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="text-4xl font-bold">{totalItems}</div>
        </div>
        
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-white mr-2"></div>
            <span className="text-sm">In stock: {inStock}</span>
          </div>
          
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-white/60 mr-2"></div>
            <span className="text-sm">Categories: {categories.length}</span>
          </div>
        </div>
    

    
        {chartData.length > 0 && (
          <div className="h-12 mt-">   
            <ChartContainer config={{}} className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 0, right: 0, left: 0, bottom: -35 }}
                  barSize={120}
                >
                  <XAxis 
                    dataKey="name" 
                    tick={false}
                    axisLine={false}
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ 
                      backgroundColor: backgroundColor, 
                      border: 'none',
                      borderRadius: '4px',
                      color: textColor
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[4, 4, 0, 0]}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;

