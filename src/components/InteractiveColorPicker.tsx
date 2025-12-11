import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// --- Color Conversion Utilities ---
const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const hexToHsl = (hex: string): { h: number, s: number, l: number } | null => {
  let sanitizedHex = hex.startsWith('#') ? hex.slice(1) : hex;
  if (sanitizedHex.length === 3) {
    sanitizedHex = sanitizedHex.split('').map(char => char + char).join('');
  }
  if (sanitizedHex.length !== 6) return null;

  const r = parseInt(sanitizedHex.substring(0, 2), 16) / 255;
  const g = parseInt(sanitizedHex.substring(2, 4), 16) / 255;
  const b = parseInt(sanitizedHex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

// --- Component ---
interface InteractiveColorPickerProps {
  hue: number;
  saturation: number;
  lightness: number;
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
  const hueBarRef = useRef<HTMLDivElement>(null);

  const [hexValue, setHexValue] = useState(() => hslToHex(hue, saturation, lightness));

  useEffect(() => {
    setHexValue(hslToHex(hue, saturation, lightness));
  }, [hue, saturation, lightness]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    setHexValue(newHex);
    const newHsl = hexToHsl(newHex);
    if (newHsl) {
      onHueChange(newHsl.h);
      onColorChange(newHsl.s, newHsl.l);
    }
  };

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(hexValue);
    toast({ title: "Copied!", description: `${hexValue} copied to clipboard.` });
  }, [hexValue, toast]);

  const createDragHandler = (
    ref: React.RefObject<HTMLDivElement>,
    callback: (x: number, y: number, rect: DOMRect) => void
  ) => (event: React.MouseEvent) => {
    event.preventDefault();
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    callback(event.clientX, event.clientY, rect);

    const handleMouseMove = (e: MouseEvent) => callback(e.clientX, e.clientY, rect);
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleColorAreaDrag = createDragHandler(colorAreaRef, (clientX, clientY, rect) => {
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const newSaturation = Math.max(0, Math.min(100, Math.round((x / rect.width) * 100)));
    const newLightness = Math.max(0, Math.min(100, Math.round(100 - (y / rect.height) * 100)));
    onColorChange(newSaturation, newLightness);
  });

  const handleHueBarDrag = createDragHandler(hueBarRef, (clientX, _, rect) => {
    const x = clientX - rect.left;
    const newHue = Math.max(0, Math.min(360, Math.round((x / rect.width) * 360)));
    onHueChange(newHue);
  });

  return (
    <div className="space-y-4">
      <div
        ref={colorAreaRef}
        className="w-full h-40 rounded-md border relative overflow-hidden cursor-crosshair"
        style={{ background: `linear-gradient(to bottom, transparent, black), linear-gradient(to right, white, hsl(${hue}, 100%, 50%))` }}
        onMouseDown={handleColorAreaDrag}
      >
        <div
          className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg pointer-events-none transform"
          style={{
            top: `${100 - lightness}%`,
            left: `${saturation}%`,
            backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
            transform: 'translate(-50%, -50%)'
          }}
        />
      </div>
      
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: hexValue }} />
        <div className="relative flex-1">
          <Input id="hex-input" value={hexValue} onChange={handleHexChange} className="pl-3 pr-9 font-mono text-sm" />
          <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <ValueSlider
          label="Hue"
          value={hue}
          max={360}
          onValueChange={onHueChange}
          background="linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)"
        />
        <ValueSlider
          label="Saturation"
          value={saturation}
          max={100}
          onValueChange={(s) => onColorChange(s, lightness)}
          background={`linear-gradient(to right, hsl(${hue}, 0%, ${lightness}%), hsl(${hue}, 100%, ${lightness}%))`}
        />
        <ValueSlider
          label="Lightness"
          value={lightness}
          max={100}
          onValueChange={(l) => onColorChange(saturation, l)}
          background={`linear-gradient(to right, #000, hsl(${hue}, ${saturation}%, 50%), #fff)`}
        />
      </div>
    </div>
  );
};

// --- Sub-components ---
interface ValueSliderProps {
  label: string;
  value: number;
  max: number;
  onValueChange: (value: number) => void;
  background: string;
}

const ValueSlider: React.FC<ValueSliderProps> = ({ label, value, max, onValueChange, background }) => {
  return (
    <div className="grid grid-cols-[40px,1fr,40px] items-center gap-2">
      <Label htmlFor={`${label}-slider`} className="text-sm text-muted-foreground">{label}</Label>
      <div className="relative h-4 rounded-full overflow-hidden border" style={{ background }}>
        <input
          id={`${label}-slider`}
          type="range"
          min="0"
          max={max}
          value={value}
          onChange={(e) => onValueChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer"
        />
      </div>
      <Input
        type="number"
        value={value}
        onChange={(e) => onValueChange(Math.max(0, Math.min(max, parseInt(e.target.value) || 0)))}
        className="h-8 text-sm font-mono text-center"
      />
    </div>
  );
};
