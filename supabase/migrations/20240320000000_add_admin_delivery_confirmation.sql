-- Create delivery_confirmations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.delivery_confirmations (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    lista_id uuid NOT NULL REFERENCES public.listas(id) ON DELETE RESTRICT,
    photo_url text NOT NULL,
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    confirmed_by uuid REFERENCES auth.users(id),
    CONSTRAINT delivery_confirmations_pkey PRIMARY KEY (id)
);

-- Create index for lista_id
CREATE INDEX IF NOT EXISTS idx_delivery_confirmations_lista_id 
ON public.delivery_confirmations(lista_id);

-- Create index for confirmed_by
CREATE INDEX IF NOT EXISTS idx_delivery_confirmations_confirmed_by 
ON public.delivery_confirmations(confirmed_by);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view their own delivery confirmations" ON delivery_confirmations;
DROP POLICY IF EXISTS "Users can insert their own delivery confirmations" ON delivery_confirmations;
DROP POLICY IF EXISTS "Users can update their own delivery confirmations" ON delivery_confirmations;
DROP POLICY IF EXISTS "Users can delete their own delivery confirmations" ON delivery_confirmations;

-- Create new policies
CREATE POLICY "Users can view their own delivery confirmations"
ON delivery_confirmations
FOR SELECT
TO authenticated
USING (
  auth.uid() = confirmed_by OR
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Users can insert their own delivery confirmations"
ON delivery_confirmations
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = confirmed_by OR
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Users can update their own delivery confirmations"
ON delivery_confirmations
FOR UPDATE
TO authenticated
USING (
  auth.uid() = confirmed_by OR
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Users can delete their own delivery confirmations"
ON delivery_confirmations
FOR DELETE
TO authenticated
USING (
  auth.uid() = confirmed_by OR
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
); 