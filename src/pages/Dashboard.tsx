
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus, WifiOff, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import { useStock } from "../context/StockContext";
import Navbar from "../components/Navbar";
import CategoryList from "../components/CategoryList";
import SearchBar from "../components/SearchBar";
import ItemCard from "../components/ItemCard";
import AddItemModal from "../components/AddItemModal";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSwipeGesture } from "@/hooks/use-swipe-gesture";

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, loading, signOut } = useAuth();
  const { filteredItems, isSyncing, selectedCategory, setSelectedCategory, categories, addCategory } = useStock();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showItemsScreen, setShowItemsScreen] = useState(false);
  const [swipeTransition, setSwipeTransition] = useState(0); // State for swipe transition (0-1)
  const [isSwipeComplete, setIsSwipeComplete] = useState(false); // Track if swipe is complete
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  
  const contentRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  
  const selectedCategoryName = selectedCategory ? 
    categories.find(cat => cat.id === selectedCategory)?.name || "Category" : 
    "All Categories";
  
  // Control the animation duration
  const swipeAnimationDuration = 1; // Slower animation (500ms)
  
  const { animationDuration } = useSwipeGesture(contentRef, {
    onSwipeRight: () => {
      if (isMobile && showItemsScreen) {
        setIsSwipeComplete(true); // Mark swipe as complete
        handleBackToCategories();
      }
    },
    onSwipeMove: (progress) => {
      if (isMobile && showItemsScreen) {
        setSwipeTransition(progress);
      }
    },
    onSwipeCancel: () => {
      setSwipeTransition(0);
    },
    disabled: !showItemsScreen,
    edgeSize: 40, // 40px from the left edge
    animationDuration: swipeAnimationDuration
  });
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("You are back online");
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast("You are offline", {
        description: "Changes will be synced when you're online again",
        icon: <WifiOff className="h-4 w-4" />,
      });
    };
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isMobile && selectedCategory !== null) {
      setShowItemsScreen(true);
    }
  }, [selectedCategory, isMobile]);
  
  useEffect(() => {
    // Reset transition when screen changes
    if (!showItemsScreen) {
      setSwipeTransition(0);
      setIsSwipeComplete(false);
    }
  }, [showItemsScreen]);
  
  const handleBackToCategories = () => {
    setShowItemsScreen(false);
  };
  
  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    if (isMobile) {
      setShowItemsScreen(true);
    }
  };

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      await addCategory(newCategoryName);
      setNewCategoryName("");
      setShowAddCategoryDialog(false);
    } else {
      toast.error("Category name cannot be empty");
    }
  };

  const handleLogout = async () => {
    await signOut();
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }
  
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Navbar only visible on non-mobile */}
        <div className="hidden md:block">
          <Navbar />
        </div>
        
        <div className="relative flex-1 overflow-hidden">
          {/* Categories Screen (underneath) */}
          <div 
            ref={categoriesRef}
            className={`absolute inset-0 z-0 pt-4 pb-6 px-4 container mx-auto ${swipeTransition > 0 ? 'visible' : 'invisible'}`}
            style={{
              transform: `translateX(${-30 + (swipeTransition * 30)}%)`,
              opacity: swipeTransition * 0.9 + 0.1,
              transition: isSwipeComplete ? 'none' : undefined
            }}
          >
            <div className="flex flex-col h-[calc(100vh-160px)]">
              <div className="flex items-center justify-between mb-6 mt-6">
                <h1 className="text-2xl font-bold">Categories</h1>
                
                <div className="flex items-center gap-2">
                  {!isOnline && (
                    <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 py-1 px-3 rounded-full text-xs">
                      <WifiOff className="h-3 w-3" />
                      <span>Offline</span>
                    </div>
                  )}
                  
                  {isSyncing && (
                    <div className="flex items-center gap-2 bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-xs">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Syncing</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setShowAddCategoryDialog(true)}
                      variant="default"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      <span>Add</span>
                    </Button>
                    
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden rounded-lg border bg-muted/30">
                <ScrollArea className="h-full">
                  <div className="p-4 h-full">
                    <CategoryList onSelectCategory={handleCategorySelect} />
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
          
          {/* Items Screen (top layer) */}
          <div 
            ref={contentRef}
            className="absolute inset-0 z-10 pt-4 pb-6 px-4 container mx-auto"
            style={{
              transform: isSwipeComplete ? 'translateX(100%)' : `translateX(${swipeTransition * 100}%)`,
              transition: swipeTransition === 0 && !isSwipeComplete 
                ? `transform ${swipeAnimationDuration}ms ease-out` 
                : 'none',
              boxShadow: swipeTransition > 0 ? `-5px 0 15px rgba(0, 0, 0, ${swipeTransition * 0.1})` : 'none',
            }}
          >
            {!showItemsScreen ? (
              <div className="flex flex-col h-[calc(100vh-105px)]">
                <div className="flex items-center justify-between mb-6 mt-6">
                  <h1 className="text-2xl font-bold">Categories</h1>
                  
                  <div className="flex items-center gap-2">
                    {!isOnline && (
                      <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 py-1 px-3 rounded-full text-xs">
                        <WifiOff className="h-3 w-3" />
                        <span>Offline</span>
                      </div>
                    )}
                    
                    {isSyncing && (
                      <div className="flex items-center gap-2 bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-xs">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Syncing</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setShowAddCategoryDialog(true)}
                        variant="default"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        <span>Add</span>
                      </Button>
                      
                      <Button
                        onClick={handleLogout}
                        variant="outline"
                        size="icon"
                        className="rounded-full"
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-hidden rounded-lg border bg-muted/30">
                  <ScrollArea className="h-full"> 
                    <div className="p-4 h-full">
                      <CategoryList onSelectCategory={handleCategorySelect} />
                    </div>
                  </ScrollArea>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-[calc(100vh-105px)] bg-background">
                <div className="flex items-center justify-between mb-6 mt-6">
                  <Button 
                    variant="ghost" 
                    onClick={handleBackToCategories}
                    className="mr-2 flex items-center gap-2 px-3 -ml-3"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="font-semibold">{selectedCategoryName}</span>
                  </Button>
                  
                  <Button
                    onClick={() => setShowAddModal(true)}
                    size="icon"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="mb-4">
                  <SearchBar />
                </div>
                
                <div className="flex-1 overflow-hidden rounded-lg border">
                  <ScrollArea className="h-full">
                    <div className="p-4">
                      {filteredItems.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-8">
                          <div className="text-center">
                            <h3 className="text-lg font-medium">No items found</h3>
                            <p className="text-sm mt-1">
                              Add your first item to get started
                            </p>
                            <Button
                              variant="outline"
                              className="mt-4"
                              onClick={() => setShowAddModal(true)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Item
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <div className="grid grid-cols-1 gap-4">
                            {filteredItems.map((item) => (
                              <ItemCard key={item.id} item={item} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <AddItemModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
        
        {/* Add Category Dialog */}
        <div className={`fixed inset-0 z-50 bg-black/50 flex items-center justify-center transition-opacity ${
          showAddCategoryDialog ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <div className="bg-background rounded-3xl w-[90%] max-w-md p-8 shadow-lg relative">
            {/* Close button */}
            <button 
              onClick={() => setShowAddCategoryDialog(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="text-2xl mb-2">🔥🔥🔥</div>
              <h3 className="text-xl font-semibold mb-2">NEW CATEGORY</h3>
              <p className="text-muted-foreground text-sm">
                Create a new category to organize your stock items and keep track of your inventory.
              </p>
            </div>

            <input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category name"
              className="w-full border border-input rounded-lg px-4 py-3 mb-6"
            />

            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleAddCategory}
                className="w-full py-6 text-base font-semibold rounded-xl"
              >
                OK
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddCategoryDialog(false)}
                className="w-full py-6 text-base font-semibold rounded-xl"
              >
                NOOOOLLL!!!
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Desktop view
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto pt-16 pb-6 px-4">
        <div className="flex items-center justify-between mb-6 mt-6">
          <h1 className="text-2xl font-bold">Inventory</h1>
          
          <div className="flex items-center gap-2">
            {!isOnline && (
              <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 py-1 px-3 rounded-full text-xs">
                <WifiOff className="h-3 w-3" />
                <span>Offline</span>
              </div>
            )}
            
            {isSyncing && (
              <div className="flex items-center gap-2 bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-xs">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Syncing</span>
              </div>
            )}
            
            <Button
              onClick={() => setShowAddModal(true)}
              className="ml-auto flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Item</span>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 min-h-[calc(100vh-160px)]">
          <div className="bg-muted/30 rounded-lg border h-[calc(100vh-160px)]">
            <ScrollArea className="h-full">
              <div className="p-4">
                <CategoryList onSelectCategory={handleCategorySelect} />
              </div>
            </ScrollArea>
          </div>
          
          <div className="bg-background rounded-lg border p-4 flex flex-col">
            <div className="mb-4">
              <SearchBar />
            </div>
            
            {filteredItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <h3 className="text-lg font-medium">No items found</h3>
                  <p className="text-sm mt-1">
                    {filteredItems.length === 0
                      ? "Add your first item to get started"
                      : "Try adjusting your search or filter"}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setShowAddModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <AddItemModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
};

export default Dashboard;
