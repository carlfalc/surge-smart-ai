

## Plan: Add Live AI Surge Prediction Card to Dashboard

The user's proposed component has several issues that need fixing before it can work with the existing codebase:

### Problems with the provided code

1. **API mismatch**: The chat edge function expects `{ messages, type }` but the component sends `{ message, type, city }`. The function also returns an SSE stream, not a JSON object — so `supabase.functions.invoke()` won't return parsed JSON with a `response` field.
2. **Confidence column type**: The `surge_predictions` table has `confidence` as `numeric`, but the component tries to insert a string like `"High"`.
3. **RLS blocks inserts**: The `surge_predictions` table has no INSERT policy — client-side inserts will fail silently.
4. **Incomplete JSX**: The pasted code has stripped HTML tags (likely formatting issue).

### What I'll actually build

**1. `src/components/dashboard/SurgePredictionCard.tsx`** — New component that:
- Calls the chat edge function correctly using `fetch` (not `supabase.functions.invoke`) with `{ messages: [{ role: "user", content: "..." }], type: "surge" }`
- Reads the SSE stream, accumulates the full response, then parses the JSON
- Displays areas with multipliers, confidence badges, and tips
- Has a refresh button and auto-refreshes every 15 minutes
- Skips writing to `surge_predictions` (no INSERT policy; can add later)

**2. `src/pages/Dashboard.tsx`** — Replace the hardcoded surge prediction block (lines 218-243) with `<SurgePredictionCard />`

### No database or edge function changes needed

The existing chat function and surge system prompt already handle this use case. We just need the client to call it correctly.

