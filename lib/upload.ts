import { supabase } from '@/lib/portfolio';

/**
 * Uploads an image file to Supabase Storage if available,
 * or compresses it via HTML Canvas and converts it to a light Data URL fallback.
 */
export async function uploadPortfolioImage(file: File): Promise<string> {
  // 1. Try uploading to Supabase Storage bucket 'portfolio-media'
  if (supabase) {
    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { data, error } = await supabase.storage
        .from('portfolio-media')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (!error && data?.path) {
        const { data: publicUrlData } = supabase.storage
          .from('portfolio-media')
          .getPublicUrl(data.path);
        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch (err) {
      console.warn('Supabase storage upload fallback triggered:', err);
    }
  }

  // 2. Fallback: Read & compress image using HTML Canvas
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

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
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(dataUrl);
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error('Erreur lors du traitement de l’image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
