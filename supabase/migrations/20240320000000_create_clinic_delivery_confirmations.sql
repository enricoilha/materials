-- Create clinic_delivery_confirmations table
CREATE TABLE clinic_delivery_confirmations (
    id UUID PRIMARY KEY,
    clinica_id INTEGER NOT NULL REFERENCES clinicas(id),
    photo_url TEXT NOT NULL,
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    confirmed_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies
ALTER TABLE clinic_delivery_confirmations ENABLE ROW LEVEL SECURITY;

-- Allow admins to insert
CREATE POLICY "Admins can insert clinic delivery confirmations"
    ON clinic_delivery_confirmations
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Allow admins to view all confirmations
CREATE POLICY "Admins can view all clinic delivery confirmations"
    ON clinic_delivery_confirmations
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_clinic_delivery_confirmations_updated_at
    BEFORE UPDATE ON clinic_delivery_confirmations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 