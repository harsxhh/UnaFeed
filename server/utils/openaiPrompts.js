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
  const system = `You are an AI that classifies campus feed posts into exactly one of:
  - Event
  - LostFound
  - Announcement
Return ONLY a valid JSON object with this exact schema (no markdown, no extra text). If a field is not present in the text, set it to null; for attachments, return an array of strings (or []). Do not fabricate details.
{
  "intent": "Event | LostFound | Announcement",
  "title": "Short title of the post",
  "description": "Detailed description in the user's words",
  "location": "Extracted location if mentioned, else null",
  "date": "Extracted date/time if mentioned, else null",
  "department": "For Announcements only, else null",
  "item": "For Lost & Found only, else null"
}`;
  const user = `Classify and extract fields from this text: ${text}`;
  const json = await createJsonChatCompletion({ system, user });

  const validIntents = ['Event', 'LostFound', 'Announcement'];
  return {
    intent: validIntents.includes(json.intent) ? json.intent : 'Announcement',
    title: typeof json.title === 'string' ? json.title : '',
    description: typeof json.description === 'string' ? json.description : '',
    location:
      typeof json.location === 'string' && json.location.trim().length > 0
        ? json.location
        : null,
    date: typeof json.date === 'string' && json.date.trim().length > 0 ? json.date : null,
    department:
      typeof json.department === 'string' && json.department.trim().length > 0
        ? json.department
        : null,
    item: typeof json.item === 'string' && json.item.trim().length > 0 ? json.item : null
  };
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

