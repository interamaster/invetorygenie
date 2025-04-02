
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Menu, X, PlusCircle, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useStock } from "../context/StockContext";
import { toast } from "sonner";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { addCategory, categories, deleteCategory } = useStock();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string, name: string } | null>(null);

  const handleLogout = async () => {
    await signOut();
  };

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      await addCategory(newCategoryName);
      setNewCategoryName("");
      setAddCategoryDialogOpen(false);
    } else {
      toast.error("Category name cannot be empty");
    }
  };

  const openDeleteConfirmation = (id: string, name: string) => {
    setCategoryToDelete({ id, name });
    setConfirmDeleteDialogOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (categoryToDelete) {
      await deleteCategory(categoryToDelete.id);
      setConfirmDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600 shadow-sm glass-morphism">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a href="/" className="flex items-center space-x-3">
          <span className="self-center text-xl font-semibold whitespace-nowrap">
            ALMACEN SEVILLA (C)JRDV 2025
          </span>
        </a>

        <div className="flex md:order-2 space-x-3">
          {user ? (
            <>
              <Button
                variant="outline"
                className="hidden md:flex items-center gap-2"
                onClick={() => setAddCategoryDialogOpen(true)}
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Category</span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="hidden md:flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{user.email?.split('@')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </>
          ) : (
            <Button 
              variant="default" 
              onClick={() => navigate("/login")}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Login
            </Button>
          )}
        </div>

        {/* Mobile menu */}
        <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} w-full md:hidden flex-col items-center justify-center py-2 animate-in slide-in`}>
          {user && (
            <>
              <Button
                variant="ghost"
                className="w-full justify-start py-2 my-1"
                onClick={() => setAddCategoryDialogOpen(true)}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                <span>Add Category</span>
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start py-2 my-1"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Logout</span>
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Add Category Dialog */}
      <Dialog open={addCategoryDialogOpen} onOpenChange={setAddCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new category to organize your stock items.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category name"
              className="w-full"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Categories Dialog */}
      <Dialog open={confirmDeleteDialogOpen} onOpenChange={setConfirmDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the category "{categoryToDelete?.name}"? 
              This will also delete all items in this category.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default Navbar;
