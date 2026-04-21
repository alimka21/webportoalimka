import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import imageCompression from 'browser-image-compression';

export const uploadAndCompressImage = async (file: File, path: string = 'img'): Promise<string> => {
  try {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    };
    
    // Compress the file
    const compressedFile = await imageCompression(file, options);
    
    // Create a unique filename
    const uniqueFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storageRef = ref(storage, `${path}/${uniqueFileName}`);
    
    // Upload the file
    await uploadBytes(storageRef, compressedFile);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error("Error compressing or uploading image:", error);
    throw error;
  }
};
