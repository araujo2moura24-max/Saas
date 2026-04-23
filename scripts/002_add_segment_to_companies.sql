-- Adicionar coluna segment à tabela companies
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS segment text;
