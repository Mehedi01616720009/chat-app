"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const apiMarkdown = `
# 📡 Chat API Documentation

Welcome to the API Documentation for the Real-Time Chat Application. This guide details the endpoints available, their parameters, required request bodies, and expected responses.

## Base URL

\`\`\`text
http://localhost:3000/api
\`\`\`

All endpoints consume and return \`application/json\`. Error responses consistently follow this shape:

\`\`\`json
{
    "error": "Human-readable error message detailing what went wrong"
}
\`\`\`

---

## 👥 Users API

### \`POST /api/users\` — Login or Register

Authenticates a user based on their phone number. If the phone number does not exist in the database, a new user account is automatically created. This serves as a seamless, passwordless login/registration endpoint.

**Request Body**

| Field   | Type     | Required | Description                                 |
| ------- | -------- | -------- | ------------------------------------------- |
| \`name\`  | \`string\` | ✅       | Full name of the user                       |
| \`phone\` | \`string\` | ✅       | Unique phone number (e.g. \`+8801XXXXXXXXX\`) |

**Example Request:**

\`\`\`json
{
    "name": "Mehedi Hasan",
    "phone": "+8801616720009"
}
\`\`\`

**Success Response** — \`200 OK\`

\`\`\`json
{
    "id": "a1b2c3d4-...",
    "name": "Mehedi Hasan",
    "phone": "+8801616720009",
    "createdAt": "2026-08-22T06:00:00.000Z",
    "updatedAt": "2026-08-22T06:00:00.000Z"
}
\`\`\`

**Error Responses**

| Status | Condition                                     |
| ------ | --------------------------------------------- |
| \`400\`  | Validation failed (missing \`name\` or \`phone\`) |
| \`500\`  | Internal server error                         |

---

### \`GET /api/users\` — Search Users

Searches all registered users in the system. Primarily used to populate the user selection lists when creating a New Chat or New Group.

**Query Parameters**

| Parameter | Type     | Required | Description                                                    |
| --------- | -------- | -------- | -------------------------------------------------------------- |
| \`search\`  | \`string\` | ❌       | Case-insensitive search term matched against \`name\` or \`phone\` |

**Example Requests:**

\`\`\`text
GET /api/users
GET /api/users?search=Mehedi
GET /api/users?search=+880
\`\`\`

**Success Response** — \`200 OK\`

\`\`\`json
[
    {
        "id": "a1b2c3d4-...",
        "name": "Mehedi Hasan",
        "phone": "+8801616720009",
        "createdAt": "2026-08-22T06:00:00.000Z",
        "updatedAt": "2026-08-22T06:00:00.000Z"
    }
]
\`\`\`

---

## 💬 Chats API

### \`GET /api/chats\` — List User's Chats

Fetches all chats that a specific user is actively participating in. Results are sorted by the most recently updated (newest message first). Each chat payload includes all participants and a snippet of the latest message for sidebar previews.

**Query Parameters**

| Parameter | Type     | Required | Description                            |
| --------- | -------- | -------- | -------------------------------------- |
| \`userId\`  | \`string\` | ✅       | The ID of the currently logged-in user |

**Example Request:**

\`\`\`text
GET /api/chats?userId=a1b2c3d4-...
\`\`\`

**Success Response** — \`200 OK\`

\`\`\`json
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
\`\`\`

**Error Responses**

| Status | Condition                           |
| ------ | ----------------------------------- |
| \`400\`  | \`userId\` query parameter is missing |

---

### \`POST /api/chats\` — Create a Chat or Group

Initiates a new chat session. If a \`name\` is provided, it instantiates a **GROUP** chat (requiring a minimum of 3 participants, including yourself). Without a name, it creates a standard **ONE_TO_ONE** direct message channel.

**Request Body**

| Field            | Type       | Required | Description                                                  |
| ---------------- | ---------- | -------- | ------------------------------------------------------------ |
| \`participantIds\` | \`string[]\` | ✅       | Array of all participant user IDs (must include your own ID) |
| \`name\`           | \`string\`   | ❌       | Group name. If provided, chat type becomes \`GROUP\`           |

**Example — Create 1:1 Chat:**

\`\`\`json
{
    "participantIds": ["user-id-1", "user-id-2"]
}
\`\`\`

**Example — Create Group Chat:**

\`\`\`json
{
    "name": "Project Team",
    "participantIds": ["user-id-1", "user-id-2", "user-id-3"]
}
\`\`\`

**Success Response** — \`200 OK\`

\`\`\`json
{
    "id": "chat-uuid-...",
    "type": "GROUP",
    "name": "Project Team",
    "createdAt": "2026-08-22T08:00:00.000Z",
    "updatedAt": "2026-08-22T08:00:00.000Z"
}
\`\`\`

**Error Responses**

| Status | Condition                                |
| ------ | ---------------------------------------- |
| \`400\`  | One or more participant IDs are invalid  |
| \`400\`  | Group chat has fewer than 3 participants |

---

### \`GET /api/chats/:id\` — Get Single Chat

Fetches the complete details of a single chat instance by its unique ID. This includes nested relationships like all current participants and their respective user profile data. Crucial for direct URL access resolving.

**Path Parameters**

| Parameter | Type     | Description      |
| --------- | -------- | ---------------- |
| \`id\`      | \`string\` | UUID of the chat |

**Success Response** — \`200 OK\`

Returns the full chat object with nested participants and user data (identical schema to the items returned in \`GET /api/chats\`).

**Error Responses**

| Status | Condition      |
| ------ | -------------- |
| \`404\`  | Chat not found |

---

### \`PATCH /api/chats/:id/add-participants\` — Add Members to Group

Appends one or multiple new users to an existing **GROUP** chat. If a user is already part of the group, they are silently skipped to prevent duplicate entries.

**Path Parameters**

| Parameter | Type     | Description            |
| --------- | -------- | ---------------------- |
| \`id\`      | \`string\` | UUID of the group chat |

**Request Body**

| Field            | Type       | Required | Description              |
| ---------------- | ---------- | -------- | ------------------------ |
| \`participantIds\` | \`string[]\` | ✅       | Array of user IDs to add |

**Example Request:**

\`\`\`json
{
    "participantIds": ["new-user-id-1", "new-user-id-2"]
}
\`\`\`

**Success Response** — \`200 OK\`

Returns the updated chat object.

**Error Responses**

| Status | Condition                                            |
| ------ | ---------------------------------------------------- |
| \`400\`  | One or more participant IDs are invalid or not found |
| \`400\`  | Chat type is \`ONE_TO_ONE\` (cannot add participants)  |
| \`404\`  | Chat not found                                       |

---

### \`PATCH /api/chats/:id/remove-participant\` — Remove a Member from Group

Revokes access for a single user from a **GROUP** chat. Users can invoke this endpoint targeting their own ID to voluntarily leave the group.

**Path Parameters**

| Parameter | Type     | Description            |
| --------- | -------- | ---------------------- |
| \`id\`      | \`string\` | UUID of the group chat |

**Request Body**

| Field           | Type     | Required | Description                              |
| --------------- | -------- | -------- | ---------------------------------------- |
| \`participantId\` | \`string\` | ✅       | The user ID of the participant to remove |

**Example Request:**

\`\`\`json
{
    "participantId": "user-id-to-remove"
}
\`\`\`

**Success Response** — \`200 OK\`

Returns the chat object.

**Error Responses**

| Status | Condition                 |
| ------ | ------------------------- |
| \`400\`  | \`participantId\` not found |
| \`400\`  | Chat type is \`ONE_TO_ONE\` |
| \`404\`  | Chat not found            |

---

### \`PATCH /api/chats/:id/mark-read\` — Mark Messages as Read

Updates the read status for all unread messages in a given chat, specific to the current user. This is triggered automatically on the frontend when a user opens a chat view or receives a live message while the window is active.

**Path Parameters**

| Parameter | Type     | Description      |
| --------- | -------- | ---------------- |
| \`id\`      | \`string\` | UUID of the chat |

**Request Body**

| Field    | Type     | Required | Description                                                            |
| -------- | -------- | -------- | ---------------------------------------------------------------------- |
| \`userId\` | \`string\` | ✅       | The current user's ID (messages sent by others will be marked as read) |

**Example Request:**

\`\`\`json
{
    "userId": "current-user-id"
}
\`\`\`

**Success Response** — \`200 OK\`

\`\`\`json
{
    "count": 5
}
\`\`\`

> \`count\` signifies the exact number of messages that were successfully transitioned to a read state.

---

## ✉️ Messages API

### \`GET /api/messages\` — Fetch Messages (with Cursor Pagination)

Retrieves the message history for a specific chat. It yields up to **50 messages** per request, chronologically ordered (ascending by \`createdAt\`). Cursor-based pagination ensures performant and seamless infinite scrolling for older message retrieval.

**Query Parameters**

| Parameter | Type     | Required | Description                                                                                                   |
| --------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| \`chatId\`  | \`string\` | ✅       | UUID of the chat to fetch messages for                                                                        |
| \`cursor\`  | \`string\` | ❌       | The \`id\` of the oldest currently loaded message. When provided, fetches the 50 messages *before* this cursor. |

**Example Requests:**

\`\`\`text
# Initial load (most recent 50 messages)
GET /api/messages?chatId=chat-uuid-...

# Load older messages (pagination)
GET /api/messages?chatId=chat-uuid-...&cursor=oldest-message-id
\`\`\`

**Success Response** — \`200 OK\`

\`\`\`json
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
\`\`\`

**Error Responses**

| Status | Condition                           |
| ------ | ----------------------------------- |
| \`400\`  | \`chatId\` query parameter is missing |

---

### \`POST /api/messages\` — Send a Message

Dispatches a new message within a chat. Upon successful database insertion, it immediately emits a \`new-message\` Socket.IO event to broadcast the payload to all connected clients residing in the same chat room. It rigidly validates that the sender retains active participant status before processing.

**Request Body**

| Field      | Type     | Required | Description                             |
| ---------- | -------- | -------- | --------------------------------------- |
| \`chatId\`   | \`string\` | ✅       | UUID of the chat to post the message in |
| \`senderId\` | \`string\` | ✅       | UUID of the user sending the message    |
| \`content\`  | \`string\` | ✅       | The text content of the message         |

**Example Request:**

\`\`\`json
{
    "chatId": "chat-uuid-...",
    "senderId": "user-uuid-...",
    "content": "Hey, how are you?"
}
\`\`\`

**Success Response** — \`200 OK\`

Returns the complete message object augmented with the sender's profile data (mirroring the schema of the \`GET /api/messages\` array items).

**Error Responses**

| Status | Condition                               |
| ------ | --------------------------------------- |
| \`403\`  | Sender is not a participant in the chat |
| \`400\`  | Validation failed (missing fields)      |
`;

export default function APIDocPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-10 w-full border-b border-border bg-content1/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        isIconOnly
                        variant="ghost"
                        onPress={() => router.back()}
                        aria-label="Go back"
                        className="text-default-500 hover:text-foreground"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <h1 className="text-xl font-semibold tracking-tight">
                        API Reference
                    </h1>
                </div>
                <Button
                    variant="primary"
                    size="sm"
                    onPress={() => router.push("/chat")}
                >
                    Go to Chat
                </Button>
            </header>

            {/* Markdown Content Area */}
            <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-10">
                <article
                    className="prose prose-zinc dark:prose-invert max-w-none 
                    prose-headings:font-bold prose-h1:text-4xl prose-h2:text-2xl prose-h3:text-xl
                    prose-a:text-primary hover:prose-a:text-primary/80 prose-a:no-underline
                    prose-pre:bg-zinc-900 dark:prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800 prose-pre:rounded-xl prose-pre:text-white
                    prose-code:text-accent-foreground prose-code:bg-accent/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                    [&_pre_code]:bg-transparent [&_pre_code]:text-white [&_pre_code]:p-0 [&_pre_code]:font-normal
                    prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                    prose-table:border prose-table:border-border prose-th:bg-content1 prose-th:p-3 prose-td:p-3 prose-td:border-t prose-td:border-border
                    prose-hr:border-border
                "
                >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {apiMarkdown}
                    </ReactMarkdown>
                </article>
            </main>
        </div>
    );
}
