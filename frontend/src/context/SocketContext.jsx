import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to socket server with JWT authentication
      const socketUrl =
        import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");

      // Don't connect if no token available
      if (!token) {
        console.warn("Socket: No token available, skipping connection");
        return;
      }

      const newSocket = io(socketUrl, {
        transports: ["websocket", "polling"],
        auth: { token },
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        reconnection: true,
      });

      newSocket.on("connect", () => {
        console.log("Socket connected");
        setIsConnected(true);
        // User is auto-joined to personal room via server-side auth
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setIsConnected(false);
      });

      newSocket.on("error", (error) => {
        console.error("Socket error:", error);
      });

      setSocket(newSocket);

      // Cleanup on unmount or auth state change
      return () => {
        if (newSocket) {
          newSocket.disconnect();
        }
      };
    } else {
      // Disconnect socket if user logs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, user]);

  // Socket event helpers with null checks for robustness
  const joinChatRoom = useCallback(
    (chatRoomId) => {
      if (socket?.connected) {
        socket.emit("chat:join", chatRoomId);
      }
    },
    [socket],
  );

  const leaveChatRoom = useCallback(
    (chatRoomId) => {
      if (socket?.connected) {
        socket.emit("chat:leave", chatRoomId);
      }
    },
    [socket],
  );

  const sendMessage = useCallback(
    (chatRoomId, message) => {
      if (socket?.connected) {
        socket.emit("chat:message", { chatRoomId, message });
      }
    },
    [socket],
  );

  const sendTyping = useCallback(
    (chatRoomId, user) => {
      if (socket?.connected) {
        socket.emit("chat:typing", { chatRoomId, user });
      }
    },
    [socket],
  );

  const sendStopTyping = useCallback(
    (chatRoomId, user) => {
      if (socket?.connected) {
        socket.emit("chat:stopTyping", { chatRoomId, user });
      }
    },
    [socket],
  );

  const markMessagesRead = useCallback(
    (chatRoomId, userId) => {
      if (socket?.connected) {
        socket.emit("chat:read", { chatRoomId, userId });
      }
    },
    [socket],
  );

  const value = {
    socket,
    isConnected,
    joinChatRoom,
    leaveChatRoom,
    sendMessage,
    sendTyping,
    sendStopTyping,
    markMessagesRead,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export default SocketContext;
