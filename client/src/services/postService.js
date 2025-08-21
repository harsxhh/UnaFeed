// Mock service to simulate backend functions
// In a real app, these would be API calls to your backend

// Generate or retrieve device ID for no-login sessions
function getDeviceId() {
  let deviceId = localStorage.getItem('unafeed_device_id');
  
  if (!deviceId) {
    // Generate a unique device ID
    deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('unafeed_device_id', deviceId);
  }
  
  return deviceId;
}

// Get user session info (simulated)
function getUserSession() {
  const deviceId = getDeviceId();
  const sessionData = localStorage.getItem(`unafeed_session_${deviceId}`);
  
  if (sessionData) {
    return JSON.parse(sessionData);
  }
  
  // Create new session data
  const newSession = {
    deviceId: deviceId,
    username: `User_${deviceId.slice(-6)}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${deviceId}`,
    joinDate: new Date().toISOString(),
    postCount: 0,
    lastActive: new Date().toISOString()
  };
  
  localStorage.setItem(`unafeed_session_${deviceId}`, JSON.stringify(newSession));
  return newSession;
}

// Update user session
function updateUserSession(updates = {}) {
  const deviceId = getDeviceId();
  const currentSession = getUserSession();
  const updatedSession = {
    ...currentSession,
    ...updates,
    lastActive: new Date().toISOString()
  };
  
  localStorage.setItem(`unafeed_session_${deviceId}`, JSON.stringify(updatedSession));
  return updatedSession;
}

// Mock responses for different post types
const mockResponses = {
  Event: {
    intent: "Event",
    title: "Campus Workshop",
    description: "Join us for an exciting workshop on the latest technologies and industry trends.",
    location: "CSE Lab, Block A",
    date: "2024-02-15T14:00:00",
    department: null,
    item: null,
    attachments: []
  },
  LostFound: {
    intent: "LostFound",
    title: "Lost Item Report",
    description: "I lost my personal item and need help finding it.",
    location: "Library",
    date: null,
    department: null,
    item: "Personal item",
    attachments: []
  },
  Announcement: {
    intent: "Announcement",
    title: "Department Update",
    description: "Important announcement regarding department policies and upcoming changes.",
    location: null,
    date: null,
    department: "Computer Science",
    item: null,
    attachments: []
  }
};

// Simulate API delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Mock function to classify post intent
export async function classifyPostClient(prompt) {
  await delay(1000); // Simulate API call delay
  
  // Simple keyword-based classification (in real app, this would be AI-powered)
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('lost') || lowerPrompt.includes('found') || 
      lowerPrompt.includes('wallet') || lowerPrompt.includes('keys') || 
      lowerPrompt.includes('item')) {
    return {
      ...mockResponses.LostFound,
      title: prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt,
      description: prompt,
      location: extractLocation(prompt),
      item: extractItem(prompt)
    };
  } else if (lowerPrompt.includes('workshop') || lowerPrompt.includes('event') || 
             lowerPrompt.includes('competition') || lowerPrompt.includes('fest') ||
             lowerPrompt.includes('tomorrow') || lowerPrompt.includes('next week')) {
    return {
      ...mockResponses.Event,
      title: prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt,
      description: prompt,
      location: extractLocation(prompt),
      date: extractDate(prompt)
    };
  } else {
    return {
      ...mockResponses.Announcement,
      title: prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt,
      description: prompt,
      department: extractDepartment(prompt)
    };
  }
}

// Helper functions to extract information from prompts
function extractLocation(prompt) {
  const locationKeywords = ['library', 'cafeteria', 'lab', 'auditorium', 'cse lab', 'block'];
  const lowerPrompt = prompt.toLowerCase();
  
  for (const keyword of locationKeywords) {
    if (lowerPrompt.includes(keyword)) {
      return keyword.charAt(0).toUpperCase() + keyword.slice(1);
    }
  }
  
  return null;
}

function extractItem(prompt) {
  const itemKeywords = ['wallet', 'keys', 'phone', 'laptop', 'book', 'bag'];
  const lowerPrompt = prompt.toLowerCase();
  
  for (const keyword of itemKeywords) {
    if (lowerPrompt.includes(keyword)) {
      return keyword.charAt(0).toUpperCase() + keyword.slice(1);
    }
  }
  
  return 'Personal item';
}

function extractDate(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('tomorrow')) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0); // 2 PM default
    return tomorrow.toISOString();
  } else if (lowerPrompt.includes('next week')) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(14, 0, 0, 0); // 2 PM default
    return nextWeek.toISOString();
  } else if (lowerPrompt.includes('today')) {
    const today = new Date();
    today.setHours(14, 0, 0, 0); // 2 PM default
    return today.toISOString();
  }
  
  return null;
}

function extractDepartment(prompt) {
  const deptKeywords = ['cse', 'computer science', 'ece', 'electrical', 'mechanical', 'civil'];
  const lowerPrompt = prompt.toLowerCase();
  
  for (const keyword of deptKeywords) {
    if (lowerPrompt.includes(keyword)) {
      if (keyword === 'cse') return 'Computer Science';
      if (keyword === 'ece') return 'Electrical Engineering';
      return keyword.charAt(0).toUpperCase() + keyword.slice(1);
    }
  }
  
  return 'General';
}

// Mock function to post to feed
export async function postToFeed(postData) {
  await delay(1500); // Simulate API call delay
  
  // Get current user session
  const userSession = getUserSession();
  
  // Create post with user info
  const post = {
    id: 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    ...postData,
    author: {
      deviceId: userSession.deviceId,
      username: userSession.username,
      avatar: userSession.avatar
    },
    createdAt: new Date().toISOString(),
    likes: 0,
    comments: [],
    status: 'active'
  };
  
  // Store post in localStorage (simulating database)
  const existingPosts = JSON.parse(localStorage.getItem('unafeed_posts') || '[]');
  existingPosts.unshift(post);
  localStorage.setItem('unafeed_posts', JSON.stringify(existingPosts));
  
  // Update user's post count
  updateUserSession({ postCount: userSession.postCount + 1 });
  
  return {
    success: true,
    message: `Post "${postData.title}" has been successfully added to the feed!`,
    postId: post.id
  };
}

// Mock function to get feed posts
export async function getFeedPosts() {
  await delay(800); // Simulate API call delay
  
  const posts = JSON.parse(localStorage.getItem('unafeed_posts') || '[]');
  return posts;
}

// Export session management functions
export { getUserSession, updateUserSession, getDeviceId };
