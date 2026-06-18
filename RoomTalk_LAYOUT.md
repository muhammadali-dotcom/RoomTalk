You are an expert full-stack developer and UI/UX designer.

Build a real-time multi-room text chat application called RoomTalk.

RoomTalk is a beginner-friendly portfolio project where users enter a username, join topic-based rooms, chat publicly inside rooms, send private messages to online room users, see unread private message badges, and all temporary chat data expires automatically after 12 hours using Redis TTL.

Important:
Do not add extra features.
Do not add authentication.
Do not add database.
Do not add file upload.
Do not add voice/video calls.
Do not add message reactions.
Do not add user profiles.
Do not add admin panel.
Keep it simple, clean, and exactly according to the MVP flow.

Tech Stack:
Frontend:

* Next.js
* TypeScript
* Tailwind CSS
* Socket.io-client
* lucide-react icons

Backend:

* Node.js
* Express.js
* Socket.io
* Redis

Design Style:

* Professional modern dark UI
* Do not use purple color
* Do not use gradient colors
* Use teal, emerald, cyan, white, gray, and dark colors
* Make it clean, attractive, and portfolio-worthy
* Use rounded cards, soft borders, clear spacing, and modern chat layout
* Make it responsive

Color Palette:

* Main background: #0B0F14
* Secondary background: #10151C
* Card background: #151A21
* Card hover: #1B222B
* Border: rgba(255,255,255,0.08)
* Primary text: #F8FAFC
* Secondary text: #A1A1AA
* Muted text: #71717A
* Accent teal: #2DD4BF
* Accent emerald: #34D399
* Online green: #22C55E
* Error/unread badge red: #EF4444

Main App Flow:

1. Username Screen

When the user opens the app, show the first screen.

Content:

* App name: RoomTalk
* Heading: “Welcome to RoomTalk”
* Subtitle: “Enter your username to start chatting”
* Username input
* Continue button

Behavior:

* User enters username, for example Ali
* Frontend sends username to backend using Socket.io
* Backend checks Redis if username is already active
* Redis key format:
  active:user:Ali = socketId
* If username already exists, show error:
  “Username already taken. Try another one.”
* If username is available:

  * Store active user in Redis
  * Set 12-hour expiry
  * Allow user to continue to rooms screen

Redis TTL:

* 12 hours = 43200 seconds

2. Rooms Screen

After username is accepted, show available rooms.

Rooms:

* Developers
* Marketing
* HR

Each room card should show:

* Room name
* Active user count
* Join Room button

Example:
Developers
3 active users
Join Room

Behavior:

* Backend gets active room counts from Redis
* Redis keys:
  room:developers:users
  room:marketing:users
  room:hr:users
* Show count for each room
* When counts update, all users on room screen should see updated counts in real time

3. Join Room

When user clicks Join Room:

* Add user to selected room in Redis
* Socket.io joins the socket to that room
* Navigate user to chat screen

Example:
Ali joins Developers

Redis:
room:developers:users contains Ali

Socket.io:
socket.join("developers")

Broadcast inside the room:
“Ali joined the room”

Update room count:
Developers: 4 active users

4. Chat Screen

Chat screen should show:

* Room name
* Public chat area
* Online users list
* Message input
* Send button
* Leave Room button

Example layout:
Developers Room

Public Chat
Rafay: We are discussing Socket.io
Asim: Redis TTL is useful
Ayaz: Nice

Online Users
Rafay
Asim
Ayaz

Input:
Type message...
Send

Important:

* The online users private chat list should not show the logged-in user.
* If Ali is logged in, show Rafay, Asim, Ayaz.
* Do not show Ali in his own private users list.

When chat screen opens:

* Backend loads recent public room messages from Redis
* Redis key:
  room:developers:messages
* Show all messages saved within the current 12-hour session

5. Public Room Chat

When Ali sends public message:
“Hello everyone”

Backend should:

* Save message in Redis list:
  room:developers:messages
* Refresh 12-hour TTL on the room messages key
* Send message only to users inside Developers room
* Marketing and HR users should not receive it

Public message object:
{
id: "msg_123",
room: "developers",
sender: "Ali",
text: "Hello everyone",
type: "public",
createdAt: "2026-06-18T10:30:00.000Z"
}

6. Online Users List

Inside room, show active users in that room.

Example:
Online Users
Rafay
Asim
Ayaz

Behavior:

* Update online users list in real time when someone joins, leaves, or disconnects
* Exclude current user from clickable private chat list

7. Private Chat Starts

When Ali clicks Rafay:

* Active chat changes from Public Chat to Private Chat with Rafay
* Backend loads private chat history between Ali and Rafay from Redis

Redis key:
private:ali:rafay:messages

Important:

* Usernames must be sorted lowercase to avoid duplicate private chat keys
* These should use the same Redis key:
  Ali to Rafay
  Rafay to Ali
* Use:
  private:ali:rafay:messages

UI:
Private Chat with Rafay
Message history
Input
Send button

8. Private Message Sending

When Ali sends Rafay:
“Hey Rafay”

Backend should:

* Save private message in Redis:
  private:ali:rafay:messages
* Refresh 12-hour TTL on private chat messages key
* Send message only to Ali and Rafay
* Do not send to Asim
* Do not send to Ayaz
* Do not send to public room

Private message object:
{
id: "msg_456",
from: "Ali",
to: "Rafay",
text: "Hey Rafay",
type: "private",
createdAt: "2026-06-18T10:35:00.000Z"
}

9. Unread Private Message Badge

If Ali is currently viewing Public Chat and Rafay sends Ali a private message:
Show:
Rafay (1)

If Rafay sends another:
Rafay (2)

If Asim sends one:
Rafay (2)
Asim (1)
Ayaz

Backend Redis keys:
unread:Ali:Rafay = 2
unread:Ali:Asim = 1

Behavior:

* Increase unread count only if recipient is not currently viewing that private chat
* When Ali opens Rafay private chat:

  * Remove unread count
  * UI shows Rafay without badge

10. Switching Chat Views

User can switch between:

* Public Chat
* Private Chat with Rafay
* Private Chat with Asim

Use simple beginner UI:

* Public button at top of chat area
* Online users sidebar
* Clicking a user opens private chat
* Clicking Public returns to room public chat

11. Leave Room

When Ali clicks Leave Room:

* Remove Ali from room users Redis set
* Socket.io removes Ali from room
* Broadcast inside room:
  “Ali left the room”
* Update room count for everyone
* Return Ali to rooms screen

Redis:
Remove Ali from:
room:developers:users

Socket.io:
socket.leave("developers")

12. Browser Close / Disconnect

If Ali closes browser or loses connection:
Backend Socket.io disconnect event should:

* Remove Ali from active users
* Remove Ali from current room users if he was in a room
* Broadcast to room:
  “Ali disconnected”
* Update room count automatically
* Update online users list automatically

Redis:
Remove:
active:user:Ali
room:developers:users

13. Redis 12-Hour Expiry

Use TTL of 43200 seconds.

Data that should expire:

* active:user:Ali
* room:developers:users
* room:marketing:users
* room:hr:users
* room:developers:messages
* room:marketing:messages
* room:hr:messages
* private:ali:rafay:messages
* unread:Ali:Rafay

Recommended expiry behavior:
Use 12 hours after last activity.

This means:

* Every new public message refreshes room messages TTL
* Every new private message refreshes private messages TTL
* Active user key expires after 12 hours
* Room user set expires after 12 hours
* Unread count expires after 12 hours

14. MVP Screens

Build only these screens:

Screen 1: Username Screen
Purpose:

* Enter username

Fields:

* Username input
* Continue button

Screen 2: Rooms Screen
Purpose:

* Choose a room

Shows:

* Developers active count
* Marketing active count
* HR active count

Screen 3: Chat Screen
Purpose:

* Public room chat
* Private chat with room users

Shows:

* Room name
* Public chat area
* Online users list
* Private chat option by clicking user
* Unread private message badge
* Message input
* Leave room button

15. MVP Feature List

Build only these features:

* Username entry
* Username uniqueness check
* Room list
* Active user count per room
* Join room
* Public room chat
* Store public messages in Redis
* Load public messages from Redis
* Online users list
* Private chat by clicking user
* Store private messages in Redis
* Load private messages from Redis
* Unread private message badge
* Leave room
* Disconnect cleanup
* Redis 12-hour expiry

16. Suggested Implementation Structure

Frontend:

* app/page.tsx
* components/UsernameScreen.tsx
* components/RoomsScreen.tsx
* components/ChatScreen.tsx
* components/RoomCard.tsx
* components/MessageBubble.tsx
* components/OnlineUsers.tsx
* components/UnreadBadge.tsx
* lib/socket.ts
* types/chat.ts

Backend:

* server/index.ts
* server/socket.ts
* server/redis.ts
* server/utils/redisKeys.ts
* server/utils/privateChatKey.ts
* server/types.ts

17. Socket Events

Use these socket events:

Client to Server:

* username:check
* rooms:get
* room:join
* room:leave
* message:public:send
* message:private:send
* message:private:open
* chat:public:open

Server to Client:

* username:accepted
* username:error
* rooms:update
* room:joined
* room:left
* room:users:update
* message:public:new
* message:private:new
* message:history
* unread:update
* system:message

18. Final Requirement

Generate complete working code for the RoomTalk MVP.

The result should be:

* Simple
* Clean
* Professional
* Easy to understand
* Easy to extend later
* Fully based on Socket.io and Redis
* No database
* No authentication
* No extra features
