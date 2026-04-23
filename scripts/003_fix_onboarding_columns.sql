-- Adicionar colunas faltantes na tabela onboarding
ALTER TABLE onboarding ADD COLUMN IF NOT EXISTS goals text[] DEFAULT '{}';
ALTER TABLE onboarding ADD COLUMN IF NOT EXISTS team_size text;
ALTER TABLE onboarding ADD COLUMN IF NOT EXISTS business_type text;
ALTER TABLE onboarding ADD COLUMN IF NOT EXISTS current_step integer DEFAULT 1;
