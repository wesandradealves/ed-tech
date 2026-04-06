# Teste Técnico Frontend EdTech

## Visão geral
Projeto frontend em HTML5, SCSS e JavaScript Vanilla para implementação da página do teste técnico da EdTech.

O código está organizado para escalar por seções, com separação clara entre estrutura (HTML), estilo (SCSS) e comportamento (JS).

## Stack
- Vite
- HTML5 semântico
- SCSS
- JavaScript Vanilla (ES Modules + classes)

## Requisitos
- Node.js 18+
- npm 9+

## Instalação
```bash
npm install
```

## Execução
Desenvolvimento:
```bash
npm run dev
```

Build de produção:
```bash
npm run build
```

Preview do build:
```bash
npm run preview
```

## Estrutura do projeto
```text
.
├─ index.html
├─ package.json
├─ public/
│  ├─ assets/
│  │  ├─ hero-banner-background.png
│  │  ├─ hero-banner-monitor.png
│  │  └─ video.jpg
│  └─ favicon.svg
└─ src/
   ├─ main.js
   ├─ js/
   │  ├─ config/
   │  │  └─ video.config.js
   │  ├─ core/
   │  │  ├─ base-component.js
   │  │  └─ component-registry.js
   │  └─ components/
   │     └─ organisms/
   │        ├─ hero-banner.component.js
   │        └─ video-intro.component.js
   └─ styles/
      ├─ main.scss
      ├─ settings/
      │  └─ _variables.scss
      ├─ base/
      │  ├─ _a11y.scss
      │  └─ _reset.scss
      ├─ layout/
      │  ├─ _page.scss
      │  └─ _wrapper.scss
      ├─ atoms/
      │  └─ _button.scss
      └─ organisms/
         ├─ _hero-banner.scss
         └─ _video-intro.scss
```

## Arquitetura

### SCSS (Atomic Design)
- `settings`: tokens globais (cores, tipografia, espaçamento, breakpoints)
- `base`: reset e acessibilidade base
- `layout`: wrappers e estrutura de página
- `atoms`: componentes pequenos reutilizáveis (ex.: botão)
- `organisms`: seções compostas (hero e vídeo)

### JavaScript
- `config`: constantes de domínio compartilhadas (URLs de vídeo)
- `core`: base de componentes e registro de montagem
- `components/organisms`: comportamento específico de cada seção

## Funcionalidades implementadas

### Seção 1: Hero banner
- Fundo full width com conteúdo centralizado
- CTA principal com abertura de vídeo em nova aba
- Layout responsivo (desktop/mobile)

### Seção 2: Bloco de vídeo introdutório
- Título e texto conforme referência
- Thumbnail com botão de play central
- Reprodução via `iframe` do YouTube
- Pausa por botão (no hover), clique fora do bloco e tecla `Escape`
- Retorno ao estado inicial após pausar

## SEO e compartilhamento social
Metadados configurados no `head`:
- `title`
- `meta description`
- Open Graph (`og:*`)
- Twitter Card (`twitter:*`)
- `theme-color`
- `favicon`

## Acessibilidade
- Estrutura semântica com hierarquia de títulos
- `skip link` para conteúdo principal
- `aria-label` em controles interativos
- foco visível em elementos acionáveis
- estados de controle atualizados no player (`aria-hidden`, `tabIndex`)

## Padrões adotados
- `font-size` em `rem`
- Cores centralizadas em `src/styles/settings/_variables.scss`
- Sem hardcode de cores fora da camada de tokens
- Imagens com `loading="lazy"` e `decoding="async"`

## Validação recomendada
Antes de subir alterações:
1. Executar build de produção
2. Verificar funcionamento das interações (hero e player)
3. Conferir responsividade em desktop e mobile

Comando principal:
```bash
npm run build
```
