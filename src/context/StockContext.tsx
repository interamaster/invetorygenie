
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { compressImage } from "../utils/imageCompression";
import { Category, StockItem } from "../types/supabase";

export type { Category, StockItem };

type StockContextType = {
  items: StockItem[];
  categories: Category[];
  addItem: (item: Omit<StockItem, "id" | "created_at" | "updated_at" | "user_id">) => Promise<void>;
  updateItem: (id: string, updates: Partial<Omit<StockItem, "id" | "created_at" | "updated_at" | "user_id">>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  selectedCategory: string | null;
  setSelectedCategory: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredItems: StockItem[];
  isSyncing: boolean;
};

const StockContext = createContext<StockContextType | undefined>(undefined);

export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error("useStock must be used within a StockProvider");
  }
  return context;
};

// Local storage keys
const LOCAL_STORAGE_KEYS = {
  CATEGORIES: "inventory_categories",
  ITEMS: "inventory_items",
};

export const StockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<StockItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  // Add this constant inside the component
  const INITIAL_CATEGORIES = [
    "CDAS",
    "DDAS",
    "MESA",
    "GRADS",
    "RF",
    "HFO",
    "ANTENAS 1.5T",
    "ANTENAS 3T",
    "CABLES 1.5T",
    "CABLES 3T"
  ];

  // Add this function inside the component
  const createInitialCategories = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setIsSyncing(true);
      const { data: existingCategories } = await supabase
        .from("categories")
        .select("id")
        .limit(1);

      if (!existingCategories?.length) {
        const categoriesData = INITIAL_CATEGORIES.map(name => ({
          name,
          user_id: user.id
        }));

        const { data, error } = await supabase
          .from("categories")
          .insert(categoriesData)
          .select();

        if (error) throw error;
        setCategories(data || []);
        toast.success("Initial categories created successfully");
      }
    } catch (error: any) {
      console.error("Error creating initial categories:", error);
      toast.error("Failed to create initial categories");
    } finally {
      setIsSyncing(false);
    }
  };

  // Modify the existing useEffect to include createInitialCategories
  useEffect(() => {
    if (isAuthenticated) {
      getFromLocalStorage();
      fetchCategories();
      fetchItems();
      createInitialCategories(); // Add this line
    } else {
      setItems([]);
      setCategories([]);
    }
  }, [isAuthenticated]);

  // Function to save data to localStorage for offline access
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      localStorage.setItem(LOCAL_STORAGE_KEYS.ITEMS, JSON.stringify(items));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  // Get data from localStorage if available
  const getFromLocalStorage = () => {
    try {
      const storedCategories = localStorage.getItem(LOCAL_STORAGE_KEYS.CATEGORIES);
      const storedItems = localStorage.getItem(LOCAL_STORAGE_KEYS.ITEMS);
      
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      }
      
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error("Error getting from localStorage:", error);
    }
  };

  // Fetch categories and items when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Always try to load from localStorage first for instant UI
      getFromLocalStorage();
      
      // Then fetch from database
      fetchCategories();
      fetchItems();
    } else {
      // Clear data when not authenticated
      setItems([]);
      setCategories([]);
    }
  }, [isAuthenticated]);

  // Save to localStorage whenever items or categories change
  useEffect(() => {
    if (items.length > 0 || categories.length > 0) {
      saveToLocalStorage();
    }
  }, [items, categories]);

  // Fetch categories from Supabase - no user_id filter to get all categories
  const fetchCategories = async () => {
    try {
      setIsSyncing(true);
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) {
        throw error;
      }

      setCategories(data || []);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setIsSyncing(false);
    }
  };

  // Fetch items from Supabase - no user_id filter to get all items
  const fetchItems = async () => {
    try {
      setIsSyncing(true);
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Parse photos from JSONB to array
      const parsedItems = data?.map(item => ({
        ...item,
        photos: item.photos as unknown as string[]
      })) || [];

      setItems(parsedItems);
    } catch (error: any) {
      console.error("Error fetching items:", error);
      toast.error("Failed to load items");
    } finally {
      setIsSyncing(false);
    }
  };

  // Add a new category to Supabase
  const addCategory = async (name: string) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to add categories");
      return;
    }

    try {
      setIsSyncing(true);
      
      // Check if category already exists by name (case insensitive)
      if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        toast.error("Category already exists");
        return;
      }
      
      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: name.trim(),
         user_id: user.id
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setCategories(prev => [...prev, data]);
      toast.success("Category added successfully");
    } catch (error: any) {
      console.error("Error adding category:", error);
      toast.error(error.message || "Failed to add category");
    } finally {
      setIsSyncing(false);
    }
  };

  // Delete a category from Supabase
  const deleteCategory = async (id: string) => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to delete categories");
      return;
    }
  
    // Get items count for this category
    const categoryItems = items.filter(item => item.category_id === id);
    const itemsCount = categoryItems.length;
  
    // Show confirmation dialog
    if (!window.confirm(
      `Are you sure you want to delete this category?\n\n${
        itemsCount > 0 
          ? `This will also delete ${itemsCount} item${itemsCount === 1 ? '' : 's'} in this category.`
          : 'This category is empty.'
      }`
    )) {
      return;
    }
  
    try {
      setIsSyncing(true);
      
      // First delete all items in this category
      if (itemsCount > 0) {
        const { error: itemsError } = await supabase
          .from('items')
          .delete()
          .eq('category_id', id);
  
        if (itemsError) throw itemsError;
      }
      
      // Then delete the category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
  
      if (error) throw error;
  
      // Update local state
      setItems(prevItems => prevItems.filter(item => item.category_id !== id));
      setCategories(prev => prev.filter(cat => cat.id !== id));
      
      // If the deleted category was selected, reset selection
      if (selectedCategory === id) {
        setSelectedCategory(null);
      }
      
      toast.success(`Category and ${itemsCount} item${itemsCount === 1 ? '' : 's'} deleted successfully`);
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast.error(error.message || "Failed to delete category");
    } finally {
      setIsSyncing(false);
    }
  };

  // Add a new item to Supabase
  const addItem = async (newItem: Omit<StockItem, "id" | "created_at" | "updated_at" | "user_id">) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to add items");
      return;
    }

    try {
      setIsSyncing(true);
      
      // Process images
      const processedPhotos: string[] = [];
      
      for (const photoUrl of newItem.photos) {
        try {
          const compressedImage = await compressImage(photoUrl);
          processedPhotos.push(compressedImage);
        } catch (error) {
          console.error("Failed to process image:", error);
          // Add original if compression fails
          processedPhotos.push(photoUrl);
        }
      }
      
      const { data, error } = await supabase
        .from("items")
        .insert({
          name: newItem.name,
          description: newItem.description,
          category_id: newItem.category_id,
          photos: processedPhotos,
          user_id: user.id  // Keep this to track who created the item
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const newItemWithParsedPhotos = {
        ...data,
        photos: data.photos as unknown as string[]
      };

      setItems(prevItems => [newItemWithParsedPhotos, ...prevItems]);
      toast.success("Item added successfully");
    } catch (error: any) {
      console.error("Error adding item:", error);
      toast.error(error.message || "Failed to add item");
    } finally {
      setIsSyncing(false);
    }
  };

  // Update an existing item in Supabase
  const updateItem = async (id: string, updates: Partial<Omit<StockItem, "id" | "created_at" | "updated_at" | "user_id">>) => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to update items");
      return;
    }

    try {
      setIsSyncing(true);
      
      // Process new images if any
      let processedPhotos: string[] | undefined;
      
      if (updates.photos) {
        processedPhotos = [];
        for (const photoUrl of updates.photos) {
          try {
            // Only compress new images (not already compressed)
            if (photoUrl.startsWith("data:image")) {
              const compressedImage = await compressImage(photoUrl);
              processedPhotos.push(compressedImage);
            } else {
              processedPhotos.push(photoUrl);
            }
          } catch (error) {
            console.error("Failed to process image:", error);
            processedPhotos.push(photoUrl);
          }
        }
      }
      
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      if (processedPhotos) {
        updateData.photos = processedPhotos;
      }
      
      const { data, error } = await supabase
        .from("items")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const updatedItemWithParsedPhotos = {
        ...data,
        photos: data.photos as unknown as string[]
      };

      setItems(prevItems => 
        prevItems.map(item => 
          item.id === id ? updatedItemWithParsedPhotos : item
        )
      );
      
      toast.success("Item updated successfully");
    } catch (error: any) {
      console.error("Error updating item:", error);
      toast.error(error.message || "Failed to update item");
    } finally {
      setIsSyncing(false);
    }
  };

  // Delete an item from Supabase
  const deleteItem = async (id: string) => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to delete items");
      return;
    }

    try {
      setIsSyncing(true);
      
      const { error } = await supabase
        .from("items")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }
      
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      toast.success("Item deleted successfully");
    } catch (error: any) {
      console.error("Error deleting item:", error);
      toast.error(error.message || "Failed to delete item");
    } finally {
      setIsSyncing(false);
    }
  };

  // Filter items based on search query and selected category
  const filteredItems = items.filter(item => {
    const matchesSearch = searchQuery === "" || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = selectedCategory === null || item.category_id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <StockContext.Provider 
      value={{
        items,
        categories,
        addItem,
        updateItem,
        deleteItem,
        addCategory,
        deleteCategory,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        filteredItems,
        isSyncing
      }}
    >
      {children}
    </StockContext.Provider>
  );
};

