# RoomTalk Project Structure

RoomTalk is a text-only real-time multi-room chat application where users enter with a username, join rooms, chat publicly, send private messages, see unread private message badges, and store temporary chat sessions in Redis with automatic 12-hour expiry.

## Tech Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- Socket.io Client

### Backend
- Node.js
- Express.js
- TypeScript
- Socket.io
- Redis

### Storage
- Redis for:
  - Active users
  - Room users
  - Room messages
  - Private messages
  - Unread private message counts
  - 12-hour TTL cleanup

---

# Recommended Repository Structure

Use a monorepo-style structure:

```txt
roomtalk/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx
│   │   │   ├── rooms/
│   │   │   │   └── page.tsx
│   │   │   ├── chat/
│   │   │   │   └── [room]/
│   │   │   │       └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   │
│   │   ├── components/
│   │   │   ├── username/
│   │   │   │   └── UsernameForm.tsx
│   │   │   ├── rooms/
│   │   │   │   ├── RoomCard.tsx
│   │   │   │   └── RoomList.tsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatLayout.tsx
│   │   │   │   ├── ChatHeader.tsx
│   │   │   │   ├── MessageList.tsx
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   ├── MessageInput.tsx
│   │   │   │   ├── OnlineUsers.tsx
│   │   │   │   ├── PrivateChatPanel.tsx
│   │   │   │   └── EmptyState.tsx
│   │   │   └── ui/
│   │   │       ├── Button.tsx
│   │   │       ├── Input.tsx
│   │   │       └── Badge.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useSocket.ts
│   │   │   ├── useRoom.ts
│   │   │   ├── useMessages.ts
│   │   │   └── useUnreadMessages.ts
│   │   │
│   │   ├── lib/
│   │   │   ├── socket.ts
│   │   │   ├── constants.ts
│   │   │   └── utils.ts
│   │   │
│   │   ├── store/
│   │   │   └── chatStore.ts
│   │   │
│   │   └── types/
│   │       ├── room.ts
│   │       ├── user.ts
│   │       ├── message.ts
│   │       └── socket.ts
│   │
│   ├── .env.local
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── next.config.ts
│
├── server/
│   ├── src/
│   │   ├── index.ts
│   │   ├── app.ts
│   │   ├── socket/
│   │   │   ├── socket.ts
│   │   │   ├── handlers/
│   │   │   │   ├── username.handler.ts
│   │   │   │   ├── room.handler.ts
│   │   │   │   ├── message.handler.ts
│   │   │   │   ├── private-message.handler.ts
│   │   │   │   └── disconnect.handler.ts
│   │   │   └── events.ts
│   │   │
│   │   ├── redis/
│   │   │   ├── redis.client.ts
│   │   │   ├── redis.keys.ts
│   │   │   └── redis.ttl.ts
│   │   │
│   │   ├── services/
│   │   │   ├── user.service.ts
│   │   │   ├── room.service.ts
│   │   │   ├── message.service.ts
│   │   │   ├── private-message.service.ts
│   │   │   └── unread.service.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── privateChatKey.ts
│   │   │   ├── normalizeUsername.ts
│   │   │   ├── generateId.ts
│   │   │   └── time.ts
│   │   │
│   │   ├── types/
│   │   │   ├── user.ts
│   │   │   ├── room.ts
│   │   │   ├── message.ts
│   │   │   └── socket.ts
│   │   │
│   │   └── config/
│   │       ├── env.ts
│   │       └── rooms.ts
│   │
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
├── docs/
│   ├── PROJECT_STRUCTURE.md
│   └── PROJECT_EXECUTION.md
│
├── README.md
└── .gitignore
```

---

# Frontend Structure Explanation

## `client/src/app/page.tsx`

This is the username entry screen.

Purpose:

```txt
User enters username before accessing rooms.
```

Responsibilities:
- Show welcome screen
- Validate username input
- Send username to backend using Socket.io
- Navigate to `/rooms` after username is accepted

---

## `client/src/app/rooms/page.tsx`

This is the room selection screen.

Purpose:

```txt
Show available rooms and active user count.
```

Responsibilities:
- Display Developers, Marketing, HR
- Show active users count per room
- Join selected room
- Navigate to `/chat/[room]`

---

## `client/src/app/chat/[room]/page.tsx`

This is the main chat screen.

Purpose:

```txt
Public room chat + private chat.
```

Responsibilities:
- Join selected room
- Load room messages
- Show online users
- Send public messages
- Open private chat
- Send private messages
- Show unread private message badge
- Leave room

---

# Frontend Components

## Username Components

```txt
components/username/UsernameForm.tsx
```

Used for:
- Username input
- Continue button
- Error message if username is already active

---

## Rooms Components

```txt
components/rooms/RoomCard.tsx
components/rooms/RoomList.tsx
```

Used for:
- Room cards
- Active users count
- Join room button

---

## Chat Components

```txt
components/chat/ChatLayout.tsx
```

Main layout wrapper for chat screen.

```txt
components/chat/ChatHeader.tsx
```

Shows:
- Current room name
- Leave room button

```txt
components/chat/MessageList.tsx
```

Shows public/private messages.

```txt
components/chat/MessageBubble.tsx
```

Single message bubble.

```txt
components/chat/MessageInput.tsx
```

Input for sending messages.

```txt
components/chat/OnlineUsers.tsx
```

Shows active users in the room.

Also shows unread private message badge:

```txt
Rafay (2)
Asim (1)
Ayaz
```

```txt
components/chat/PrivateChatPanel.tsx
```

Handles private chat UI when a user is selected.

---

# Frontend Hooks

## `useSocket.ts`

Handles Socket.io client connection.

Used for:
- Connect socket
- Disconnect socket
- Reuse socket across app

---

## `useRoom.ts`

Handles room-related logic.

Used for:
- Fetch room list
- Join room
- Leave room
- Listen for room users update
- Listen for active room counts update

---

## `useMessages.ts`

Handles public and private messages.

Used for:
- Send public message
- Receive public message
- Send private message
- Receive private message
- Load message history

---

## `useUnreadMessages.ts`

Handles unread private message badge.

Used for:
- Increase unread count
- Reset unread count when private chat opens
- Show badge in UI

---

# Frontend Store

## `store/chatStore.ts`

You can use Zustand or React state.

Recommended beginner approach:

```txt
Use Zustand for cleaner global state.
```

Store should include:
- Username
- Current room
- Active chat type
- Selected private user
- Room messages
- Private messages
- Online users
- Unread counts

Example state:

```ts
type ChatState = {
  username: string;
  currentRoom: string | null;
  activeChat: "public" | "private";
  selectedPrivateUser: string | null;
  onlineUsers: User[];
  roomMessages: Message[];
  privateMessages: Record<string, PrivateMessage[]>;
  unreadCounts: Record<string, number>;
};
```

---

# Backend Structure Explanation

## `server/src/index.ts`

Main server entry file.

Responsibilities:
- Start Express server
- Attach Socket.io server
- Connect Redis
- Listen on backend port

---

## `server/src/app.ts`

Express app configuration.

Responsibilities:
- CORS setup
- JSON middleware
- Health check route

Example health route:

```txt
GET /health
```

---

## `server/src/socket/socket.ts`

Main Socket.io setup.

Responsibilities:
- Initialize Socket.io
- Register socket event handlers
- Handle socket connections

---

# Socket Handlers

## `username.handler.ts`

Handles username entry.

Events:
- `user:check`
- `user:accepted`
- `user:error`

Responsibilities:
- Check if username already exists in Redis
- Store active user with socket ID
- Apply 12-hour TTL

---

## `room.handler.ts`

Handles rooms.

Events:
- `rooms:get`
- `rooms:update`
- `room:join`
- `room:leave`
- `room:users`

Responsibilities:
- Get room active counts
- Join selected room
- Remove user from previous room
- Update room users list
- Emit room count updates

---

## `message.handler.ts`

Handles public room messages.

Events:
- `message:send`
- `message:receive`
- `messages:history`

Responsibilities:
- Save public message in Redis
- Apply/refresh 12-hour TTL
- Emit message to room users
- Load room history

---

## `private-message.handler.ts`

Handles private messages.

Events:
- `private:send`
- `private:receive`
- `private:history`
- `private:opened`

Responsibilities:
- Save private message in Redis
- Send message only to sender and receiver
- Increase unread count for receiver
- Reset unread count when receiver opens private chat

---

## `disconnect.handler.ts`

Handles user disconnect.

Responsibilities:
- Remove active user from Redis
- Remove user from room set
- Notify room users
- Update room counts

---

# Redis Structure

## TTL

All temporary chat data should expire after:

```txt
12 hours = 43,200 seconds
```

Create a constant:

```ts
export const ROOM_SESSION_TTL_SECONDS = 43200;
```

---

# Redis Keys

## Active User

```txt
active:user:{username}
```

Example:

```txt
active:user:ali = socketId
```

Used for:
- Username uniqueness
- Finding user socket ID for private messages

---

## Socket User Mapping

```txt
socket:user:{socketId}
```

Example:

```txt
socket:user:abc123 = Ali
```

Used for:
- Disconnect cleanup

---

## User Current Room

```txt
user:{username}:room
```

Example:

```txt
user:ali:room = developers
```

Used for:
- Knowing which room user is currently in
- Cleanup on disconnect

---

## Room Users

```txt
room:{roomId}:users
```

Example:

```txt
room:developers:users
```

Redis type:

```txt
Set
```

Stores:

```txt
Ali
Rafay
Asim
Ayaz
```

Used for:
- Online users list
- Active room count

---

## Room Messages

```txt
room:{roomId}:messages
```

Example:

```txt
room:developers:messages
```

Redis type:

```txt
List
```

Stores JSON messages.

Used for:
- Public chat history
- 12-hour temporary room messages

---

## Private Messages

```txt
private:{userA}:{userB}:messages
```

Example:

```txt
private:ali:rafay:messages
```

Important:

Always sort usernames alphabetically before creating this key.

So:

```txt
Ali → Rafay
Rafay → Ali
```

Both use:

```txt
private:ali:rafay:messages
```

---

## Unread Count

```txt
unread:{receiver}:{sender}
```

Example:

```txt
unread:ali:rafay = 2
```

Used for:
- Private unread message badge

When Ali opens Rafay private chat:

```txt
Delete unread:ali:rafay
```

---

# Redis Key Helper File

## `server/src/redis/redis.keys.ts`

Recommended helpers:

```ts
export const redisKeys = {
  activeUser: (username: string) => `active:user:${username}`,
  socketUser: (socketId: string) => `socket:user:${socketId}`,
  userRoom: (username: string) => `user:${username}:room`,
  roomUsers: (roomId: string) => `room:${roomId}:users`,
  roomMessages: (roomId: string) => `room:${roomId}:messages`,
  privateMessages: (userA: string, userB: string) => {
    const [first, second] = [userA, userB].sort();
    return `private:${first}:${second}:messages`;
  },
  unread: (receiver: string, sender: string) => `unread:${receiver}:${sender}`,
};
```

---

# Room Config

## `server/src/config/rooms.ts`

Keep rooms fixed for the MVP.

```ts
export const ROOMS = [
  {
    id: "developers",
    name: "Developers",
    description: "Talk about coding, bugs, and projects.",
  },
  {
    id: "marketing",
    name: "Marketing",
    description: "Discuss campaigns, ideas, and growth.",
  },
  {
    id: "hr",
    name: "HR",
    description: "Team updates, hiring, and company policies.",
  },
];
```

---

# Shared Types

## User Type

```ts
export type User = {
  username: string;
  socketId: string;
  room?: string;
};
```

---

## Room Type

```ts
export type Room = {
  id: string;
  name: string;
  description: string;
  activeUsers: number;
};
```

---

## Public Message Type

```ts
export type PublicMessage = {
  id: string;
  room: string;
  sender: string;
  text: string;
  type: "public";
  createdAt: string;
};
```

---

## Private Message Type

```ts
export type PrivateMessage = {
  id: string;
  from: string;
  to: string;
  text: string;
  type: "private";
  createdAt: string;
};
```

---

# Environment Variables

## Client `.env.local`

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## Server `.env`

```env
PORT=5000
CLIENT_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
ROOM_SESSION_TTL_SECONDS=43200
```

---

# Package Suggestions

## Client Packages

```bash
npm install socket.io-client zustand clsx
```

Optional:

```bash
npm install lucide-react
```

---

## Server Packages

```bash
npm install express socket.io cors dotenv redis
npm install -D typescript ts-node-dev @types/node @types/express @types/cors
```

---

# Final Notes

Keep the MVP simple.

Do not add:
- Authentication
- Images
- Audio
- Video
- File sharing
- Complex database
- Friend requests
- User profiles

Build the real-time text chat first.

Then polish the UI.
