-- Add receiver_name for "To [Name]" on the card
ALTER TABLE public.valentine_pages
ADD COLUMN IF NOT EXISTS receiver_name text;
