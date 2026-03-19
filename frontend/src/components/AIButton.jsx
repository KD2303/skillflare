/**
 * AI Button Component
 * Floating circular button for easy AI chat access
 */

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { AIChat } from "./index.js";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/aiButton.css";

export const AIButton = ({ taskId, submissionId }) => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Only show button for authenticated users
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="ai-float-button"
        title="Open AI Assistant"
        aria-label="Open AI Assistant"
      >
        {isOpen ? (
          <X size={24} className="ai-icon" />
        ) : (
          <MessageCircle size={24} className="ai-icon" />
        )}
      </button>

      {/* AI Chat Modal */}
      {isOpen && (
        <div className="ai-modal-overlay">
          <div className="ai-modal-container">
            <AIChat
              taskId={taskId}
              submissionId={submissionId}
              onClose={() => setIsOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default AIButton;
