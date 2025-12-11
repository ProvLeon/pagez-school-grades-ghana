-- supabase/migrations/20251207000000_add_profile_for_seed_user.sql

INSERT INTO public.profiles (user_id, user_type)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'admin@example.com'
ON CONFLICT (user_id) DO NOTHING;