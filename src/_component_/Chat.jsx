import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { ArrowLeft, Send, Check, Smile, MoreVertical, Edit, X, Trash2, Mic, Square } from "lucide-react";
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
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const [showMenu, setShowMenu] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const currentAudioRef = useRef(null);
  const [playingMessageId, setPlayingMessageId] = useState(null);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const playbackIntervalRef = useRef(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

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
        await addDoc(collection(db, "chats", chatId, "messages"), {
          type: "voice",
          audioData: base64Audio,
          duration: duration || window.pendingVoiceNoteDuration || 0,
          senderId: user.uid,
          receiverId: recipientId,
          timestamp: serverTimestamp(),
          read: false,
        });

        // Clear the pending duration
        window.pendingVoiceNoteDuration = null;

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
      if (!event.target.closest('.message-menu')) {
        setShowMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
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
        <div className="flex-1 overflow-y-auto p-4 space-y-10 bg-gray-50 dark:bg-gray-900 transition-colors no-scrollbar">
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
                        <div className="text-gray-500 dark:text-gray-400 italic text-sm">
                          🎤 Voice note deleted
                        </div>
                      ) : (
                        <div>
                          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 flex items-center gap-3">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                              <span className="text-red-600 dark:text-red-400 text-xl">🎤</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white text-sm">Voice Note</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
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
                              className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition"
                            >
                              <span className="text-xs">
                                {playingMessageId === msg.id && !currentAudioRef.current?.paused ? '❚❚' : '▶'}
                              </span>
                            </button>
                          </div>
                          {/* Delete button for own voice notes */}
                          {msg.senderId === user.uid && (
                            <button
                              onClick={() => handleDelete(msg.id)}
                              className="w-6 h-6 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition"
                              title="Delete voice note"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                          <div className="text-[10px] mt-1 flex items-center justify-end gap-1 text-gray-400 dark:text-gray-500">
                            <span>{formatTime(msg.timestamp)}</span>
                            {msg.senderId === user.uid && msg.read && <Check size={12} strokeWidth={3} className="text-green-500" />}
                          </div>
                        </div>
                      )
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

                {/* Menu for own messages */}
                {msg.senderId === user.uid && msg.type !== "sticker" && msg.type !== "voice" && editingMessage !== msg.id && (
                  <div className="message-menu relative">
                    <button
                      onClick={() => toggleMenu(msg.id)}
                      className="absolute top-1 -right-4 w-5 h-5 bg-green-700 dark:bg-green-800 rounded-full flex items-center justify-center hover:bg-green-800 dark:hover:bg-green-900 transition"
                    >
                      <MoreVertical size={10} className="text-green-200 dark:text-green-300" />
                    </button>

                    {showMenu === msg.id && (
                      <div className="absolute top-6 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1 z-50 border border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => handleEditClick(msg)}
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition w-full text-left"
                        >
                          <Edit size={14} />
                          <span className="text-gray-700 dark:text-gray-300">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition w-full text-left"
                        >
                          <Trash2 size={14} />
                          <span className="text-red-600 dark:text-red-400">Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="p-3 bg-white dark:bg-gray-800 border-t dark:border-gray-700 transition-colors mb-0 relative">
          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute -top-16 left-4 right-4 bg-red-100 dark:bg-red-900/30 rounded-lg p-3 flex items-center gap-2 z-50">
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

          <form onSubmit={sendMessage} className="flex gap-2 items-center bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 transition-colors">
            {/* Voice recording button */}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isSending}
              className={`p-2 rounded-full flex items-center justify-center transition flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${isRecording
                  ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                  : 'text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400'
                }`}
            >
              {isRecording ? <Square size={20} /> : <Mic size={20} />}
            </button>

            {/* Sticker button */}
            <button
              type="button"
              onClick={() => setIsStickerPickerOpen(!isStickerPickerOpen)}
              disabled={isSending || isRecording}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Smile size={20} />
            </button>

            <input
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                // Cancel edit if user starts typing a new message
                if (editingMessage) {
                  handleEditCancel();
                }
              }}
              placeholder="Message..."
              disabled={isSending || isRecording}
              className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm py-2 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!message.trim() || isSending || isRecording}
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
  );
};
