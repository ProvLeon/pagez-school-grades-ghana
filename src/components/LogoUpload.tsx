
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDropzone } from 'react-dropzone';

interface LogoUploadProps {
  currentLogoUrl?: string | null;
  onLogoChange: (logoUrl: string | null) => void;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({ currentLogoUrl, onLogoChange }) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file (PNG, JPG, etc.)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
      const fileName = `logo-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      if (currentLogoUrl) {
        const oldFileName = currentLogoUrl.split('/').pop();
        if (oldFileName) {
          await supabase.storage.from('school-logos').remove([oldFileName]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('school-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('school-logos')
        .getPublicUrl(fileName);

      onLogoChange(publicUrl);

      toast({
        title: "Logo uploaded",
        description: "School logo has been successfully updated",
      });

    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleFileUpload(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, multiple: false });

  const handleRemoveLogo = async () => {
    if (!currentLogoUrl) return;
    try {
      const fileName = currentLogoUrl.split('/').pop();
      if (fileName) {
        await supabase.storage.from('school-logos').remove([fileName]);
      }
      onLogoChange(null);
      toast({
        title: "Logo removed",
        description: "School logo has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove logo",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {currentLogoUrl ? (
        <div className="relative group">
          <img
            src={currentLogoUrl}
            alt="School Logo"
            className="w-full h-40 object-contain rounded-lg border bg-muted/20"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemoveLogo}
            >
              <X className="w-4 h-4 mr-2" />
              Remove Logo
            </Button>
          </div>
        </div>
      ) : (
        <div {...getRootProps()} className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Image className="w-8 h-8" />
            {isDragActive ? (
              <p>Drop the logo here...</p>
            ) : (
              <p>Drag & drop a logo here, or click to select a file</p>
            )}
            <p className="text-xs">PNG or JPG, max 5MB</p>
          </div>
        </div>
      )}

      <Button
        onClick={() => document.getElementById('logo-upload-input')?.click()}
        disabled={uploading}
        className="w-full"
        variant="outline"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            {currentLogoUrl ? 'Change Logo' : 'Upload Logo'}
          </>
        )}
      </Button>
      <Input id="logo-upload-input" type="file" accept="image/*" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])} className="hidden" />
    </div>
  );
};
