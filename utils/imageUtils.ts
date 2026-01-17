
export const resizeImage = (base64Str: string, maxWidth = 1600, maxHeight = 1600): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
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

      // Melhorar a nitidez e o contraste para facilitar a leitura da IA
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Aplicar filtros de processamento de imagem para destacar lápis e texto
      // Contrast(1.4) ajuda a separar o cinzento do lápis do fundo
      // Brightness(1.1) limpa sombras de fotos tiradas em casa
      ctx.filter = 'contrast(1.4) brightness(1.1) saturate(1.1)';

      ctx.drawImage(img, 0, 0, width, height);
      
      // Qualidade máxima para evitar artefactos de compressão que baralham a IA
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = (e) => reject(e);
  });
};

export const getStorageUsage = () => {
  let total = 0;
  try {
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        total += (localStorage[key]?.length || 0) * 2;
      }
    }
  } catch (e) {
    console.error("Erro ao calcular uso de memória", e);
  }
  
  const sizeMB = total / (1024 * 1024);
  const limitMB = 5; 
  const percentage = Math.min(Math.round((sizeMB / limitMB) * 100), 100);
  
  return {
    usedMB: sizeMB.toFixed(2),
    percentage,
    isCritical: percentage > 90,
    isFull: percentage >= 100
  };
};
