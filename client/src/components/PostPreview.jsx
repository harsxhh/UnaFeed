import { useState } from "react";
import { Edit3, Save, X, MapPin, Calendar, Building2, Package, FileText, Image as ImageIcon } from "lucide-react";

export default function PostPreview({ 
  previewData, 
  onEdit, 
  onPost, 
  onCancel, 
  isLoading = false,
  isInline = false 
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({ ...previewData });

  function handleEdit() {
    setEditMode(true);
    setEditedData({ ...previewData });
  }

  function handleSave() {
    onEdit(editedData);
    setEditMode(false);
  }

  function handleCancelEdit() {
    setEditedData({ ...previewData });
    setEditMode(false);
  }

  function getPostTypeStyles() {
    switch (previewData.intent) {
      case "Event":
        return {
          color: "#10b981",
          borderColor: "#10b981",
          bgColor: "rgba(16, 185, 129, 0.1)"
        };
      case "LostFound":
        return {
          color: "#f59e0b",
          borderColor: "#f59e0b",
          bgColor: "rgba(245, 158, 11, 0.1)"
        };
      case "Announcement":
        return {
          color: "#8b5cf6",
          borderColor: "#8b5cf6",
          bgColor: "rgba(139, 92, 246, 0.1)"
        };
      default:
        return {
          color: "#6b7280",
          borderColor: "#6b7280",
          bgColor: "rgba(107, 114, 128, 0.1)"
        };
    }
  }

  function formatDate(dateString) {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateString;
    }
  }

  function renderEventSection() {
    if (previewData.intent !== "Event") return null;
    
    return (
      <div className="preview-section">
        <div className="section-header">
          <Calendar className="section-icon" />
          <h4>Event Details</h4>
        </div>
        <div className="detail-grid">
          {previewData.location && (
            <div className="detail-item">
              <MapPin className="detail-icon" />
              <span className="detail-label">Location:</span>
              <span className="detail-value">{previewData.location}</span>
            </div>
          )}
          {previewData.date && (
            <div className="detail-item">
              <Calendar className="detail-icon" />
              <span className="detail-label">Date:</span>
              <span className="detail-value">{formatDate(previewData.date)}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderLostFoundSection() {
    if (previewData.intent !== "LostFound") return null;
    
    return (
      <div className="preview-section">
        <div className="section-header">
          <Package className="section-icon" />
          <h4>Item Details</h4>
        </div>
        <div className="detail-grid">
          {previewData.item && (
            <div className="detail-item">
              <Package className="detail-icon" />
              <span className="detail-label">Item:</span>
              <span className="detail-value">{previewData.item}</span>
            </div>
          )}
          {previewData.location && (
            <div className="detail-item">
              <MapPin className="detail-icon" />
              <span className="detail-label">Location:</span>
              <span className="detail-value">{previewData.location}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderAnnouncementSection() {
    if (previewData.intent !== "Announcement") return null;
    
    return (
      <div className="preview-section">
        <div className="section-header">
          <Building2 className="section-icon" />
          <h4>Announcement Details</h4>
        </div>
        <div className="detail-grid">
          {previewData.department && (
            <div className="detail-item">
              <Building2 className="detail-icon" />
              <span className="detail-label">Department:</span>
              <span className="detail-value">{previewData.department}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderAttachments() {
    if (!previewData.attachments || previewData.attachments.length === 0) return null;
    
    return (
      <div className="preview-section">
        <div className="section-header">
          <FileText className="section-icon" />
          <h4>Attachments</h4>
        </div>
        <div className="attachments-grid">
          {previewData.attachments.map((attachment, index) => (
            <div key={index} className="attachment-item">
              <ImageIcon className="attachment-icon" />
              <span className="attachment-name">{attachment}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const typeStyles = getPostTypeStyles();

  if (isInline) {
    return (
      <div className="inline-preview-container">
        <div className="preview-content">
          {/* Post Type Badge */}
          <div className="preview-type-badge" style={{
            color: typeStyles.color,
            borderColor: typeStyles.color,
            backgroundColor: typeStyles.bgColor
          }}>
            {previewData.intent}
          </div>

          {/* Title */}
          <div className="preview-field">
            <label className="field-label">Title</label>
            {editMode ? (
              <input
                type="text"
                className="edit-input title-input"
                value={editedData.title}
                onChange={(e) => setEditedData({...editedData, title: e.target.value})}
                placeholder="Enter post title"
              />
            ) : (
              <h3 className="preview-title">{previewData.title}</h3>
            )}
          </div>

          {/* Description */}
          <div className="preview-field">
            <label className="field-label">Description</label>
            {editMode ? (
              <textarea
                className="edit-textarea"
                value={editedData.description}
                onChange={(e) => setEditedData({...editedData, description: e.target.value})}
                placeholder="Enter post description"
              />
            ) : (
              <p className="preview-description">{previewData.description}</p>
            )}
          </div>

          {/* Type-specific sections */}
          {renderEventSection()}
          {renderLostFoundSection()}
          {renderAnnouncementSection()}
          {renderAttachments()}

          {/* Action Buttons */}
          <div className="preview-footer">
            <div className="preview-info">
              <span className="info-text">
                <span className="info-icon">ℹ️</span>
                Review and edit your post before publishing
              </span>
            </div>
            <div className="footer-actions">
              {editMode ? (
                <>
                  <button 
                    onClick={handleSave}
                    className="button primary"
                    disabled={isLoading}
                  >
                    <span className="button-icon">💾</span>
                    Save Changes
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    className="button secondary"
                  >
                    Cancel Edit
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={handleEdit}
                    className="button secondary"
                  >
                    <span className="button-icon">✏️</span>
                    Edit Post
                  </button>
                  <button 
                    onClick={() => onPost(editMode ? editedData : previewData)}
                    className="button primary"
                    disabled={isLoading}
                  >
                    <span className="button-icon">📤</span>
                    {isLoading ? "Posting..." : "Post to Feed"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modal overlay version (kept for backward compatibility)
  return (
    <div className="post-preview-overlay">
      <div className="post-preview-container">
        {/* Preview Header */}
        <div className="preview-header">
          <div className="preview-type-badge" style={{
            color: typeStyles.color,
            borderColor: typeStyles.color,
            backgroundColor: typeStyles.bgColor
          }}>
            {previewData.intent}
          </div>
          <div className="preview-actions">
            <button 
              onClick={handleEdit}
              className="action-button secondary"
              title="Edit post"
            >
              <Edit3 className="action-icon" />
            </button>
            <button 
              onClick={() => onCancel()}
              className="action-button danger"
              title="Cancel"
            >
              <X className="action-icon" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="preview-content">
          {/* Title */}
          <div className="preview-field">
            <label className="field-label">Title</label>
            {editMode ? (
              <input
                type="text"
                className="edit-input title-input"
                value={editedData.title}
                onChange={(e) => setEditedData({...editedData, title: e.target.value})}
                placeholder="Enter post title"
              />
            ) : (
              <h3 className="preview-title">{previewData.title}</h3>
            )}
          </div>

          {/* Description */}
          <div className="preview-field">
            <label className="field-label">Description</label>
            {editMode ? (
              <textarea
                className="edit-textarea"
                value={editedData.description}
                onChange={(e) => setEditedData({...editedData, description: e.target.value})}
                placeholder="Enter post description"
              />
            ) : (
              <p className="preview-description">{previewData.description}</p>
            )}
          </div>

          {/* Type-specific sections */}
          {renderEventSection()}
          {renderLostFoundSection()}
          {renderAnnouncementSection()}
          {renderAttachments()}
        </div>

        {/* Preview Footer */}
        <div className="preview-footer">
          <div className="preview-info">
            <span className="info-text">
              <span className="info-icon">ℹ️</span>
              Review and edit your post before publishing
            </span>
          </div>
          <div className="footer-actions">
            {editMode ? (
              <>
                <button 
                  onClick={handleSave}
                  className="button primary"
                  disabled={isLoading}
                >
                  <span className="button-icon">💾</span>
                  Save Changes
                </button>
                <button 
                  onClick={handleCancelEdit}
                  className="button secondary"
                >
                  Cancel Edit
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleEdit}
                  className="button secondary"
                >
                  <span className="button-icon">✏️</span>
                  Edit Post
                </button>
                <button 
                  onClick={() => onPost(editMode ? editedData : previewData)}
                  className="button primary"
                  disabled={isLoading}
                >
                  <span className="button-icon">📤</span>
                  {isLoading ? "Posting..." : "Post to Feed"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
