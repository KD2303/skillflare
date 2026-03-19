import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a task title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    skills: {
      type: [String],
      required: [true, 'Please add required skills'],
    },
    creditPoints: {
      type: Number,
      default: 0,
      min: [0, 'Credit points cannot be negative'],
    },
    deadline: {
      type: Date,
      required: [true, 'Please add a deadline'],
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'submitted', 'completed', 'reassigned'],
      default: 'open',
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    posterRole: {
      type: String,
      enum: ['teacher', 'student'],
      required: true,
    },
    takenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    submission: {
      content: {
        type: String,
        default: '',
      },
      submittedAt: {
        type: Date,
        default: null,
      },
      files: [
        {
          name: String,
          url: String,
        },
      ],
    },
    review: {
      satisfied: {
        type: Boolean,
        default: null,
      },
      feedback: {
        type: String,
        default: '',
      },
      reviewedAt: {
        type: Date,
        default: null,
      },
    },
    chatRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatRoom',
      default: null,
    },
    reassignCount: {
      type: Number,
      default: 0,
    },
    previousAssignees: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        reason: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
taskSchema.index({ status: 1, posterRole: 1 });
taskSchema.index({ postedBy: 1 });
taskSchema.index({ takenBy: 1 });
taskSchema.index({ skills: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
