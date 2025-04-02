
import React, { useState, useEffect } from "react";
import { X, Upload, Loader2, Image } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStock, StockItem } from "../context/StockContext";
import { fileToDataUrl } from "../utils/imageCompression";
import { toast } from "sonner";

interface EditItemModalProps {
  item: StockItem;
  isOpen: boolean;
  onClose: () => void;
}

const EditItemModal: React.FC<EditItemModalProps> = ({ item, isOpen, onClose }) => {
  const { categories, updateItem } = useStock();
  
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description);
  const [category_id, setCategoryId] = useState(item.category_id);
  const [photos, setPhotos] = useState<string[]>([...item.photos]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Reset form when item changes
  useEffect(() => {
    if (isOpen) {
      setName(item.name);
      setDescription(item.description);
      setCategoryId(item.category_id);
      setPhotos([...item.photos]);
      setErrors({});
    }
  }, [item, isOpen]);
  
  const handleClose = () => {
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
      
      await updateItem(item.id, {
        name,
        description,
        category_id,
        photos,
      });
      
      handleClose();
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
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
            <Label htmlFor="edit-category">Category</Label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setCategoryId(category.id)}
                  className={`p-2 rounded-md transition-colors ${
                    category_id === category.id ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
                  } hover:bg-blue-500 active:bg-blue-700`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            {errors.category_id && (
              <p className="text-destructive text-sm">{errors.category_id}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
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
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemModal;
