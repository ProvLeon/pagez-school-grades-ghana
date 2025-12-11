import { useState, useCallback, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Camera, Loader2, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useStudentForm } from "./StudentFormProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const StudentPhotoSection = () => {
  const { formData, setFormData } = useStudentForm();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Please select JPG, PNG, or WebP";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File must be less than 5MB";
    }
    return null;
  };

  const uploadPhoto = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: "Invalid file",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Delete old photo if exists
      if (formData.photo_url) {
        const oldPath = formData.photo_url.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('student-photos').remove([oldPath]);
        }
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `student-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

      // Upload new photo
      const { error: uploadError } = await supabase.storage
        .from('student-photos')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('student-photos')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, photo_url: publicUrl }));

      toast({ title: "Photo uploaded successfully" });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) uploadPhoto(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadPhoto(file);
  };

  const handleRemovePhoto = async () => {
    if (!formData.photo_url || isRemoving) return;
    setIsRemoving(true);

    try {
      const fileName = formData.photo_url.split('/').pop();
      if (fileName) {
        await supabase.storage.from('student-photos').remove([fileName]);
      }
      setFormData(prev => ({ ...prev, photo_url: null }));
      toast({ title: "Photo removed" });
    } catch (error) {
      console.error('Error removing photo:', error);
      toast({
        title: "Failed to remove photo",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center p-4 rounded-lg border-2 border-dashed transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-muted bg-muted/30"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Avatar */}
      <div className="relative group mb-3">
        <Avatar className="w-24 h-24 ring-2 ring-background shadow-md">
          <AvatarImage
            src={formData.photo_url || undefined}
            alt="Student"
            className="object-cover"
          />
          <AvatarFallback className="bg-muted">
            <User className="w-10 h-10 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>

        {/* Loading overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}

        {/* Hover overlay for existing photo */}
        {formData.photo_url && !isUploading && (
          <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-red-500/50"
              onClick={handleRemovePhoto}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Label */}
      <Label className="text-sm font-medium mb-2">Student Photo</Label>

      {/* Upload button (only when no photo) */}
      {!formData.photo_url && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="text-xs"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Camera className="w-3 h-3 mr-1" />
              Upload Photo
            </>
          )}
        </Button>
      )}

      {/* Helper text */}
      <p className="text-[10px] text-muted-foreground mt-2 text-center">
        {formData.photo_url ? "Hover to change" : "JPG, PNG • Max 5MB"}
      </p>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
