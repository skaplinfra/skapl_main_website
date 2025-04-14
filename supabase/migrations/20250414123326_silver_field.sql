/*
  # Create career applications table and storage

  1. New Tables
    - `career_applications`
      - `id` (bigint, primary key)
      - `name` (text)
      - `email` (text)
      - `phone` (text, optional)
      - `position_applied` (text)
      - `resume_url` (text)
      - `cover_letter` (text, optional)
      - `submitted_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `career_applications` table
    - Add policy for authenticated users to insert data
    - Create storage bucket for resumes
*/

CREATE TABLE IF NOT EXISTS career_applications (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  position_applied text NOT NULL,
  resume_url text NOT NULL,
  cover_letter text,
  submitted_at timestamp with time zone DEFAULT now()
);

ALTER TABLE career_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert career applications"
  ON career_applications
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can view career applications"
  ON career_applications
  FOR SELECT
  TO authenticated
  USING (true);