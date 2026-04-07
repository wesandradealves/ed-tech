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
│  │  ├─ trees.jpg
│  │  ├─ atividade-discursiva.svg
│  │  ├─ atividade-objetiva.svg
│  │  ├─ check.svg
│  │  └─ logo.svg
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
   │  │  ├─ component-registry.js
   │  │  └─ value.utils.js
   │  └─ components/
   │     └─ organisms/
   │        ├─ activity-panel.component.js
   │        ├─ audio-player.component.js
   │        ├─ dark-text-box.component.js
   │        ├─ faq-accordion.component.js
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
      │  ├─ _section-intro.scss
      │  └─ _wrapper.scss
      ├─ atoms/
      │  ├─ _button.scss
      │  └─ _toast.scss
      └─ organisms/
         ├─ _activity-panel.scss
         ├─ _audio-player.scss
         ├─ _dark-text-box.scss
         ├─ _faq-accordion.scss
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

## Styleguide

### Fonte única de tokens
- Arquivo base: `src/styles/settings/_variables.scss`
- Todas as cores em hexadecimal ficam no bloco `Styleguide de Cores (HEX)` com prefixo `$color-*`
- A coleção completa de cores está no map `$styleguide-colors`
- Os tokens semânticos consumidos pelos componentes ficam abaixo do bloco de cores (ex.: `$page-bg`, `$accent`, `$text-base`)

### Paleta principal
- `$color-page-bg`: `#f7f8f5`
- `$color-surface-dark`: `#020302`
- `$color-text-primary`: `#f5f7f7`
- `$color-text-base`: `#111111`
- `$color-text-dark-title`: `#182415`
- `$color-text-dark-description`: `#5f6f58`
- `$color-accent`: `#76ce00`
- `$color-accent-figma`: `#76b900`
- `$color-slider-control-border`: `#e5e7eb`
- `$color-wave-card-border`: `#f3f4f6`
- `$color-toast-success-bg`: `#dcfce7`
- `$color-toast-success-text`: `#166534`
- `$color-toast-warning-bg`: `#fff9c4`
- `$color-toast-warning-text`: `#713f12e5`
- `$color-footer-text`: `#697586`

### Escalas padronizadas
- Espaçamento: `$token-space-*` (`xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `section`, `footer-y`)
- Tamanhos de fonte: `$token-font-size-*` (`sm`, `base`, `md`, `lg`)
- Line-height: `$token-line-height-*` (`sm`, `base`, `md`, `lg`, `xl`)
- Radius: `$token-radius-sm`, `$token-radius-md`
- Auxiliares globais: `$token-zero`, `$token-letter-spacing-none`, `$token-shadow-card`

### Convenção de nomenclatura
- Cores base: `$color-*`
- Tokens semânticos reutilizáveis: sem prefixo `color` (ex.: `$page-bg`, `$footer-text-color`)
- Tokens de escala global: `$token-*`
- Tokens por componente/seção: `$hero-*`, `$video-intro-*`, `$audio-player-*`, `$activity-panel-*`, `$faq-*`

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

### Seção 7: Player de áudio
- Título e texto com tipografia alinhada ao padrão da página
- Player customizado com borda `#E5E7EB`, sombra leve e `padding` de `16px`
- Barra de progresso com trilha cinza, progresso verde (`#76B900`) e handle branco
- Controles de play/pause, mute, volume e tempo
- Reprodução de áudio remoto via URL definida em configuração

### Seção 8 e 9: Atividades (discursiva e objetiva)
- Mesmo organismo reutilizável (`activity-panel`) com variação por `data-activity-type`
- Atividade discursiva com textarea, validação de preenchimento e ações `Responder`/`Alterar`
- Atividade objetiva com alternativas e seleção única (sem item marcado por padrão)
- Toaster contextual por atividade (sucesso/aviso), com botão de fechar
- `Responder` habilita apenas após interação válida no formulário
- `Alterar` reseta formulário e toaster para estado inicial

### Seção 10: FAQ (Accordion)
- Cabeçalho de seção com título e descrição centralizados
- Lista de accordions com estado aberto/fechado e comportamento acessível (`aria-expanded` e `aria-controls`)
- Item aberto em verde com conteúdo em branco; itens fechados em fundo claro com título escuro
- Conteúdo e textos vindos de configuração (`faq` em `site-content.json`)

### Seção 11: Footer
- Rodapé em faixa escura full width
- Logo configurável com link externo
- Texto de copyright via configuração central
- Wrapper específico de `1024px` para alinhamento com o layout

### Configuração central de conteúdo
- Conteúdo textual e caminhos de imagem centralizados em `public/config/site-content.json`
- Aplicação desse conteúdo no bootstrap da página por `site-content.config.js`
- Hero, players de vídeo/áudio, bloco de imagem+texto, slider, box escuro, atividades, FAQ e metadados SEO consomem esse JSON

### Montagem lazy por seção
- Componentes com `lazyOnScroll = true` são montados com `IntersectionObserver`
- Montagem acontece quando a seção entra no viewport

### Build de produção
- Minificação de HTML, CSS e JavaScript no pipeline de build
- Configuração centralizada em `vite.config.js` para saída otimizada na Vercel

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
- feedbacks de formulário com `role="status"` e `aria-live="polite"`

## Padrões adotados
- `font-size` em `rem`
- Tokens SCSS centralizados em `src/styles/settings/_variables.scss`
- Sem hardcode de cores fora da camada de tokens
- Imagens com `loading="lazy"` e `decoding="async"`
- Organização por responsabilidade (HTML, SCSS, JS)
- Conteúdo e metadados consumidos de arquivo JSON central
