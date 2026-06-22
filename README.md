# RoomTalk

RoomTalk is a real-time anonymous multi-room chat application built with Next.js, Node.js, Socket.io, and Redis. Users can join public rooms, send live messages, start private one-to-one conversations, track unread direct messages, and rely on Redis-based temporary storage where chat/session data automatically expires after 12 hours.

---

## Overview

RoomTalk is designed as a lightweight real-time chat system focused on temporary conversations. Users do not need to create an account. They choose a temporary username, join a room, chat publicly, and start private conversations with other active users.

The project demonstrates real-time communication, Redis session management, room-based presence tracking, private messaging, unread message counts, and TTL-based data expiry.

---

## Features

### User Session

- Temporary username-based login
- Username uniqueness validation
- Active user tracking with Redis
- Logout support
- Automatic cleanup on disconnect
- 12-hour session expiry

### Rooms

- Public room selection dashboard
- Active user count per room
- Join and leave room functionality
- Room users list
- Real-time room count updates

### Public Chat

- Real-time public messaging inside rooms
- Room-based message broadcasting
- Public message history stored in Redis
- Messages automatically expire after 12 hours

### Private Direct Messages

- One-to-one private messaging
- Private conversations between users
- Redis-backed private message history
- Direct Messages list
- Unread private message badges
- Reopen private conversations from dashboard
- Private messages do not appear in public chat

### UI

- Modern responsive interface
- Dark and light theme support
- Theme persistence using localStorage
- Clean dashboard layout
- Chat screen with public/private modes
- Direct Messages sidebar
- User avatars and online indicators

---

## Tech Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- Socket.io Client
- Lucide React

### Backend

- Node.js
- Express.js
- TypeScript
- Socket.io
- Redis

---

## Architecture

```txt
RoomTalk
│
├── Frontend
│   ├── Next.js App
│   ├── Dashboard
│   ├── Room Chat
│   ├── Private Chat
│   ├── Direct Messages
│   └── Theme System
│
├── Backend
│   ├── Express Server
│   ├── Socket.io Server
│   ├── User Handlers
│   ├── Room Handlers
│   ├── Message Handlers
│   └── Private Message Handlers
│
└── Redis
    ├── Active Users
    ├── Room Users
    ├── Public Messages
    ├── Private Messages
    ├── Direct Message Lists
    └── Unread Counts
