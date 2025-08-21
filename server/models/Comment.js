import mongoose from 'mongoose';

const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    authorId: { type: String, required: true },
    text: { type: String, required: true },
    parentCommentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
    reactions: [
      {
        userId: String,
        type: String,
      },
    ],
    isMeme: { type: Boolean, default: false },
    memeUrl: { type: String, default: null },
  },
  { timestamps: true },
);

export default mongoose.model('Comment', commentSchema);


