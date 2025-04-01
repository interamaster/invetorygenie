
import React, { useState } from "react";
import { X, Upload, Loader2, Image } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStock } from "../context/StockContext";
import { fileToDataUrl } from "../utils/imageCompression";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose }) => {
  const { categories, addItem } = useStock();
  const isMobile = useIsMobile();
  
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Item name"
              disabled={isLoading}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-destructive text-sm">{errors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={category_id}
              onValueChange={setCategoryId}
              disabled={isLoading}
            >
              <SelectTrigger className={errors.category_id ? "border-destructive" : ""}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent position={isMobile ? "popper" : "item-aligned"} className="max-h-[40vh]">
                <ScrollArea className="h-[40vh] md:h-[300px]">
                  {categories.map((category) => (
                    <SelectItem 
                      key={category.id} 
                      value={category.id}
                      className="py-3"
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-destructive text-sm">{errors.category_id}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Item description"
              disabled={isLoading}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Photos</Label>
            
            <div className="grid grid-cols-4 gap-2">
              {photos.map((photo, index) => (
                <div 
                  key={index}
                  className="aspect-square rounded-md overflow-hidden relative group"
                >
                  <img 
                    src={photo} 
                    alt={`Uploaded ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 bg-black/50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
              
              <label className="aspect-square rounded-md border-2 border-dashed border-muted flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors">
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
                    <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Upload</span>
                  </>
                )}
              </label>
            </div>
            
            {photos.length === 0 && (
              <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-md">
                <Image className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center">
                  No photos added yet. Photos will be compressed to reduce storage usage.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemModal;
