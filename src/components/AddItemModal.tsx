
import React, { useState } from "react";
import { X, Upload, Loader2, Image } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStock } from "../context/StockContext";
import { fileToDataUrl } from "../utils/imageCompression";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose }) => {
  const { categories, addItem } = useStock();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category_id, setCategoryId] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const resetForm = () => {
    setName("");
    setDescription("");
    setCategoryId("");
    setPhotos([]);
    setErrors({});
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!category_id) {
      newErrors.category_id = "Category is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      
      setIsLoading(true);
      
      const newPhotos: string[] = [...photos];
      
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        
        // Check file type
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image`);
          continue;
        }
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }
        
        const dataUrl = await fileToDataUrl(file);
        newPhotos.push(dataUrl);
      }
      
      setPhotos(newPhotos);
    } catch (error) {
      console.error("Error uploading photos:", error);
      toast.error("Failed to upload photos");
    } finally {
      setIsLoading(false);
    }
  };
  
  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async () => {
    try {
      if (!validate()) return;
      
      setIsLoading(true);
      
      await addItem({
        name,
        description,
        category_id,
        photos,
      });
      
      handleClose();
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Failed to add item");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Item</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Item name"
              disabled={isLoading}
              className={cn(
                "transition-all duration-200 focus:ring-offset-0",
                errors.name ? "border-destructive" : ""
              )}
            />
            {errors.name && (
              <p className="text-destructive text-sm mt-1">{errors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">Category</Label>
            <Select
              value={category_id}
              onValueChange={setCategoryId}
              disabled={isLoading}
            >
              <SelectTrigger className={cn(
                "transition-all duration-200",
                errors.category_id ? "border-destructive" : ""
              )}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="h-[200px]">
                <ScrollArea className="h-full">
                  <div className="p-2 space-y-1">
                    {categories.map((category) => (
                      <SelectItem 
                        key={category.id} 
                        value={category.id}
                        className="rounded-md px-2 py-2.5 hover:bg-accent/50 cursor-pointer transition-colors"
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </div>
                </ScrollArea>
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-destructive text-sm mt-1">{errors.category_id}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Item description"
              disabled={isLoading}
              className="min-h-[100px] transition-all duration-200 focus:ring-offset-0"
            />
          </div>
          
          <div className="space-y-3">
            <Label className="text-sm font-medium">Photos</Label>
            
            <div className="grid grid-cols-4 gap-3">
              {photos.map((photo, index) => (
                <div 
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden relative group ring-1 ring-border/50"
                >
                  <img 
                    src={photo} 
                    alt={`Uploaded ${index + 1}`} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/80"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
              
              <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors bg-muted/50 hover:bg-muted/80">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  disabled={isLoading}
                  className="hidden"
                />
                {isLoading ? (
                  <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground font-medium">Upload</span>
                  </>
                )}
              </label>
            </div>
            
            {photos.length === 0 && (
              <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg border border-border/50">
                <Image className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground text-center">
                  No photos added yet. Photos will be compressed to reduce storage usage.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={handleClose} 
            disabled={isLoading}
            className="transition-colors"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="min-w-[100px] transition-colors"
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemModal;
