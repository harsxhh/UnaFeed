import { useState, useEffect } from "react";
import PostGenerator from "./components/PostGenerator";
import { getUserSession } from "./services/postService";
import { getFeed, initSession, togglePostReaction, getComments, createComment, toggleCommentReaction, setEventRsvp } from "./services/backend";
import "./App.css";

function App() {
  const [currentView, setCurrentView] = useState('feed'); // 'feed' or 'generator'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSession, setUserSession] = useState(null);
  const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [commentMsg, setCommentMsg] = useState("");
  const [pendingOverride, setPendingOverride] = useState(false);
  const [busy, setBusy] = useState({}); // map of id->boolean for per-post actions
  const [rsvpBusy, setRsvpBusy] = useState({}); // separate busy map for RSVP

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

  async function openComments(postId) {
    setActiveCommentsPostId(postId);
    setCommentInput("");
    setCommentMsg("");
    setPendingOverride(false);
    try {
      const res = await getComments(postId);
      setComments(res.items || []);
    } catch (err) {
      setComments([]);
      setCommentMsg(err?.response?.data?.error || 'Failed to load comments');
    }
  }

  async function submitComment() {
    if (!activeCommentsPostId || !commentInput.trim()) return;
    try {
      const payload = pendingOverride ? { text: commentInput, confirmOverride: true } : { text: commentInput };
      const res = await createComment(activeCommentsPostId, payload);
      if (res && res.warning) {
        setCommentMsg(res.message + ' Click send again to confirm.');
        setPendingOverride(true);
        return;
      }
      setCommentInput("");
      setPendingOverride(false);
      await openComments(activeCommentsPostId);
    } catch (err) {
      setCommentMsg(err?.response?.data?.error || err.message);
    }
  }

  async function reactToPost(postId, type) {
    setBusy((b) => ({ ...b, [postId]: true }));
    try {
      const res = await togglePostReaction(postId, type);
      setPosts((ps) => ps.map((p) => (String(p._id || p.id) === String(postId) ? { ...p, reactions: res.reactions } : p)));
    } catch (err) {
      console.error('Reaction failed', err);
    } finally {
      setBusy((b) => ({ ...b, [postId]: false }));
    }
  }

  async function rsvpEvent(postId, status) {
    setRsvpBusy((b) => ({ ...b, [postId]: true }));
    try {
      const res = await setEventRsvp(postId, status);
      setPosts((ps) => ps.map((p) => (
        String(p._id || p.id) === String(postId)
          ? { ...p, rsvps: res.rsvps || [], counts: res.counts || undefined }
          : p
      )));
    } catch (err) {
      console.error('RSVP failed', err);
    } finally {
      setRsvpBusy((b) => ({ ...b, [postId]: false }));
    }
  }

  function getRsvpCounts(post) {
    const counts = post.counts || {};
    const rsvps = Array.isArray(post.rsvps) ? post.rsvps : [];
    const going = typeof counts.going === 'number' ? counts.going : rsvps.filter((r) => r.status === 'going').length;
    const notGoing = typeof counts.notGoing === 'number' ? counts.notGoing : rsvps.filter((r) => r.status === 'not_going').length;
    return { going, notGoing };
  }

  async function reactToComment(commentId, type) {
    if (!activeCommentsPostId) return;
    try {
      const res = await toggleCommentReaction(activeCommentsPostId, commentId, type);
      setComments((cs) => cs.map((c) => (c._id === commentId ? { ...c, reactions: res.reactions } : c)));
    } catch (err) {
      console.error('Comment reaction failed', err);
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
                  
                  {/* Images */}
                  {post.images && post.images.length > 0 && (
                    <div className="post-images">
                      <div className="post-images-grid">
                        {post.images.slice(0, 4).map((image, index) => (
                          <div key={index} className="post-image-item">
                            <img src={image.url} alt={`Post image ${index + 1}`} />
                          </div>
                        ))}
                        {post.images.length > 4 && (
                          <div className="post-image-more">
                            +{post.images.length - 4} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
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
                  {intent === 'Event' && (
                    (() => {
                      const { going, notGoing } = getRsvpCounts(post);
                      return (
                        <div className="post-detail">
                          <span className="detail-icon">🗳️</span>
                          <button
                            disabled={!!rsvpBusy[post._id || post.id]}
                            className="stat-item"
                            onClick={() => rsvpEvent(post._id || post.id, 'going')}
                          >
                            I am coming ({going})
                          </button>
                          <button
                            disabled={!!rsvpBusy[post._id || post.id]}
                            className="stat-item"
                            onClick={() => rsvpEvent(post._id || post.id, 'not_going')}
                          >
                            Not coming ({notGoing})
                          </button>
                        </div>
                      );
                    })()
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
                    <button disabled={!!busy[post._id || post.id]} className="stat-item" onClick={() => reactToPost(post._id || post.id, 'like')}>
                      👍 {(post.reactions || []).filter(r=>r.type==='like').length}
                    </button>
                    <button disabled={!!busy[post._id || post.id]} className="stat-item" onClick={() => reactToPost(post._id || post.id, 'love')}>
                      ❤️ {(post.reactions || []).filter(r=>r.type==='love').length}
                    </button>
                    <button disabled={!!busy[post._id || post.id]} className="stat-item" onClick={() => reactToPost(post._id || post.id, 'wow')}>
                      😮 {(post.reactions || []).filter(r=>r.type==='wow').length}
                    </button>
                    <button disabled={!!busy[post._id || post.id]} className="stat-item" onClick={() => reactToPost(post._id || post.id, 'laugh')}>
                      😂 {(post.reactions || []).filter(r=>r.type==='laugh').length}
                    </button>
                    <button disabled={!!busy[post._id || post.id]} className="stat-item" onClick={() => reactToPost(post._id || post.id, 'sad')}>
                      😢 {(post.reactions || []).filter(r=>r.type==='sad').length}
                    </button>
                    <button className="stat-item" onClick={() => openComments(post._id || post.id)}>
                      💬 Comments
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {activeCommentsPostId && (
          <div className="comments-panel">
            <div className="comments-header">
              <span>Comments</span>
              <button onClick={() => setActiveCommentsPostId(null)} className="close-comments">×</button>
            </div>
            <div className="comments-list">
              {comments.map((c) => (
                <div key={c._id} className="comment-item">
                  <div className="comment-text">{c.text}</div>
                  <div className="comment-actions">
                    <button onClick={() => reactToComment(c._id, 'like')}>
                      👍 {(c.reactions || []).filter(r=>r.type==='like').length}
                    </button>
                    <button onClick={() => reactToComment(c._id, 'love')}>
                      ❤️ {(c.reactions || []).filter(r=>r.type==='love').length}
                    </button>
                    <button onClick={() => reactToComment(c._id, 'wow')}>
                      😮 {(c.reactions || []).filter(r=>r.type==='wow').length}
                    </button>
                    <button onClick={() => reactToComment(c._id, 'laugh')}>
                      😂 {(c.reactions || []).filter(r=>r.type==='laugh').length}
                    </button>
                    <button onClick={() => reactToComment(c._id, 'sad')}>
                      😢 {(c.reactions || []).filter(r=>r.type==='sad').length}
                    </button>
                  </div>
                </div>
              ))}
              {comments.length === 0 && <div className="no-comments">No comments yet.</div>}
            </div>
            <div className="comments-input">
              <input value={commentInput} onChange={(e)=>setCommentInput(e.target.value)} placeholder="Write a comment..." />
              <button onClick={submitComment}>Send</button>
            </div>
            {commentMsg && <div className="comments-message">{commentMsg}</div>}
          </div>
        )}
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
