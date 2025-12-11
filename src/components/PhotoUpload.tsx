
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PhotoUploadProps {
  currentPhotoUrl?: string | null;
  onPhotoChange: (photoUrl: string | null) => void;
  bucketName?: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ 
  currentPhotoUrl, 
  onPhotoChange, 
  bucketName = 'student-photos' 
}) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
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
      // Delete old photo if exists
      if (currentPhotoUrl) {
        const oldPath = currentPhotoUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from(bucketName)
            .remove([oldPath]);
        }
      }

      // Upload new photo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      onPhotoChange(publicUrl);

      toast({
        title: "Photo uploaded",
        description: "Photo has been successfully uploaded",
      });

    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!currentPhotoUrl) return;

    try {
      const fileName = currentPhotoUrl.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from(bucketName)
          .remove([fileName]);
      }

      onPhotoChange(null);

      toast({
        title: "Photo removed",
        description: "Photo has been removed",
      });

    } catch (error) {
      console.error('Error removing photo:', error);
      toast({
        title: "Error",
        description: "Failed to remove photo",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {currentPhotoUrl && (
        <div className="flex items-center gap-4">
          <img 
            src={currentPhotoUrl} 
            alt="Photo" 
            className="w-16 h-16 object-cover rounded-lg border"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemovePhoto}
            className="text-red-600 hover:text-red-700"
            type="button"
          >
            <X className="w-4 h-4 mr-2" />
            Remove Photo
          </Button>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="photo-upload">Upload Photo</Label>
        <div className="flex items-center gap-2">
          <Input
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="flex-1"
          />
          <Button 
            variant="outline" 
            disabled={uploading}
            className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            type="button"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>
    </div>
  );
};
