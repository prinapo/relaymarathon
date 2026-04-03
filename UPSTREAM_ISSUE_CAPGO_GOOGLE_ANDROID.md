# Upstream Issue Draft: `@capgo/capacitor-social-login`

## Title

Android Google login: support Firebase-only flows that need `idToken` without forcing `accessToken` authorization

## Repository

- `https://github.com/Cap-go/capacitor-social-login`

## Summary

On Android, the Google provider in `online` mode currently obtains a Google credential, then immediately requests an additional authorization flow to fetch an `accessToken`.

For Firebase Authentication integrations, this second step is not always needed because `signInWithCredential()` only needs the Google `idToken`.

In our Quasar + Capacitor + Firebase app, the extra authorization step caused Android-specific failures on a real device, even though:

- web login worked
- package name and SHA-1 were correctly configured
- Firebase sign-in only needed `idToken`

We fixed the app by adding a small patch to the plugin so Android can complete login with the `idToken` only when explicitly requested by the app.

## Why this matters

Some apps use Google login only as an identity bridge into Firebase Auth:

- `GoogleAuthProvider.credential(idToken)`
- `signInWithCredential(firebaseAuth, credential)`

In this case, forcing the extra Google authorization step for `accessToken` can introduce avoidable failures and prompts.

The plugin already has all the information needed to return a valid `idToken` after the credential step.

## Observed behavior

Current Android `online` flow:

1. Credential Manager returns Google credential with `idToken`
2. Plugin calls `getAuthorizationResult(...)`
3. Plugin expects `accessToken`
4. If the extra authorization fails, login fails entirely

In our case this produced Android errors such as:

- `Google Sign-in failed: [16] Account reauth failed`

and more generally made Firebase-only login fail even though the `idToken` was already available.

## Expected behavior

There should be an official way to tell the Android Google provider:

- return success as soon as a valid `idToken` is available
- skip the extra `accessToken` authorization step
- keep existing behavior as default for apps that do need `accessToken`

## Proposed API

Example:

```ts
const result = await SocialLogin.login({
  provider: "google",
  options: {
    preferIdTokenOnly: true,
  },
});
```

Possible semantics:

- Android only
- only relevant in `online` mode
- if `preferIdTokenOnly` is `true`, resolve with:
  - `idToken`
  - profile data
  - `responseType: 'online'`
- do not force the extra authorization step for `accessToken`

## Minimal patch that solved it locally

We added:

- a new login option: `preferIdTokenOnly`
- an early return in Android `GoogleProvider.java` after `GoogleIdTokenCredential.createFrom(...)`

Behavior:

- if `mode === ONLINE` and `preferIdTokenOnly === true`
- return `profile + idToken`
- skip `getAuthorizationResult(forceRefreshToken)`

## Local integration context

Stack:

- Quasar 2
- Capacitor 7
- Firebase Auth
- `@capgo/capacitor-social-login@7.20.0`

Firebase usage:

```ts
const googleLoginResult = await SocialLogin.login({
  provider: "google",
  options: {
    filterByAuthorizedAccounts: false,
    preferIdTokenOnly: true,
  },
});

const credential = GoogleAuthProvider.credential(
  googleLoginResult?.result?.idToken,
);

await signInWithCredential(auth, credential);
```

## Why this should be upstream instead of app-local

- the use case is legitimate and common with Firebase Auth
- the plugin already obtains the required `idToken`
- the current behavior is more strict than necessary for Firebase-only consumers
- carrying a local patch is fragile across plugin upgrades

## Current local workaround in our repo

We currently maintain this via:

- `patch-package`
- patch file: `patches/@capgo+capacitor-social-login+7.20.0.patch`

We would prefer to remove the patch and adopt an official plugin option instead.
