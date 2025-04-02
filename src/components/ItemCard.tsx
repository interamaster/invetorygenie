
import React, { useState } from "react";
import { format } from "date-fns";
import { Edit, Trash2, Image, Info } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStock } from "../context/StockContext";
import { StockItem } from "../types/supabase";
import EditItemModal from "./EditItemModal";

interface ItemCardProps {
  item: StockItem;
}

const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  const { deleteItem, categories } = useStock();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const category = categories.find((c) => c.id === item.category_id);
  
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      deleteItem(item.id);
    }
  };
  
  const formattedDate = format(new Date(item.updated_at), "MMM d, yyyy 'at' h:mm a");

  return (
    <>
      <Card className="w-full overflow-hidden hover:shadow-md transition-all duration-200 h-full flex flex-col">
        <CardContent className="p-0 flex-1 flex flex-col">
          <div className="p-6 pb-2 flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg leading-tight mb-1">{item.name}</h3>
                <div className="inline-block bg-primary/80 text-primary-foreground/90 text-xs px-2 py-1 rounded-sm mb-2">
                  {category?.name || "Uncategorized"}
                </div>
              </div>
            </div>
            
            <p className="text-muted-foreground text-sm line-clamp-3 mb-4">{item.description}</p>
            
            {item.photos.length > 0 && (
              <div className="flex flex-wrap gap-2 my-2">
                {item.photos.slice(0, 3).map((photo, index) => (
                  <div 
                    key={index}
                    className="w-16 h-16 rounded-md bg-muted overflow-hidden cursor-pointer relative group"
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setShowImageDialog(true);
                    }}
                  >
                    <img 
                      src={photo} 
                      alt={`${item.name} photo ${index + 1}`}
                      className="w-full h-full object-cover transition-all group-hover:scale-105"
                    />
                  </div>
                ))}
                
                {item.photos.length > 3 && (
                  <div 
                    className="w-16 h-16 rounded-md bg-muted overflow-hidden cursor-pointer relative flex items-center justify-center"
                    onClick={() => {
                      setSelectedImageIndex(3);
                      setShowImageDialog(true);
                    }}
                  >
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-medium">
                      +{item.photos.length - 3}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between items-center p-4 pt-2 border-t bg-muted/20">
          <div className="text-xs text-muted-foreground">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Updated {format(new Date(item.updated_at), "MMM d")}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Last modified: {formattedDate}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowEditModal(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Image viewer dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{item.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center">
            {item.photos.length > 0 ? (
              <div className="relative w-full">
                <img 
                  src={item.photos[selectedImageIndex]} 
                  alt={`${item.name} full view`}
                  className="w-full h-auto rounded-md max-h-[70vh] object-contain"
                />
                
                {item.photos.length > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    {item.photos.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === selectedImageIndex ? "bg-primary" : "bg-muted"
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                <Image className="h-10 w-10 mb-2" />
                <p>No images available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit modal */}
      <EditItemModal 
        item={item} 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
      />
    </>
  );
};

export default ItemCard;
