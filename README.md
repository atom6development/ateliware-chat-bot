# Ateliware Chat Widget

Widget de chat em JavaScript para integração fácil com qualquer site, utilizando Shadow DOM, HTML e CSS externos. Ideal para adicionar um assistente virtual alimentado por IA em páginas web.

## Funcionalidades
- Botão flutuante (FAB) para abrir o chat
- Modal de chat com histórico de mensagens
- Integração com API de chatbot
- Interface responsiva e personalizável
- Carregamento dinâmico de template e estilos via CDN

## Como usar via CDN
Inclua as seguintes tags no `<head>` ou antes do fechamento do `<body>` do seu site:

> ⚠️ **Atenção:**
>
> Sempre utilize o número da versão da tag desejada na URL do CDN (por exemplo, `@v1.0.5`). Isso garante que você está usando uma versão estável e imutável do widget. Sempre que possível, prefira utilizar a versão mais recente disponível para garantir maior estabilidade e evitar quebras inesperadas por atualizações futuras.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/atom6development/ateliware-chat-bot@v1.0.1/src/ateliware-chat.style.css">
<script src="https://cdn.jsdelivr.net/gh/atom6development/ateliware-chat-bot@v1.0.1/src/ateliware-chat.widget.js"></script>
```

O widget será carregado automaticamente na página.

## Desenvolvimento local
1. Clone o repositório
2. Edite os arquivos em `src/`
3. Abra `demo/index.html` para testar localmente
