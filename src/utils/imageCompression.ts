/**
 * Compresses an image to a target size limit (100KB default)
 */
export const compressImage = async (
  dataUrl: string,
  maxSizeKB = 100
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create an image element to load the image
      const img = new Image();
      img.onload = () => {
        // Create a canvas to draw and compress the image
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        
        // Maintain aspect ratio while resizing if needed
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw image on canvas
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Start with high quality
        let quality = 0.7;
        let compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        
        // Function to check size in KB
        const getSizeInKB = (dataUrl: string) => {
          // Remove the data URL header to get only the base64 data
          const base64 = dataUrl.split(",")[1];
          // Convert to bytes: base64 string length * 3/4 (base64 encoding ratio)
          const sizeInBytes = Math.ceil((base64.length * 3) / 4);
          return sizeInBytes / 1024;
        };
        
        // Keep reducing quality until we're under the size limit
        let currentSize = getSizeInKB(compressedDataUrl);
        
        // If already under size limit, return it
        if (currentSize <= maxSizeKB) {
          resolve(compressedDataUrl);
          return;
        }
        
        // Binary search for optimal quality setting
        let minQuality = 0.1;
        let maxQuality = 0.7;
        let attempts = 0;
        const MAX_ATTEMPTS = 10;
        
        const compress = () => {
          if (attempts >= MAX_ATTEMPTS) {
            // If we've tried too many times, just return the best we have
            resolve(compressedDataUrl);
            return;
          }
          
          quality = (minQuality + maxQuality) / 2;
          compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          currentSize = getSizeInKB(compressedDataUrl);
          
          if (Math.abs(currentSize - maxSizeKB) < 1) {
            // Close enough to target size
            resolve(compressedDataUrl);
            return;
          }
          
          if (currentSize > maxSizeKB) {
            maxQuality = quality;
          } else {
            minQuality = quality;
          }
          
          attempts++;
          compress();
        };
        
        compress();
      };
      
      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
      
      img.src = dataUrl;
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Converts a file to a data URL
 */
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert file to data URL"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
