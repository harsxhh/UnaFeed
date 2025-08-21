import { useState, useEffect } from "react";
import PostGenerator from "./components/PostGenerator";
import { getUserSession } from "./services/postService";
import { getFeed, initSession } from "./services/backend";
import "./App.css";

function App() {
  const [currentView, setCurrentView] = useState('feed'); // 'feed' or 'generator'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSession, setUserSession] = useState(null);

  useEffect(() => {
    // ensure server sets deviceId cookie; maintain frontend-only display session
    initSession().finally(() => {
      const session = getUserSession();
      setUserSession(session);
      loadPosts();
    });
  }, []);

  async function loadPosts() {
    setLoading(true);
    try {
      const res = await getFeed({ page: 1, limit: 20 });
      setPosts(res.items || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleCreatePost() {
    setCurrentView('generator');
  }

  function handleBackToFeed() {
    setCurrentView('feed');
    loadPosts(); // Refresh posts when returning to feed
  }

  function getPostTypeStyles(intent) {
    switch (intent) {
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
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return null;
    }
  }

  function renderFeed() {
    if (loading) {
      return (
        <div className="feed-loading">
          <div className="loading-spinner"></div>
          <p>Loading campus feed...</p>
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <div className="empty-feed">
          <div className="empty-icon">📝</div>
          <h3>No posts yet</h3>
          <p>Be the first to share something with your campus!</p>
          <button onClick={handleCreatePost} className="create-first-post-btn">
            Create First Post
          </button>
        </div>
      );
    }

    return (
      <div className="feed-container">
        <div className="feed-header">
          <h1 className="feed-title">IIIT-Una Campus Feed</h1>
          <p className="feed-subtitle">Stay updated with campus events, announcements, and lost & found items</p>
          {userSession && (
            <div className="user-welcome">
              Welcome back, {userSession.username}! You've made {userSession.postCount} posts.
            </div>
          )}
        </div>

        <div className="create-post-section">
          <button onClick={handleCreatePost} className="create-post-button">
            ✨ Create New Post
          </button>
        </div>

        <div className="posts-grid">
          {posts.map((post) => {
            const intent = post.intent || post.kind || 'Announcement';
            const typeStyles = getPostTypeStyles(intent);
            return (
              <div key={post._id || post.id} className="post-card">
                <div className="post-header">
                  <div className="post-author">
                    <img 
                      src={post.author?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
                      alt="Avatar" 
                      className="author-avatar"
                    />
                    <div className="author-info">
                      <span className="author-name">{post.author?.username || 'Anonymous'}</span>
                      <span className="post-time">{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                  <div 
                    className="post-type-badge"
                    style={{
                      color: typeStyles.color,
                      borderColor: typeStyles.borderColor,
                      backgroundColor: typeStyles.bgColor
                    }}
                  >
                    {intent}
                  </div>
                </div>

                <div className="post-content">
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-description">{post.description}</p>
                  
                  {/* Post-specific details */}
                  {intent === 'Event' && post.location && (
                    <div className="post-detail">
                      <span className="detail-icon">📍</span>
                      <span>{post.location}</span>
                    </div>
                  )}
                  
                  {intent === 'Event' && post.date && (
                    <div className="post-detail">
                      <span className="detail-icon">📅</span>
                      <span>{formatDate(post.date)}</span>
                    </div>
                  )}
                  
                  {intent === 'LostFound' && (post.item || post.itemName) && (
                    <div className="post-detail">
                      <span className="detail-icon">🔍</span>
                      <span>{post.item || post.itemName}</span>
                    </div>
                  )}
                  
                  {intent === 'Announcement' && post.department && (
                    <div className="post-detail">
                      <span className="detail-icon">🏢</span>
                      <span>{post.department}</span>
                    </div>
                  )}
                </div>

                <div className="post-footer">
                  <div className="post-stats">
                    <span className="stat-item">
                      <span className="stat-icon">❤️</span>
                      {post.likes || 0}
                    </span>
                    <span className="stat-item">
                      <span className="stat-icon">💬</span>
                      {post.comments?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {currentView === 'feed' ? (
        renderFeed()
      ) : (
        <PostGenerator onBackToFeed={handleBackToFeed} />
      )}
    </div>
  );
}

export default App;
