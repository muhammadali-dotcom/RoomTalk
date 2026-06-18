# RoomTalk Project Execution Plan

RoomTalk is a text-only real-time multi-room chat application built with:

```txt
Next.js + TypeScript + Tailwind CSS
Node.js + Express.js + Socket.io
Redis for temporary 12-hour chat storage
```

This document explains the complete build flow, feature phases, socket events, Redis behavior, and execution order.

---

# Project Goal

Build a beginner-friendly but portfolio-worthy real-time chat app where:

- User enters a username
- User sees rooms with active user count
- User joins a room
- User chats publicly with room members
- User clicks another active user to start private chat
- User sees unread private message badges
- Messages and session data are stored in Redis
- Redis automatically expires data after 12 hours

---

# Core App Flow

```txt
Open App
   ↓
Enter Username
   ↓
Backend checks username in Redis
   ↓
Username accepted
   ↓
Show rooms with active user counts
   ↓
User joins Developers
   ↓
Load Developers messages from Redis
   ↓
Show online users in Developers
   ↓
User sends public messages
   ↓
User clicks Rafay
   ↓
Load private messages from Redis
   ↓
User sends private messages
   ↓
Unread badge updates when private message arrives
   ↓
User leaves room or disconnects
   ↓
Redis auto-cleans data after 12 hours
```

---

# MVP Screens

## Screen 1: Username Screen

Route:

```txt
/
```

Purpose:

```txt
Ask user to enter a username.
```

UI:

```txt
Welcome to RoomTalk

Enter your username

[ Ali ]

[ Continue ]
```

Actions:
- User enters username
- Frontend emits `user:join`
- Backend checks Redis
- If username exists, show error
- If username is available, store active user and move to rooms screen

---

## Screen 2: Rooms Screen

Route:

```txt
/rooms
```

Purpose:

```txt
Show available rooms with active user counts.
```

UI:

```txt
Choose a Room

Developers
3 active users
[ Join Room ]

Marketing
1 active user
[ Join Room ]

HR
0 active users
[ Join Room ]
```

Actions:
- Frontend emits `rooms:get`
- Backend reads counts from Redis sets
- Frontend shows active user count
- User clicks Join Room
- Frontend emits `room:join`

---

## Screen 3: Chat Screen

Route:

```txt
/chat/[room]
```

Purpose:

```txt
Public room chat + private chat.
```

UI:

```txt
Developers Room

Online Users
Rafay (1)
Asim
Ayaz

Public Chat
Rafay: We are discussing Socket.io
Asim: Redis TTL is useful
Ayaz: Nice

[ Type message... ] [ Send ]
```

Actions:
- Load public room message history
- Show online users
- Send public messages
- Open private chat by clicking a user
- Send private messages
- Show unread private message badge
- Leave room

---

# Phase-Based Build Plan

## Phase 1: Basic Frontend Screens

Build frontend UI without backend first.

Create:
- Username screen
- Room selection screen
- Chat screen

Focus only on layout.

Do not connect Socket.io yet.

### Tasks

```txt
Create Next.js app
Install Tailwind CSS
Create page.tsx for username screen
Create /rooms page
Create /chat/[room] page
Create reusable UI components
```

### Done When

```txt
You can move between username screen, rooms screen, and chat screen using local state or router.
```

---

# Phase 2: Backend Setup

Create Node.js + Express + TypeScript server.

### Tasks

```txt
Create server folder
Install Express
Install Socket.io
Install Redis package
Configure TypeScript
Create health route
Start backend server
```

### Backend Health Check

```txt
GET /health
```

Expected response:

```json
{
  "status": "ok",
  "message": "RoomTalk server is running"
}
```

### Done When

```txt
Backend runs on http://localhost:5000
```

---

# Phase 3: Socket.io Connection

Connect frontend and backend using Socket.io.

### Events

Client emits:

```txt
socket:connect
```

Server logs:

```txt
User connected: socketId
```

Server handles:

```txt
disconnect
```

### Tasks

```txt
Install socket.io-client in frontend
Create socket client helper
Connect frontend to backend
Show connection status in console
Handle disconnect
```

### Done When

```txt
Opening frontend logs a socket connection on backend.
Closing browser logs disconnect.
```

---

# Phase 4: Redis Setup

Connect backend with Redis.

### Tasks

```txt
Install Redis locally or use Upstash Redis
Add REDIS_URL in .env
Create redis.client.ts
Test Redis connection
Create Redis key helpers
Create TTL constant
```

### TTL Constant

```ts
export const ROOM_SESSION_TTL_SECONDS = 43200;
```

### Done When

```txt
Backend connects to Redis successfully.
```

---

# Phase 5: Username System

When user opens the app, they enter username.

### Socket Event

Client emits:

```txt
user:join
```

Payload:

```ts
{
  username: "Ali"
}
```

### Backend Logic

1. Normalize username
2. Check Redis key:

```txt
active:user:ali
```

3. If key exists, emit error:

```txt
user:error
```

4. If available, save:

```txt
active:user:ali = socketId
socket:user:{socketId} = ali
```

5. Apply 12-hour TTL
6. Emit success:

```txt
user:accepted
```

### Redis Keys

```txt
active:user:{username}
socket:user:{socketId}
```

### Done When

```txt
User cannot join with a duplicate active username.
User can continue when username is available.
```

---

# Phase 6: Room List and Active Counts

After username is accepted, show room list.

### Socket Event

Client emits:

```txt
rooms:get
```

Server responds:

```txt
rooms:list
```

Payload:

```ts
[
  {
    id: "developers",
    name: "Developers",
    description: "Talk about coding, bugs, and projects.",
    activeUsers: 3
  },
  {
    id: "marketing",
    name: "Marketing",
    description: "Discuss campaigns, ideas, and growth.",
    activeUsers: 1
  },
  {
    id: "hr",
    name: "HR",
    description: "Team updates, hiring, and policies.",
    activeUsers: 0
  }
]
```

### Backend Logic

Use Redis set count:

```txt
SCARD room:developers:users
SCARD room:marketing:users
SCARD room:hr:users
```

### Done When

```txt
Rooms page shows real active user counts from Redis.
```

---

# Phase 7: Join Room

User clicks Join Developers.

### Socket Event

Client emits:

```txt
room:join
```

Payload:

```ts
{
  roomId: "developers"
}
```

### Backend Logic

1. Get username from socket:

```txt
socket:user:{socketId}
```

2. Add socket to Socket.io room:

```txt
developers
```

3. Add user to Redis set:

```txt
room:developers:users
```

4. Store user current room:

```txt
user:ali:room = developers
```

5. Apply/refresh TTL
6. Load room message history from Redis
7. Emit room users list
8. Emit join notification to room
9. Update room counts for all users

### Redis Keys

```txt
room:{roomId}:users
user:{username}:room
room:{roomId}:messages
```

### Done When

```txt
Ali joins Developers.
Other users in Developers see Ali joined.
Developers active count updates.
```

---

# Phase 8: Load Room Messages

When user joins a room, load old messages from Redis.

### Socket Event

Server emits:

```txt
messages:history
```

Payload:

```ts
[
  {
    id: "msg_123",
    room: "developers",
    sender: "Rafay",
    text: "We are discussing Socket.io",
    type: "public",
    createdAt: "2026-06-18T10:30:00.000Z"
  }
]
```

### Redis Command

```txt
LRANGE room:developers:messages 0 -1
```

### Done When

```txt
User sees previous room messages from the current 12-hour Redis session.
```

---

# Phase 9: Public Room Chat

Ali sends:

```txt
Hello everyone
```

### Socket Event

Client emits:

```txt
message:send
```

Payload:

```ts
{
  room: "developers",
  text: "Hello everyone"
}
```

### Backend Logic

1. Get username from socket
2. Create message object
3. Save message in Redis list
4. Refresh TTL
5. Emit message to everyone in room

### Redis Key

```txt
room:developers:messages
```

### Message Object

```ts
{
  id: "msg_123",
  room: "developers",
  sender: "Ali",
  text: "Hello everyone",
  type: "public",
  createdAt: "2026-06-18T10:30:00.000Z"
}
```

### Server Emits

```txt
message:receive
```

To:

```txt
developers room only
```

### Done When

```txt
Message appears instantly for all users inside Developers.
Marketing and HR users do not receive Developers messages.
```

---

# Phase 10: Online Users List

Inside Developers room, show:

```txt
Online Users

Rafay
Asim
Ayaz
```

Ali should not see himself in private chat list.

### Backend Event

Server emits:

```txt
room:users
```

Payload:

```ts
[
  {
    username: "Rafay"
  },
  {
    username: "Asim"
  },
  {
    username: "Ayaz"
  }
]
```

### Frontend Logic

Filter current user:

```ts
const visibleUsers = users.filter(user => user.username !== currentUsername);
```

### Done When

```txt
Ali sees active users in Developers except himself.
```

---

# Phase 11: Private Chat Opens

Ali clicks Rafay.

### Frontend Logic

Set active chat:

```txt
activeChat = private
selectedPrivateUser = Rafay
```

### Socket Event

Client emits:

```txt
private:open
```

Payload:

```ts
{
  withUser: "Rafay"
}
```

### Backend Logic

1. Create sorted private message key
2. Load private messages from Redis
3. Reset unread count for Ali from Rafay
4. Emit private message history

### Redis Keys

```txt
private:ali:rafay:messages
unread:ali:rafay
```

### Done When

```txt
Private chat with Rafay opens.
Old private messages load.
Unread badge for Rafay resets to 0.
```

---

# Phase 12: Private Message Sending

Ali sends Rafay:

```txt
Hey Rafay
```

### Socket Event

Client emits:

```txt
private:send
```

Payload:

```ts
{
  to: "Rafay",
  text: "Hey Rafay"
}
```

### Backend Logic

1. Get sender from socket
2. Find receiver socket ID from Redis:

```txt
active:user:rafay
```

3. Create private message object
4. Save message in Redis list
5. Refresh TTL
6. Emit message to sender
7. Emit message to receiver
8. Increase receiver unread count if receiver is not currently viewing that chat

### Redis Keys

```txt
private:ali:rafay:messages
unread:rafay:ali
```

### Message Object

```ts
{
  id: "msg_456",
  from: "Ali",
  to: "Rafay",
  text: "Hey Rafay",
  type: "private",
  createdAt: "2026-06-18T10:35:00.000Z"
}
```

### Done When

```txt
Only Ali and Rafay receive the private message.
Asim and Ayaz do not receive it.
```

---

# Phase 13: Unread Private Message Badge

Ali is viewing public chat.

Rafay sends Ali private message.

Ali sees:

```txt
Rafay (1)
```

If another message comes:

```txt
Rafay (2)
```

### Redis Key

```txt
unread:{receiver}:{sender}
```

Example:

```txt
unread:ali:rafay = 2
```

### Backend Logic

When private message is sent:
- If receiver is not actively viewing sender chat, increment unread count
- Emit updated unread count to receiver

When private chat opens:
- Delete unread count
- Emit updated unread count as 0

### Socket Events

Server emits:

```txt
unread:update
```

Payload:

```ts
{
  from: "Rafay",
  count: 2
}
```

### Done When

```txt
Unread badge increases when private chat is not open.
Unread badge resets when private chat opens.
```

---

# Phase 14: Leave Room

Ali clicks Leave Room.

### Socket Event

Client emits:

```txt
room:leave
```

Payload:

```ts
{
  roomId: "developers"
}
```

### Backend Logic

1. Get username from socket
2. Remove user from Redis set:

```txt
room:developers:users
```

3. Remove user room key:

```txt
user:ali:room
```

4. Remove socket from Socket.io room
5. Notify room users
6. Update room count
7. Send user back to rooms screen

### Done When

```txt
Ali leaves Developers.
Developers users see Ali left the room.
Developers active count decreases.
```

---

# Phase 15: Disconnect Cleanup

If user closes browser or disconnects.

### Socket Event

Built-in Socket.io event:

```txt
disconnect
```

### Backend Logic

1. Get username:

```txt
socket:user:{socketId}
```

2. Get current room:

```txt
user:{username}:room
```

3. Remove user from room users set
4. Delete active user key
5. Delete socket user key
6. Delete user room key
7. Notify room users
8. Update room counts

### Done When

```txt
Closed browser removes user from active room users.
Room count updates automatically.
```

---

# Phase 16: Redis 12-Hour Expiry

All temporary data should expire after 12 hours.

### TTL

```txt
12 hours = 43,200 seconds
```

### Keys That Expire

```txt
active:user:{username}
socket:user:{socketId}
user:{username}:room
room:{roomId}:users
room:{roomId}:messages
private:{userA}:{userB}:messages
unread:{receiver}:{sender}
```

### Recommended Expiry Behavior

Use:

```txt
12 hours after last activity
```

This means every new room activity refreshes the TTL.

Example:

```txt
Ali sends message at 10:00 AM
Room expires at 10:00 PM

Rafay sends message at 2:00 PM
Room expiry extends to 2:00 AM
```

### Done When

```txt
Redis automatically removes inactive chat data after 12 hours.
```

---

# Socket Event Summary

## User Events

```txt
user:join
user:accepted
user:error
```

## Room Events

```txt
rooms:get
rooms:list
rooms:update
room:join
room:leave
room:users
```

## Public Message Events

```txt
message:send
message:receive
messages:history
```

## Private Message Events

```txt
private:open
private:history
private:send
private:receive
```

## Unread Events

```txt
unread:update
```

## System Events

```txt
system:message
disconnect
```

---

# Redis Key Summary

```txt
active:user:{username}
socket:user:{socketId}
user:{username}:room
room:{roomId}:users
room:{roomId}:messages
private:{userA}:{userB}:messages
unread:{receiver}:{sender}
```

---

# Important Rules

## Username Rule

```txt
Two active users cannot use the same username.
```

## Room Rule

```txt
A public room message is visible only to users inside that room.
```

## Private Message Rule

```txt
A private message is visible only to the sender and receiver.
```

## Unread Badge Rule

```txt
Unread count increases only when the receiver is not currently viewing that private chat.
```

## Redis TTL Rule

```txt
Chat/session data expires automatically after 12 hours of inactivity.
```

## Self User Rule

```txt
User should not see himself in the private chat users list.
```

---

# Beginner Development Order

Build in this exact order:

```txt
1. Setup Next.js frontend
2. Setup Express backend
3. Connect Socket.io
4. Connect Redis
5. Build username system
6. Build room list
7. Build join room
8. Build active room counts
9. Build public chat
10. Save public messages in Redis
11. Load public history from Redis
12. Build online users list
13. Build private chat opening
14. Save private messages in Redis
15. Load private chat history
16. Build unread badge
17. Build leave room
18. Build disconnect cleanup
19. Add Redis 12-hour TTL
20. Polish UI
```

---

# Final MVP Feature Checklist

```txt
[ ] Username entry
[ ] Username uniqueness check
[ ] Room list
[ ] Active user count per room
[ ] Join room
[ ] Load public room messages from Redis
[ ] Public room chat
[ ] Store public messages in Redis
[ ] Online users list
[ ] Private chat by clicking user
[ ] Load private messages from Redis
[ ] Store private messages in Redis
[ ] Unread private message badge
[ ] Reset unread count when private chat opens
[ ] Leave room
[ ] Disconnect cleanup
[ ] Redis 12-hour expiry
[ ] Responsive UI
[ ] Dark mode
[ ] Auto-scroll to latest message
[ ] Message timestamps
[ ] Empty room state
```

---

# Final Portfolio Description

```txt
RoomTalk is a real-time multi-room chat application where users can join topic-based rooms, view active room counts, chat publicly with room members, start private text conversations, see unread private message badges, and store temporary chat sessions using Redis TTL with automatic 12-hour cleanup.
```

---

# Suggested README Short Description

```txt
RoomTalk is a text-only real-time chat app built with Next.js, TypeScript, Node.js, Express, Socket.io, and Redis. Users can enter with a username, join topic-based rooms, chat publicly, send private messages, view unread message badges, and keep temporary chat history for 12 hours using Redis TTL.
```
