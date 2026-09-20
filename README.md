# CIFRALAB PRO (V7 - MONOREPO & HIGH PERFORMANCE)

> **Plataforma de alta performance para músicos e bandas no palco e estúdio.**  
> Arquitetura: **Java 21 Spring Boot BFF + React 19 Frontend + Supabase DB/Auth & Realtime**.

---

## 🚀 Arquitetura do Sistema

```
cifras/
├── client/                     # SPA React + Vite + Tailwind (Deploy Netlify)
│   ├── netlify.toml            # Proxy reverso /api/* e SPA redirects
│   ├── src/
│   │   ├── chordEngine/        # Parser ChordPro, transposição, harmonia funcional e dicionário
│   │   ├── components/         # Controles de palco, Smart Scroll, grades e modais
│   │   ├── hooks/              # useSmartScroll com suporte a visibilitychange e pausa de toque
│   │   └── lib/                # Conexão Supabase Realtime e streaming SSE
│   └── .env                    # Configurações de API e Supabase
├── server/                     # Backend BFF (Java 21 + Spring Boot 3 + WebFlux)
│   ├── pom.xml                 # Dependências WebFlux e Spring AI
│   └── src/main/
│       ├── java/com/cifralab/  # AIController (SSE), HarmonicAIService e RateLimiterFilter
│       └── resources/          # application.yml e credenciais blindadas
└── supabase/
    └── schema.sql              # DDL das tabelas (musicas, setlists, setlist_itens), RLS e Realtime
```

---

## 🎛️ Funcionalidades de Palco

1. **Barra de Ajustes Flutuante (Controles de Palco)**:
   - **Transposição em Tempo Real**: Botões `-1 semitom`, `Original` e `+1 semitom` com recálculo instantâneo sem recarregamento.
   - **Smart Scroll**: Iniciar/pausar rolagem, velocidade regulável (1-10) e **Pausa Inteligente de 2s** ao detectar toque ou rolagem do músico.
   - **Economia de Recursos em Palco**: Listener automático de `document.visibilitychange` pausa o motor de rolagem caso o usuário mude de aba no tablet/notebook.
   - **Toggle de Tablatura**: Alternador instantâneo para ocultar/mostrar blocos `{sot}/{eot}` em container monoespaçado com rolagem horizontal independente.
   - **Dicionário Dinâmico de Acordes**: Alternador rápido entre **Cavaco (afinação D-G-B-D)** e **Violão/Guitarra (E-A-D-G-B-E)** com diagramas SVG detalhados.

2. **Modos de Visualização**:
   - **Cifra + Letra**: Leitura e alinhamento clássico baseado em ChordPro.
   - **Grade de Compassos (Lead Sheet)**: Foco na harmonia pura organizada em compassos de 4 tempos.
   - **Grade em Graus (Harmonia Funcional)**: Análise funcional em numerais romanos (I, IV, V7, vi, etc.).

3. **Harmonic AI Advisor (Streaming SSE)**:
   - Chat harmônico com IA alimentado por Server-Sent Events (SSE).
   - Injeção contextual automática do **Tom Transposto Atual**, **Instrumento Ativo** e **Trecho da Música**.

4. **Sincronização em Tempo Real (Supabase Realtime)**:
   - Atualizações de repertório e setlists refletidas em milissegundos para todos os músicos conectados.

---

## ⚙️ Como Executar Localmente

### 1. Frontend (Client)
```bash
cd client
npm install
npm run dev
```
Acesse em: `http://localhost:5173`

### 2. Backend BFF (Server)
```bash
cd server
mvn spring-boot:run
```
Endpoint SSE disponível em: `http://localhost:8080/api/ai/harmonic-chat`

### 3. Banco de Dados (Supabase)
Execute o script em `supabase/schema.sql` no **SQL Editor** do seu painel Supabase para criar as tabelas com RLS e replicação Realtime.
