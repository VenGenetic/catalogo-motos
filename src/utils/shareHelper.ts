// src/utils/shareHelper.ts
import { Producto } from '../types';
import { optimizarImg } from './helpers';

/**
 * Genera una tarjeta de repuesto de SÚPER ALTA CALIDAD (1200x1400) en un Canvas de HTML5.
 * - En móviles (Android/iOS): abre la ventana de compartir nativa (ideal para WhatsApp).
 * - En computadoras (Windows/macOS): copia la imagen directamente al portapapeles.
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

    // Activar suavizado de imagen de alta calidad
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Configurar dimensiones de súper alta resolución (1200 x 1400) para nitidez extrema
    const width = 1200;
    const height = 1400;
    canvas.width = width;
    canvas.height = height;

    // --- FONDO DE LA TARJETA ---
    // Fondo blanco puro
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Borde exterior slate-100 elegante
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 30;
    ctx.strokeRect(15, 15, width - 30, height - 30);

    // --- ENCABEZADO DE MARCA (Fondo oscuro premium) ---
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(30, 30, width - 60, 160);

    // Dibujar logo: "LV" en blanco y "PARTS" en rojo
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 54px "Inter", "Helvetica Neue", Arial, sans-serif';
    ctx.fillText('LV', 70, 128);

    ctx.fillStyle = '#e11d48'; // rose-600/red-600
    ctx.font = 'italic 900 54px "Inter", "Helvetica Neue", Arial, sans-serif';
    ctx.fillText('PARTS', 150, 128);

    // Subtítulo del catálogo oficial
    ctx.fillStyle = '#94a3b8'; // slate-400
    ctx.font = 'bold 18px "Inter", "Helvetica Neue", Arial, sans-serif';
    ctx.fillText('CATÁLOGO OFICIAL DE REPUESTOS', 480, 118);

    // Línea de acento roja
    ctx.fillStyle = '#e11d48';
    ctx.fillRect(30, 190, width - 60, 8);

    // --- CARGA Y DIBUJO DE IMAGEN DEL REPUESTO ---
    const imgUrl = optimizarImg(product.imagen, 1000);
    const fullImgUrl = imgUrl.startsWith('/')
      ? window.location.origin + imgUrl
      : imgUrl;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('No se pudo cargar la imagen del repuesto'));
      img.src = fullImgUrl;
    });

    // Contenedor de la imagen (recuadro gris claro elegante)
    const boxX = 60;
    const boxY = 240;
    const boxWidth = width - 120; // 1080px
    const boxHeight = 620;

    ctx.fillStyle = '#f8fafc'; // slate-50
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    ctx.strokeStyle = '#e2e8f0'; // slate-200
    ctx.lineWidth = 3;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    // Ajustar imagen para que quepa ("contain") manteniendo aspect ratio
    const imgRatio = img.width / img.height;
    const boxRatio = boxWidth / boxHeight;
    let drawWidth = boxWidth - 60; // Padding de 30px
    let drawHeight = boxHeight - 60;
    let drawX = boxX + 30;
    let drawY = boxY + 30;

    if (imgRatio > boxRatio) {
      drawHeight = (boxWidth - 60) / imgRatio;
      drawY = boxY + (boxHeight - drawHeight) / 2;
    } else {
      drawWidth = (boxHeight - 60) * imgRatio;
      drawX = boxX + (boxWidth - drawWidth) / 2;
    }

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

    // --- DETALLES DEL REPUESTO (TEXTOS) ---
    // Título/Nombre del repuesto (bold y grande)
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.font = 'bold 42px "Inter", "Helvetica Neue", Arial, sans-serif';

    const textX = 60;
    const textY = 940;
    const textMaxWidth = width - 120;
    const lineHeight = 54;

    // Envoltura de texto inteligente
    const words = product.nombre.split(' ');
    let line = '';
    let currentY = textY;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > textMaxWidth && n > 0) {
        ctx.fillText(line, textX, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, textX, currentY);

    // Sección y Referencia
    const detailsY = currentY + 60;
    ctx.fillStyle = '#64748b'; // slate-500
    ctx.font = 'bold 22px "Inter", "Helvetica Neue", Arial, sans-serif';
    
    let infoStr = `SECCIÓN: ${String(product.seccion || 'General').toUpperCase()}`;
    if (product.codigo_referencia) {
      infoStr += `   |   REFERENCIA: ${product.codigo_referencia}`;
    }
    ctx.fillText(infoStr, textX, detailsY);

    // --- PRECIO Y DISPONIBILIDAD ---
    const priceY = detailsY + 110;

    // Valor del repuesto
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.font = '900 76px "Inter", "Helvetica Neue", Arial, sans-serif';
    const priceText = `$${Number(product.precio).toFixed(2)}`;
    ctx.fillText(priceText, textX, priceY);

    // Badge de Stock
    const priceWidth = ctx.measureText(priceText).width;
    const badgeX = textX + priceWidth + 35;
    const badgeY = priceY - 62;
    const badgeWidth = 190;
    const badgeHeight = 56;

    // Fondo del badge con esquinas redondeadas
    ctx.fillStyle = product.stock ? '#dcfce7' : '#fee2e2'; // green-100 / red-100
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 12);
    } else {
      ctx.rect(badgeX, badgeY, badgeWidth, badgeHeight);
    }
    ctx.fill();

    // Texto del badge
    ctx.fillStyle = product.stock ? '#166534' : '#991b1b'; // green-800 / red-800
    ctx.font = 'bold 18px "Inter", "Helvetica Neue", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      product.stock ? 'DISPONIBLE' : 'AGOTADO',
      badgeX + badgeWidth / 2,
      badgeY + 36
    );
    ctx.textAlign = 'left'; // Resetear alineación

    // --- PIE DE PÁGINA DE LA TARJETA ---
    ctx.fillStyle = '#f8fafc'; // slate-50
    ctx.fillRect(30, height - 120, width - 60, 90);

    ctx.fillStyle = '#64748b'; // slate-500
    ctx.font = 'medium 20px "Inter", "Helvetica Neue", Arial, sans-serif';
    ctx.fillText('Catálogo en línea: lvparts.com  •  Contacto de pedidos vía WhatsApp', 70, height - 68);

    // --- PROCESAMIENTO E INTERACCIÓN SEGÚN DISPOSITIVO ---
    return new Promise<boolean>((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          showToast('No se pudo generar la imagen de salida', 'error');
          resolve(false);
          return;
        }

        const fileName = `repuesto-${product.codigo_referencia || product.id}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });

        // Identificar si es un dispositivo móvil (Android/iOS)
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

        // 1. En móviles (Android/iOS): priorizar menú de compartir nativo (para WhatsApp)
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

        // 2. En computadoras (Windows/macOS) o si falla compartir nativo en móvil:
        // Copiar la imagen directamente al portapapeles (ideal para pegar con Ctrl+V)
        try {
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
              new ClipboardItem({
                [blob.type]: blob
              })
            ]);
            showToast('¡Ficha de repuesto copiada al portapapeles!', 'success');
            resolve(true);
          } else {
            throw new Error('Clipboard API no soportada en este navegador');
          }
        } catch (clipErr) {
          console.warn('Fallo al escribir en portapapeles, intentando descargar imagen:', clipErr);

          // 3. Fallback de emergencia: Descarga directa de la imagen
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
        }
      }, 'image/png');
    });
  } catch (error) {
    console.error('Error en shareProductAsImage:', error);
    showToast(error instanceof Error ? error.message : 'Error al generar la imagen', 'error');
    return false;
  }
};
