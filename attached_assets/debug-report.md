# Debug Report: Blank Page + WebSocket Connection Closed on /expenses

## ❗️ Problem
On the `/expenses` page of our React + Express application hosted on Replit Pro, the page loads to a **blank screen**, and the browser console reports:

```
WebSocket connection closed unexpectedly
```

This happens **immediately on page load** with no delay or loading state.

---

## 🔍 Project Architecture

- **Frontend:** React using `@tanstack/react-query`
- **Backend:** Express.js with API routes mounted at `/api/*`
- **Auth:** `passport-local` + `express-session`
- **Session Store:** Custom session storage
- **Problematic Endpoint:** `GET /api/expenses`

---

## ✅ Confirmed

- `fetch("/api/expenses", { credentials: "include" })` is used correctly.
- `/api/expenses` returns a valid JSON array when the user is authenticated.
- Route is protected with `req.isAuthenticated()` from Passport.

---

## 🔥 Root Cause

When the user is **not authenticated**:
1. `req.isAuthenticated()` returns false.
2. The backend returns a 401 Unauthorized.
3. The frontend attempts to parse an empty or HTML response as JSON.
4. React Query fails silently → screen remains blank.
5. Replit logs show `WebSocket connection closed`, likely unrelated to real socket usage.

---

## 🧪 How to Confirm

- Add logging inside the route:

```ts
app.get("/api/expenses", isAuthenticated, async (req, res) => {
  console.log("User hitting /api/expenses:", req.user);
});
```

- Temporarily remove authentication:

```ts
app.get("/api/expenses", async (req, res) => {
  const expenses = await storage.getExpenses(1);
  res.json(expenses);
});
```

---

## ⚠️ Replit Behavior Suspicion

We believe Replit may:
- Suppress or mishandle 401 responses in internal fetch requests.
- Fallback to a 204 or empty-body HTML response.
- Proxy early rejections as "WebSocket connection closed" in logs.

---

## ✅ Suggested Code Fixes

In frontend `queryFn`:

```ts
if (res.status === 401) {
  throw new Error("Unauthorized – please log in.");
}
```

Add fallback UI for unauthenticated users in the React page.

---

## 🙏 Questions for Replit

- Does Replit modify `401` or `403` responses internally?
- Why would a simple fetch error result in a WebSocket-level error?
- Is there any special proxying logic for `fetch("/api/...")` from the frontend?

