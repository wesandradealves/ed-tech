# Teste Técnico Frontend EdTech

## Deploy (Vercel)
https://ed-tech-ten-murex.vercel.app/

## Visão geral
Implementação frontend da página do teste técnico EdTech usando HTML5 semântico, SCSS e JavaScript Vanilla (ES Modules).

O projeto está estruturado para evolução por seções, com separação entre marcação, estilo e comportamento.

## Stack
- Vite
- HTML5 semântico
- SCSS
- JavaScript Vanilla (ES Modules com classes)

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
│  │  ├─ video.jpg
│  │  ├─ Nature waves crashing.jpg
│  │  └─ trees.jpg
│  ├─ config/
│  │  └─ site-content.json
│  └─ favicon.svg
└─ src/
   ├─ main.js
   ├─ js/
   │  ├─ config/
   │  │  └─ site-content.config.js
   │  ├─ core/
   │  │  ├─ base-component.js
   │  │  └─ component-registry.js
   │  └─ components/
   │     └─ organisms/
   │        ├─ dark-text-box.component.js
   │        ├─ hero-banner.component.js
   │        ├─ forest-slider.component.js
   │        ├─ reveal-cards.component.js
   │        ├─ video-intro.component.js
   │        └─ wave-text.component.js
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
         ├─ _dark-text-box.scss
         ├─ _forest-slider.scss
         ├─ _hero-banner.scss
         ├─ _reveal-cards.scss
         ├─ _video-intro.scss
         └─ _wave-text.scss
```

## Arquitetura

### SCSS (Atomic Design)
- `settings`: tokens globais (cores, tipografia, espaçamento, sombras, breakpoints)
- `base`: reset e acessibilidade base
- `layout`: estrutura macro da página e wrappers
- `atoms`: unidades reutilizáveis de UI (ex.: botão)
- `organisms`: seções compostas da página

### JavaScript
- `config`: carregamento e aplicação do conteúdo via JSON
- `core`: classes base e registro de componentes
- `components/organisms`: comportamento específico por seção

## Funcionalidades implementadas

### Seção 1: Hero banner
- Fundo full width com conteúdo centralizado
- CTA com abertura de vídeo externo em nova aba
- Layout responsivo com ajuste de ordem/posicionamento em mobile

### Seção 2: Bloco de vídeo introdutório
- Título e texto introdutórios
- Thumbnail com botão de play central
- Troca para `iframe` do YouTube ao reproduzir
- Pausa por botão (exibido no hover), clique fora do bloco e tecla `Escape`
- Retorno ao estado inicial ao pausar

### Seção 3: Bloco imagem + texto
- Card com imagem lateral e dois blocos de texto
- Layout em grid no desktop e empilhado no mobile
- Tokens dedicados para espaçamento, borda, sombra e tipografia

### Seção 4: Slider de imagem
- Card com fundo branco, borda e sombra leve
- Navegação por setas e indicadores (dots)
- Suporte a teclado (`ArrowLeft` e `ArrowRight`)
- Status de slide para leitor de tela (região `aria-live`)

### Seção 5: Box preto com texto
- Card escuro centralizado com largura máxima de `784px`
- Tipografia `Inter` 500 com `18px/29.25px`
- Sombra em duas camadas conforme especificação
- Em mobile ocupa largura total e remove borda arredondada

### Seção 6: Cards interativos (3 boxes)
- Componente limitado a 3 cards em layout flex com largura equilibrada
- Estado inicial com card central aberto e os demais com `?`
- Ação de abrir/fechar por card com botão dedicado
- Card ativo com fundo escuro e altura maior; cards inativos com fundo claro

### Configuração central de conteúdo
- Conteúdo textual e caminhos de imagem centralizados em `public/config/site-content.json`
- Aplicação desse conteúdo no bootstrap da página por `site-content.config.js`
- Hero, player, bloco de imagem+texto, slider, box escuro e metadados SEO consomem esse JSON

### Montagem lazy por seção
- Componentes com `lazyOnScroll = true` são montados com `IntersectionObserver`
- Montagem acontece quando a seção entra no viewport

## SEO e compartilhamento social
Metadados configurados no `head`:
- `title`
- `canonical`
- `meta description`
- `meta robots`
- Open Graph (`og:*`)
- Twitter Card (`twitter:*`)
- `theme-color`
- `favicon`
- URLs absolutas para `canonical`, `og:url`, `og:image` e `twitter:image`

## Acessibilidade
- Estrutura semântica com hierarquia de títulos
- `skip link` para o conteúdo principal
- `aria-label` em controles interativos
- foco visível em elementos acionáveis
- estados de controle atualizados no player (`aria-hidden`, `aria-pressed`, `tabIndex`)

## Padrões adotados
- `font-size` em `rem`
- Tokens SCSS centralizados em `src/styles/settings/_variables.scss`
- Sem hardcode de cores fora da camada de tokens
- Imagens com `loading="lazy"` e `decoding="async"`
- Organização por responsabilidade (HTML, SCSS, JS)
- Conteúdo e metadados consumidos de arquivo JSON central
