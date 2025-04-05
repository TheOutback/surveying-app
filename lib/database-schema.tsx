export const databaseSchema = `
-- Drop existing tables if they exist to avoid conflicts
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.news CASCADE;
DROP TABLE IF EXISTS public.team CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- Create messages table
CREATE TABLE public.messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  features TEXT[] DEFAULT '{}',
  icon TEXT DEFAULT 'FileText',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  details TEXT,
  image_url TEXT,
  location TEXT NOT NULL,
  completion_date DATE NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create news table
CREATE TABLE public.news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  author TEXT NOT NULL,
  publish_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create team table
CREATE TABLE public.team (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  bio TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create settings table
CREATE TABLE public.settings (
  id SERIAL PRIMARY KEY,
  site_name TEXT NOT NULL DEFAULT 'JL Surveying & Services',
  site_url TEXT DEFAULT 'https://jlsurveying.com',
  site_description TEXT DEFAULT 'Professional surveying and construction services for all your needs.',
  contact_email TEXT DEFAULT 'info@jlsurveying.com',
  contact_phone TEXT DEFAULT '(123) 456-7890',
  address TEXT DEFAULT '123 Main Street, City, State 12345, United States',
  primary_color TEXT DEFAULT '#FFD700',
  dark_mode BOOLEAN DEFAULT false,
  animations BOOLEAN DEFAULT true,
  font TEXT DEFAULT 'Inter',
  email_notifications BOOLEAN DEFAULT false,
  sms_notifications BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin users table
CREATE TABLE public.admin_users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Disable RLS on all tables to fix permission issues
ALTER TABLE IF EXISTS public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.news DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.team DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_users DISABLE ROW LEVEL SECURITY;

-- Insert default settings if not exists
INSERT INTO public.settings (id, site_name, site_url, site_description, contact_email, contact_phone, address, primary_color, dark_mode, animations, font)
VALUES (1, 'JL Surveying & Services', 'https://jlsurveying.com', 'Professional surveying and construction services for all your needs.', 'info@jlsurveying.com', '(123) 456-7890', '123 Main Street, City, State 12345, United States', '#FFD700', false, true, 'Inter')
ON CONFLICT (id) DO UPDATE SET
  site_name = EXCLUDED.site_name,
  site_url = EXCLUDED.site_url,
  site_description = EXCLUDED.site_description,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  address = EXCLUDED.address,
  primary_color = EXCLUDED.primary_color,
  dark_mode = EXCLUDED.dark_mode,
  animations = EXCLUDED.animations,
  font = EXCLUDED.font;

-- Insert default admin user (email: admin@jlsurveying.com, password: admin123)
-- Note: In production, use a secure password and proper hashing
INSERT INTO public.admin_users (email, password_hash, name, role)
VALUES ('admin@jlsurveying.com', '$2a$10$xVqYLGUuJ9Fk9KZgJvVZxeUqwAjJnK9QgNQoL0hPCRKYLKIcZPOYi', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;
`

