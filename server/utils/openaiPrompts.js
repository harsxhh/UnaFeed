import { openai } from '../config/ai.js';
async function createJsonChatCompletion({ system, user }) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });
  const content = response.choices?.[0]?.message?.content || '{}';
  try {
    return JSON.parse(content);
  } catch (err) {
    console.error('Failed to parse OpenAI response as JSON:', err);
    return {};
  }
}

export async function getClassificationPrompt(text) {
  const system = `You are an AI assistant for a campus social feed. Your job is to analyze user input and create structured posts.

CLASSIFICATION RULES:
- Event: workshops, competitions, meetings, parties, festivals, seminars, talks
- LostFound: lost items, found items, missing belongings
- Announcement: general news, updates, notices, policy changes, department info

IMPORTANT INSTRUCTIONS:
1. Create a CATCHY, ENGAGING title (different from user input)
2. Expand the description with helpful details while keeping the user's core message
3. For dates: convert relative terms to ISO format (YYYY-MM-DDTHH:MM:SS.000Z)
4. Extract specific locations mentioned
5. Don't copy the user's exact words for title/description

Return ONLY valid JSON:
{
  "intent": "Event | LostFound | Announcement",
  "title": "Engaging title that summarizes the post (NOT the user's exact words)",
  "description": "Enhanced description with context and details (expand on user input)",
  "location": "Specific location if mentioned, else null",
  "date": "ISO datetime string (2024-01-15T14:00:00.000Z) or null",
  "department": "Department name for announcements, else null",
  "item": "Specific item name for lost/found, else null"
}

EXAMPLES:
Input: "lost wallet near library"
Output: {"intent": "LostFound", "title": "Missing Wallet - Library Area", "description": "A wallet has been lost somewhere near the library. If you've found it or have any information, please help reunite it with its owner.", "location": "Library", "item": "Wallet", "date": null, "department": null}

Input: "workshop tomorrow 5pm"
Output: {"intent": "Event", "title": "Upcoming Workshop Session", "description": "Join us for an informative workshop session. Don't miss this opportunity to learn and network with fellow students.", "location": null, "date": "2024-12-20T11:30:00.000Z", "department": null, "item": null}`;

  const user = `Analyze this campus post and create structured output: "${text}"`;
  const json = await createJsonChatCompletion({ system, user });

  const validIntents = ['Event', 'LostFound', 'Announcement'];
  return {
    intent: validIntents.includes(json.intent) ? json.intent : 'Announcement',
    title: typeof json.title === 'string' && json.title.trim() ? json.title.trim() : generateFallbackTitle(text),
    description: typeof json.description === 'string' && json.description.trim() ? json.description.trim() : enhanceDescription(text),
    location: typeof json.location === 'string' && json.location.trim() ? json.location.trim() : null,
    date: typeof json.date === 'string' && json.date.trim() ? normalizeDate(json.date.trim()) : null,
    department: typeof json.department === 'string' && json.department.trim() ? json.department.trim() : null,
    item: typeof json.item === 'string' && json.item.trim() ? json.item.trim() : null
  };
}

function generateFallbackTitle(text) {
  const words = text.split(' ').slice(0, 6);
  return words.join(' ').replace(/[.!?]+$/, '') + (words.length < text.split(' ').length ? '...' : '');
}

function enhanceDescription(text) {
  if (text.length < 50) {
    return text + '. More details will be shared soon.';
  }
  return text;
}

function normalizeDate(dateStr) {
  try {
    const lowerDate = dateStr.toLowerCase();
    
    // Get current IST time
    const now = new Date();
    const istNow = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    
    // Handle relative dates
    if (lowerDate.includes('tomorrow')) {
      const tomorrow = new Date(istNow);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Extract time if mentioned
      const timeMatch = lowerDate.match(/(\d{1,2})\s*(am|pm)/);
      if (timeMatch) {
        let hour = parseInt(timeMatch[1]);
        const ampm = timeMatch[2];
        if (ampm === 'pm' && hour !== 12) hour += 12;
        if (ampm === 'am' && hour === 12) hour = 0;
        tomorrow.setHours(hour, 0, 0, 0);
      } else {
        tomorrow.setHours(14, 0, 0, 0); // Default 2 PM IST
      }
      return tomorrow.toISOString();
    }
    
    if (lowerDate.includes('today')) {
      const today = new Date(istNow);
      const timeMatch = lowerDate.match(/(\d{1,2})\s*(am|pm)/);
      if (timeMatch) {
        let hour = parseInt(timeMatch[1]);
        const ampm = timeMatch[2];
        if (ampm === 'pm' && hour !== 12) hour += 12;
        if (ampm === 'am' && hour === 12) hour = 0;
        today.setHours(hour, 0, 0, 0);
      } else {
        today.setHours(14, 0, 0, 0);
      }
      return today.toISOString();
    }
    
    if (lowerDate.includes('next week')) {
      const nextWeek = new Date(istNow);
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(14, 0, 0, 0);
      return nextWeek.toISOString();
    }
    
    // Handle specific day names (monday, tuesday, etc.)
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayMatch = dayNames.find(day => lowerDate.includes(day));
    if (dayMatch) {
      const targetDay = dayNames.indexOf(dayMatch);
      const currentDay = istNow.getDay();
      let daysUntil = targetDay - currentDay;
      if (daysUntil <= 0) daysUntil += 7; // Next occurrence of this day
      
      const targetDate = new Date(istNow);
      targetDate.setDate(targetDate.getDate() + daysUntil);
      
      const timeMatch = lowerDate.match(/(\d{1,2})\s*(am|pm)/);
      if (timeMatch) {
        let hour = parseInt(timeMatch[1]);
        const ampm = timeMatch[2];
        if (ampm === 'pm' && hour !== 12) hour += 12;
        if (ampm === 'am' && hour === 12) hour = 0;
        targetDate.setHours(hour, 0, 0, 0);
      } else {
        targetDate.setHours(14, 0, 0, 0);
      }
      
      return targetDate.toISOString();
    }
    
    // Try to parse as regular date
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
    
    return null;
  } catch (err) {
    return null;
  }
}

export async function checkForToxicity(text) {
  const system =
    'You are a content moderator for a student community. Analyze the given text for toxicity, harassment, hate, sexual explicitness, or inappropriate content. Respond ONLY with a JSON object: { "isToxic": boolean, "message": string }. The message should be a short, constructive warning if toxic, otherwise a brief reassurance.';
  const user = `Analyze toxicity for: ${text}`;
  const json = await createJsonChatCompletion({ system, user });
  return {
    isToxic: Boolean(json.isToxic),
    message: typeof json.message === 'string' && json.message.trim().length > 0
      ? json.message
      : json.isToxic
        ? 'This content may be harmful or inappropriate for the community.'
        : 'No toxicity detected.',
  };
}

export async function generateMemePrompt(text) {
  const system =
    'You turn short campus-related prompts into fun meme captions. Return JSON: { "caption": string, "style": string }. Keep it safe for school.';
  const user = `Create a meme idea for: ${text}`;
  const json = await createJsonChatCompletion({ system, user });
  const caption = json.caption || `When ${text} hits different`;
  const style = json.style || 'dank-classic';
  return { caption, style };
}

export async function generateMemeImage(promptText) {
  try {
    const res = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: `Meme style image: ${promptText}. Keep it safe for school.`,
      size: '1024x1024',
    });
    const url = res.data?.[0]?.url || null;
    return url;
  } catch (err) {
    console.error('Error generating meme image:', err);
    return null;
  }
}

