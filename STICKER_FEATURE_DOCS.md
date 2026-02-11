# Sticker Feature Documentation

## Overview
This document explains the WhatsApp-style sticker feature implemented in the SayLess chat application.

## Features
- ✅ Sticker picker panel with multiple categories (Emoji, Reactions, Animals)
- ✅ Send stickers as messages
- ✅ Display stickers in chat with proper sizing
- ✅ Smooth animations and responsive design
- ✅ Notification support for sticker messages
- ✅ Read receipts for stickers

## Data Structure

### Message Document in Firestore
```javascript
// Text Message
{
  id: "msg_123",
  chatId: "user1_user2",
  senderId: "user_1",
  receiverId: "user_2",
  type: "text",           // or omitted for backward compatibility
  text: "Hello!",
  timestamp: Timestamp,
  read: false
}

// Sticker Message
{
  id: "msg_124",
  chatId: "user1_user2",
  senderId: "user_1",
  receiverId: "user_2",
  type: "sticker",
  stickerUrl: "https://em-content.zobj.net/thumbs/240/google/350/fire_1f525.png",
  stickerName: "Fire",
  timestamp: Timestamp,
  read: false
}
```

## Components

### 1. StickerPicker.jsx
Location: `src/_component_/StickerPicker.jsx`

**Props:**
- `isOpen` (boolean): Controls visibility of sticker picker
- `onClose` (function): Called when user closes the picker
- `onSelectSticker` (function): Called when user selects a sticker

**Features:**
- Tabbed interface for different sticker categories
- Grid layout for stickers
- Hover and tap animations
- Responsive for mobile and desktop
- Dark mode support

**Usage:**
```jsx
<StickerPicker
  isOpen={isStickerPickerOpen}
  onClose={() => setIsStickerPickerOpen(false)}
  onSelectSticker={sendSticker}
/>
```

### 2. Chat.jsx (Updated)
Location: `src/_component_/Chat.jsx`

**New Functions:**

#### `sendSticker(sticker)`
Sends a sticker message to Firestore and creates a notification.

```javascript
const sendSticker = async (sticker) => {
  try {
    // Update chat metadata
    await setDoc(
      doc(db, "chats", chatId),
      { lastUpdated: serverTimestamp() },
      { merge: true }
    );

    // Add sticker message
    await addDoc(collection(db, "chats", chatId, "messages"), {
      type: "sticker",
      stickerUrl: sticker.url,
      stickerName: sticker.name,
      senderId: user.uid,
      receiverId: recipientId,
      timestamp: serverTimestamp(),
      read: false,
    });

    // Create notification
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
  }
};
```

**New State:**
```javascript
const [isStickerPickerOpen, setIsStickerPickerOpen] = useState(false);
```

## UI Components

### Sticker Button
Located in the chat input area, opens the sticker picker:

```jsx
<button
  type="button"
  onClick={() => setIsStickerPickerOpen(!isStickerPickerOpen)}
  className="p-2 text-gray-500 dark:text-gray-400 hover:text-green-600"
>
  <Smile size={20} />
</button>
```

### Message Rendering
Messages are rendered differently based on type:

```jsx
{msg.type === "sticker" ? (
  // Sticker display
  <div>
    <img
      src={msg.stickerUrl}
      alt={msg.stickerName}
      className="w-32 h-32 object-contain"
    />
    <div className="text-[10px] mt-1">
      <span>{formatTime(msg.timestamp)}</span>
      {msg.read && <Check size={12} />}
    </div>
  </div>
) : (
  // Text display
  <>
    <p>{msg.text}</p>
    <div className="text-[10px] mt-1">
      <span>{formatTime(msg.timestamp)}</span>
      {msg.read && <Check size={12} />}
    </div>
  </>
)}
```

## Sticker Packs

### Current Packs
Pre-defined sticker URLs from Google's Noto Emoji CDN:

1. **Emoji Pack**
   - Grinning, Heart Eyes, Laughing, Thumbs Up, Heart, Fire, Star Struck, Party, Wink, Cool, Thinking, Kiss

2. **Reactions Pack**
   - Clap, Pray, Celebrate, 100, Rocket, Sparkles

3. **Animals Pack**
   - Dog, Cat, Lion, Unicorn, Monkey, Panda

### Adding Custom Stickers

To add your own sticker packs:

1. **Option 1: Update stickerPacks object**
```javascript
const stickerPacks = {
  custom: [
    { 
      id: "custom_1", 
      url: "https://your-domain.com/sticker.png", 
      name: "My Sticker" 
    },
    // ... more stickers
  ]
};
```

2. **Option 2: Upload to Firebase Storage**
```javascript
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";

const uploadSticker = async (file) => {
  const storageRef = ref(storage, `stickers/${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
};
```

3. **Option 3: Store in Firestore**
```javascript
// Create a sticker packs collection
const stickersRef = collection(db, "stickers");
await addDoc(stickersRef, {
  packName: "Custom Pack",
  stickers: [
    { id: "1", url: "...", name: "..." },
    // ...
  ]
});
```

## Best Practices

### Performance
1. **Lazy Loading**: Stickers use `loading="lazy"` attribute
2. **Image Optimization**: Use WebP format for better compression
3. **CDN**: Host stickers on a CDN for faster loading
4. **Caching**: Browser automatically caches sticker URLs

### Security
1. **Validate URLs**: Ensure sticker URLs are from trusted sources
2. **File Size Limits**: Limit sticker file sizes if allowing uploads
3. **Content Moderation**: Implement moderation for user-uploaded stickers

### User Experience
1. **Smooth Animations**: Framer Motion for panel transitions
2. **Responsive Design**: Works on mobile and desktop
3. **Dark Mode**: Full dark theme support
4. **Accessibility**: Proper alt tags and keyboard navigation

## Firestore Security Rules

Add these rules to allow sticker messages:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /chats/{chatId}/messages/{messageId} {
      allow read: if request.auth != null && 
        (request.auth.uid in chatId.split('_'));
      
      allow create: if request.auth != null && 
        request.resource.data.senderId == request.auth.uid &&
        (request.resource.data.type in ['text', 'sticker']) &&
        (request.resource.data.type == 'text' ? 
          request.resource.data.keys().hasAll(['text', 'senderId', 'receiverId', 'timestamp', 'read']) :
          request.resource.data.keys().hasAll(['stickerUrl', 'senderId', 'receiverId', 'timestamp', 'read']));
    }
  }
}
```

## Testing

### Test Scenarios
1. ✅ Open sticker picker
2. ✅ Switch between tabs
3. ✅ Select and send a sticker
4. ✅ View sticker in chat
5. ✅ Send sticker and text messages alternately
6. ✅ Read receipts show correctly for stickers
7. ✅ Notifications work for stickers
8. ✅ Dark mode rendering
9. ✅ Mobile responsiveness
10. ✅ Close picker with backdrop click

### Example Test Code
```javascript
// Send a test sticker
const testSticker = {
  id: "test_1",
  url: "https://em-content.zobj.net/thumbs/240/google/350/fire_1f525.png",
  name: "Fire"
};

await sendSticker(testSticker);
```

## Future Enhancements

### Suggested Features
1. **Sticker Search**: Add search functionality
2. **Recent Stickers**: Show recently used stickers
3. **Favorite Stickers**: Let users favorite stickers
4. **Custom Sticker Upload**: Allow users to upload custom stickers
5. **Animated Stickers**: Support for GIFs and animated stickers
6. **Sticker Packs Store**: Downloadable sticker packs
7. **Sticker Reactions**: Quick reactions with stickers
8. **Sticker Statistics**: Track most used stickers

## Troubleshooting

### Common Issues

**Sticker not displaying:**
- Check if `stickerUrl` is valid
- Verify CORS settings if using external URLs
- Check network tab for 404 errors

**Sticker picker not opening:**
- Verify `isStickerPickerOpen` state
- Check console for JavaScript errors
- Ensure StickerPicker component is imported

**Stickers too large/small:**
- Adjust `className="w-32 h-32"` in message rendering
- Update `max-w-[150px]` in message container

## Resources
- [Google Noto Emoji CDN](https://googlefonts.github.io/noto-emoji-animation/)
- [Firebase Storage Docs](https://firebase.google.com/docs/storage)
- [Framer Motion Docs](https://www.framer.com/motion/)
