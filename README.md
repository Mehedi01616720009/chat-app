# 💬 Real-Time Chat Application

A full-stack, real-time chat application built with **Next.js 16**, **Socket.IO**, **Prisma ORM**, and **PostgreSQL**. Supports one-to-one messaging, group chats with member management, unread message indicators, and cursor-based pagination — all in a clean, responsive UI powered by HeroUI and Tailwind CSS.

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
    - [Base URL](#base-url)
    - [Users](#users-api)
    - [Chats](#chats-api)
    - [Messages](#messages-api)
- [Features](#-features)
- [Database Schema](#-database-schema)
- [Socket.IO Events](#-socketio-events)
- [Author](#-author)

---

## 🧾 About the Project

This is a real-time, full-featured messaging application built as an assignment project. Users authenticate using their **name and phone number** (no password required), which registers or signs them in automatically. Once logged in, they can start one-to-one conversations or create named group chats.

All messages are delivered in real-time over **WebSockets** via Socket.IO. The UI provides unread message indicators (bold text, similar to Messenger/WhatsApp), pagination for older messages, and a group management panel to add or remove participants on the fly.

---

## 🛠 Tech Stack

### Frontend

| Technology           | Version | Purpose                                              |
| -------------------- | ------- | ---------------------------------------------------- |
| **Next.js**          | 16.3.2  | Full-stack React framework (App Router)              |
| **React**            | 19.2.8  | UI library                                           |
| **HeroUI**           | ^3.2.4  | Component library (Buttons, Modals, Inputs, Avatars) |
| **Tailwind CSS**     | ^4      | Utility-first CSS styling                            |
| **Socket.IO Client** | ^4.8.3  | Real-time WebSocket client                           |

### Backend

| Technology               | Version | Purpose                                      |
| ------------------------ | ------- | -------------------------------------------- |
| **Next.js API Routes**   | 16.3.2  | REST API endpoints                           |
| **Socket.IO**            | ^4.8.3  | Real-time WebSocket server                   |
| **Prisma ORM**           | ^7.9.1  | Type-safe database client                    |
| **`@prisma/adapter-pg`** | ^7.9.1  | PostgreSQL driver adapter for Prisma         |
| **pg**                   | ^8.23.0 | PostgreSQL native client                     |
| **Zod**                  | ^4.4.3  | Request body validation & schema enforcement |

### Database

| Technology     | Purpose                                            |
| -------------- | -------------------------------------------------- |
| **PostgreSQL** | Relational database for users, chats, and messages |

### Runtime & Tooling

| Technology     | Version | Purpose                   |
| -------------- | ------- | ------------------------- |
| **Bun**        | 1.3.13  | Package manager & runtime |
| **TypeScript** | ^5      | Static type safety        |
| **ESLint**     | ^9      | Code linting              |

---

## 📁 Project Structure

```
chat-app-assignment/
├── app/
│   ├── api/
│   │   ├── chats/
│   │   │   ├── route.ts                    # GET (list chats), POST (create chat/group)
│   │   │   └── [id]/
│   │   │       ├── route.ts                # GET (single chat)
│   │   │       ├── add-participants/
│   │   │       │   └── route.ts            # PATCH (add members to group)
│   │   │       ├── remove-participant/
│   │   │       │   └── route.ts            # PATCH (remove member from group)
│   │   │       └── mark-read/
│   │   │           └── route.ts            # PATCH (mark messages as read)
│   │   ├── messages/
│   │   │   └── route.ts                    # GET (paginated messages), POST (send message)
│   │   └── users/
│   │       └── route.ts                    # GET (search users), POST (login/register)
│   ├── chat/
│   │   ├── components/
│   │   │   ├── Sidebar.tsx                 # Chat list with unread indicators
│   │   │   ├── MainChat.tsx                # Active chat messages and input
│   │   │   ├── ChatInfoModal.tsx           # Chat info, add/remove members
│   │   │   ├── NewChatModal.tsx            # Start a new 1:1 conversation
│   │   │   └── NewGroupModal.tsx           # Create a new group chat
│   │   └── page.tsx                        # Main chat page orchestrator
│   ├── login/
│   │   └── page.tsx                        # Login / Register page
│   ├── globals.css                         # Global styles
│   └── layout.tsx                          # Root layout
├── lib/
│   ├── prisma.ts                           # Prisma client singleton
│   └── catchAsync.ts                       # Async error handler wrapper
├── module/
│   ├── chat/schema.ts                      # Chat Zod validation schemas
│   ├── message/schema.ts                   # Message Zod validation schemas
│   └── user/schema.ts                      # User Zod validation schemas
├── prisma/
│   └── schema.prisma                       # Database schema
├── server.ts                               # Custom HTTP + Socket.IO server
├── package.json
└── .env                                    # Environment variables
```

---

## 🚀 Getting Started

### Prerequisites

- **Bun** >= 1.3.x — [Install Bun](https://bun.sh/docs/installation)
- **PostgreSQL** database (local or remote, e.g., [Render](https://render.com), [Supabase](https://supabase.com))

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/chat-app.git
cd chat-app-assignment
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Configure Environment Variables

Copy or create a `.env` file at the root (see [Environment Variables](#-environment-variables)):

```bash
cp .env.example .env
# Then edit .env with your database URL
```

### 4. Push the Database Schema

```bash
bunx prisma db push
```

> This command syncs your `prisma/schema.prisma` with the database and generates the Prisma Client.

### 5. Generate Prisma Client (if needed separately)

```bash
bunx prisma generate
```

### 6. Run the Development Server

```bash
bun run dev
```

The app will be live at **[http://localhost:3000](http://localhost:3000)**.

### 7. Build for Production

```bash
bun run build
bun run start
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root with the following variable:

| Variable       | Description                       | Example                                                       |
| -------------- | --------------------------------- | ------------------------------------------------------------- |
| `DATABASE_URL` | Full PostgreSQL connection string | `postgresql://user:password@host:5432/dbname?sslmode=require` |

```env
DATABASE_URL="postgresql://root:yourpassword@localhost:5432/chatdb?schema=public"
```

> **Note for Render / Remote databases:** Append `?sslmode=require` to your connection string and whitelist your local IP address in your database provider's Access Control settings.

---

## 📡 API Reference

### Base URL

```
http://localhost:3000/api
```

All endpoints return JSON. Error responses follow the shape:

```json
{
    "error": "Human-readable error message"
}
```

---

### Users API

#### `POST /api/users` — Login or Register

Creates a new user account if the phone number is not found; returns the existing user otherwise. This serves as the combined **login and registration** endpoint.

**Request Body**

| Field   | Type     | Required | Description                                 |
| ------- | -------- | -------- | ------------------------------------------- |
| `name`  | `string` | ✅       | Full name of the user                       |
| `phone` | `string` | ✅       | Unique phone number (e.g. `+8801XXXXXXXXX`) |

```json
{
    "name": "Mehedi Hasan",
    "phone": "+8801616720009"
}
```

**Success Response** — `200 OK`

```json
{
    "id": "a1b2c3d4-...",
    "name": "Mehedi Hasan",
    "phone": "+8801616720009",
    "createdAt": "2026-08-22T06:00:00.000Z",
    "updatedAt": "2026-08-22T06:00:00.000Z"
}
```

**Error Responses**

| Status | Condition                                     |
| ------ | --------------------------------------------- |
| `400`  | Validation failed (missing `name` or `phone`) |
| `500`  | Internal server error                         |

---

#### `GET /api/users` — Search Users

Searches all registered users by name or phone number. Primarily used to populate the user search within the New Chat and New Group modals.

**Query Parameters**

| Parameter | Type     | Required | Description                                                    |
| --------- | -------- | -------- | -------------------------------------------------------------- |
| `search`  | `string` | ❌       | Case-insensitive search term matched against `name` or `phone` |

**Example Requests**

```
GET /api/users
GET /api/users?search=Mehedi
GET /api/users?search=+880
```

**Success Response** — `200 OK`

```json
[
    {
        "id": "a1b2c3d4-...",
        "name": "Mehedi Hasan",
        "phone": "+8801616720009",
        "createdAt": "2026-08-22T06:00:00.000Z",
        "updatedAt": "2026-08-22T06:00:00.000Z"
    }
]
```

---

### Chats API

#### `GET /api/chats` — List User's Chats

Fetches all chats that a specific user is a participant in. Results are sorted by most recently updated (newest message first). Each chat includes all participants and the single most recent message for sidebar preview.

**Query Parameters**

| Parameter | Type     | Required | Description                            |
| --------- | -------- | -------- | -------------------------------------- |
| `userId`  | `string` | ✅       | The ID of the currently logged-in user |

**Example Request**

```
GET /api/chats?userId=a1b2c3d4-...
```

**Success Response** — `200 OK`

```json
[
    {
        "id": "chat-uuid-...",
        "type": "ONE_TO_ONE",
        "name": null,
        "createdAt": "2026-08-22T06:00:00.000Z",
        "updatedAt": "2026-08-22T07:30:00.000Z",
        "participants": [
            {
                "id": "participant-uuid-...",
                "chatId": "chat-uuid-...",
                "userId": "user-uuid-...",
                "joinedAt": "2026-08-22T06:00:00.000Z",
                "user": {
                    "id": "user-uuid-...",
                    "name": "Mehedi Hasan",
                    "phone": "+8801616720009"
                }
            }
        ],
        "messages": [
            {
                "id": "msg-uuid-...",
                "chatId": "chat-uuid-...",
                "senderId": "user-uuid-...",
                "content": "Hello!",
                "isRead": false,
                "createdAt": "2026-08-22T07:30:00.000Z",
                "updatedAt": "2026-08-22T07:30:00.000Z"
            }
        ]
    }
]
```

**Error Responses**

| Status | Condition                           |
| ------ | ----------------------------------- |
| `400`  | `userId` query parameter is missing |

---

#### `POST /api/chats` — Create a Chat or Group

Creates a new chat. If a `name` is provided, the chat is created as a **GROUP** (minimum 3 participants required, including yourself). Otherwise, a standard **ONE_TO_ONE** chat is created.

**Request Body**

| Field            | Type       | Required | Description                                                  |
| ---------------- | ---------- | -------- | ------------------------------------------------------------ |
| `participantIds` | `string[]` | ✅       | Array of all participant user IDs (must include your own ID) |
| `name`           | `string`   | ❌       | Group name. If provided, chat type becomes `GROUP`           |

**Example — Create 1:1 Chat**

```json
{
    "participantIds": ["user-id-1", "user-id-2"]
}
```

**Example — Create Group Chat**

```json
{
    "name": "Project Team",
    "participantIds": ["user-id-1", "user-id-2", "user-id-3"]
}
```

**Success Response** — `200 OK`

```json
{
    "id": "chat-uuid-...",
    "type": "GROUP",
    "name": "Project Team",
    "createdAt": "2026-08-22T08:00:00.000Z",
    "updatedAt": "2026-08-22T08:00:00.000Z"
}
```

**Error Responses**

| Status | Condition                                |
| ------ | ---------------------------------------- |
| `400`  | One or more participant IDs are invalid  |
| `400`  | Group chat has fewer than 3 participants |

---

#### `GET /api/chats/:id` — Get Single Chat

Fetches the full details of a single chat by its ID, including all participants and their user profiles. Used when a user accesses a chat via direct URL link.

**Path Parameters**

| Parameter | Type     | Description      |
| --------- | -------- | ---------------- |
| `id`      | `string` | UUID of the chat |

**Success Response** — `200 OK`

Returns the full chat object with nested participants and user data (same shape as `GET /api/chats` items).

**Error Responses**

| Status | Condition      |
| ------ | -------------- |
| `404`  | Chat not found |

---

#### `PATCH /api/chats/:id/add-participants` — Add Members to Group

Adds one or more new users to an existing **GROUP** chat. Silently skips users who are already participants (`skipDuplicates`).

**Path Parameters**

| Parameter | Type     | Description            |
| --------- | -------- | ---------------------- |
| `id`      | `string` | UUID of the group chat |

**Request Body**

| Field            | Type       | Required | Description              |
| ---------------- | ---------- | -------- | ------------------------ |
| `participantIds` | `string[]` | ✅       | Array of user IDs to add |

```json
{
    "participantIds": ["new-user-id-1", "new-user-id-2"]
}
```

**Success Response** — `200 OK`

Returns the updated chat object.

**Error Responses**

| Status | Condition                                            |
| ------ | ---------------------------------------------------- |
| `400`  | One or more participant IDs are invalid or not found |
| `400`  | Chat type is `ONE_TO_ONE` (cannot add participants)  |
| `404`  | Chat not found                                       |

---

#### `PATCH /api/chats/:id/remove-participant` — Remove a Member from Group

Removes a single user from a **GROUP** chat. A user may also use this to remove themselves (leave the group).

**Path Parameters**

| Parameter | Type     | Description            |
| --------- | -------- | ---------------------- |
| `id`      | `string` | UUID of the group chat |

**Request Body**

| Field           | Type     | Required | Description                              |
| --------------- | -------- | -------- | ---------------------------------------- |
| `participantId` | `string` | ✅       | The user ID of the participant to remove |

```json
{
    "participantId": "user-id-to-remove"
}
```

**Success Response** — `200 OK`

Returns the chat object.

**Error Responses**

| Status | Condition                 |
| ------ | ------------------------- |
| `400`  | `participantId` not found |
| `400`  | Chat type is `ONE_TO_ONE` |
| `404`  | Chat not found            |

---

#### `PATCH /api/chats/:id/mark-read` — Mark Messages as Read

Marks all unread messages in a given chat as read for the current user. Triggered automatically when a user opens a chat or receives a message while the chat is active.

**Path Parameters**

| Parameter | Type     | Description      |
| --------- | -------- | ---------------- |
| `id`      | `string` | UUID of the chat |

**Request Body**

| Field    | Type     | Required | Description                                                            |
| -------- | -------- | -------- | ---------------------------------------------------------------------- |
| `userId` | `string` | ✅       | The current user's ID (messages sent by others will be marked as read) |

```json
{
    "userId": "current-user-id"
}
```

**Success Response** — `200 OK`

```json
{
    "count": 5
}
```

> `count` is the number of messages that were updated.

---

### Messages API

#### `GET /api/messages` — Fetch Messages (with Cursor Pagination)

Fetches messages for a given chat. Returns up to **50 messages** at a time, ordered ascending by `createdAt`. Supports cursor-based pagination for loading older messages.

**Query Parameters**

| Parameter | Type     | Required | Description                                                                                                   |
| --------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| `chatId`  | `string` | ✅       | UUID of the chat to fetch messages for                                                                        |
| `cursor`  | `string` | ❌       | The `id` of the oldest currently loaded message. When provided, fetches the 50 messages _before_ this cursor. |

**Example Requests**

```
# Initial load (most recent 50 messages)
GET /api/messages?chatId=chat-uuid-...

# Load older messages (pagination)
GET /api/messages?chatId=chat-uuid-...&cursor=oldest-message-id
```

**Success Response** — `200 OK`

```json
[
    {
        "id": "msg-uuid-...",
        "chatId": "chat-uuid-...",
        "senderId": "user-uuid-...",
        "content": "Hello, world!",
        "isRead": true,
        "createdAt": "2026-08-22T07:00:00.000Z",
        "updatedAt": "2026-08-22T07:00:00.000Z",
        "sender": {
            "id": "user-uuid-...",
            "name": "Mehedi Hasan",
            "phone": "+8801616720009"
        }
    }
]
```

**Error Responses**

| Status | Condition                           |
| ------ | ----------------------------------- |
| `400`  | `chatId` query parameter is missing |

---

#### `POST /api/messages` — Send a Message

Creates a new message in a chat and emits a `new-message` Socket.IO event to all clients in the same chat room. Validates that the sender is an active participant before saving.

**Request Body**

| Field      | Type     | Required | Description                             |
| ---------- | -------- | -------- | --------------------------------------- |
| `chatId`   | `string` | ✅       | UUID of the chat to post the message in |
| `senderId` | `string` | ✅       | UUID of the user sending the message    |
| `content`  | `string` | ✅       | The text content of the message         |

```json
{
    "chatId": "chat-uuid-...",
    "senderId": "user-uuid-...",
    "content": "Hey, how are you?"
}
```

**Success Response** — `200 OK`

Returns the full message object with sender data (same shape as GET response items).

**Error Responses**

| Status | Condition                               |
| ------ | --------------------------------------- |
| `403`  | Sender is not a participant in the chat |
| `400`  | Validation failed (missing fields)      |

---

## ✨ Features

- **Phone-based Authentication** — No passwords. Users log in or auto-register using just their name and phone number. Session is stored in `localStorage` and a browser cookie.

- **One-to-One Messaging** — Start a private conversation with any registered user via the "New Chat" modal.

- **Group Chats** — Create named group chats with three or more participants via the "New Group" modal, with multi-select chip UI.

- **Real-Time Messaging** — All messages are delivered instantly over WebSockets (Socket.IO). Users are automatically joined into chat rooms when the sidebar loads.

- **Unread Message Indicators** — If the last message in a chat was sent by someone else and hasn't been read yet, the chat name and message preview appear in **bold** in the sidebar, mimicking Messenger/WhatsApp.

- **Automatic Mark as Read** — Opening a chat automatically marks all unread messages in it as read via the `PATCH /mark-read` API, clearing the bold indicator.

- **Cursor-Based Pagination** — The message window loads the latest 50 messages. A "Load previous messages" button allows loading older batches without losing scroll position.

- **Add Group Members** — Group admins can search for and add new users to an existing group from the "Chat Info" modal.

- **Remove Group Members** — Any participant can be removed from a group via the "Chat Info" modal. Removing yourself acts as a "leave group" action.

- **Participant Access Control** — If a user is removed from a group and tries to access it via a direct URL, the message input is hidden and replaced with a "You are no longer a participant" notice.

- **Chat Info Modal** — Clicking "Info" on any active chat reveals a modal showing all participants, with options to add/remove members in group chats.

- **Debounced User Search** — User search in the New Chat and New Group modals is debounced (400ms) to avoid excessive API calls while typing.

- **Responsive Split-Pane Layout** — Fixed sidebar with scrollable chat list on the left; the main chat panel fills the remaining space.

---

## 🗄 Database Schema

```prisma
enum ChatType {
    ONE_TO_ONE
    GROUP
}

model User {
    id        String   @id @default(uuid())
    name      String
    phone     String   @unique
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    participants ChatParticipant[]
    messages     Message[]
}

model Chat {
    id        String   @id @default(uuid())
    type      ChatType @default(ONE_TO_ONE)
    name      String?           // Only set for GROUP chats
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    participants ChatParticipant[]
    messages     Message[]
}

model ChatParticipant {
    id       String   @id @default(uuid())
    chatId   String
    userId   String
    joinedAt DateTime @default(now())

    chat Chat @relation(fields: [chatId], references: [id], onDelete: Cascade)
    user User @relation(fields: [userId], references: [id], onDelete: Cascade)

    @@unique([chatId, userId])
}

model Message {
    id        String   @id @default(uuid())
    chatId    String
    senderId  String
    content   String
    isRead    Boolean  @default(false)
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    chat   Chat @relation(fields: [chatId], references: [id], onDelete: Cascade)
    sender User @relation(fields: [senderId], references: [id], onDelete: Cascade)
}
```

---

## 🔌 Socket.IO Events

The server runs a custom Socket.IO instance alongside Next.js (see `server.ts`).

### Client → Server

| Event        | Payload          | Description                                                        |
| ------------ | ---------------- | ------------------------------------------------------------------ |
| `join-chat`  | `chatId: string` | Joins the socket to a specific chat room to receive its messages   |
| `leave-chat` | `chatId: string` | Removes the socket from a chat room (emitted on component unmount) |

### Server → Client

| Event         | Payload                             | Description                                                              |
| ------------- | ----------------------------------- | ------------------------------------------------------------------------ |
| `new-message` | Full message object (with `sender`) | Broadcast to all sockets in a `chatId` room when a new message is posted |

The `new-message` event is emitted by the `POST /api/messages` route immediately after persisting the message to the database.

---

## 👤 Author

**Mehedi Hasan**
📧 [mehedi01616720009@gmail.com](mailto:mehedi01616720009@gmail.com)

---

> Built with ❤️ using Next.js, Prisma, Socket.IO, and Bun.
