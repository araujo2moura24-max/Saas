-- Adicionar constraint unique para evitar conversas duplicadas
-- e permitir upsert funcionar corretamente

-- Criar indice unico se nao existir
CREATE UNIQUE INDEX IF NOT EXISTS conversations_user_contact_channel_idx 
  ON conversations (user_id, contact_phone, channel);
