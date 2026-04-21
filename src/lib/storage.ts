import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc } from 'firebase/firestore';
import { storage, db } from '../firebase';
import imageCompression from 'browser-image-compression';

export const uploadAndCompressImage = async (file: File, path: string = 'img'): Promise<string> => {
  try {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1200,
      useWebWorker: false, // Disabled web worker to prevent hanging in some environments
    };
    
    // Compress the file
    const compressedFile = await imageCompression(file, options);
    
    // Check for Cloudinary settings from the correct document
    const settingsDoc = await getDoc(doc(db, 'settings', 'homepage'));
    const settings = settingsDoc.data();
    
    if (settings && settings.cloudinaryCloudName && settings.cloudinaryUploadPreset) {
       // --- Upload to Cloudinary ---
       const formData = new FormData();
       formData.append('file', compressedFile);
       formData.append('upload_preset', settings.cloudinaryUploadPreset);

       const response = await fetch(`https://api.cloudinary.com/v1_1/${settings.cloudinaryCloudName}/image/upload`, {
          method: 'POST',
          body: formData
       });

       if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(`Cloudinary Error: ${errData?.error?.message || 'Upload failed.'}`);
       }
       const data = await response.json();
       return data.secure_url;
    } else {
       // --- Upload to Firebase Storage ---
       // Create a unique filename
       const uniqueFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
       const storageRef = ref(storage, `${path}/${uniqueFileName}`);
       
       // Upload the file
       await uploadBytes(storageRef, compressedFile);
       
       // Get the download URL
       const downloadURL = await getDownloadURL(storageRef);
       
       return downloadURL;
    }
  } catch (error) {
    console.error("Error compressing or uploading image:", error);
    throw error;
  }
};
