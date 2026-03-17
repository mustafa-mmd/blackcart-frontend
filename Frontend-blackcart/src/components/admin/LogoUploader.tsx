import React, { useState, useRef } from 'react';
import { Camera, Loader, Check, AlertCircle, X } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface Props {
  onUpload?: (logo: { url: string; alt: string }) => void;
  className?: string;
}

const LogoUploader: React.FC<Props> = ({ onUpload, className = '' }) => {
  const { settings, uploadLogo } = useSettings();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return 'Please select an image file (JPEG, PNG, GIF, WEBP, SVG)';
    }

    if (file.size > 2 * 1024 * 1024) {
      return 'File size must be less than 2MB';
    }

    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const alt = prompt('Enter logo alt text (optional):', settings.general?.storeName) || settings.general?.storeName;
      const logoData = await uploadLogo(file, alt);
      
      setSuccess(true);
      if (onUpload) {
        onUpload(logoData);
      }
      
      setTimeout(() => {
        setPreview(null);
        setSuccess(false);
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to upload logo');
      setPreview(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePreview = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-6">
        <div className="relative group">
          <div className="w-48 h-16 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
            {preview ? (
              <img 
                src={preview} 
                alt="Preview" 
                className="max-w-full max-h-full object-contain"
              />
            ) : settings.logo?.url ? (
              <img 
                src={settings.logo.url} 
                alt={settings.logo.alt} 
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'150\' height=\'40\' viewBox=\'0 0 150 40\'%3E%3Crect width=\'150\' height=\'40\' fill=\'%23f0f0f0\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Arial\' font-size=\'14\' fill=\'%23999\'%3ELogo%3C/text%3E%3C/svg%3E';
                }}
              />
            ) : (
              <Camera className="h-8 w-8 text-gray-400" />
            )}
          </div>
          
          {!isUploading && !preview && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <Camera className="h-6 w-6 text-white" />
            </button>
          )}

          {preview && !isUploading && (
            <button
              onClick={handleRemovePreview}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">Site Logo</h3>
          <p className="text-xs text-gray-500 mt-1">
            Recommended: PNG or SVG, 200x60px, max 2MB
          </p>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition"
          >
            {isUploading ? (
              <span className="flex items-center">
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </span>
            ) : (
              'Change Logo'
            )}
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
        onChange={handleFileSelect}
        className="hidden"
      />

      {success && (
        <div className="flex items-center text-green-600 text-sm bg-green-50 p-2 rounded-lg">
          <Check className="h-4 w-4 mr-1 flex-shrink-0" />
          Logo uploaded successfully!
        </div>
      )}

      {error && (
        <div className="flex items-center text-red-600 text-sm bg-red-50 p-2 rounded-lg">
          <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
};

export default LogoUploader;