-- CIFRALAB PRO (V7) - Schema SQL do Supabase
-- Tabelas com RLS, estilos musicais e suporte a Realtime

-- 1. Tabela de Músicas
CREATE TABLE IF NOT EXISTS public.musicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    titulo TEXT NOT NULL,
    artista TEXT NOT NULL,
    estilo TEXT NOT NULL DEFAULT 'Samba',
    tom_original TEXT NOT NULL DEFAULT 'C',
    chordpro TEXT NOT NULL,
    publico BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Setlists (Repertórios)
CREATE TABLE IF NOT EXISTS public.setlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    descricao TEXT,
    publico BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Itens do Setlist (Músicas no Repertório com Ordem)
CREATE TABLE IF NOT EXISTS public.setlist_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setlist_id UUID REFERENCES public.setlists(id) ON DELETE CASCADE,
    musica_id UUID REFERENCES public.musicas(id) ON DELETE CASCADE,
    ordem INTEGER NOT NULL DEFAULT 1,
    tom_customizado TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para alta performance
CREATE INDEX IF NOT EXISTS idx_musicas_artista ON public.musicas(artista);
CREATE INDEX IF NOT EXISTS idx_musicas_titulo ON public.musicas(titulo);
CREATE INDEX IF NOT EXISTS idx_musicas_estilo ON public.musicas(estilo);
CREATE INDEX IF NOT EXISTS idx_setlist_itens_setlist ON public.setlist_itens(setlist_id, ordem);

-- Políticas RLS
ALTER TABLE public.musicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setlist_itens ENABLE ROW LEVEL SECURITY;

-- Músicas: públicas são visíveis por todos, edição por criador
DROP POLICY IF EXISTS "Select musicas publicas ou autenticadas" ON public.musicas;
CREATE POLICY "Select musicas publicas ou autenticadas" 
ON public.musicas FOR SELECT 
USING (publico = true OR auth.uid() = user_id OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Insert musicas autenticados" ON public.musicas;
CREATE POLICY "Insert musicas autenticados" 
ON public.musicas FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Update musicas proprias" ON public.musicas;
CREATE POLICY "Update musicas proprias" 
ON public.musicas FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- Setlists: público visível para todos (banda), privado apenas para o dono
DROP POLICY IF EXISTS "Select setlists proprios ou publicos" ON public.setlists;
CREATE POLICY "Select setlists proprios ou publicos" 
ON public.setlists FOR SELECT 
USING (publico = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Manage setlists" ON public.setlists;
CREATE POLICY "Manage setlists" 
ON public.setlists FOR ALL 
TO authenticated 
USING (auth.uid() = user_id OR publico = true)
WITH CHECK (auth.uid() = user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.musicas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.setlists;
ALTER PUBLICATION supabase_realtime ADD TABLE public.setlist_itens;
