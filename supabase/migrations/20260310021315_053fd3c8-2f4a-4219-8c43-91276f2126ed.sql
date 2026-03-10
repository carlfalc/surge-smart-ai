
-- Make contact_messages insert policy slightly more restrictive - limit to non-empty values
DROP POLICY "Anyone can insert contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages FOR INSERT WITH CHECK (
  length(trim(name)) > 0 AND length(trim(email)) > 3 AND length(trim(message)) > 0
);
