// Mock post classification service
// This simulates the backend API response format

// Mock data for different post types
const mockResponses = {
  event: {
    intent: "Event",
    title: "Docker Workshop",
    description: "Learn Docker containerization fundamentals in this hands-on workshop. Perfect for beginners and intermediate developers.",
    location: "CSE Lab 101",
    date: "2024-01-20T14:00:00",
    department: null,
    item: null,
    attachments: []
  },
  
  lostFound: {
    intent: "LostFound",
    title: "Lost Black Wallet",
    description: "Lost my black leather wallet near the library yesterday evening. Contains my student ID and some cash.",
    location: "Library entrance",
    date: null,
    department: null,
    item: "Black leather wallet with student ID",
    attachments: []
  },
  
  announcement: {
    intent: "Announcement",
    title: "New Timetable for CSE Department",
    description: "Updated class schedule for Computer Science Engineering students starting next week. Check the attached circular for details.",
    location: null,
    date: null,
    department: "Computer Science Engineering",
    item: null,
    attachments: [
      { name: "CSE_Timetable_2024.pdf", type: "pdf" }
    ]
  },
  
  codingCompetition: {
    intent: "Event",
    title: "Annual Coding Competition",
    description: "Showcase your programming skills in our annual coding competition. Prizes worth ₹50,000 to be won!",
    location: "Main Auditorium",
    date: "2024-01-25T10:00:00",
    department: null,
    item: null,
    attachments: [
      { name: "Competition_Rules.pdf", type: "pdf" }
    ]
  },
  
  foundKeys: {
    intent: "LostFound",
    title: "Found Set of Keys",
    description: "Found a set of keys with a keychain in the cafeteria. If these are yours, please contact me.",
    location: "Cafeteria",
    date: null,
    department: null,
    item: "Set of keys with keychain",
    attachments: []
  }
}

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Mock classification function that simulates the backend response
export async function classifyPostClient(prompt) {
  // Simulate API processing time
  await delay(1500)
  
  const lowerPrompt = prompt.toLowerCase()
  
  // Simple keyword-based classification (will be replaced with actual AI)
  if (lowerPrompt.includes('workshop') || lowerPrompt.includes('event') || 
      lowerPrompt.includes('competition') || lowerPrompt.includes('fest')) {
    if (lowerPrompt.includes('coding') || lowerPrompt.includes('competition')) {
      return mockResponses.codingCompetition
    }
    return mockResponses.event
  } else if (lowerPrompt.includes('lost') || lowerPrompt.includes('found') || 
             lowerPrompt.includes('wallet') || lowerPrompt.includes('keys')) {
    if (lowerPrompt.includes('found')) {
      return mockResponses.foundKeys
    }
    return mockResponses.lostFound
  } else if (lowerPrompt.includes('timetable') || lowerPrompt.includes('announcement') || 
             lowerPrompt.includes('department') || lowerPrompt.includes('circular')) {
    return mockResponses.announcement
  } else {
    // Default to event if unclear
    return mockResponses.event
  }
}

// Mock function to post the final content to the feed
export async function postToFeed(postData) {
  await delay(1000)
  
  // Simulate successful posting
  return {
    success: true,
    postId: Date.now().toString(),
    message: "Post successfully added to feed"
  }
}

// Mock function to get feed posts
export async function getFeedPosts() {
  await delay(800)
  
  return [
    mockResponses.event,
    mockResponses.lostFound,
    mockResponses.announcement,
    mockResponses.codingCompetition,
    mockResponses.foundKeys
  ]
}
