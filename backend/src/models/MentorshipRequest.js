import mongoose from 'mongoose';

const mentorshipRequestSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    skill: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending',
    },
    sessionDate: {
      type: Date,
      required: true,
    },
    creditsUsed: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const MentorshipRequest = mongoose.model('MentorshipRequest', mentorshipRequestSchema);

export default MentorshipRequest;
