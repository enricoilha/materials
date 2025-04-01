-- Create delivery_confirmations table
CREATE TABLE IF NOT EXISTS delivery_confirmations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lista_id UUID NOT NULL REFERENCES listas(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  confirmed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE delivery_confirmations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own delivery confirmations
CREATE POLICY "Users can insert their own delivery confirmations"
  ON delivery_confirmations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listas l
      JOIN profissionais p ON l.profissional_id = p.id
      WHERE l.id = lista_id
      AND p.user_id = auth.uid()
    )
  );

-- Allow users to view their own delivery confirmations
CREATE POLICY "Users can view their own delivery confirmations"
  ON delivery_confirmations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listas l
      JOIN profissionais p ON l.profissional_id = p.id
      WHERE l.id = lista_id
      AND p.user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_delivery_confirmations_updated_at
  BEFORE UPDATE ON delivery_confirmations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 