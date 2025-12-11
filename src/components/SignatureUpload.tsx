import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Loader2, PenSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDropzone } from 'react-dropzone';

interface SignatureUploadProps {
  currentSignatureUrl?: string | null;
  onSignatureChange: (url: string | null) => void;
}

const SignatureUpload: React.FC<SignatureUploadProps> = ({ currentSignatureUrl, onSignatureChange }) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Signature image must be less than 2MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
      const fileName = `signature-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      console.log('Uploading signature with filename:', fileName);

      if (currentSignatureUrl) {
        const oldFileName = currentSignatureUrl.split('/').pop();
        if (oldFileName) {
          console.log('Attempting to delete old signature:', oldFileName);
          const { error: deleteError } = await supabase.storage
            .from('signatures')
            .remove([oldFileName]);
          if (deleteError) {
            console.warn('Failed to delete old signature:', deleteError);
          } else {
            console.log('Successfully deleted old signature');
          }
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('signatures')
        .upload(fileName, file, {
          cacheControl: '3600',
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('signatures')
        .getPublicUrl(fileName);

      console.log('Generated public URL:', publicUrl);
      onSignatureChange(publicUrl);

      toast({
        title: "Signature updated",
        description: "New signature has been uploaded successfully.",
      });

    } catch (error: any) {
      console.error('Error uploading signature:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload signature. Please try again.",
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
  }, [currentSignatureUrl]); // Add dependencies

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif'] },
    multiple: false
  });

  const handleRemoveSignature = async () => {
    if (!currentSignatureUrl) return;

    try {
      const fileName = currentSignatureUrl.split('/').pop();
      if (fileName) {
        console.log('Removing signature:', fileName);
        const { error } = await supabase.storage
          .from('signatures')
          .remove([fileName]);

        if (error) {
          console.error('Error removing signature:', error);
          toast({
            title: "Error",
            description: "Failed to remove signature",
            variant: "destructive",
          });
          return;
        }
      }

      onSignatureChange(null);

      toast({
        title: "Signature removed",
        description: "Headteacher signature has been removed",
      });

    } catch (error: any) {
      console.error('Error removing signature:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove signature",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {currentSignatureUrl ? (
        <div className="relative group">
          <img
            src={currentSignatureUrl}
            alt="Headteacher Signature"
            className="w-full h-28 object-contain rounded-lg border bg-muted/20 p-2"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemoveSignature}
              disabled={uploading}
            >
              <X className="w-4 h-4 mr-2" />
              Remove Signature
            </Button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
          } ${uploading ? 'cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} disabled={uploading} />
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin" />
                <p>Uploading...</p>
              </>
            ) : (
              <>
                <PenSquare className="w-8 h-8" />
                {isDragActive ? (
                  <p>Drop the signature here...</p>
                ) : (
                  <p>Drag & drop a signature here, or click to select a file</p>
                )}
                <p className="text-xs">PNG or JPG, max 2MB</p>
              </>
            )}
          </div>
        </div>
      )}

      <Button
        onClick={() => getRootProps().onClick && getRootProps().onClick({} as any)}
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
            {currentSignatureUrl ? 'Change Signature' : 'Upload Signature'}
          </>
        )}
      </Button>
    </div>
  );
};

export default SignatureUpload;