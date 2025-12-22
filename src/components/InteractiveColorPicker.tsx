import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// --- Color Conversion Utilities (HSV-based for accurate visual representation) ---

// HSV to RGB
const hsvToRgb = (h: number, s: number, v: number): { r: number; g: number; b: number } => {
  h = h / 360;
  s = s / 100;
  v = v / 100;

  let r = 0, g = 0, b = 0;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
};

// RGB to Hex
const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
};

// HSV to Hex
const hsvToHex = (h: number, s: number, v: number): string => {
  const { r, g, b } = hsvToRgb(h, s, v);
  return rgbToHex(r, g, b);
};

// Hex to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  let sanitizedHex = hex.startsWith('#') ? hex.slice(1) : hex;
  if (sanitizedHex.length === 3) {
    sanitizedHex = sanitizedHex.split('').map(char => char + char).join('');
  }
  if (sanitizedHex.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(sanitizedHex)) return null;

  return {
    r: parseInt(sanitizedHex.substring(0, 2), 16),
    g: parseInt(sanitizedHex.substring(2, 4), 16),
    b: parseInt(sanitizedHex.substring(4, 6), 16)
  };
};

// RGB to HSV
const rgbToHsv = (r: number, g: number, b: number): { h: number; s: number; v: number } => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  const s = max === 0 ? 0 : (diff / max) * 100;
  const v = max * 100;

  if (diff !== 0) {
    switch (max) {
      case r: h = ((g - b) / diff + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / diff + 2) * 60; break;
      case b: h = ((r - g) / diff + 4) * 60; break;
    }
  }

  return { h: Math.round(h), s: Math.round(s), v: Math.round(v) };
};

// Hex to HSV
const hexToHsv = (hex: string): { h: number; s: number; v: number } | null => {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToHsv(rgb.r, rgb.g, rgb.b);
};

// HSV to HSL (for compatibility with parent component)
const hsvToHsl = (h: number, s: number, v: number): { h: number; s: number; l: number } => {
  s /= 100;
  v /= 100;

  const l = v * (1 - s / 2);
  const newS = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);

  return {
    h: Math.round(h),
    s: Math.round(newS * 100),
    l: Math.round(l * 100)
  };
};

// HSL to HSV (for compatibility with parent component)
const hslToHsv = (h: number, s: number, l: number): { h: number; s: number; v: number } => {
  s /= 100;
  l /= 100;

  const v = l + s * Math.min(l, 1 - l);
  const newS = v === 0 ? 0 : 2 * (1 - l / v);

  return {
    h: Math.round(h),
    s: Math.round(newS * 100),
    v: Math.round(v * 100)
  };
};

// Preset color swatches - professional school/brand colors
const PRESET_COLORS = [
  { hex: '#e11d48', name: 'Rose' },
  { hex: '#dc2626', name: 'Red' },
  { hex: '#ea580c', name: 'Orange' },
  { hex: '#d97706', name: 'Amber' },
  { hex: '#16a34a', name: 'Green' },
  { hex: '#059669', name: 'Emerald' },
  { hex: '#0891b2', name: 'Cyan' },
  { hex: '#0284c7', name: 'Sky' },
  { hex: '#2563eb', name: 'Blue' },
  { hex: '#4f46e5', name: 'Indigo' },
  { hex: '#7c3aed', name: 'Violet' },
  { hex: '#9333ea', name: 'Purple' },
];

// --- Component ---
interface InteractiveColorPickerProps {
  hue: number;
  saturation: number; // HSL saturation from parent
  lightness: number;  // HSL lightness from parent
  onColorChange: (saturation: number, lightness: number) => void;
  onHueChange: (hue: number) => void;
}

export const InteractiveColorPicker: React.FC<InteractiveColorPickerProps> = ({
  hue,
  saturation,
  lightness,
  onColorChange,
  onHueChange
}) => {
  const { toast } = useToast();
  const colorAreaRef = useRef<HTMLDivElement>(null);
  const hueSliderRef = useRef<HTMLDivElement>(null);

  // Convert HSL from parent to HSV for internal use
  const [hsv, setHsv] = useState(() => hslToHsv(hue, saturation, lightness));
  const [hexValue, setHexValue] = useState(() => hsvToHex(hsv.h, hsv.s, hsv.v));
  const [originalHex] = useState(() => hsvToHex(hsv.h, hsv.s, hsv.v));
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Sync HSV when parent HSL changes
  useEffect(() => {
    if (!isDragging) {
      const newHsv = hslToHsv(hue,
        saturation, lightness);
      setHsv(newHsv);
      setHexValue(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
    }
  }, [hue, saturation, lightness, isDragging]);

  // Update parent with HSL values
  const updateParent = useCallback((newHsv: { h: number; s: number; v: number }) => {
    const hsl = hsvToHsl(newHsv.h, newHsv.s, newHsv.v);
    onHueChange(hsl.h);
    onColorChange(hsl.s, hsl.l);
  }, [onHueChange, onColorChange]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newHex = e.target.value;
    if (newHex && !newHex.startsWith('#')) {
      newHex = '#' + newHex;
    }
    setHexValue(newHex);

    const newHsv = hexToHsv(newHex);
    if (newHsv) {
      setHsv(newHsv);
      updateParent(newHsv);
    }
  };

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(hexValue.toUpperCase());
    setCopied(true);
    toast({ title: "Copied!", description: `${hexValue.toUpperCase()} copied to clipboard.` });
    setTimeout(() => setCopied(false), 2000);
  }, [hexValue, toast]);

  const resetToOriginal = useCallback(() => {
    const newHsv = hexToHsv(originalHex);
    if (newHsv) {
      setHsv(newHsv);
      setHexValue(originalHex);
      updateParent(newHsv);
    }
  }, [originalHex, updateParent]);

  const applyPreset = (hex: string) => {
    const newHsv = hexToHsv(hex);
    if (newHsv) {
      setHsv(newHsv);
      setHexValue(hex);
      updateParent(newHsv);
    }
  };

  // --- Drag Handlers ---
  const handleColorAreaInteraction = useCallback((clientX: number, clientY: number) => {
    if (!colorAreaRef.current) return;
    const rect = colorAreaRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

    // X = Saturation (0-100), Y = Value/Brightness (100 at top, 0 at bottom)
    const newS = Math.round((x / rect.width) * 100);
    const newV = Math.round(100 - (y / rect.height) * 100);

    const newHsv = { h: hsv.h, s: newS, v: newV };
    setHsv(newHsv);
    setHexValue(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
    updateParent(newHsv);
  }, [hsv.h, updateParent]);

  const handleHueInteraction = useCallback((clientX: number) => {
    if (!hueSliderRef.current) return;
    const rect = hueSliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const newH = Math.round((x / rect.width) * 360);

    const newHsv = { h: newH, s: hsv.s, v: hsv.v };
    setHsv(newHsv);
    setHexValue(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
    updateParent(newHsv);
  }, [hsv.s, hsv.v, updateParent]);

  const createDragHandler = (
    onInteraction: (clientX: number, clientY: number) => void
  ) => {
    return (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      setIsDragging(true);

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      onInteraction(clientX, clientY);

      const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
        const moveClientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
        const moveClientY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
        onInteraction(moveClientX, moveClientY);
      };

      const handleEnd = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
      };

      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    };
  };

  const currentColor = hsvToHex(hsv.h, hsv.s, hsv.v);
  const pureHueColor = hsvToHex(hsv.h, 100, 100);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr,1fr,240px]">
      {/* Left - Main Color Area */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground">Pick Color</Label>
        <div
          ref={colorAreaRef}
          className={cn(
            "w-full aspect-square rounded-xl relative overflow-hidden cursor-crosshair shadow-sm border-2",
            isDragging && "ring-2 ring-primary ring-offset-2"
          )}
          style={{ backgroundColor: pureHueColor }}
          onMouseDown={createDragHandler(handleColorAreaInteraction)}
          onTouchStart={createDragHandler(handleColorAreaInteraction)}
        >
          {/* White to transparent gradient (saturation) */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, #ffffff, transparent)' }}
          />
          {/* Transparent to black gradient (value/brightness) */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, transparent, #000000)' }}
          />
          {/* Picker Handle */}
          <div
            className={cn(
              "absolute w-5 h-5 rounded-full border-[3px] border-white pointer-events-none transition-transform duration-75",
              isDragging ? "scale-125" : "scale-100"
            )}
            style={{
              top: `${100 - hsv.v}%`,
              left: `${hsv.s}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: currentColor,
              boxShadow: '0 0 0 1px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.4)'
            }}
          />
        </div>
      </div>

      {/* Middle - Hue Slider & Presets */}
      <div className="space-y-4">
        {/* Hue Slider */}
        <div className="space-y-3">
          <Label className="text-xs font-medium text-muted-foreground">Hue</Label>
          <div
            ref={hueSliderRef}
            className={cn(
              "w-full h-8 rounded-lg relative cursor-pointer shadow-sm border-2",
              isDragging && "ring-2 ring-primary ring-offset-1"
            )}
            style={{
              background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
            }}
            onMouseDown={createDragHandler((x) => handleHueInteraction(x))}
            onTouchStart={createDragHandler((x) => handleHueInteraction(x))}
          >
            {/* Hue Handle */}
            <div
              className={cn(
                "absolute top-1/2 w-4 h-10 rounded-md border-2 border-white pointer-events-none shadow-lg",
                isDragging ? "scale-110" : "scale-100"
              )}
              style={{
                left: `${(hsv.h / 360) * 100}%`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: pureHueColor,
                boxShadow: '0 0 0 1px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.3)'
              }}
            />
          </div>
        </div>

        {/* Preset Colors */}
        <div className="space-y-3">
          <Label className="text-xs font-medium text-muted-foreground">Quick Presets</Label>
          <div className="grid grid-cols-6 gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color.hex}
                onClick={() => applyPreset(color.hex)}
                className={cn(
                  "aspect-square rounded-lg border-2 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary/50",
                  currentColor.toLowerCase() === color.hex.toLowerCase()
                    ? "border-primary scale-105 shadow-lg ring-2 ring-primary/30"
                    : "border-transparent hover:border-gray-300 shadow-sm"
                )}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Brightness Variations */}
        <div className="space-y-3">
          <Label className="text-xs font-medium text-muted-foreground">Brightness</Label>
          <div className="grid grid-cols-5 gap-2">
            {[95, 75, 55, 35, 15].map((v) => (
              <button
                key={v}
                onClick={() => {
                  const newHsv = { h: hsv.h, s: hsv.s, v };
                  setHsv(newHsv);
                  setHexValue(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
                  updateParent(newHsv);
                }}
                className={cn(
                  "h-8 rounded-lg border-2 transition-all hover:scale-105",
                  hsv.v === v ? "border-primary ring-2 ring-primary/30" : "border-transparent"
                )}
                style={{ backgroundColor: hsvToHex(hsv.h, hsv.s, v) }}
                title={`${v}% brightness`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right - Preview & Values */}
      <div className="space-y-4">
        {/* Color Preview - Stacked */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Preview</Label>
          <div
            className="w-full h-20 rounded-xl border-2 border-primary shadow-lg ring-2 ring-primary/20"
            style={{ backgroundColor: currentColor }}
          />
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-md border shadow-inner flex-shrink-0"
              style={{ backgroundColor: originalHex }}
            />
            <span className="text-[10px] text-muted-foreground">Original</span>
          </div>
        </div>

        {/* Hex Input */}
        <div className="space-y-2">
          <Label htmlFor="hex-input" className="text-xs font-medium text-muted-foreground">
            Hex Color
          </Label>
          <div className="flex gap-2">
            <div
              className="w-10 h-10 rounded-lg border shadow-inner flex-shrink-0"
              style={{ backgroundColor: currentColor }}
            />
            <div className="flex-1 relative">
              <Input
                id="hex-input"
                value={hexValue.toUpperCase()}
                onChange={handleHexChange}
                className="font-mono text-sm h-10 pr-16"
                placeholder="#000000"
                maxLength={7}
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={copyToClipboard}
                  title="Copy"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={resetToOriginal}
                  title="Reset"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Color Values */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Color Values</Label>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-muted/50 rounded-lg p-2 text-center">
              <div className="text-[10px] text-muted-foreground font-medium">HUE</div>
              <div className="text-sm font-mono font-semibold">{hsv.h}°</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-2 text-center">
              <div className="text-[10px] text-muted-foreground font-medium">SAT</div>
              <div className="text-sm font-mono font-semibold">{hsv.s}%</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-2 text-center">
              <div className="text-[10px] text-muted-foreground font-medium">VAL</div>
              <div className="text-sm font-mono font-semibold">{hsv.v}%</div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};
