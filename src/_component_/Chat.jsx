import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { Nav } from "../Home/Nav";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "../Context/AuthContext";
import { ArrowLeft, Send, Check, Smile } from "lucide-react";
import { StickerPicker } from "./StickerPicker";

export const Chat = () => {
  const { recipientId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isStickerPickerOpen, setIsStickerPickerOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const chatId = [user.uid, recipientId].sort().join("_");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchRecipient = async () => {
      const userDoc = await getDoc(doc(db, "users", recipientId));
      if (userDoc.exists()) {
        setRecipientInfo(userDoc.data());
      }
    };
    fetchRecipient();
  }, [recipientId]);

  useEffect(() => {
    const statusRef = doc(db, "status", recipientId);
    const unsubscribe = onSnapshot(statusRef, (doc) => {
      if (doc.exists()) {
        setIsOnline(doc.data().state === "online");
      }
    });
    return () => unsubscribe();
  }, [recipientId]);

  useEffect(() => {
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messagesData);

      snapshot.docs.forEach(async (msgDoc) => {
        const msgData = msgDoc.data();
        if (msgData.receiverId === user.uid && !msgData.read) {
          await updateDoc(doc(db, "chats", chatId, "messages", msgDoc.id), {
            read: true,
          });
        }
      });
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [chatId, user.uid]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    setIsSending(true);
    const messageText = message.trim();

    try {
      await setDoc(
        doc(db, "chats", chatId),
        { lastUpdated: serverTimestamp() },
        { merge: true }
      );

      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: messageText,
        senderId: user.uid,
        receiverId: recipientId,
        timestamp: serverTimestamp(),
        read: false,
      });

      await addDoc(collection(db, "notifications"), {
        userId: recipientId,
        type: "message",
        senderId: user.uid,
        senderEmail: user.email,
        senderName: user.displayName || user.email,
        message: messageText.slice(0, 50),
        chatId: chatId,
        read: false,
        timestamp: serverTimestamp(),
      });

      setMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const sendSticker = async (sticker) => {
    if (isSending) return;
    
    setIsSending(true);
    
    try {
      await setDoc(
        doc(db, "chats", chatId),
        { lastUpdated: serverTimestamp() },
        { merge: true }
      );

      await addDoc(collection(db, "chats", chatId, "messages"), {
        type: "sticker",
        stickerUrl: sticker.url,
        stickerName: sticker.name,
        senderId: user.uid,
        receiverId: recipientId,
        timestamp: serverTimestamp(),
        read: false,
      });

      await addDoc(collection(db, "notifications"), {
        userId: recipientId,
        type: "message",
        senderId: user.uid,
        senderEmail: user.email,
        senderName: user.displayName || user.email,
        message: "🎨 Sent a sticker",
        chatId: chatId,
        read: false,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to send sticker:", err);
    } finally {
      setIsSending(false);
    }
  };


  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Nav />

      {/* Chat Container - Full height minus Nav */}
      <div className="flex-1 flex flex-col pt-0 md:pt-16 max-w-4xl mx-auto w-full overflow-hidden">

        {/* Chat Header - Sticky at top */}
        <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 z-10 transition-colors">
          <button onClick={() => navigate(-1)} className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition">
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                {recipientInfo?.email?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white dark:border-gray-800 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`}></div>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white leading-tight">
                {recipientInfo?.name || recipientInfo?.email?.split('@')[0]}
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400 block">
                {isOnline ? "Active now" : "Offline"}
              </span>
            </div>
          </div>
        </div>

        {/* Messages Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 transition-colors no-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === user.uid ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`${msg.type === "sticker" ? "max-w-[150px]" : "max-w-[75%] px-4 py-2"
                  } rounded-2xl ${msg.senderId === user.uid
                    ? msg.type === "sticker" ? "" : "bg-green-600 text-white rounded-tr-none"
                    : msg.type === "sticker" ? "" : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 rounded-tl-none"
                  }`}
              >
                {/* Render sticker or text */}
                {msg.type === "sticker" ? (
                  <div>
                    <img
                      src={msg.stickerUrl}
                      alt={msg.stickerName || "Sticker"}
                      className="w-32 h-32 object-contain"
                    />
                    <div className="text-[10px] mt-1 flex items-center justify-end gap-1 text-gray-400 dark:text-gray-500">
                      <span>{formatTime(msg.timestamp)}</span>
                      {msg.senderId === user.uid && msg.read && <Check size={12} strokeWidth={3} className="text-green-500" />}
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-[15px]">{msg.text}</p>
                    <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${msg.senderId === user.uid ? "text-green-100" : "text-gray-400 dark:text-gray-500"}`}>
                      <span>{formatTime(msg.timestamp)}</span>
                      {msg.senderId === user.uid && msg.read && <Check size={12} strokeWidth={3} />}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="p-3 bg-white dark:bg-gray-800 border-t dark:border-gray-700 transition-colors mb-0 relative">
          <form onSubmit={sendMessage} className="flex gap-2 items-center bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 transition-colors">
            {/* Sticker button */}
            <button
              type="button"
              onClick={() => setIsStickerPickerOpen(!isStickerPickerOpen)}
              disabled={isSending}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Smile size={20} />
            </button>

            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message..."
              disabled={isSending}
              className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm py-2 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!message.trim() || isSending}
              className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </form>

          {/* Sticker Picker */}
          <StickerPicker
            isOpen={isStickerPickerOpen}
            onClose={() => setIsStickerPickerOpen(false)}
            onSelectSticker={sendSticker}
          />
        </div>
      </div>
    </div>
  );
};
