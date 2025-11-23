# Farcaster Mini App Embed Endpoints

This document describes the API endpoints that enable sharing contests, submissions, and voting opportunities as interactive embeds (also known as embeds) on Farcaster. These embeds deep-link directly into the JokeRace Mini App.

## Overview

Farcaster embeds are interactive cards that appear in casts with buttons that users can click. This Mini App extension provides three types of embeds:

1. **Contest Embeds** - Share full contests with interactive buttons
2. **Submission Embeds** - Share specific submissions with voting options
3. **Voting Embeds** - Share voting opportunities with direct access

All embeds use the Farcaster embed protocol (fc:frame meta tags) to deep link into the JokeRace Mini App for seamless interaction.

---

## Contest Embed

### Endpoint

```
GET /api/frame/contest/{chain}/{address}
```

### Purpose

Generates a Farcaster embed for a JokeRace contest with buttons to view, submit, and vote. The embed opens the contest in the Mini App.

### Example

```
https://your-miniapp.com/api/frame/contest/base/0x1234567890abcdef...
```

### Embed Buttons

1. **View Contest** - Opens contest page in Mini App
2. **Submit Entry** - Opens contest with submit action in Mini App
3. **Vote** - Opens contest with vote action in Mini App

### Embed Image

Dynamically generated OG image showing:
- Contest name
- Description preview
- Chain name
- Submission count

### Usage in Farcaster

1. Copy the embed URL
2. Paste it into a cast on Warpcast or other Farcaster clients
3. The cast will render as an interactive embed
4. Users can click buttons to open the Mini App

### Response Format

Returns HTML with Farcaster embed meta tags (using the fc:frame protocol):

```html
<meta property="fc:frame" content="vNext" />
<meta property="fc:frame:image" content="{image-url}" />
<meta property="fc:frame:button:1" content="View Contest" />
<meta property="fc:frame:button:1:action" content="link" />
<meta property="fc:frame:button:1:target" content="{miniapp-url}" />
```

---

## Submission Embed

### Endpoint

```
GET /api/frame/submission/{chain}/{address}/{id}
```

### Purpose

Generates a Farcaster embed for a specific contest submission with voting buttons that open in the Mini App.

### Example

```
https://your-miniapp.com/api/frame/submission/base/0x1234.../42
```

### Embed Buttons

1. **Vote For** - Opens submission with vote-for action in Mini App
2. **Vote Against** - Opens submission with vote-against action in Mini App
3. **View Contest** - Opens parent contest in Mini App
4. **Visit** - Opens submission detail page in Mini App

### Embed Image

Dynamically generated OG image showing:
- Submission ID (large)
- Contest name
- Chain name
- "Vote on this submission" call-to-action

### URL Parameters

- `chain` - Network name (base, ethereum, etc.)
- `address` - Contest contract address
- `id` - Submission ID

### Deep Link Actions

Buttons link to Mini App with action query params:

```
{miniapp}/contest/{chain}/{address}/submission/{id}?action=vote-for
{miniapp}/contest/{chain}/{address}/submission/{id}?action=vote-against
```

---

## Vote Embed

### Endpoint

```
GET /api/frame/vote/{chain}/{address}
```

### Purpose

Generates a Farcaster embed specifically for voting on a contest, with dynamic content based on contest status.

### Example

```
https://your-miniapp.com/api/frame/vote/base/0x1234567890abcdef...
```

### Embed Buttons

**When voting is open:**
1. **Vote Now (X entries)** - Opens voting interface in Mini App
2. **View Contest** - Opens full contest page in Mini App

**When voting has ended:**
1. **View Results** - Opens contest results in Mini App
2. **View Contest** - Opens full contest page in Mini App

### Dynamic Content

The embed adapts based on:
- Current contest phase (submission vs voting)
- Number of submissions
- Time remaining

### Embed Image

Shows:
- Contest name
- Voting status (Open/Closed)
- Number of submissions
- Call-to-action based on status

---

## OG Image Endpoints

### Contest Image

```
GET /api/og/contest/{chain}/{address}
```

Generates a 1200x630 image for contest embeds (Frame protocol).

**Design:**
- Purple gradient background (#8A63D2 → #472A91)
- White card with contest details
- Contest name (large, bold)
- Description preview
- Chain and submission count badges

### Submission Image

```
GET /api/og/submission/{chain}/{address}/{id}
```

Generates a 1200x630 image for submission embeds (Frame protocol).

**Design:**
- Purple gradient background (reversed)
- White card with submission details
- Large submission ID (#42)
- Contest name
- Chain badge
- "Vote on this submission" text

### Image Format

- **Size:** 1200×630 pixels (Farcaster standard)
- **Format:** PNG
- **Aspect Ratio:** 1.91:1
- **Technology:** Next.js ImageResponse API

---

## Integration Guide

### 1. Share a Contest

```javascript
// Get contest Embed URL
const embedUrl = `https://your-miniapp.com/api/frame/contest/base/0x123...`;

// Post to Farcaster (via Neynar SDK or API)
await neynarClient.publishCast({
  text: "Check out this contest!",
  embeds: [embedUrl],
});
```

### 2. Share a Submission

```javascript
const embedUrl = `https://your-miniapp.com/api/frame/submission/base/0x123.../5`;

await neynarClient.publishCast({
  text: "Vote on my submission!",
  embeds: [embedUrl],
});
```

### 3. Promote Voting

```javascript
const embedUrl = `https://your-miniapp.com/api/frame/vote/base/0x123...`;

await neynarClient.publishCast({
  text: "Voting is now open! Cast your votes 🗳️",
  embeds: [embedUrl],
});
```

---

## Embed Specification Compliance

All embeds follow the [Farcaster Embed Specification](https://docs.farcaster.xyz/reference/frames/spec):

✅ **fc:frame** = "vNext"
✅ **fc:frame:image** - Dynamic OG images
✅ **fc:frame:image:aspect_ratio** - 1.91:1
✅ **fc:frame:button:{idx}** - Up to 4 buttons
✅ **fc:frame:button:{idx}:action** - "link" actions
✅ **fc:frame:button:{idx}:target** - Deep links to Mini App

---

## Testing embeds

### 1. Using Warpcast

1. Copy a Embed URL
2. Paste into a cast on Warpcast
3. Warpcast will fetch and render the Frame
4. Click buttons to test deep links

### 2. Using Embed Validator

Visit: https://warpcast.com/~/developers/frames

Paste your Embed URL to preview and validate.

### 3. Local Testing

```bash
# Start the extension
npm run dev

# Access Embed URLs directly
open http://localhost:3001/api/frame/contest/base/0x123...
```

---

## Environment Variables

### Optional Configuration

```env
# Base URL for Embed URLs (defaults to localhost in dev)
NEXT_PUBLIC_BASE_URL=https://your-miniapp.com
```

### Production Deployment

When deploying, set `NEXT_PUBLIC_BASE_URL` to your production domain:

```
NEXT_PUBLIC_BASE_URL=https://jokerace-miniapp.vercel.app
```

---

## Embed URL Patterns

### Contest Frame
```
{baseUrl}/api/frame/contest/{chain}/{address}
```

### Submission Frame
```
{baseUrl}/api/frame/submission/{chain}/{address}/{id}
```

### Voting Frame
```
{baseUrl}/api/frame/vote/{chain}/{address}
```

### Contest OG Image
```
{baseUrl}/api/og/contest/{chain}/{address}
```

### Submission OG Image
```
{baseUrl}/api/og/submission/{chain}/{address}/{id}
```

---

## API Response Caching

### Cache Headers

**Contest & Submission embeds:**
```
Cache-Control: public, max-age=300  # 5 minutes
```

**Vote embeds:**
```
Cache-Control: public, max-age=60   # 1 minute (more dynamic)
```

### Why Caching Matters

- Reduces blockchain queries
- Faster Embed loading
- Better user experience
- Lower infrastructure costs

---

## Error Handling

All endpoints include error handling:

1. **Invalid Chain** - Returns error Frame
2. **Contract Read Failure** - Returns error Frame
3. **Missing Data** - Returns error Embed with details

Error embeds display:
- Error message
- Chain and address for debugging
- Fallback image

---

## Examples

### Full Example: Share Contest

```typescript
// In your app
const shareContest = async (chain: string, address: string) => {
  const embedUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/contest/${chain}/${address}`;

  // Copy to clipboard
  await navigator.clipboard.writeText(embedUrl);

  // Or auto-post to Farcaster
  window.open(
    `https://warpcast.com/~/compose?text=${encodeURIComponent('Check out this contest!')}&embeds[]=${encodeURIComponent(embedUrl)}`
  );
};
```

### Full Example: Share Submission

```typescript
const shareSubmission = async (
  chain: string,
  address: string,
  id: string
) => {
  const embedUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/submission/${chain}/${address}/${id}`;

  window.open(
    `https://warpcast.com/~/compose?embeds[]=${encodeURIComponent(embedUrl)}`
  );
};
```

---

## Best Practices

### 1. Always Use Production URLs

In production, never use localhost. Set `NEXT_PUBLIC_BASE_URL` properly.

### 2. Test Before Sharing

Use the Warpcast Embed validator before sharing widely.

### 3. Monitor Embed Performance

Check:
- Image load times
- Blockchain query speed
- Button click-through rates

### 4. Keep Images Optimized

- Use ImageResponse for dynamic generation
- Keep file sizes under 1MB
- Use 1200×630 dimensions

### 5. Descriptive Text

Include context when posting Embed URLs:
- What the contest is about
- Why users should participate
- Deadlines or important info

---

## Troubleshooting

### Embed Not Rendering

1. Validate URL is publicly accessible
2. Check meta tags are present
3. Verify image URL works
4. Test with Embed validator

### Images Not Loading

1. Check OG image endpoint returns 200
2. Verify image size is correct (1200×630)
3. Check blockchain data is available
4. Look for console errors

### Buttons Not Working

1. Verify target URLs are absolute
2. Check Mini App URLs are accessible
3. Test deep links manually
4. Ensure action type is "link"

---

## Resources

- [Farcaster Embed Spec](https://docs.farcaster.xyz/reference/frames/spec)
- [Warpcast Embed Validator](https://warpcast.com/~/developers/frames)
- [Next.js ImageResponse](https://nextjs.org/docs/app/api-reference/functions/image-response)
- [JokeRace Extension Docs](../README.md)

---

*embeds enable viral sharing of JokeRace contests on Farcaster! 🚀*
