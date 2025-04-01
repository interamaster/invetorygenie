
import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useStock } from "../context/StockContext";

const SearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery } = useStock();

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <Input
        type="search"
        placeholder="Search items..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 pr-10 w-full"
      />
      
      {searchQuery && (
        <button
          className="absolute inset-y-0 right-0 flex items-center pr-3"
          onClick={() => setSearchQuery("")}
        >
          <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
