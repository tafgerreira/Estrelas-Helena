
export const resizeImage = (base64Str: string, maxWidth = 1200, maxHeight = 1200): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Não foi possível criar o contexto do canvas"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      // Comprime para JPEG com 70% de qualidade para poupar imenso espaço no localStorage
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = (e) => reject(e);
  });
};

export const getStorageUsage = () => {
  let total = 0;
  for (const key in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
      total += (localStorage[key]?.length || 0) * 2; // UTF-16 usa 2 bytes por caractere
    }
  }
  const sizeMB = total / (1024 * 1024);
  const limitMB = 5; // Limite padrão aproximado do localStorage
  return {
    usedMB: sizeMB.toFixed(2),
    percentage: Math.min(Math.round((sizeMB / limitMB) * 100), 100)
  };
};
