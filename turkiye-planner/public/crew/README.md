# Crew photos

Drop a photo here named after the person, lowercase: `matt.jpg`, `derin.jpg`, …
Square crops look best (the polaroid frame is 1:1); anything roughly 600×600 is
plenty. Then point at it from `data/crew.ts`:

```ts
Matt: {
  photo: '/crew/matt.jpg',
  …
}
```

Without a photo, that person's card falls back to their initial on their avatar
color — so it's fine to add them one at a time.

**These are public.** Photos here get committed to the repo and shipped to
whatever host serves the site, with no login in front of them. Only use ones
everyone is happy to have on the open internet.
