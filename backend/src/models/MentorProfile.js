import mongoose from 'mongoose';

const mentorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot be more than 500 characters'],
      default: '',
    },
    skills: [
      {
        name: {
          type: String,
          required: true,
        },
        isVerified: {
          type: Boolean,
          default: false,
        },
        verificationDoc: {
          type: String, // file path or cloud URL
        },
        verificationStatus: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending',
        },
      },
    ],
    rating: {
      type: Number,
      default: 0,
    },
    totalSessions: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const MentorProfile = mongoose.model('MentorProfile', mentorProfileSchema);

export default MentorProfile;
