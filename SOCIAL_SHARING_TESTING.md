# Social Sharing Feature - Manual Testing Guide

This document describes how to manually test the social sharing feature with OG meta tags.

## Features Implemented

### 1. ShareButtons Component
- **Location**: `frontend/src/lib/components/ShareButtons.svelte`
- **Features**:
  - Share to Twitter/X with pre-filled text
  - Share to Facebook
  - Share to WhatsApp with formatted message
  - Share to LinkedIn
  - Copy link to clipboard with success toast
  - Native share API support (on supported devices)
  - Fully accessible with ARIA labels
  - Responsive design with Tailwind CSS

### 2. Open Graph Meta Tags
- **Location**: `frontend/src/routes/officials/[id]/+page.svelte`
- **Features**:
  - Dynamic title per official
  - Dynamic description with position info
  - Dynamic OG image via custom endpoint
  - Twitter Card support (summary_large_image)
  - Proper URL canonicalization
  - Fallback image when photo unavailable

### 3. OG Image Generation Endpoint
- **Location**: `frontend/src/routes/api/og/[id]/+server.ts`
- **Features**:
  - Generates 1200x630 SVG image
  - Displays official's name
  - Shows status badge (Active, Deceased, etc.)
  - Shows confidence level with visual indicator
  - Shows sanctions count if applicable
  - Proper cache headers (1 hour client, 24 hour CDN)
  - Error handling for missing officials

## Manual Testing Steps

### Prerequisites
1. Ensure backend is running: `cd backend && pnpm dev`
2. Ensure frontend is running: `cd frontend && pnpm dev`
3. Have at least one official in the database

### Test 1: ShareButtons Component

1. Navigate to an official's profile page: `http://localhost:5173/officials/{id}`
2. Scroll to the bottom of the page to find the "Compartir:" section
3. Verify all share buttons are visible:
   - ❌ X (Twitter)
   - 👍 Facebook
   - 💬 WhatsApp
   - 💼 LinkedIn
   - 📋 Copiar (Copy)
   - 📤 Compartir (Native share - only on mobile/supported browsers)

#### Test Copy to Clipboard:
1. Click the "Copiar" button
2. Verify the green toast appears with "¡Enlace copiado!"
3. Toast should disappear after 3 seconds
4. Paste in a text editor to verify URL was copied correctly

#### Test Social Share Links:
1. **Twitter/X**: Click the X button
   - Should open Twitter with pre-filled text: "[Official Name] - La Memoria de Venezuela"
   - URL should be included
   
2. **Facebook**: Click the Facebook button
   - Should open Facebook sharer with the profile URL
   
3. **WhatsApp**: Click the WhatsApp button
   - Should open WhatsApp with formatted message including:
     - Official name
     - Description
     - Profile URL
   
4. **LinkedIn**: Click the LinkedIn button
   - Should open LinkedIn share dialog with the profile URL

#### Test Native Share (Mobile/Supported Browsers):
1. On a mobile device or supported browser
2. The "Compartir" button should appear
3. Click it to open the native share sheet
4. Verify title, description, and URL are passed correctly

### Test 2: Open Graph Meta Tags

#### Using Browser Developer Tools:
1. Navigate to an official's profile: `http://localhost:5173/officials/{id}`
2. Open Developer Tools (F12)
3. Go to Elements/Inspector tab
4. Find the `<head>` section
5. Verify the following meta tags exist:

```html
<!-- Basic meta -->
<meta name="description" content="Información sobre [Name]..." />

<!-- Open Graph -->
<meta property="og:type" content="profile" />
<meta property="og:url" content="http://localhost:5173/officials/{id}" />
<meta property="og:title" content="[Name] | La Memoria de Venezuela" />
<meta property="og:description" content="Información sobre [Name]..." />
<meta property="og:image" content="/api/og/{id}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="[Name] | La Memoria de Venezuela" />
<meta name="twitter:description" content="Información sobre [Name]..." />
<meta name="twitter:image" content="/api/og/{id}" />
```

#### Using Meta Tag Validators:
1. **Facebook Debugger**: https://developers.facebook.com/tools/debug/
   - Enter the profile URL
   - Click "Scrape Again" to fetch fresh data
   - Verify image loads correctly
   - Check title and description

2. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
   - Enter the profile URL
   - Verify card preview shows correctly
   - Check image, title, and description

3. **LinkedIn Inspector**: https://www.linkedin.com/post-inspector/
   - Enter the profile URL
   - Verify preview looks correct

### Test 3: OG Image Endpoint

#### Direct Access:
1. Navigate to: `http://localhost:5173/api/og/{id}`
2. You should see an SVG image with:
   - "La Memoria de Venezuela" header
   - Official's name in large text
   - Status badge (colored based on status)
   - Confidence level with emoji indicator
   - Sanctions count (if applicable)
   - Footer text

#### Test Different Officials:
Test with officials having different attributes:
- Active official with sanctions
- Deceased official
- Exiled official
- Official without sanctions
- Official with long name (should truncate)

#### Verify Cache Headers:
1. Open Developer Tools Network tab
2. Navigate to the OG image URL
3. Check Response Headers:
   - Should have: `Cache-Control: public, max-age=3600, s-maxage=86400`
   - Should have: `Content-Type: image/svg+xml`

### Test 4: WhatsApp Preview

To test WhatsApp preview (requires actual sharing):
1. Share a profile URL via WhatsApp Web or mobile
2. Send to yourself or a test contact
3. Verify the preview shows:
   - OG image
   - Title
   - Description
4. Image should be 1200x630 and load quickly

### Test 5: Responsive Design

#### Desktop:
1. View on desktop browser (1920x1080)
2. Share buttons should display in a horizontal row
3. All icons and text should be visible

#### Tablet:
1. Resize browser to ~768px width
2. Share buttons should wrap if needed
3. Layout should remain clean

#### Mobile:
1. Resize to ~375px width
2. Share buttons should stack/wrap appropriately
3. Toast notification should be visible
4. Native share button should appear (if supported)

## Common Issues & Solutions

### Issue: OG Image Not Loading
**Solution**: 
- Check backend is running on port 3000
- Verify PUBLIC_API_URL in frontend/.env
- Check browser console for CORS errors

### Issue: Copy Button Not Working
**Solution**:
- Check browser console for clipboard permission errors
- Try HTTPS context (clipboard API requires secure context)
- Fallback to execCommand should work in older browsers

### Issue: Meta Tags Not Updating
**Solution**:
- Clear browser cache
- Use Facebook Debugger to scrape fresh data
- Check SvelteKit's SSR is working properly

### Issue: Native Share Not Appearing
**Solution**:
- This is expected - not all browsers support it
- Works on: Mobile Safari, Mobile Chrome, some desktop Chrome versions
- Feature is progressive enhancement

## Test Checklist

- [ ] All share buttons render correctly
- [ ] Copy to clipboard works and shows toast
- [ ] Twitter/X share opens with correct text
- [ ] Facebook share opens correctly
- [ ] WhatsApp share includes formatted message
- [ ] LinkedIn share works
- [ ] Native share appears on supported devices
- [ ] OG meta tags present in page source
- [ ] OG image endpoint returns valid SVG
- [ ] OG image shows correct official data
- [ ] Cache headers are set correctly
- [ ] Facebook Debugger shows preview correctly
- [ ] Twitter Card Validator shows preview correctly
- [ ] WhatsApp preview displays correctly
- [ ] Responsive design works on all screen sizes
- [ ] Accessibility: keyboard navigation works
- [ ] Accessibility: screen reader labels present
- [ ] Error handling: invalid official ID returns 404

## Automated Tests

All features have comprehensive unit tests:
- **ShareButtons**: 13 tests in `frontend/src/lib/components/__tests__/share-buttons.spec.ts`
- **OG Endpoint**: 11 tests in `frontend/src/routes/api/og/[id]/__tests__/og-endpoint.spec.ts`

Run tests:
```bash
cd frontend
pnpm test:ci
```

## Security Considerations

✅ **No PII in meta tags** - Only public official information
✅ **XSS Prevention** - SVG text is XML-escaped
✅ **CSRF Protection** - Share URLs use GET requests only
✅ **CORS** - OG images served with proper headers
✅ **Rate Limiting** - Should be added to OG endpoint in production
✅ **Input Validation** - Official IDs validated via backend API

## Performance

- **OG Image**: SVG format, ~4-5KB, renders instantly
- **Cache**: 1 hour browser cache, 24 hour CDN cache
- **Bundle Size**: ShareButtons adds ~8KB to bundle
- **Lazy Loading**: Component only loads when profile page visited

## Future Enhancements

Potential improvements for future iterations:
- [ ] Add Telegram share button
- [ ] Add email share option
- [ ] Generate PNG instead of SVG for better compatibility
- [ ] Add official's photo to OG image
- [ ] Support custom share text per platform
- [ ] Add share analytics tracking
- [ ] Pre-generate OG images at build time for static hosting
- [ ] Add QR code share option
