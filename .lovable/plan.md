

## Plan: Add Search Bar to Landing Page with Direct Model Navigation

### What changes
Add a search input on the Index page (styled like the uploaded image with orange border) that searches across **all models from all brands**. When the user types (e.g., "iphone 14"), matching models appear as a dropdown list. Clicking a result navigates directly to the service selection page (step 2: `/orcamento/:brand/:modelSlug`).

### Implementation

**`src/pages/Index.tsx`**:
1. Import `BRANDS`, `MODELS_BY_BRAND`, `slugify` from `@/data/catalog` and `Search` from `lucide-react`.
2. Add state for search query and a computed list of filtered results (each result includes brand ID, brand name, and model name).
3. Build a flat list of all models across all brands (excluding empty arrays), search against it with `toLowerCase().includes()`.
4. Place the search bar between the hero headline/subtitle and the CTA buttons.
5. Style the input with an orange/primary border matching the uploaded screenshot (dark bg, rounded, orange border, search icon).
6. Show a dropdown below the input with matching results (max ~6 results), each showing the model name and brand as a subtle label.
7. On click of a result, navigate to `/orcamento/${brandId}/${slugify(modelName)}`.
8. Include a "Outra marca" option at the bottom of results for custom quotes.

### UI Details
- Search input: `bg-card border border-primary/60 rounded-xl` with `Search` icon on the left.
- Results dropdown: absolute positioned below input, `bg-card border border-border rounded-xl`, each item is a clickable row with model name + brand badge.
- Click outside or clear search closes the dropdown.

