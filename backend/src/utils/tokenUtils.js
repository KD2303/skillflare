import jwt from "jsonwebtoken";

// Generate JWT Token
export const generateToken = (id) => {
  const expiresIn = process.env.JWT_EXPIRE || "7d";
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn,
  });
};

// Send token response with cookie
export const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  // Remove password from output
  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    bio: user.bio,
    skills: user.skills,
    portfolio: user.portfolio,
    avatar: user.avatar,
    creditPoints: user.creditPoints,
    ratingPoints: user.ratingPoints,
    totalPoints: user.totalPoints,
    tasksCompleted: user.tasksCompleted,
    tasksPosted: user.tasksPosted,
    averageRating: user.averageRating,
    createdAt: user.createdAt,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user: userData,
  });
};
