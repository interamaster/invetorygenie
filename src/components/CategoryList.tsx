
import React from "react";
import { useStock } from "../context/StockContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Package, Box, Server, Database, Monitor, Cpu, Radio, Cable, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCard from "./StatsCard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CategoryListProps {
  onSelectCategory?: (categoryId: string | null) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ onSelectCategory }) => {
  const { categories, selectedCategory, setSelectedCategory, items, deleteCategory } = useStock();

  // Count items per category
  const categoryCounts = categories.reduce<Record<string, number>>((acc, category) => {
    acc[category.id] = items.filter(item => item.category_id === category.id).length;
    return acc;
  }, {});
  
  // Total count for "All" category
  const totalCount = items.length;

  const handleCategoryClick = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    if (onSelectCategory) {
      onSelectCategory(categoryId);
    }
  };

  const handleDeleteCategory = (e: React.MouseEvent, categoryId: string) => {
    e.stopPropagation();
    
    // Find the category name
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      if (categoryCounts[categoryId] > 0) {
        if (window.confirm(`This will delete all ${categoryCounts[categoryId]} items in "${category.name}". Are you sure?`)) {
          deleteCategory(categoryId);
        }
      } else {
        deleteCategory(categoryId);
      }
    }
  };

  // Map category names to icons
  const getCategoryIcon = (name: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      "CDAS": <Cpu className="h-10 w-10" />,
      "DDAS": <Server className="h-10 w-10" />,
      "MESA": <Monitor className="h-10 w-10" />,
      "GRADS": <Database className="h-10 w-10" />,
      "RF": <Radio className="h-10 w-10" />,
      "HFO": <Box className="h-10 w-10" />,
      "ANTENAS 1.5T": <Wifi className="h-10 w-10" />,
      "ANTENAS 3T": <Wifi className="h-10 w-10" />,
      "CABLES 1.5T": <Cable className="h-10 w-10" />,
      "CABLES 3T": <Cable className="h-10 w-10" />
    };
    
    return iconMap[name] || <Package className="h-10 w-10" />;
  };

  return (
    <div className="h-full w-full">
      <div className="p-2">
        {/* Stats Card */}
        <StatsCard 
          title="Inventory Stats" 
          backgroundColor="rgba(255, 133, 85, 0.9)" 
        />
      
        {/* All Categories Button */}
        <button
          onClick={() => handleCategoryClick(null)}
          className={`w-full mb-4 flex flex-col items-center justify-center p-4 rounded-md text-sm transition-colors aspect-square ${
            selectedCategory === null
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          <Package className="h-10 w-10 mb-2" />
          <span className="font-medium text-base">All Categories</span>
          <span className={`mt-1 text-xs font-medium rounded-full px-2 py-0.5 ${
            selectedCategory === null 
              ? "bg-primary-foreground/20 text-primary-foreground" 
              : "bg-muted-foreground/20 text-muted-foreground"
          }`}>
            {totalCount}
          </span>
        </button>

        {/* Category Grid */}
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`relative flex flex-col items-center justify-center p-4 rounded-md text-sm transition-colors aspect-square ${
                selectedCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              <button
                className="flex-1 flex flex-col items-center justify-center w-full h-full"
                onClick={() => handleCategoryClick(category.id)}
              >
                {getCategoryIcon(category.name)}
                <span className="font-medium text-base mt-2 text-center line-clamp-2">{category.name}</span>
                {categoryCounts[category.id] > 0 && (
                  <span 
                    className={`mt-1 text-xs font-medium rounded-full px-2 py-0.5 ${
                      selectedCategory === category.id 
                        ? "bg-primary-foreground/20 text-primary-foreground" 
                        : "bg-muted-foreground/20 text-muted-foreground"
                    }`}
                  >
                    {categoryCounts[category.id]}
                  </span>
                )}
              </button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`absolute top-1 right-1 h-7 w-7 ${
                        selectedCategory === category.id 
                          ? "text-primary-foreground hover:bg-primary-foreground/20" 
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                      onClick={(e) => handleDeleteCategory(e, category.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete category</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryList;
