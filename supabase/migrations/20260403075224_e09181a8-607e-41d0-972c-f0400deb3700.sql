CREATE TABLE public.favourite_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  city text,
  lat decimal(9,6),
  lng decimal(9,6),
  zone_type text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.favourite_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favourites" ON public.favourite_locations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favourites" ON public.favourite_locations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own favourites" ON public.favourite_locations
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own favourites" ON public.favourite_locations
  FOR DELETE TO authenticated USING (auth.uid() = user_id);