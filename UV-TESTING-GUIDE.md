# UV Mapping Testing Guide

## What Was Changed

### 1. Removed Size Variants
- ✅ All products now use single 'standard' size
- ✅ Removed oz-based sizing (16oz, 23oz, 32oz, etc.)
- ✅ Size selector removed from UI

### 2. Standardized Canvas Dimensions
- ✅ All products: **231.42mm × 134.37mm**
- ✅ Same canvas size = designs transfer perfectly between products
- ✅ Canvas height matches cup BODY only (excludes head/lid and foot/base)

### 3. Updated Model Paths
All 7 models now loaded:
- Handlebar- v3.glb ✅
- Walrus- v3.glb ✅
- General- v3.glb ✅
- Magnum- v3.glb ✅
- Sippy- v3.glb ✅
- Zappa Wide- v3.glb ✅
- Zappa Skinny- v3.glb ✅

## Current UV Settings

### Initial Values (Need Testing)

| Product | uvRepeatY | uvOffsetY | Notes |
|---------|-----------|-----------|-------|
| Handlebar | 1.72 | -0.21 | Standard tall cup |
| Walrus | 1.72 | -0.21 | Standard tall cup |
| General | 1.72 | -0.21 | Standard tall cup |
| Magnum | 1.72 | -0.21 | Standard tall cup |
| Sippy | 1.67 | -0.20 | Shorter cup |
| Zappa Wide | 1.61 | -0.19 | Short/wide cup |
| Zappa Skinny | 1.61 | -0.19 | Short/narrow cup |

## Testing Steps

### 1. Test Center Alignment
```
1. Go to http://localhost:3000
2. Add a sticker to the EXACT CENTER of canvas
3. Switch to each product type
4. Verify sticker appears centered on cup BODY (not on head or foot)
```

### 2. Test Vertical Boundaries
```
1. Add stickers at:
   - Top edge of canvas
   - Bottom edge of canvas
2. Switch between products
3. Check that:
   ✓ Top sticker does NOT appear on cup head/lid
   ✓ Bottom sticker does NOT appear on cup foot/bottom
   ✓ Both stickers stay on cup BODY only
```

### 3. Test Horizontal Wrapping
```
1. Add stickers at left and right edges
2. Verify they wrap around cup correctly
3. Check no distortion at seam
```

## How to Adjust UV Values

### If Design Appears on Cup Head (Lid Area)

**Problem**: Stickers showing on top lid/rim
**Solution**: INCREASE `uvRepeatY` by 0.1

```typescript
// In app/config/products.ts
handlebar: {
  uvRepeatY: 1.82,  // Was 1.72, increased by 0.1
  uvOffsetY: -0.21,
  // ...
}
```

### If Design Appears on Cup Foot (Bottom Area)

**Problem**: Stickers showing on bottom base
**Solution**: INCREASE `uvRepeatY` by 0.1 (same as above)

### If Design is Too HIGH on Cup

**Problem**: Canvas appears shifted upward, closer to lid
**Solution**: DECREASE `uvOffsetY` (more negative)

```typescript
handlebar: {
  uvRepeatY: 1.72,
  uvOffsetY: -0.25,  // Was -0.21, made more negative
  // ...
}
```

### If Design is Too LOW on Cup

**Problem**: Canvas appears shifted downward, closer to base
**Solution**: INCREASE `uvOffsetY` (less negative)

```typescript
handlebar: {
  uvRepeatY: 1.72,
  uvOffsetY: -0.17,  // Was -0.21, made less negative
  // ...
}
```

## Understanding UV Parameters

### uvRepeatY
- **Controls**: How much vertical space canvas occupies
- **Higher value** (e.g., 1.8): Canvas covers LESS of cup = excludes more head/foot
- **Lower value** (e.g., 1.5): Canvas covers MORE of cup = includes more area
- **Formula**: `1 / body_fraction`
  - If cup body is 58% of total height → uvRepeatY = 1/0.58 = 1.72

### uvOffsetY
- **Controls**: Vertical position/centering of canvas
- **Negative** (e.g., -0.21): Shifts canvas DOWN
- **Positive** (e.g., +0.10): Shifts canvas UP
- **Zero** (0.00): Canvas starts at UV origin

## Testing Checklist

For EACH product, verify:

- [ ] **Handlebar**
  - [ ] Center sticker is centered on cup body
  - [ ] Top canvas edge doesn't reach lid/rim
  - [ ] Bottom canvas edge doesn't reach base/foot
  - [ ] Design wraps correctly around cup

- [ ] **Walrus**
  - [ ] Center sticker is centered on cup body
  - [ ] No bleeding to lid or base
  - [ ] Wrap-around is correct

- [ ] **General**
  - [ ] Center sticker is centered on cup body
  - [ ] No bleeding to lid or base
  - [ ] Wrap-around is correct

- [ ] **Magnum**
  - [ ] Center sticker is centered on cup body
  - [ ] No bleeding to lid or base
  - [ ] Wrap-around is correct

- [ ] **Sippy**
  - [ ] Center sticker is centered on cup body
  - [ ] No bleeding to lid or base
  - [ ] Wrap-around is correct

- [ ] **Zappa Wide**
  - [ ] Center sticker is centered on cup body
  - [ ] No bleeding to lid or base
  - [ ] Wrap-around is correct

- [ ] **Zappa Skinny**
  - [ ] Center sticker is centered on cup body
  - [ ] No bleeding to lid or base
  - [ ] Wrap-around is correct

## Quick Reference - Adjustment Workflow

```
1. Identify problem:
   - Design on lid? → Increase uvRepeatY
   - Design on base? → Increase uvRepeatY
   - Design too high? → Decrease uvOffsetY (more negative)
   - Design too low? → Increase uvOffsetY (less negative)

2. Edit app/config/products.ts

3. Save file (dev server auto-reloads)

4. Test in browser

5. Repeat until perfect
```

## Files Modified

- ✅ `app/config/products.ts` - Product configuration with UV settings
- ✅ `app/store/product.ts` - Product store
- ✅ `app/store/editor.ts` - Editor state
- ✅ `app/composables/useProductSwitcher.ts` - Product switcher logic
- ✅ `app/composables/useCanvasOperations.ts` - Canvas operations
- ✅ `app/components/editor/ProductSwitcher.vue` - UI component
- ✅ `app/components/preview/CupViewer.vue` - 3D viewer

## Notes

- All products share same canvas dimensions (231.42 × 134.37 mm)
- UV settings are per-product to match each cup's unique proportions
- Changes in `app/config/products.ts` apply immediately (hot reload)
- Start testing with Handlebar (default product)
- Once one product is perfect, use it as reference for others
