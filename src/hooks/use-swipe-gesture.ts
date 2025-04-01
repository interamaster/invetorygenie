
import { useEffect, useState, TouchEvent } from "react";

interface SwipeOptions {
  threshold?: number;
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  disabled?: boolean;
  onSwipeMove?: (progress: number) => void; // Callback for swipe progress
  onSwipeCancel?: () => void; // Callback when swipe is canceled
  edgeSize?: number; // Size of the edge area that triggers swipe (in pixels)
  animationDuration?: number; // Animation duration in ms
}

export function useSwipeGesture(
  ref: React.RefObject<HTMLElement>,
  options: SwipeOptions = {}
) {
  const { 
    threshold = 50, 
    onSwipeRight, 
    onSwipeLeft, 
    disabled = false,
    onSwipeMove,
    onSwipeCancel,
    edgeSize = 30, // Default edge size (30px from left edge)
    animationDuration = 300 // Default animation duration
  } = options;
  
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isEdgeTouch, setIsEdgeTouch] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || disabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touchX = e.targetTouches[0].clientX;
      
      // Only initiate swipe if touch starts from the edge
      if (touchX <= edgeSize) {
        setIsEdgeTouch(true);
        setTouchStart(touchX);
        setTouchEnd(null);
      } else {
        setIsEdgeTouch(false);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Only process touch move if it started at the edge
      if (!isEdgeTouch) return;
      
      const currentX = e.targetTouches[0].clientX;
      setTouchEnd(currentX);
      
      // Calculate progress for the visual feedback
      if (touchStart !== null && onSwipeMove) {
        const screenWidth = window.innerWidth;
        const distance = currentX - touchStart;
        
        // Only handle right swipes for back navigation (positive distance)
        if (distance > 0) {
          // Slow down the movement by increasing the divisor (from 0.4 to 0.6)
          const progress = Math.min(distance / (screenWidth * 1.), 1);
          onSwipeMove(progress);
        }
      }
    };

    const handleTouchEnd = () => {
      if (!isEdgeTouch || !touchStart || !touchEnd) {
        setIsEdgeTouch(false);
        setTouchStart(null);
        setTouchEnd(null);
        return;
      }
      
      const distance = touchEnd - touchStart;
      const swipeThreshold = window.innerWidth * 0.7;
      
      if (distance > swipeThreshold && onSwipeRight) {
        // Immediate transition for successful swipe
        onSwipeRight();
      } else if (onSwipeCancel) {
        // Gradual animation back to original position
        const startTime = performance.now();
        const startProgress = distance / (window.innerWidth * 1.0);
        
        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.max(0, startProgress * (1 - (elapsed / 200)));
          
          onSwipeMove?.(progress);
          
          if (elapsed < 300) {
            requestAnimationFrame(animate);
          } else {
            onSwipeCancel();
          }
        };
        
        requestAnimationFrame(animate);
      }
      
      setIsEdgeTouch(false);
      setTouchStart(null);
      setTouchEnd(null);
    };

    el.addEventListener("touchstart", handleTouchStart as any);
    el.addEventListener("touchmove", handleTouchMove as any);
    el.addEventListener("touchend", handleTouchEnd as any);

    return () => {
      el.removeEventListener("touchstart", handleTouchStart as any);
      el.removeEventListener("touchmove", handleTouchMove as any);
      el.removeEventListener("touchend", handleTouchEnd as any);
    };
  }, [ref, threshold, touchStart, touchEnd, onSwipeRight, onSwipeLeft, onSwipeMove, onSwipeCancel, disabled, edgeSize, isEdgeTouch]);

  return { animationDuration };
}
