// src/utils/shareHelper.ts
import { Producto } from '../types';
import { optimizarImg } from './helpers';

/**
 * Genera una tarjeta de repuesto CUADRADA de ALTA CALIDAD (1200x1200) en un Canvas de HTML5.
 * Calcula dinámicamente el tamaño de la imagen para que nunca se recorte el texto largo.
 */
export const shareProductAsImage = async (
  product: Producto,
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
): Promise<boolean> => {
  showToast('Generando tarjeta del repuesto en alta calidad...', 'info');

  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo inicializar el contexto del Canvas');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Formato Cuadrado (Instagram/WhatsApp ready)
    const width = 1200;
    const height = 1200;
    canvas.width = width;
    canvas.height = height;

    // --- FONDO DE LA TARJETA ---
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Borde exterior ancho (slate-100 elegante)
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 40;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // --- ENCABEZADO DE MARCA ---
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(40, 40, width - 80, 130);

    // Centrar Logo LV PARTS
    ctx.font = '900 54px "Inter", "Helvetica Neue", Arial, sans-serif';
    const lvWidth = ctx.measureText('LV').width;
    ctx.font = 'italic 900 54px "Inter", "Helvetica Neue", Arial, sans-serif';
    const partsWidth = ctx.measureText('PARTS').width;
    const logoTotalWidth = lvWidth + 10 + partsWidth;
    
    const logoStartX = 600 - logoTotalWidth / 2;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 54px "Inter", "Helvetica Neue", Arial, sans-serif';
    ctx.fillText('LV', logoStartX, 105);
    ctx.fillStyle = '#e11d48';
    ctx.font = 'italic 900 54px "Inter", "Helvetica Neue", Arial, sans-serif';
    ctx.fillText('PARTS', logoStartX + lvWidth + 10, 105);

    // Subtítulo del catálogo oficial
    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 16px "Inter", "Helvetica Neue", Arial, sans-serif';
    ctx.fillText('CATÁLOGO OFICIAL DE REPUESTOS', 600, 145);

    // Línea de acento roja
    ctx.fillStyle = '#e11d48';
    ctx.fillRect(40, 170, width - 80, 8);

    // --- PIE DE PÁGINA ---
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(40, 1080, width - 80, 80);

    ctx.fillStyle = '#64748b';
    ctx.font = 'medium 20px "Inter", "Helvetica Neue", Arial, sans-serif';
    ctx.fillText('Catálogo en línea: lvparts.com  •  Contacto de pedidos vía WhatsApp', 600, 1128);

    // --- CARGA DE IMAGEN ---
    const primaryImgUrl = optimizarImg(product.imagen, 1000);
    const getFullUrl = (url: string) => url.startsWith('/') ? window.location.origin + url : url;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      let fallbackTried = false;
      
      img.onload = () => resolve();
      img.onerror = () => {
        if (!fallbackTried && product.codigo_referencia) {
          fallbackTried = true;
          const fallbackUrl = `/imagenes_repuestos/${product.codigo_referencia}.webp`;
          img.src = getFullUrl(fallbackUrl);
        } else {
          reject(new Error('No se pudo cargar la imagen del repuesto'));
        }
      };
      
      img.src = getFullUrl(primaryImgUrl);
    });

    // --- DETERMINAR ESTADO DE STOCK TEMP ---
    let badgeText = 'AGOTADO';
    let badgeBgColor = '#fee2e2'; // red-100
    let badgeTextColor = '#991b1b'; // red-800

    if (product.stock) {
      const tieneBajoPedido = product.origenes?.some(o => o.toLowerCase().includes('pedido'));
      if (tieneBajoPedido) {
        badgeText = 'BAJO PEDIDO';
        badgeBgColor = '#fef3c7'; // amber-100
        badgeTextColor = '#92400e'; // amber-800
      } else {
        badgeText = 'DISPONIBLE';
        badgeBgColor = '#dcfce7'; // green-100
        badgeTextColor = '#166534'; // green-800
      }
    }

    // --- CALCULO DINÁMICO DE ESPACIO PARA TEXTO ---
    ctx.font = 'bold 36px "Inter", "Helvetica Neue", Arial, sans-serif';
    const words = product.nombre.split(' ');
    const titleLines = [];
    let currentLine = '';
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(testLine).width > 1040) {
        if (currentLine) titleLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) titleLines.push(currentLine);

    const titleLineHeight = 44;
    const titleBlockHeight = titleLines.length * titleLineHeight;
    const spacingBelowImage = 40;
    const spacingBelowTitle = 15;
    const subHeight = 24;
    const spacingBelowSub = 30;
    const priceHeight = 75; // Aumentado ligeramente para el badge mas grande

    const totalTextHeight = spacingBelowImage + titleBlockHeight + spacingBelowTitle + subHeight + spacingBelowSub + priceHeight;

    // Área de contenido dinámico disponible = de Y=178 a Y=1080 (902px)
    const contentAreaHeight = 902;
    const boxY = 208; // 178 + 30 padding top
    const boxHeight = contentAreaHeight - totalTextHeight - 50; // restante para la imagen
    const boxWidth = 1040;
    const boxX = 80;

    // Contenedor de la imagen
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    // Ajustar imagen
    const imgRatio = img.width / img.height;
    const boxRatio = boxWidth / boxHeight;
    let drawWidth = boxWidth - 40;
    let drawHeight = boxHeight - 40;
    let drawX = boxX + 20;
    let drawY = boxY + 20;

    if (imgRatio > boxRatio) {
      drawHeight = (boxWidth - 40) / imgRatio;
      drawY = boxY + (boxHeight - drawHeight) / 2;
    } else {
      drawWidth = (boxHeight - 40) * imgRatio;
      drawX = boxX + (boxWidth - drawWidth) / 2;
    }

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

    // --- MARCA DE AGUA SI ESTA AGOTADO ---
    if (badgeText === 'AGOTADO') {
      ctx.save();
      const centerX = boxX + boxWidth / 2;
      const centerY = boxY + boxHeight / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate(-Math.PI / 6); // Rotacion de -30 grados
      
      ctx.fillStyle = 'rgba(220, 38, 38, 0.7)'; // red-600 transparente
      ctx.font = '900 130px "Inter", "Helvetica Neue", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Borde blanco exterior para mayor legibilidad
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 14;
      ctx.strokeText('AGOTADO', 0, 0);
      ctx.fillText('AGOTADO', 0, 0);
      ctx.restore();
    }

    // --- DIBUJO DE TEXTOS ---
    let currentY = boxY + boxHeight + spacingBelowImage + 30;

    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.font = 'bold 36px "Inter", "Helvetica Neue", Arial, sans-serif';
    titleLines.forEach(line => {
      ctx.fillText(line, 600, currentY);
      currentY += titleLineHeight;
    });

    currentY += spacingBelowTitle;
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 20px "Inter", "Helvetica Neue", Arial, sans-serif';
    let infoStr = `SECCIÓN: ${String(product.seccion || 'General').toUpperCase()}`;
    if (product.codigo_referencia) infoStr += `   |   REFERENCIA: ${product.codigo_referencia}`;
    ctx.fillText(infoStr, 600, currentY);

    currentY += spacingBelowSub + 40;
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 68px "Inter", "Helvetica Neue", Arial, sans-serif';
    const priceText = `$${Number(product.precio).toFixed(2)}`;
    
    const priceWidth = ctx.measureText(priceText).width;
    const badgeWidth = badgeText === 'BAJO PEDIDO' ? 240 : 210;
    const badgeHeight = 64;
    const totalWidth = priceWidth + 30 + badgeWidth;
    const startX = 600 - totalWidth / 2;

    ctx.textAlign = 'left';
    ctx.fillText(priceText, startX, currentY);

    const badgeX = startX + priceWidth + 30;
    const badgeY = currentY - 56;
    
    // Fondo del Badge
    ctx.fillStyle = badgeBgColor;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 16);
    } else {
      ctx.rect(badgeX, badgeY, badgeWidth, badgeHeight);
    }
    ctx.fill();
    
    // Borde del Badge
    ctx.strokeStyle = badgeTextColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Texto del Badge
    ctx.fillStyle = badgeTextColor;
    ctx.font = '900 22px "Inter", "Helvetica Neue", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(badgeText, badgeX + badgeWidth / 2, badgeY + 40);

    // --- SALIDA Y COMPARTIR ---
    return new Promise<boolean>((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          showToast('No se pudo generar la imagen de salida', 'error');
          resolve(false);
          return;
        }

        const fileName = `repuesto-${product.codigo_referencia || product.id}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobileDevice && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: product.nombre,
              text: `Mira este repuesto en LV PARTS: ${product.nombre} - ${priceText}`
            });
            showToast('¡Repuesto compartido exitosamente!', 'success');
            resolve(true);
            return;
          } catch (shareErr: any) {
            if (shareErr && shareErr.name === 'AbortError') {
              showToast('Acción de compartir cancelada', 'info');
              resolve(false);
              return;
            }
            console.warn('Compartir nativo fallido, intentando portapapeles...', shareErr);
          }
        }

        const handleFallbackDownload = () => {
          try {
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);
            showToast('Imagen descargada en alta calidad.', 'success');
            resolve(true);
          } catch (dlErr) {
            console.error('Fallo final en descarga:', dlErr);
            showToast('Error al procesar la imagen', 'error');
            resolve(false);
          }
        };

        const attemptClipboardWrite = async () => {
          try {
            await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
            showToast('¡Ficha de repuesto copiada al portapapeles!', 'success');
            resolve(true);
          } catch (clipErr: any) {
            console.warn('Fallo al copiar al portapapeles. Intentando descarga directa...', clipErr);
            handleFallbackDownload();
          }
        };

        if (navigator.clipboard && window.ClipboardItem) {
          if (document.hasFocus()) {
            // Si tenemos el foco, copiar de inmediato
            await attemptClipboardWrite();
          } else {
            // Si el usuario cambió de pestaña, le avisamos y esperamos a que regrese
            showToast('Imagen lista. Vuelve a la pestaña para copiarla.', 'info');
            
            const onFocus = () => {
              window.removeEventListener('focus', onFocus);
              // Un ligero delay permite al navegador asentar el evento de interacción (click en la pestaña)
              setTimeout(() => {
                attemptClipboardWrite();
              }, 300);
            };
            window.addEventListener('focus', onFocus);
          }
        } else {
          // Si no hay API de portapapeles, saltar directo a descarga
          console.warn('Clipboard API no soportada en este navegador');
          handleFallbackDownload();
        }
      }, 'image/png');
    });
  } catch (error) {
    console.error('Error en shareProductAsImage:', error);
    showToast(error instanceof Error ? error.message : 'Error al generar la imagen', 'error');
    return false;
  }
};
