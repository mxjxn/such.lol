# Farcaster Frame Endpoints

This document describes the Farcaster Frame API endpoints that enable sharing contests, submissions, and voting opportunities as interactive embeds on Farcaster.

## Overview

Farcaster Frames are interactive embeds that appear in casts with buttons that users can click. This extension provides three types of Frames:

1. **Contest Frames** - Share full contests
2. **Submission Frames** - Share specific submissions
3. **Voting Frames** - Share voting opportunities

All Frames deep link into the JokeRace MiniApp for seamless interaction.

---

## Contest Frame

### Endpoint

```
GET /api/frame/contest/{chain}/{address}
```

### Purpose

Generates a Farcaster Frame for a JokeRace contest with buttons to view, submit, and vote.

### Example

```
https://your-miniapp.com/api/frame/contest/base/0x1234567890abcdef...
```

### Frame Buttons

1. **View Contest** - Opens contest page in MiniApp
2. **Submit Entry** - Opens contest with submit action
3. **Vote** - Opens contest with vote action

### Frame Image

Dynamically generated OG image showing:
- Contest name
- Description preview
- Chain name
- Submission count

### Usage in Farcaster

1. Copy the Frame URL
2. Paste it into a cast on Warpcast
3. The cast will render as an interactive Frame
4. Users can click buttons to open the MiniApp

### Response Format

Returns HTML with Farcaster Frame meta tags:

```html
<meta property="fc:frame" content="vNext" />
<meta property="fc:frame:image" content="{image-url}" />
<meta property="fc:frame:button:1" content="View Contest" />
<meta property="fc:frame:button:1:action" content="link" />
<meta property="fc:frame:button:1:target" content="{miniapp-url}" />
```

---

## Submission Frame

### Endpoint

```
GET /api/frame/submission/{chain}/{address}/{id}
```

### Purpose

Generates a Farcaster Frame for a specific contest submission with voting buttons.

### Example

```
https://your-miniapp.com/api/frame/submission/base/0x1234.../42
```

### Frame Buttons

1. **Vote For** - Opens submission with vote-for action
2. **Vote Against** - Opens submission with vote-against action
3. **View Contest** - Opens parent contest
4. **Visit** - Opens submission detail page

### Frame Image

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

Buttons link to MiniApp with action query params:

```
{miniapp}/contest/{chain}/{address}/submission/{id}?action=vote-for
{miniapp}/contest/{chain}/{address}/submission/{id}?action=vote-against
```

---

## Vote Frame

### Endpoint

```
GET /api/frame/vote/{chain}/{address}
```

### Purpose

Generates a Farcaster Frame specifically for voting on a contest.

### Example

```
https://your-miniapp.com/api/frame/vote/base/0x1234567890abcdef...
```

### Frame Buttons

**When voting is open:**
1. **Vote Now (X entries)** - Opens voting interface
2. **View Contest** - Opens full contest page

**When voting has ended:**
1. **View Results** - Opens contest results
2. **View Contest** - Opens full contest page

### Dynamic Content

The Frame adapts based on:
- Current contest phase (submission vs voting)
- Number of submissions
- Time remaining

### Frame Image

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

Generates a 1200x630 image for contest Frames.

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

Generates a 1200x630 image for submission Frames.

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
// Get contest Frame URL
const frameUrl = `https://your-miniapp.com/api/frame/contest/base/0x123...`;

// Post to Farcaster (via Neynar SDK or API)
await neynarClient.publishCast({
  text: "Check out this contest!",
  embeds: [frameUrl],
});
```

### 2. Share a Submission

```javascript
const frameUrl = `https://your-miniapp.com/api/frame/submission/base/0x123.../5`;

await neynarClient.publishCast({
  text: "Vote on my submission!",
  embeds: [frameUrl],
});
```

### 3. Promote Voting

```javascript
const frameUrl = `https://your-miniapp.com/api/frame/vote/base/0x123...`;

await neynarClient.publishCast({
  text: "Voting is now open! Cast your votes 🗳️",
  embeds: [frameUrl],
});
```

---

## Frame Specification Compliance

All Frames follow the [Farcaster Frame Specification](https://docs.farcaster.xyz/reference/frames/spec):

✅ **fc:frame** = "vNext"
✅ **fc:frame:image** - Dynamic OG images
✅ **fc:frame:image:aspect_ratio** - 1.91:1
✅ **fc:frame:button:{idx}** - Up to 4 buttons
✅ **fc:frame:button:{idx}:action** - "link" actions
✅ **fc:frame:button:{idx}:target** - Deep links to MiniApp

---

## Testing Frames

### 1. Using Warpcast

1. Copy a Frame URL
2. Paste into a cast on Warpcast
3. Warpcast will fetch and render the Frame
4. Click buttons to test deep links

### 2. Using Frame Validator

Visit: https://warpcast.com/~/developers/frames

Paste your Frame URL to preview and validate.

### 3. Local Testing

```bash
# Start the extension
npm run dev

# Access Frame URLs directly
open http://localhost:3001/api/frame/contest/base/0x123...
```

---

## Environment Variables

### Optional Configuration

```env
# Base URL for Frame URLs (defaults to localhost in dev)
NEXT_PUBLIC_BASE_URL=https://your-miniapp.com
```

### Production Deployment

When deploying, set `NEXT_PUBLIC_BASE_URL` to your production domain:

```
NEXT_PUBLIC_BASE_URL=https://jokerace-miniapp.vercel.app
```

---

## Frame URL Patterns

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

**Contest & Submission Frames:**
```
Cache-Control: public, max-age=300  # 5 minutes
```

**Vote Frames:**
```
Cache-Control: public, max-age=60   # 1 minute (more dynamic)
```

### Why Caching Matters

- Reduces blockchain queries
- Faster Frame loading
- Better user experience
- Lower infrastructure costs

---

## Error Handling

All endpoints include error handling:

1. **Invalid Chain** - Returns error Frame
2. **Contract Read Failure** - Returns error Frame
3. **Missing Data** - Returns error Frame with details

Error Frames display:
- Error message
- Chain and address for debugging
- Fallback image

---

## Examples

### Full Example: Share Contest

```typescript
// In your app
const shareContest = async (chain: string, address: string) => {
  const frameUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/contest/${chain}/${address}`;

  // Copy to clipboard
  await navigator.clipboard.writeText(frameUrl);

  // Or auto-post to Farcaster
  window.open(
    `https://warpcast.com/~/compose?text=${encodeURIComponent('Check out this contest!')}&embeds[]=${encodeURIComponent(frameUrl)}`
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
  const frameUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/submission/${chain}/${address}/${id}`;

  window.open(
    `https://warpcast.com/~/compose?embeds[]=${encodeURIComponent(frameUrl)}`
  );
};
```

---

## Best Practices

### 1. Always Use Production URLs

In production, never use localhost. Set `NEXT_PUBLIC_BASE_URL` properly.

### 2. Test Before Sharing

Use the Warpcast Frame validator before sharing widely.

### 3. Monitor Frame Performance

Check:
- Image load times
- Blockchain query speed
- Button click-through rates

### 4. Keep Images Optimized

- Use ImageResponse for dynamic generation
- Keep file sizes under 1MB
- Use 1200×630 dimensions

### 5. Descriptive Text

Include context when posting Frame URLs:
- What the contest is about
- Why users should participate
- Deadlines or important info

---

## Troubleshooting

### Frame Not Rendering

1. Validate URL is publicly accessible
2. Check meta tags are present
3. Verify image URL works
4. Test with Frame validator

### Images Not Loading

1. Check OG image endpoint returns 200
2. Verify image size is correct (1200×630)
3. Check blockchain data is available
4. Look for console errors

### Buttons Not Working

1. Verify target URLs are absolute
2. Check MiniApp URLs are accessible
3. Test deep links manually
4. Ensure action type is "link"

---

## Resources

- [Farcaster Frame Spec](https://docs.farcaster.xyz/reference/frames/spec)
- [Warpcast Frame Validator](https://warpcast.com/~/developers/frames)
- [Next.js ImageResponse](https://nextjs.org/docs/app/api-reference/functions/image-response)
- [JokeRace Extension Docs](../README.md)

---

*Frames enable viral sharing of JokeRace contests on Farcaster! 🚀*
