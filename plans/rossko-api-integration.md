# Rossko API Integration Plan

## Overview
Integrate real auto parts prices from Rossko (Калужский регион) into the car price calculator on the АвтоВыкуп40 landing page.

## Current State
- Calculator uses hardcoded approximate repair cost database
- No external API integration for parts pricing
- All calculations done client-side

## Target Architecture

### 1. Server-Side API Route
```
src/app/api/parts/route.ts    # Proxy to Rossko API (secures credentials)
```

**Why:** Rossko API requires authentication keys that cannot be exposed in client-side code.

### 2. Environment Variables
```
.env.local
├── ROSSKO_KEY1=xxx          # Rossko API key 1
├── ROSSKO_KEY2=xxx          # Rossko API key 2
└── ROSSKO_ENDPOINT=klg      # Kaluga region endpoint
```

### 3. Data Flow
```
User selects damaged part
       ↓
Client → API Route → Rossko API (with credentials)
       ↓
Return real parts prices + labor estimates
       ↓
Calculate final price with actual market rates
```

## Implementation Steps

### Step 1: Create API Route
- `src/app/api/parts/route.ts`
- Handle POST requests with part names
- Proxy requests to Rossko API
- Cache responses (5-15 min) to reduce API calls
- Fallback to current estimates if API unavailable

### Step 2: Update Calculator Logic
- Modify damage analysis to fetch real prices
- Show "Loading..." while fetching
- Display both: estimated repair cost + real parts prices from Rossko
- Calculate total: parts cost + labor (30-40% of parts)

### Step 3: Add Configuration UI
- Optional: Admin input for API keys (stored in localStorage or env)
- Toggle between "real prices" and "estimates" mode

## Rossko API Methods to Use

Based on typical Rossko API structure:

1. **Search by part name** - Find parts by name/article
2. **Get delivery time** - Kaluga warehouse
3. **Get price and availability** - Real-time stock check

## Fallback Strategy
- If Rossko API fails → use current repairCostDatabase
- Show "Цены приблизительные" disclaimer
- Cache successful responses

## Security Considerations
- NEVER expose API keys in client code
- Use server-side API route
- Rate limit client requests (max 10/minute per IP)

## Files to Modify
1. `src/app/api/parts/route.ts` - NEW
2. `src/app/page.tsx` - Update calculator logic
3. `.env.local.example` - Add template for env vars

## Testing Checklist
- [ ] API route returns correct data
- [ ] Fallback works when API unavailable
- [ ] Prices display correctly in calculator
- [ ] No credential leakage in client code
