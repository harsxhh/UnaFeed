import Post from './BasePost.js';
import mongoose from 'mongoose';

const { Schema } = mongoose;

// Event Post
const EventPostSchema = new Schema({
  date: { type: Date, required: true },
  location: { type: String, required: true },
  rsvps: [
    {
      userId: { type: String, required: true },
      status: { type: String, enum: ['going', 'not_going'], required: true },
      updatedAt: { type: Date, default: Date.now },
    },
  ],
});

// Lost & Found Post
const LostFoundPostSchema = new Schema({
  itemName: { type: String, required: true },
  imageUrl: { type: String, default: null },
  contactInfo: { type: String, required: true },
  status: { type: String, enum: ['lost', 'found'], required: true },
});

// Announcement Post
const AnnouncementPostSchema = new Schema({
  pdfUrl: { type: String, default: null },
  importance: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
});

export const EventPost = Post.discriminator('Event', EventPostSchema);
export const LostFoundPost = Post.discriminator('LostFound', LostFoundPostSchema);
export const AnnouncementPost = Post.discriminator('Announcement', AnnouncementPostSchema);

export default Post;


