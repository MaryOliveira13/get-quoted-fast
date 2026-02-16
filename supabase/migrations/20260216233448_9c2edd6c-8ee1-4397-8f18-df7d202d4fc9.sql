
-- Rename label_url to label_url_pdf
ALTER TABLE public.orders RENAME COLUMN label_url TO label_url_pdf;

-- Add label_url_png column
ALTER TABLE public.orders ADD COLUMN label_url_png text;

-- Add issue_description column
ALTER TABLE public.orders ADD COLUMN issue_description text;
