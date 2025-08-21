import { useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

const CLOUDINARY_CLOUD_NAME = "dl3cveveh";
const CLOUDINARY_UPLOAD_PRESET = "ml_default"; // Using default preset

export default function ImageUpload({ onImageUploaded, onImageRemoved, existingImages = [] }) {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState(existingImages);
  const [dragOver, setDragOver] = useState(false);

  const uploadToCloudinary = async (file) => {
    try {
      // Upload via backend endpoint - more secure and reliable
      const formData = new FormData();
      formData.append("image", file);

      console.log("Uploading via backend:", file.name, file.size, file.type);

      const response = await fetch('/api/cloudinary/upload', {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);
      
      if (!response.ok) {
        console.error("Backend upload error:", data);
        throw new Error(data.error || data.details || `Upload failed: ${response.status}`);
      }

      return {
        url: data.url,
        publicId: data.publicId,
        width: data.width,
        height: data.height,
      };
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(uploadToCloudinary);
      const uploadedImages = await Promise.all(uploadPromises);
      
      const newImages = [...images, ...uploadedImages];
      setImages(newImages);
      onImageUploaded?.(newImages);
    } catch (error) {
      console.error("Upload error details:", error);
      alert(`Failed to upload images: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e) => {
    handleFileSelect(e.target.files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImageRemoved?.(newImages);
  };

  return (
    <div className="image-upload-container">
      {/* Upload Area */}
      <div
        className={`upload-dropzone ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('image-input').click()}
      >
        <input
          id="image-input"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          style={{ display: 'none' }}
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="upload-loading">
            <div className="upload-spinner"></div>
            <p>Uploading images...</p>
          </div>
        ) : (
          <div className="upload-content">
            <Upload className="upload-icon" />
            <p className="upload-text">
              <strong>Click to upload</strong> or drag and drop images here
            </p>
            <p className="upload-hint">PNG, JPG, GIF up to 10MB each</p>
            <p style={{fontSize: '0.7rem', opacity: 0.6, marginTop: '0.5rem'}}>
              Upload via Backend → Cloudinary ({CLOUDINARY_CLOUD_NAME})
            </p>
          </div>
        )}
      </div>

      {/* Image Preview */}
      {images.length > 0 && (
        <div className="image-preview-grid">
          {images.map((image, index) => (
            <div key={index} className="image-preview-item">
              <img src={image.url} alt={`Upload ${index + 1}`} />
              <button
                type="button"
                className="remove-image-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
