
CREATE OR REPLACE VIEW public.platform_rates AS
SELECT
  p.city,
  e.platform,
  COUNT(*) AS trip_count,
  ROUND(AVG(e.amount / NULLIF(e.trip_distance_km, 0))::numeric, 2) AS avg_per_km,
  ROUND(AVG(e.amount / NULLIF(e.trip_duration_min, 0) * 60)::numeric, 2) AS avg_per_hour,
  ROUND(AVG(e.amount)::numeric, 2) AS avg_trip_value,
  ROUND(AVG(e.surge_multiplier)::numeric, 2) AS avg_surge,
  MAX(e.created_at) AS last_updated
FROM earnings e
JOIN profiles p ON p.user_id = e.user_id
WHERE e.trip_distance_km > 0
  AND e.amount > 0
GROUP BY p.city, e.platform;

GRANT SELECT ON public.platform_rates TO authenticated;
