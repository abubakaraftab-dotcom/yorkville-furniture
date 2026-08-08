1. **Remove Colour Filter from `ProductsClient.tsx`**
   - Remove `selectedColours` and `setSelectedColours` state.
   - Remove `uniqueColours` extraction logic.
   - Remove colour filtering logic from `filteredAndSortedProducts`.
   - Remove the Colour filter UI block completely (both desktop and mobile instances).
   - Ensure `clearAllFilters` no longer touches colour state.

2. **Update Products Colour Data in `products.json`**
   - Keep the recent changes we made where colors were mapped to the new palette.
   - Ensure that `sofas` category products have an empty `colours` array. (Already done)

3. **Update Product Detail Page handling of empty colours**
   - We already added `?.` to `ProductDetailClient.tsx` for `selectedColour.name` handling. Let's make sure it fully works gracefully if `selectedColour` is undefined because `product.colours` is empty (for sofas).

4. **Complete Pre-commit Steps**
   - Ensure proper testing, verification, review, and reflection are done.
