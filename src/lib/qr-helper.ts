import QRCode from 'qrcode';

export interface QROptions {
  colorDark?: string;
  colorLight?: string;
  margin?: number;
  width?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export const QR_THEMES = [
  {
    id: 'artistant',
    name: 'Artistant Signature',
    dark: '#F25A2B',
    light: '#121212',
    gradient: 'linear-gradient(135deg, #F25A2B 0%, #7C5CFF 100%)',
    border: 'rgba(242, 90, 43, 0.3)',
    bg: '#121212',
  },
  {
    id: 'gold',
    name: 'Gold VIP Pass',
    dark: '#FFD700',
    light: '#0B0D14',
    gradient: 'linear-gradient(135deg, #FFB800 0%, #FFA000 100%)',
    border: 'rgba(255, 184, 0, 0.3)',
    bg: '#0B0D14',
  },
  {
    id: 'emerald',
    name: 'Cyber Emerald',
    dark: '#10B981',
    light: '#064E3B',
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    border: 'rgba(16, 185, 129, 0.3)',
    bg: '#064E3B',
  },
  {
    id: 'monochrome',
    name: 'Onyx Minimal',
    dark: '#FFFFFF',
    light: '#000000',
    gradient: 'linear-gradient(135deg, #FFFFFF 0%, #A1A1AA 100%)',
    border: 'rgba(255, 255, 255, 0.2)',
    bg: '#000000',
  },
];

export async function generateQRCodeDataUrl(text: string, options: QROptions = {}): Promise<string> {
  const {
    colorDark = '#F25A2B',
    colorLight = '#121212',
    margin = 2,
    width = 600,
    errorCorrectionLevel = 'H'
  } = options;

  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width,
      margin,
      errorCorrectionLevel,
      color: {
        dark: colorDark,
        light: colorLight,
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('QR code generation error:', err);
    throw err;
  }
}

export async function generateQRCodeSVG(text: string, options: QROptions = {}): Promise<string> {
  const {
    colorDark = '#F25A2B',
    colorLight = '#121212',
    margin = 2,
    width = 600,
    errorCorrectionLevel = 'H'
  } = options;

  try {
    const svgString = await QRCode.toString(text, {
      type: 'svg',
      width,
      margin,
      errorCorrectionLevel,
      color: {
        dark: colorDark,
        light: colorLight,
      },
    });
    return svgString;
  } catch (err) {
    console.error('QR SVG generation error:', err);
    throw err;
  }
}

export function downloadStringAsFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
