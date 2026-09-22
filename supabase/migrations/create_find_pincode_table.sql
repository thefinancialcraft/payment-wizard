-- Create find_pincode table for caching pincode location data
CREATE TABLE IF NOT EXISTS find_pincode (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pincode VARCHAR(6) NOT NULL UNIQUE,
  city VARCHAR(255) NOT NULL,
  district VARCHAR(255) NOT NULL,
  state VARCHAR(255) NOT NULL,
  country VARCHAR(255) DEFAULT 'India',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on pincode for faster lookups
CREATE INDEX IF NOT EXISTS idx_find_pincode_pincode ON find_pincode(pincode);

-- Create index on created_at for potential cleanup
CREATE INDEX IF NOT EXISTS idx_find_pincode_created_at ON find_pincode(created_at);

-- Disable Row Level Security to avoid permission errors
ALTER TABLE find_pincode DISABLE ROW LEVEL SECURITY;

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically update updated_at
CREATE TRIGGER update_find_pincode_updated_at
  BEFORE UPDATE ON find_pincode
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE find_pincode IS 'Cache table for pincode location data to reduce API calls';
