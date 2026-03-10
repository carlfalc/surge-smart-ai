

## Plan: Wire Up AI Chat Support Widget with Streaming

### What Changes

**`src/pages/Help.tsx`** — the only file that needs modification:

1. **Add state** for chat messages array (`{role, content}[]`), loading flag, and a scroll ref
2. **Add `streamChat` helper** that calls the `chat` edge function with `type: "support"`, reads the SSE stream token-by-token, and updates the last assistant message progressively
3. **Wire the send button and Enter key** to append user message, call `streamChat`, and render the streaming assistant response
4. **Render messages list** with markdown support (`react-markdown`) in the chat body, replacing the static greeting
5. **Auto-scroll** to bottom on new messages
6. **Handle errors** (429/402/generic) with toast notifications
7. **Add initial welcome message** as a static assistant message in default state

### Technical Details

- Uses `fetch` to `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat` with SSE line-by-line parsing
- Sends `{ messages, type: "support" }` to reuse the existing chat edge function's support system prompt
- No new edge functions or database changes needed
- `react-markdown` is already installed

