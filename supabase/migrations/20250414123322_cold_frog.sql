/*
  # Create contact forms table

  1. New Tables
    - `contact_forms`
      - `id` (bigint, primary key)
      - `name` (text)
      - `email` (text)
      - `phone` (text, optional)
      - `message` (text)
      - `submitted_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `contact_forms` table
    - Add policy for authenticated users to insert data
*/

CREATE TABLE IF NOT EXISTS contact_forms (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text,
  submitted_at timestamp with time zone DEFAULT now()
);

ALTER TABLE contact_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert contact forms"
  ON contact_forms
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can view contact forms"
  ON contact_forms
  FOR SELECT
  TO authenticated
  USING (true);