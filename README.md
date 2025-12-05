
# Ateliware Chat Widget

Widget de chat em JavaScript para integração fácil com qualquer site, utilizando Shadow DOM, HTML e CSS externos. Ideal para adicionar um assistente virtual alimentado por IA em páginas web.

## Funcionalidades
- Botão flutuante (FAB) para abrir o chat
- Modal de chat com histórico de mensagens
- Integração com API de chatbot
- Interface responsiva e personalizável
- Carregamento dinâmico de template e estilos via CDN

---

## 1. Como clonar e rodar localmente

1. Clone o repositório:
	```sh
	git clone https://github.com/atom6development/ateliware-chat-bot.git
	```
2. Edite os arquivos em `src/` conforme necessário.
3. Abra `demo/index.html` no navegador para testar o widget localmente.

### Como testar o widget localmente
No arquivo `src/ateliware-chat.widget.js`, basta **comentar** a linha do CDN:

```js
const CDN_BASE = "https://cdn.jsdelivr.net/gh/atom6development/ateliware-chat-bot@v1.1.9/src/";
```

E **descomentar** a linha local:

```js
const CDN_BASE = "../src/";
```

Assim, o widget irá carregar os arquivos diretamente do seu projeto local.

---

## 2. Como usar via CDN

Inclua as seguintes tags no `<head>` ou antes do fechamento do `<body>` do seu site:

> ⚠️ **Atenção:**
>
> Sempre utilize o número da versão da tag desejada na URL do CDN (por exemplo, `@v1.0.5`). Isso garante que você está usando uma versão estável e imutável do widget. Sempre que possível, prefira utilizar a versão mais recente disponível para garantir maior estabilidade e evitar quebras inesperadas por atualizações futuras.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/atom6development/ateliware-chat-bot@v1.0.1/src/ateliware-chat.style.css">
<script src="https://cdn.jsdelivr.net/gh/atom6development/ateliware-chat-bot@v1.0.1/src/ateliware-chat.widget.js"></script>
```


O widget será carregado automaticamente na página.

---

## 3. Funções globais do Widget

O widget expõe funções globais para facilitar a integração e personalização:

### Abrir o modal do chat

Para abrir o chat programaticamente, utilize:

```js
window.openAteliwareChat();
```

### Alterar o idioma do chat


Para alterar o idioma da interface do chat, utilize:

```js
window.setChatLanguage('en'); // ou 'pt-br', 'es'
```

Você pode chamar essas funções a partir de qualquer script na sua página, por exemplo ao clicar em um botão:

```html
<button onclick="window.openAteliwareChat()">Abrir Chat</button>
<button onclick="window.setChatLanguage('es')">Espanhol</button>
```

---

---

## 3. Como publicar uma nova versão no CDN

Para disponibilizar uma nova versão do widget via CDN:

1. Altere o valor de `CDN_BASE` em `src/ateliware-chat.widget.js` para a nova tag desejada, por exemplo:

	```js
	const CDN_BASE = "https://cdn.jsdelivr.net/gh/atom6development/ateliware-chat-bot@v1.2.0/src/";
	```

2. Faça o commit das alterações:

	```sh
	git add src/ateliware-chat.widget.js
	git commit -m "Atualiza CDN_BASE para v1.2.0"
	```

3. Crie uma nova tag correspondente à versão:

	```sh
	git tag v1.2.0
	```

4. Envie o commit e a tag para o repositório remoto:

	```sh
	git push origin main --tags
	```

Após esses passos, o CDN irá servir a nova versão e os links com a nova tag estarão disponíveis e validados.
