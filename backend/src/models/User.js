import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["teacher", "student"],
      required: [true, "Please select a role"],
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot be more than 500 characters"],
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    portfolio: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    creditPoints: {
      type: Number,
      default: 0,
    },
    ratingPoints: {
      type: Number,
      default: 0,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    tasksCompleted: {
      type: Number,
      default: 0,
    },
    tasksPosted: {
      type: Number,
      default: 0,
    },
    ratings: [
      {
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        review: String,
        ratedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        taskId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Task",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    isMentor: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Encrypt password using bcrypt
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (
    typeof enteredPassword !== "string" ||
    typeof this.password !== "string" ||
    !this.password
  ) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

// Calculate total points
userSchema.methods.calculateTotalPoints = function () {
  this.totalPoints = this.creditPoints + this.ratingPoints;
  return this.totalPoints;
};

// Calculate average rating
userSchema.methods.calculateAverageRating = function () {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    return;
  }
  const sum = this.ratings.reduce((acc, item) => acc + item.rating, 0);
  this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
};

// Compound index for leaderboard sort (totalPoints DESC, tasksCompleted DESC)
userSchema.index({ totalPoints: -1, tasksCompleted: -1 });

const User = mongoose.model("User", userSchema);

export default User;
