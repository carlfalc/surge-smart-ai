

## Analysis: Dashboard Redirects to Login

The Dashboard component has a guard at line ~44:
```typescript
useEffect(() => {
  if (!loading && !user) navigate("/login");
}, [loading, user, navigate]);
```

This redirects to `/login` whenever there's no authenticated user. This is **working as designed** — the dashboard is a protected route.

### Why you're seeing the redirect

You need to **sign up and log in first** before accessing `/dashboard`. Without an active session, the auth guard correctly sends you to `/login`.

### Potential race condition fix

There is also a subtle race condition in `AuthContext.tsx`: the `onAuthStateChange` listener can fire with a null session (INITIAL_SESSION event) and set `loading = false` before `getSession()` resolves, causing a brief flash-redirect even for authenticated users. The fix:

**`src/contexts/AuthContext.tsx`** — restructure the auth initialization:
1. Only set `loading = false` from the `onAuthStateChange` callback (remove the duplicate in `getSession().then(...)`)
2. Call `getSession()` first, then set up the listener, to avoid the race where both paths independently set state

This ensures `loading` stays `true` until the session is definitively resolved, preventing premature redirects for users who ARE logged in.

### No database changes needed

