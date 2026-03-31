import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../../firebase";
import { Nav } from "../Home/Nav";
import { toast } from "react-hot-toast";
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
import { ArrowLeft, Send, Check, Smile, Mic, Square, Trash2, Edit, MoreVertical, Paperclip, FileText, X, Plus } from "lucide-react";
import { Avatar } from "./Avatar";
import { StickerPicker } from "./StickerPicker";
import { Loader } from "./Loader";

export const Chat = () => {
  const { recipientId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(true);
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isStickerPickerOpen, setIsStickerPickerOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const [showMenu, setShowMenu] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const currentAudioRef = useRef(null);
  const [playingMessageId, setPlayingMessageId] = useState(null);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const playbackIntervalRef = useRef(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);
  const lastSentTypingStatusRef = useRef(false);

  const chatId = [user.uid, recipientId].sort().join("_");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const playVoiceNote = (audioData, messageId) => {
    // Check if the same audio is already playing
    if (currentAudioRef.current && currentAudioRef.current.src === audioData) {
      if (currentAudioRef.current.paused) {
        // Resume if paused
        currentAudioRef.current.play().catch((error) => {
          console.error("Audio resume failed:", error);
        });
        startPlaybackTimer();
      } else {
        // Pause if playing
        currentAudioRef.current.pause();
        stopPlaybackTimer();
      }
      return;
    }

    // Stop any currently playing audio (different one)
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }
    stopPlaybackTimer();

    // Create and play new audio
    const audio = new Audio(audioData);
    currentAudioRef.current = audio;
    setPlayingMessageId(messageId);
    setCurrentPlaybackTime(0);

    audio.play().catch((error) => {
      console.error("Audio playback failed:", error);
    });

    startPlaybackTimer();

    // Clear reference when audio finishes
    audio.onended = () => {
      currentAudioRef.current = null;
      setPlayingMessageId(null);
      setCurrentPlaybackTime(0);
      stopPlaybackTimer();
    };
  };

  const startPlaybackTimer = () => {
    stopPlaybackTimer(); // Clear any existing timer
    playbackIntervalRef.current = setInterval(() => {
      if (currentAudioRef.current) {
        setCurrentPlaybackTime(currentAudioRef.current.currentTime);
      }
    }, 1000); // Update every 1 second (no milliseconds)
  };

  const stopPlaybackTimer = () => {
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }
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
      setIsChatLoading(false);

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

  // Optimized Typing status sync
  useEffect(() => {
    if (!chatId || !user.uid) return;

    const isNowTyping = message.trim().length > 0;

    const updateStatus = async (val) => {
      if (lastSentTypingStatusRef.current === val) return;
      lastSentTypingStatusRef.current = val;
      
      try {
        const chatRef = doc(db, "chats", chatId);
        await updateDoc(chatRef, {
          [`typing.${user.uid}`]: val
        });
      } catch (err) {
        // Doc missing - silent fail
      }
    };

    if (isNowTyping) {
      updateStatus(true);
      const timeout = setTimeout(() => updateStatus(false), 3000);
      return () => clearTimeout(timeout);
    } else if (lastSentTypingStatusRef.current === true) {
      updateStatus(false);
    }
  }, [message, chatId, user.uid]);

  // Listen for recipient typing status
  useEffect(() => {
    if (!chatId || !recipientId) return;

    const unsubscribe = onSnapshot(doc(db, "chats", chatId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const typingMap = data.typing || {};
        setIsRecipientTyping(!!typingMap[recipientId]);
      }
    });

    return () => unsubscribe();
  }, [chatId, recipientId]);

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      }
      stopPlaybackTimer();
    };
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (fileToUpload) {
      await uploadAndSendFile(message.trim());
      return;
    }

    if (!message.trim() || isSending) return;

    // Cancel any ongoing edit when sending a new message
    if (editingMessage) {
      handleEditCancel();
    }

    setIsSending(true);
    const messageText = message.trim();

    try {
      await setDoc(
        doc(db, "chats", chatId),
        { lastUpdated: serverTimestamp() },
        { merge: true }
      );

      const messageData = {
        type: "text",
        text: messageText,
        senderId: user.uid,
        receiverId: recipientId,
        timestamp: serverTimestamp(),
        read: false,
      };

      if (replyingTo) {
        messageData.repliedTo = {
          id: replyingTo.id,
          text: replyingTo.text || (replyingTo.type === "image" ? "🖼️ Image" : replyingTo.type === "voice" ? "🎤 Voice note" : replyingTo.type === "sticker" ? "🎨 Sticker" : "📁 File"),
          senderName: replyingTo.senderId === user.uid ? "You" : (recipientInfo?.name || "Recipient"),
          senderId: replyingTo.senderId
        };
      }

      await addDoc(collection(db, "chats", chatId, "messages"), messageData);

      await addDoc(collection(db, "notifications"), {
        userId: recipientId,
        type: "message",
        senderId: user.uid,
        senderEmail: user.email,
        senderName: user.displayName || user.email,
        message: replyingTo ? `↩️ Replying: ${messageText.slice(0, 40)}` : messageText.slice(0, 50),
        chatId: chatId,
        read: false,
        timestamp: serverTimestamp(),
      });

      setMessage("");
      setReplyingTo(null);
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

      const stickerData = {
        type: "sticker",
        stickerUrl: sticker.url,
        stickerName: sticker.name,
        senderId: user.uid,
        receiverId: recipientId,
        timestamp: serverTimestamp(),
        read: false,
      };

      if (replyingTo) {
        stickerData.repliedTo = {
          id: replyingTo.id,
          text: replyingTo.text || (replyingTo.type === "image" ? "🖼️ Image" : replyingTo.type === "voice" ? "🎤 Voice note" : replyingTo.type === "sticker" ? "🎨 Sticker" : "📁 File"),
          senderName: replyingTo.senderId === user.uid ? "You" : (recipientInfo?.name || "Recipient"),
          senderId: replyingTo.senderId
        };
      }

      await addDoc(collection(db, "chats", chatId, "messages"), stickerData);

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
      setReplyingTo(null);
      setIsStickerPickerOpen(false);
    } catch (err) {
      console.error("Failed to send sticker:", err);
      toast.error("Failed to send sticker");
    } finally {
      setIsSending(false);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setFileToUpload(file);
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const cancelFileSelection = () => {
    setFileToUpload(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadAndSendFile = async (caption = "") => {
    if (!fileToUpload) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("upload_preset", "social_app_uploads");

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dc5mukmoh/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      const isImage = fileToUpload.type.startsWith("image/");

      await setDoc(
        doc(db, "chats", chatId),
        { lastUpdated: serverTimestamp() },
        { merge: true }
      );

      await addDoc(collection(db, "chats", chatId, "messages"), {
        type: isImage ? "image" : "file",
        fileUrl: data.secure_url,
        fileName: fileToUpload.name,
        fileType: fileToUpload.type,
        senderId: user.uid,
        receiverId: recipientId,
        timestamp: serverTimestamp(),
        read: false,
        text: caption,
      });

      await addDoc(collection(db, "notifications"), {
        userId: recipientId,
        type: "message",
        senderId: user.uid,
        senderEmail: user.email,
        senderName: user.displayName || user.email,
        message: isImage ? `🖼️ Image ${caption ? ': ' + caption : ''}` : `📁 File: ${fileToUpload.name}`,
        chatId: chatId,
        read: false,
        timestamp: serverTimestamp(),
      });

      toast.success("File sent successfully!");
      setMessage(""); // Clear caption
    } catch (err) {
      console.error("File upload error:", err);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      cancelFileSelection();
    }
  };

  // Edit message functions
  const handleEditClick = (msg) => {
    setEditingMessage(msg.id);
    setEditText(msg.text);
    setShowMenu(null);
  };

  const handleEditSubmit = async (msgId) => {
    if (!editText.trim() || isSending) return;

    setIsSending(true);
    try {
      await updateDoc(doc(db, "chats", chatId, "messages", msgId), {
        text: editText.trim(),
        edited: true,
        editedAt: serverTimestamp(),
      });

      setEditingMessage(null);
      setEditText("");
    } catch (err) {
      console.error("Failed to edit message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleEditCancel = () => {
    setEditingMessage(null);
    setEditText("");
  };

  const handleReplyClick = (msg) => {
    setReplyingTo(msg);
    setShowMenu(null);
    // Focus the input
    textareaRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const handleDelete = async (msgId) => {
    console.log("Delete clicked for message ID:", msgId);
    setMessageToDelete(msgId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!messageToDelete) return;

    console.log("Attempting to delete message from Firestore...");
    console.log("Chat ID:", chatId);
    console.log("Message ID:", messageToDelete);

    // Find the message to determine its type
    const messageToDeleteData = messages.find(msg => msg.id === messageToDelete);
    console.log("Message to delete:", messageToDeleteData);

    const updateData = {
      deletedForEveryone: true,
    };

    // Set appropriate deleted message based on type
    if (messageToDeleteData?.type === "voice") {
      updateData.audioData = null;
      updateData.text = "🎤 Voice note deleted";
      console.log("Deleting voice note");
    } else {
      updateData.text = "This message was deleted";
      console.log("Deleting text message");
    }

    console.log("Update data:", updateData);

    try {
      await updateDoc(doc(db, "chats", chatId, "messages", messageToDelete), updateData);

      console.log("Message successfully deleted");

      // Update local state immediately to reflect deletion
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageToDelete
            ? { ...msg, ...updateData }
            : msg
        )
      );

      console.log("Local state updated");

      // Show success toast
      toast.success("Message deleted successfully");
    } catch (err) {
      console.error("Failed to delete message:", err);
      console.error("Error details:", err.code, err.message);
    } finally {
      setShowDeleteConfirm(false);
      setMessageToDelete(null);
      setShowMenu(null);
    }
  };

  const cancelDelete = () => {
    console.log("Delete cancelled by user");
    setShowDeleteConfirm(false);
    setMessageToDelete(null);
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        audioChunksRef.current = [];

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());

        // Send voice note
        await sendVoiceNote(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error starting recording:", err);
      alert("Failed to access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Clear recording timer
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      // Store the final recording time before resetting
      const finalRecordingTime = recordingTime;

      // Send voice note with the captured duration
      setTimeout(() => {
        sendVoiceNoteWithDuration(finalRecordingTime);
      }, 100);

      setRecordingTime(0);
    }
  };

  const sendVoiceNoteWithDuration = async (duration) => {
    // This will be called from the mediaRecorder.onstop callback
    // We'll store the duration and wait for the audio blob
    window.pendingVoiceNoteDuration = duration;
  };

  const sendVoiceNote = async (audioBlob, duration = null) => {
    setIsSending(true);

    try {
      // For now, we'll store the audio as a base64 string in Firestore
      // Later, this can be moved to Firebase Storage
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);

      reader.onloadend = async () => {
        const base64Audio = reader.result;

        // Update chat document
        await setDoc(
          doc(db, "chats", chatId),
          { lastUpdated: serverTimestamp() },
          { merge: true }
        );

        // Add voice message to Firestore
        const voiceData = {
          type: "voice",
          audioData: base64Audio,
          duration: duration || window.pendingVoiceNoteDuration || 0,
          senderId: user.uid,
          receiverId: recipientId,
          timestamp: serverTimestamp(),
          read: false,
        };

        if (replyingTo) {
          voiceData.repliedTo = {
            id: replyingTo.id,
            text: replyingTo.text || (replyingTo.type === "image" ? "🖼️ Image" : replyingTo.type === "voice" ? "🎤 Voice note" : replyingTo.type === "sticker" ? "🎨 Sticker" : "📁 File"),
            senderName: replyingTo.senderId === user.uid ? "You" : (recipientInfo?.name || "Recipient"),
            senderId: replyingTo.senderId
          };
        }

        await addDoc(collection(db, "chats", chatId, "messages"), voiceData);

        // Clear the pending duration and reply state
        window.pendingVoiceNoteDuration = null;
        setReplyingTo(null);

        // Send notification
        await addDoc(collection(db, "notifications"), {
          userId: recipientId,
          type: "message",
          senderId: user.uid,
          senderEmail: user.email,
          senderName: user.displayName || user.email,
          message: "🎤 Sent a voice note",
          chatId: chatId,
          read: false,
          timestamp: serverTimestamp(),
        });
      };

    } catch (err) {
      console.error("Failed to send voice note:", err);
      alert("Failed to send voice note. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const formatRecordingTime = (seconds) => {
    const roundedSeconds = Math.round(seconds);
    const mins = Math.floor(roundedSeconds / 60);
    const secs = roundedSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMenu = (msgId) => {
    setShowMenu(showMenu === msgId ? null : msgId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.message-menu') && !event.target.closest('.options-menu-trigger')) {
        setShowMenu(null);
        setIsOptionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);


  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Nav />

      <main className="relative pt-16 min-h-screen overflow-hidden">
        {/* Underlay image + overlays (match auth pages) */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 bg-center bg-cover opacity-30 saturate-125"
            style={{ backgroundImage: "url(/sideimg.jpg)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-black/70" />
          <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_70%_40%,rgba(34,197,94,0.18),transparent_60%)]" />
        </div>

        <div className="relative mx-auto w-full max-w-4xl px-3 sm:px-4 py-2 sm:py-6 h-[calc(100dvh-80px)] sm:h-[calc(100vh-120px)] flex flex-col">
          <div className="relative flex flex-col h-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_20px_70px_-30px_rgba(0,0,0,0.85)] overflow-hidden">

            {/* Chat Header - Pinned for constant navigation accessibility */}
            <div className="sticky top-0 z-[60] flex items-center gap-3 p-4 border-b border-white/10 bg-black/40 backdrop-blur-3xl shadow-lg">
              <button
                onClick={() => navigate(-1)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition"
                aria-label="Go back"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <Avatar
                    src={recipientInfo?.photoURL}
                    name={recipientInfo?.name || recipientInfo?.email}
                    size="w-10 h-10"
                    textSize="text-sm"
                  />
                  <div
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-black/60 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"
                      }`}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-white leading-tight truncate">
                    {recipientInfo?.name || recipientInfo?.email?.split("@")[0] || "Chat"}
                  </h3>
                  <div className="flex items-center gap-1.5 h-4">
                    {isRecipientTyping ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-green-400 font-medium animate-pulse">typing</span>
                        <div className="flex gap-0.5">
                          <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1 h-1 bg-green-400 rounded-full" />
                          <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-green-400 rounded-full" />
                          <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-green-400 rounded-full" />
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-white/60">
                        {isOnline ? "Active now" : "Offline"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="ml-auto text-xs text-white/50 hidden sm:block">
                {isChatLoading ? "Connecting…" : "Connected"}
              </div>
            </div>





            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-10 no-scrollbar relative">
              {isChatLoading ? (
                <div className="h-full min-h-[320px] flex items-center justify-center">
                  <Loader label="Loading chat..." />
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === user.uid ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`${msg.type === "sticker" ? "max-w-[150px]" : "max-w-[75%] px-4 py-2"
                        } rounded-2xl relative ${msg.senderId === user.uid
                          ? msg.type === "sticker" ? "" : "bg-green-600 text-white rounded-tr-none"
                          : msg.type === "sticker"
                            ? ""
                            : "bg-[#1e1e1e]/90 text-white/90 shadow-sm border border-white/10 backdrop-blur-3xl rounded-tl-none"
                        }`}
                    >
                      {/* Replied Message Display inside bubble */}
                      {msg.repliedTo && (
                        <div className={`mb-2 p-2 rounded-lg border-l-4 text-xs bg-black/30 backdrop-blur-sm ${msg.senderId === user.uid ? "border-green-300" : "border-green-500"}`}>
                          <div className="font-bold mb-0.5 text-green-400">
                            {msg.repliedTo.senderName}
                          </div>
                          <div className="opacity-70 truncate line-clamp-1 italic">
                            {msg.repliedTo.text}
                          </div>
                        </div>
                      )}
                      {/* Edit mode */}
                      {editingMessage === msg.id && msg.type !== "sticker" ? (
                        <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleEditSubmit(msg.id);
                              } else if (e.key === 'Escape') {
                                handleEditCancel();
                              }
                            }}
                            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                            autoFocus
                            disabled={isSending}
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={handleEditCancel}
                              disabled={isSending}
                              className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 transition disabled:opacity-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleEditSubmit(msg.id)}
                              disabled={!editText.trim() || isSending}
                              className="px-3 py-1 text-xs bg-green-600 text-white rounded-full hover:bg-green-700 transition disabled:opacity-50"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Render sticker, voice, or text */}
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
                          ) : msg.type === "voice" ? (
                            msg.deletedForEveryone ? (
                              <div className="text-white/60 italic text-sm">
                                🎤 Voice note deleted
                              </div>
                            ) : (
                              <div>
                                <div className="rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 border border-white/10 bg-black/25 backdrop-blur-xl">

                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-white text-sm leading-tight">
                                      Voice note
                                    </p>
                                    <p className="text-xs text-white/60">
                                      {playingMessageId === msg.id
                                        ? formatRecordingTime(currentPlaybackTime)
                                        : msg.duration
                                          ? formatRecordingTime(msg.duration)
                                          : "0:00"
                                      }
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => playVoiceNote(msg.audioData, msg.id)}
                                    className="w-9 h-9 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition shadow-[0_14px_40px_-20px_rgba(34,197,94,0.7)] active:scale-[0.99]"
                                    aria-label={playingMessageId === msg.id && !currentAudioRef.current?.paused ? "Pause voice note" : "Play voice note"}
                                  >
                                    <span className="text-xs font-bold">
                                      {playingMessageId === msg.id && !currentAudioRef.current?.paused ? (
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                                          <rect x="6" y="4" width="4" height="16" rx="1" />
                                          <rect x="14" y="4" width="4" height="16" rx="1" />
                                        </svg>
                                      ) : (
                                        '▶'
                                      )}
                                    </span>
                                  </button>
                                </div>
                                {/* Delete button for own voice notes */}
                                {msg.senderId === user.uid && (
                                  <button
                                    onClick={() => handleDelete(msg.id)}
                                    className="text-xs font-semibold text-red-300 hover:text-red-200 transition"
                                    title="Delete voice note"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                                <div className="text-[10px] flex items-center text-white/50">
                                  {formatTime(msg.timestamp)}
                                  {msg.senderId === user.uid && msg.read && <Check size={12} strokeWidth={3} className="text-green-500  " />}
                                </div>
                              </div>
                            )
                          ) : msg.type === "image" ? (
                            <div className="flex flex-col gap-1">
                              <img
                                src={msg.fileUrl}
                                alt={msg.fileName}
                                className="max-w-full rounded-lg cursor-zoom-in hover:opacity-95 transition"
                                onClick={() => setSelectedImage(msg.fileUrl)}
                              />
                              {msg.text && <p className="text-[15px] mt-2 mb-1">{msg.text}</p>}
                              <div className="text-[10px] mt-1 flex items-center justify-end gap-1 text-gray-400 dark:text-gray-500">
                                <span>{formatTime(msg.timestamp)}</span>
                                {msg.senderId === user.uid && msg.read && <Check size={12} strokeWidth={3} className="text-green-500" />}
                              </div>
                            </div>
                          ) : msg.type === "file" ? (
                            <div className="flex flex-col gap-1">
                              <a
                                href={msg.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                              >
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                                  <FileText className="text-blue-600 dark:text-blue-400" size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{msg.fileName}</p>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">{msg.fileType?.split('/')[1] || 'FILE'}</p>
                                </div>
                              </a>
                              {msg.text && <p className="text-[15px] mt-2 mb-1">{msg.text}</p>}
                              <div className="text-[10px] mt-1 flex items-center justify-end gap-1 text-gray-400 dark:text-gray-500">
                                <span>{formatTime(msg.timestamp)}</span>
                                {msg.senderId === user.uid && msg.read && <Check size={12} strokeWidth={3} className="text-green-500" />}
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-[15px]">{msg.text}</p>
                              {msg.edited && (
                                <span className="text-[10px] italic text-gray-400 dark:text-gray-500"> (edited)</span>
                              )}
                              <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${msg.senderId === user.uid ? "text-green-100" : "text-gray-400 dark:text-gray-500"}`}>
                                <span>{formatTime(msg.timestamp)}</span>
                                {msg.senderId === user.uid && msg.read && <Check size={12} strokeWidth={3} />}
                              </div>
                            </>
                          )}
                        </>
                      )}

                      {/* Menu for all messages */}
                      {editingMessage !== msg.id && (
                        <div className="message-menu absolute top-1 -right-4 z-20">
                          <button
                            onClick={() => toggleMenu(msg.id)}
                            className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${msg.senderId === user.uid ? "bg-green-700/80 hover:bg-green-800" : "bg-white/10 hover:bg-white/20 border border-white/10"
                              }`}
                          >
                            <MoreVertical size={10} className="text-white/70" />
                          </button>

                          <AnimatePresence>
                            {showMenu === msg.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9, x: 10 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9, x: 10 }}
                                className="absolute top-6 right-0 bg-[#1e1e1e]/95 backdrop-blur-2xl rounded-xl shadow-2xl p-1 z-[110] border border-white/10 min-w-[110px]"
                              >
                                <button
                                  onClick={() => handleReplyClick(msg)}
                                  className="flex items-center gap-2 px-3 py-2 text-[11px] hover:bg-white/10 rounded-lg transition w-full text-left"
                                >
                                  <Send size={11} className="rotate-[-45deg] scale-x-[-1]" />
                                  <span>Reply</span>
                                </button>

                                {msg.senderId === user.uid && msg.type === "text" && (
                                  <button
                                    onClick={() => handleEditClick(msg)}
                                    className="flex items-center gap-2 px-3 py-2 text-[11px] hover:bg-white/10 rounded-lg transition w-full text-left"
                                  >
                                    <Edit size={11} />
                                    <span>Edit</span>
                                  </button>
                                )}

                                {msg.senderId === user.uid && (
                                  <button
                                    onClick={() => handleDelete(msg.id)}
                                    className="flex items-center gap-2 px-3 py-2 text-[11px] hover:bg-red-500/20 rounded-lg transition w-full text-left text-red-500"
                                  >
                                    <Trash2 size={11} />
                                    <span>Delete</span>
                                  </button>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {/* Recipient Typing Bubble */}
              <AnimatePresence>
                {isRecipientTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.9 }}
                    className="flex justify-start mb-4"
                  >
                    <div className="bg-[#1e1e1e]/90 text-white/90 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm border border-white/10 backdrop-blur-3xl flex items-center gap-1.5 min-w-[60px] justify-center">
                      <motion.div 
                        animate={{ y: [0, -5, 0] }} 
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} 
                        className="w-1.5 h-1.5 bg-green-500 rounded-full" 
                      />
                      <motion.div 
                        animate={{ y: [0, -5, 0] }} 
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} 
                        className="w-1.5 h-1.5 bg-green-500 rounded-full" 
                      />
                      <motion.div 
                        animate={{ y: [0, -5, 0] }} 
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} 
                        className="w-1.5 h-1.5 bg-green-500 rounded-full" 
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Floating & Fixed for mobile UX */}
            <div className="fixed md:absolute bottom-0 inset-x-0 p-4 pb-6 z-50 pointer-events-none">
              <div className="max-w-4xl mx-auto w-full pointer-events-auto">
                {/* Recording indicator */}
                {isRecording && (
                  <div className="absolute -top-16 left-4 right-4 bg-red-500/20 backdrop-blur-3xl border border-red-500/20 rounded-2xl p-4 flex items-center justify-between z-50 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-red-700 dark:text-red-300 text-sm font-medium">
                        Recording... {formatRecordingTime(recordingTime)}
                      </span>
                    </div>
                    <button
                      onClick={stopRecording}
                      className="px-3 py-1 text-xs bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                    >
                      Stop
                    </button>
                  </div>
                )}
                {/* Upload progress indicator */}
                {isUploading && (
                  <div className="absolute -top-16 left-4 right-4 rounded-2xl p-4 shadow-2xl border border-white/10 bg-black/60 backdrop-blur-3xl flex flex-col gap-2 z-50 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-white/80">Sending file...</span>
                      <Loader size="xs" showLabel={false} />
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-green-600 h-full transition-all duration-300"
                        style={{ width: `${uploadProgress || 10}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* File/Image PreviewCard */}
                {fileToUpload && (
                  <div className="absolute -top-36 left-4 right-4 rounded-2xl p-4 shadow-2xl border border-white/10 bg-black/80 backdrop-blur-3xl flex flex-col gap-3 z-[60] animate-in slide-in-from-bottom-4 duration-300 overflow-hidden max-h-48">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-bold text-green-600 dark:text-green-500 uppercase tracking-wider">
                        {previewUrl ? 'Image Preview' : 'File Selected'}
                      </span>
                      <button
                        onClick={cancelFileSelection}
                        className="p-1 hover:bg-white/10 rounded-full transition text-white/70"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="flex gap-4 items-center">
                      {previewUrl ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 bg-black/20 flex-shrink-0">
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-blue-500/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="text-blue-600 dark:text-blue-400" size={24} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-white">
                          {fileToUpload.name}
                        </p>
                        <p className="text-[10px] text-white/60">
                          {(fileToUpload.size / 1024 / 1024).toFixed(2)} MB • {fileToUpload.type.split('/')[1]?.toUpperCase() || 'FILE'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                 {/* Reply Preview Above Input */}
                <AnimatePresence>
                  {replyingTo && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute -top-16 left-0 right-0 p-3 bg-[#1e1e1e]/90 backdrop-blur-3xl border border-white/10 border-l-4 border-l-green-600 rounded-t-2xl z-40 flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="text-xs font-bold text-green-400 truncate">
                          Replying to {replyingTo.senderId === user.uid ? "yourself" : (recipientInfo?.name || "Recipient")}
                        </div>
                        <div className="text-[11px] text-white/50 truncate">
                          {replyingTo.text || (replyingTo.type === "image" ? "🖼️ Image" : replyingTo.type === "voice" ? "🎤 Voice note" : replyingTo.type === "sticker" ? "🎨 Sticker" : "📁 File")}
                        </div>
                      </div>
                      <button
                        onClick={cancelReply}
                        className="p-1.5 hover:bg-white/10 rounded-full transition text-white/40"
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative">
                  {/* Options Menu Overlay for Mobile */}
                  <AnimatePresence>
                    {isOptionsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute bottom-full left-2 mb-4 flex flex-col gap-3 z-[100]"
                      >
                        {/* File upload item */}
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => {
                            handleFileClick();
                            setIsOptionsOpen(false);
                          }}
                          disabled={isSending || isRecording || isUploading}
                          className="flex items-center gap-3 p-3 bg-[#1e1e1e]/90 backdrop-blur-3xl border border-white/10 rounded-2xl text-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] group disabled:opacity-50"
                        >
                          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all shrink-0">
                            <FileText size={24} />
                          </div>
                          <div className="flex flex-col items-start pr-6">
                            <span className="text-sm font-bold tracking-wide">Documents</span>
                            <span className="text-[11px] text-white/40">PDF, Word, TXT, etc.</span>
                          </div>
                        </motion.button>

                        {/* Sticker item */}
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => {
                            setIsStickerPickerOpen(true);
                            setIsOptionsOpen(false);
                          }}
                          disabled={isSending || isRecording || isUploading}
                          className="flex items-center gap-3 p-3 bg-[#1e1e1e]/90 backdrop-blur-3xl border border-white/10 rounded-2xl text-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] group disabled:opacity-50"
                        >
                          <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-400 group-hover:scale-110 group-hover:bg-yellow-500/20 transition-all shrink-0">
                            <Smile size={24} />
                          </div>
                          <div className="flex flex-col items-start pr-6">
                            <span className="text-sm font-bold tracking-wide">Stickers</span>
                            <span className="text-[11px] text-white/40">Send fun stickers</span>
                          </div>
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form
                    onSubmit={sendMessage}
                    className="flex gap-x-2 items-end w-full pointer-events-auto"
                  >
                    {/* Main Input Pill - WhatsApp style */}
                    <div
                      className="flex-1 flex gap-1 items-end rounded-[26px] py-1.5 px-2 border border-white/10 bg-[#1e1e1e]/90 backdrop-blur-3xl shadow-xl ring-1 ring-white/5 focus-within:ring-green-500/20 group transition-all duration-300"
                    >
                      {/* Leading Emoji/Sticker Trigger */}
                      <button
                        type="button"
                        onClick={() => setIsStickerPickerOpen(!isStickerPickerOpen)}
                        disabled={isSending || isRecording || isUploading}
                        className={`p-2 transition-all duration-300 shrink-0 ${isStickerPickerOpen ? 'text-green-500 scale-110' : 'text-white/50 hover:text-white'}`}
                      >
                        {isStickerPickerOpen ? <X size={24} /> : <Smile size={24} strokeWidth={2} />}
                      </button>

                      <div className="flex-1 min-w-0 py-1.5">
                        <textarea
                          ref={textareaRef}
                          rows={1}
                          value={message}
                          onChange={(e) => {
                            setMessage(e.target.value);
                            if (editingMessage) handleEditCancel();
                            if (isOptionsOpen) setIsOptionsOpen(false);
                            // Auto-expand
                            e.target.style.height = "auto";
                            e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey && !isRecording && !isSending) {
                              e.preventDefault();
                              sendMessage(e);
                              e.target.style.height = "auto";
                            }
                          }}
                          placeholder={isRecording ? "Recording..." : "Message"}
                          disabled={isSending || isRecording || isUploading}
                          className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-[16px] py-0 placeholder:text-white/30 text-white selection:bg-green-500/30 resize-none max-h-32 overflow-y-auto leading-tight"
                        />
                      </div>

                      {/* Attachment Toggle */}
                      <button
                        type="button"
                        onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                        disabled={isSending || isRecording || isUploading}
                        className={`p-2 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 options-menu-trigger ${isOptionsOpen ? 'text-green-500 scale-110' : 'text-white/50 hover:text-white'
                          } disabled:opacity-50`}
                      >
                        <Paperclip size={22} className={isOptionsOpen ? 'rotate-45 transition-transform' : 'transition-transform'} />
                      </button>
                    </div>

                    {/* Separate Circle Send/Mic Button */}
                    <button
                      type={message.trim() || fileToUpload ? "submit" : "button"}
                      onClick={message.trim() || fileToUpload ? undefined : (isRecording ? stopRecording : startRecording)}
                      disabled={isSending || isUploading}
                      className={`w-[52px] h-[52px] rounded-full flex items-center justify-center shrink-0 transition-all duration-300 shadow-lg active:scale-95 ${isRecording
                        ? 'bg-red-600 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                        : 'bg-green-600 text-white shadow-[0_4px_15px_-5px_rgba(34,197,94,0.5)] hover:bg-green-500'
                        } disabled:opacity-50 disabled:active:scale-100 flex-shrink-0`}
                    >
                      {message.trim() || fileToUpload ? (
                        <Send size={20} fill="currentColor" className="ml-1" />
                      ) : (
                        isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={22} />
                      )}
                    </button>

                    {/* Hidden File Input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    />
                  </form>
                </div>
              </div>

              {/* Sticker Picker */}
              <StickerPicker
                isOpen={isStickerPickerOpen}
                onClose={() => setIsStickerPickerOpen(false)}
                onSelectSticker={sendSticker}
              />

              {/* Delete Confirmation Dialog */}
              {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4 shadow-xl">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Delete Message
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Are you sure you want to delete this message for everyone? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={cancelDelete}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmDelete}
                        className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Full-screen Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[100] p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-5 right-5 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center transition text-xl"
            onClick={() => setSelectedImage(null)}
          >
            <X size={20} />
          </button>
          <img
            src={selectedImage}
            className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
