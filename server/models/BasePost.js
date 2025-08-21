import mongoose from 'mongoose';

const { Schema } = mongoose;

const baseOptions = {
  discriminatorKey: 'kind',
  timestamps: true,
};

const BasePostSchema = new Schema(
  {
    authorId: { type: String, required: true }, // Simulated via deviceId cookie
    title: { type: String, required: true },
    description: { type: String, required: true },
    tags: [{ type: String }],
    reactions: [
      {
        userId: String,
        type: { type: String }, // like, love, wow, etc.
      },
    ],
    meta: {
      views: { type: Number, default: 0 },
    },
  },
  baseOptions,
);

export default mongoose.model('Post', BasePostSchema);
