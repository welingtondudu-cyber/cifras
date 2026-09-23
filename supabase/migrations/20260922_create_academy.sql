-- ====================================================================
-- CIFRALAB ACADEMY: Migration para Trilhas de Teoria Musical & Estudos
-- Data: 2026-09-22
-- ====================================================================

-- 1. Tabela de Trilhas / Níveis de Aprendizado
CREATE TABLE IF NOT EXISTS academy_tracks (
    id SERIAL PRIMARY KEY,
    level_order INT UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL
);

-- 2. Tabela de Módulos e Lições da Academia
CREATE TABLE IF NOT EXISTS academy_modules (
    id SERIAL PRIMARY KEY,
    track_id INT REFERENCES academy_tracks(id) ON DELETE CASCADE,
    module_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    concept TEXT NOT NULL,
    practical_example TEXT NOT NULL,
    exercise TEXT NOT NULL
);

-- 3. Tabela de Progresso do Aluno / Músico
CREATE TABLE IF NOT EXISTS user_module_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id INT REFERENCES academy_modules(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE academy_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_module_progress ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
CREATE POLICY "Leitura pública de trilhas da academia" 
    ON academy_tracks FOR SELECT 
    USING (true);

CREATE POLICY "Leitura pública de módulos da academia" 
    ON academy_modules FOR SELECT 
    USING (true);

CREATE POLICY "Usuários gerenciam seu próprio progresso" 
    ON user_module_progress FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Carga inicial das 4 Trilhas da CIFRALAB Academy
INSERT INTO academy_tracks (level_order, title, description) VALUES
(1, 'Nível 1: Fundamentos & O Início Prático', 'Sair do zero absoluto, dominar cifras, ritmo e montagem de acordes.'),
(2, 'Nível 2: O Mecanismo da Harmonia', 'Entender a gravidade musical, campos harmônicos e funções.'),
(3, 'Nível 3: Melodia, Escalas e Tablaturas', 'Domínio visual do braço, pentatônicas e leitura avançada de tabs.'),
(4, 'Nível 4: Maestria, Samba/MPB e Ouvido Pro', 'Harmonias complexas, reharmonização e tirar músicas de ouvido.')
ON CONFLICT (level_order) DO UPDATE 
SET title = EXCLUDED.title, description = EXCLUDED.description;

-- Carga inicial dos Módulos para cada Nível
-- Nível 1
INSERT INTO academy_modules (track_id, module_number, title, concept, practical_example, exercise)
SELECT t.id, 1, 'O Alfabeto Musical e as Cifras Internacionais', 
       'As 7 notas naturais (C, D, E, F, G, A, B) e acidentes (sustenidos e bemóis). Toda cifra indica o tom fundamental e seu tipo harmônico.', 
       'Am7 = A (Lá) + m (Menor) + 7 (Sétima menor) -> Lá, Dó, Mi, Sol.', 
       'Traduzir 5 cifras complexas para notas por extenso.'
FROM academy_tracks t WHERE t.level_order = 1
ON CONFLICT DO NOTHING;

INSERT INTO academy_modules (track_id, module_number, title, concept, practical_example, exercise)
SELECT t.id, 2, 'Montagem Lógica de Acordes', 
       'Acordes como fórmulas matemáticas. Tríade Maior = Tônica + 4 semitons + 3 semitons. Tríade Menor = Tônica + 3 semitons + 4 semitons.', 
       'Em Dó (C): C + 4 semitons (E) + 3 semitons (G). Logo C = C-E-G.', 
       'Calcular as notas do acorde de Sol (G) do zero.'
FROM academy_tracks t WHERE t.level_order = 1
ON CONFLICT DO NOTHING;

-- Nível 2
INSERT INTO academy_modules (track_id, module_number, title, concept, practical_example, exercise)
SELECT t.id, 1, 'A Função de Cada Grau', 
       'Tônica (repouso/casa), Subdominante (afastamento moderado) e Dominante (tensão máxima). Cada acorde exerce uma gravidade específica no ouvido.', 
       'Tocar um acorde com sétima dominante (G7) gera urgência de voltar para a tônica (C).', 
       'Identificar a resolução de tensão em uma progressão básica.'
FROM academy_tracks t WHERE t.level_order = 2
ON CONFLICT DO NOTHING;

-- Nível 3
INSERT INTO academy_modules (track_id, module_number, title, concept, practical_example, exercise)
SELECT t.id, 1, 'Leitura Avançada de Tablaturas (TabLab)', 
       'Leitura de linhas, trastes e efeitos de execução (h = hammer-on, p = pull-off, / = slide, ~ = vibrato).', 
       'G|---5h7p5--/9~---| significa hammer-on, pull-off, slide para a casa 9 e vibrato.', 
       'Executar um pequeno riff aplicando o slide e o vibrato.'
FROM academy_tracks t WHERE t.level_order = 3
ON CONFLICT DO NOTHING;

-- Nível 4
INSERT INTO academy_modules (track_id, module_number, title, concept, practical_example, exercise)
SELECT t.id, 1, 'Como Tirar Música de Ouvido', 
       'Método em 4 passos: Achar a tônica final, caçar o baixo, testar campo harmônico e mapear as tensões.', 
       'Ouvir o final da música para descobrir onde a voz descansa (Grau I).', 
       'Tirar a progressão de uma música de 3 acordes em menos de 5 minutos.'
FROM academy_tracks t WHERE t.level_order = 4
ON CONFLICT DO NOTHING;

INSERT INTO academy_modules (track_id, module_number, title, concept, practical_example, exercise)
SELECT t.id, 2, 'A Harmonia do Samba e da MPB', 
       'Uso de dominantes secundários em cadeia, acordes diminutos de passagem e baixos cromáticos ascendentes e descendentes.', 
       'C7M -> C#dim -> Dm7 -> G7(9) -> C7M (o diminuto como elevador estético e preparação harmônica).', 
       'Analisar a condução de vozes em um final de frase de samba.'
FROM academy_tracks t WHERE t.level_order = 4
ON CONFLICT DO NOTHING;
