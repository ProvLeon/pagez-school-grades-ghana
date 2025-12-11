
-- Seed an admin user for the seed script to use
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'seed_admin@pagez.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'seed_admin@pagez.com',
      crypt('Password123!', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
  ELSE
    UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'seed_admin@pagez.com';
  END IF;
END $$;
