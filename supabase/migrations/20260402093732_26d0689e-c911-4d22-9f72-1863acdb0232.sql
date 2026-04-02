
-- Create alert_preferences table
CREATE TABLE public.alert_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  surge_alerts boolean DEFAULT true,
  surge_threshold numeric DEFAULT 1.5,
  goal_alerts boolean DEFAULT true,
  platform_alerts boolean DEFAULT true,
  alerts_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.alert_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own alert preferences" ON public.alert_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alert preferences" ON public.alert_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alert preferences" ON public.alert_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Update handle_new_user to also insert alert_preferences
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  INSERT INTO public.alert_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;
