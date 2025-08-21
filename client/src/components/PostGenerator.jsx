import { useState } from "react";
import { classifyPostClient, postToFeed } from "../services/postService";
import PostPreview from "./PostPreview";
import "./PostGenerator.css";

export default function PostGenerator() {
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  async function handleGenerate() {
    if (!input.trim()) return;
    setLoading(true);
    setPreview(null);
    setMessage("");
    
    try {
      const result = await classifyPostClient(input);
      setPreview(result);
      setShowPreview(true);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handlePost(postData) {
    setPosting(true);
    try {
      const result = await postToFeed(postData);
      setMessage(result.message);
      setPreview(null);
      setShowPreview(false);
      setInput("");
    } catch (err) {
      setMessage(`Error posting: ${err.message}`);
    } finally {
      setPosting(false);
    }
  }

  function handleEdit(updatedData) {
    setPreview(updatedData);
  }

  function handleCancel() {
    setPreview(null);
    setShowPreview(false);
    setMessage("");
  }

  function handleBackToGenerator() {
    setShowPreview(false);
    setPreview(null);
    setMessage("");
  }

  const examplePrompts = [
    "Lost my black wallet near the library yesterday evening",
    "Workshop on Docker tomorrow at 5pm in CSE Lab",
    "Found a set of keys in the cafeteria",
    "Coding competition this weekend in the auditorium",
    "New timetable for CSE department starting next week"
  ];

  if (showPreview && preview) {
    return (
      <div className="post-generator-container">
        <div className="preview-header-section">
          <button 
            onClick={handleBackToGenerator}
            className="back-button"
          >
            ← Back to Generator
          </button>
          <h2 className="preview-page-title">Preview Your Post</h2>
        </div>
        
        <PostPreview
          previewData={preview}
          onEdit={handleEdit}
          onPost={handlePost}
          onCancel={handleCancel}
          isLoading={posting}
          isInline={true}
        />
      </div>
    );
  }

  return (
    <div className="post-generator-container">
      <div className="generator-header">
        <h1 className="generator-title">IIIT-Una Feed Post Generator</h1>
        <p className="generator-subtitle">
          Type naturally and let AI help you create the perfect campus post
        </p>
      </div>

      <div className="input-section">
        <div className="input-wrapper">
          <textarea
            className="post-input"
            rows={4}
            placeholder="Describe what you want to post... e.g., 'Lost my black wallet near the library yesterday evening' or 'Workshop on Docker tomorrow at 5pm in CSE Lab'"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          
          <button
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
            className="generate-button"
          >
            {loading ? (
              <div className="loading-spinner" />
            ) : (
              <>
                <span>✨</span>
                Generate Preview
              </>
            )}
          </button>
        </div>

        {/* Example prompts */}
        <div className="example-prompts">
          <h3>Try these examples:</h3>
          <div className="example-buttons">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => setInput(example)}
                className="example-button"
                disabled={loading}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Message display */}
      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
          <button onClick={() => setMessage("")} className="close-message">
            ×
          </button>
        </div>
      )}
    </div>
  );
}
