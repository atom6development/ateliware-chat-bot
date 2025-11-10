/*!
 * Atom Chat Widget (All-in-one, HTML/CSS externos)
 * - injeta Shadow DOM, carrega template.html e styles.css
 * - chama sua API com token embutido
 * Autor: Atomsix
 */
(() => {
  // ===== HELPERS =====
  function getOrCreateUserId() {
    const key = "acw_user_id";
    let id = localStorage.getItem(key);
    if (!id) {
      id = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
        (
          c ^
          (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
        ).toString(16)
      );
      localStorage.setItem(key, id);
    }
    return id;
  }

  const loadText = (url) =>
    fetch(url, { credentials: "omit" }).then((r) => {
      if (!r.ok) throw new Error("Falha ao carregar: " + url);
      return r.text();
    });

  const fetchWithTimeout = (url, options = {}, timeout = 0) => {
    let controller, signal;
    if (options.signal) {
      signal = options.signal;
    } else {
      controller = new AbortController();
      signal = controller.signal;
    }
    let id;
    if (timeout) {
      id = setTimeout(() => {
        if (controller) controller.abort();
      }, timeout);
    }
    return fetch(url, { ...options, signal }).finally(() => {
      if (id) clearTimeout(id);
    });
  };

  const autoresize = (ta) => {
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  };

  // ===== CONFIGURAÇÃO =====
  const CDN_BASE = "https://cdn.jsdelivr.net/gh/atom6development/ateliware-chat-bot@v1.0.8/src/";
  // const CDN_BASE = "../src/"; // para desenvolvimento local
  const CONFIG = {
    cssUrl: CDN_BASE + "ateliware-chat.style.css",
    tplUrl: CDN_BASE + "ateliware-chat.template.html",
    ui: {
      zIndex: 999999,
      position: "right",
    },
    api: {
      url: "https://chatbot-api.purpleground-09d239ed.eastus.azurecontainerapps.io",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer 4e7c8bcd1f73f50c3a65af18c6d6f83e0f3e7a8f29c94c2d1a142a2e7bcd873f",
      },
      timeoutMs: 30000,
      buildPayload: ({ message, user_id }) => {
        const conversation_id = localStorage.getItem("acw_conversation_id");
        const payload = {
          user_id,
          question: message,
        };
        if (conversation_id) {
          payload.conversation_id = conversation_id;
        }
        return payload;
      },
      parseResponse: async (res) => {
        const data = await res.json();
        if (data.conversation_id) {
          try {
            localStorage.setItem("acw_conversation_id", data.conversation_id);
          } catch (e) {}
        }
        return data.answer ?? "";
      },
    },
  };

  // ===== MONTAGEM E EVENTOS =====
  async function boot() {
    // Variável para controle de cancelamento
    let currentAbortController = null;
    // Limpa o chat de forma otimista: remove do front imediatamente, depois chama a API
    async function clearChat() {
      // Remove mensagens do front imediatamente
      [...inbox.querySelectorAll(".acw-msg")].forEach((el) => el.remove());
      // Mostra bloco hello novamente
      if (helloBlock) helloBlock.style.display = "";
      // Chama a API para deletar no backend (não bloqueia o front)
      const user_id = getOrCreateUserId();
      try {
        const url = `${CONFIG.api.url}/messages/${user_id}`;
        await fetch(url, { method: "DELETE", headers: CONFIG.api.headers });
      } catch (e) {}
    }
    // Função para adicionar mensagem do assistant usando o template customizado
    function scrollInboxToBottom() {
      // Rola até o final de forma suave
      inbox.scrollTo({ top: inbox.scrollHeight, behavior: "smooth" });
    }
      // Expor função global para abrir o chat externamente
      window.openAteliwareChat = function() {
        if (typeof open === 'function') open();
      };

    // Função para transformar URLs em links clicáveis
    function linkify(text) {
      // Regex melhorado para capturar URLs, inclusive com caracteres especiais e sem espaço no final
      const urlRegex = /(https?:\/\/(?:[\w-]+\.)+[\w-]+(?:[\w\-._~:/?#[\]@!$&'()*+,;=%]*)?)|(www\.(?:[\w-]+\.)+[\w-]+(?:[\w\-._~:/?#[\]@!$&'()*+,;=%]*)?)/gi;
      return text.replace(urlRegex, function (url) {
        let href = url;
        if (!href.startsWith("http")) href = "https://" + href;
        return `<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`;
      });
    }

    function addAssistantMessage(text, isPending = false) {
      const tpl = shadow.getElementById("acw-assistant-template");
      if (!tpl) return add("assistant", text); // fallback
      const node = tpl.content.firstElementChild.cloneNode(true);
      const textEl = node.querySelector(".acw-assistant-text");
      // Usa linkify para transformar URLs em links clicáveis
      textEl.innerHTML = linkify(text);
      if (isPending) node.classList.add("acw-msg--pending");
      inbox.appendChild(node);
      // Não faz scroll aqui, só quando a resposta final chegar
      if (helloBlock) helloBlock.style.display = "none";
      return node;
    }
    // Carrega histórico antigo ao iniciar
    async function loadHistory() {
      const user_id = getOrCreateUserId();
      try {
        const url = `${CONFIG.api.url}/messages/${user_id}`;
        const res = await fetch(
          url,
          {
            method: "GET",
            headers: CONFIG.api.headers,
          },
          CONFIG.api.timeoutMs
        );
        if (!res.ok) return;
        const arr = await res.json();
        if (Array.isArray(arr)) {
          arr.forEach((msg) => {
            // msg: { message, type }
            if (msg.type === "system" && msg.message) {
              addAssistantMessage(msg.message);
            } else if (msg.type === "user" && msg.message) {
              add("user", msg.message);
            }
          });
        }
      } catch (e) {
        // pode logar erro se quiser
      }
    }
    // host & shadow
    const host = document.createElement("div");
    host.id = "float-ia";
    const shadow = host.attachShadow({ mode: "open" });

    // injeta CSS via <link> dentro do shadow
    const link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("href", CONFIG.cssUrl);
    shadow.appendChild(link);

    // carrega template HTML e faz substituição dinâmica do CDN_BASE
    let html = await loadText(CONFIG.tplUrl);
    html = html.replace(/__CDN_BASE__/g, CDN_BASE);
    const tplWrap = document.createElement("div");
    tplWrap.innerHTML = html;
    // garante que só os nós do template entram no shadow
    [...tplWrap.childNodes].forEach((n) => shadow.appendChild(n));

    // aplica tema via CSS vars no :host (agora só zIndex)
    const rootStyle = document.createElement("style");
    rootStyle.textContent = `
      :host {
        --acw-z: ${CONFIG.ui.zIndex};
      }
    `;
    shadow.prepend(rootStyle);

    // posicionamento (right|left)
    if (CONFIG.ui.position === "left") {
      const fab = shadow.querySelector(".acw-fab");
      const modal = shadow.querySelector(".acw-modal");
      if (fab) (fab.style.left = "20px"), (fab.style.right = "");
      if (modal) (modal.style.left = "20px"), (modal.style.right = "");
    }

    // pega elementos
    const fab = shadow.querySelector(".acw-fab");
    const overlay = shadow.querySelector(".acw-overlay");
    const modal = shadow.querySelector(".acw-modal");
    const closeBtns = shadow.querySelectorAll(".acw-close");
    const inbox = shadow.querySelector("#acw-messages");
    const input = shadow.querySelector(".acw-input");
    const sendBtn = shadow.querySelector(".acw-send");
    const helloBlock = shadow.querySelector(".acw-hello");

    // desabilita o botão de enviar se o input estiver vazio
    function updateSendBtnState() {
      if (!input.value.trim()) {
        sendBtn.disabled = true;
        sendBtn.classList.add("acw-send--disabled");
      } else {
        sendBtn.disabled = false;
        sendBtn.classList.remove("acw-send--disabled");
      }
    }
    updateSendBtnState();

    // Troca estrela do input ao focar/desfocar
    const inputStar = shadow.getElementById("acw-input-star");
    const inputContainer = shadow.querySelector(".acw-input-container");
    if (input && inputStar && inputContainer) {
      input.addEventListener("focus", () => {
        // Só troca se não estiver "thinking"
        if (!inputContainer.classList.contains("thinking")) {
          inputStar.src = CDN_BASE + "icon/stars.svg";
        }
      });
      input.addEventListener("blur", () => {
        // Só volta para cinza se não estiver "thinking"
        if (!inputContainer.classList.contains("thinking")) {
          inputStar.src = CDN_BASE + "icon/starsGray.svg";
        }
      });
    }

    // estado
    const history = []; // {role, content}[]
    let isOpen = false;

    function open() {
      if (isOpen) return;
      isOpen = true;
      if (modal) modal.classList.add("acw-open");
      if (overlay) overlay.classList.add("acw-open");
      if (fab) fab.classList.add("acw-fab--gradient");
      input?.focus();
      // Se já houver mensagens, esconde o bloco hello
      if (helloBlock && inbox.querySelector(".acw-msg")) {
        helloBlock.style.display = "none";
      }
    }
    function close() {
      if (!isOpen) return;
      isOpen = false;
      if (modal) modal.classList.remove("acw-open");
      if (overlay) overlay.classList.remove("acw-open");
      if (fab) fab.classList.remove("acw-fab--gradient");
      fab?.focus();
    }
    function add(role, text) {
      const b = document.createElement("div");
      b.className = `acw-msg ${role}`;
      b.textContent = text;
      inbox.appendChild(b);
      // Usa MutationObserver para garantir scroll após renderização
      const observer = new MutationObserver(() => {
        scrollInboxToBottom();
        observer.disconnect();
      });
      observer.observe(inbox, { childList: true, subtree: false });
      setTimeout(scrollInboxToBottom, 100);
      // Esconde o bloco de boas-vindas ao adicionar qualquer mensagem
      if (helloBlock) helloBlock.style.display = "none";
      return b;
    }

    async function sendMessage() {
      const text = (input.value || "").trim();
      if (!text) return;
      // user bubble
      add("user", text);
      history.push({ role: "user", content: text });
      input.value = "";
      autoresize(input);
      updateSendBtnState();
      // typing
      const typing = addAssistantMessage("Pensando...", true);
      // Troca ícone do botão para pause
      const sendIcon = shadow.querySelector(".acw-send-icon");
      const pauseIcon = shadow.querySelector(".acw-pause-icon");
      if (sendIcon && pauseIcon) {
        sendIcon.style.display = "none";
        pauseIcon.style.display = "";
      }
      // Habilita o botão para permitir cancelar
      sendBtn.disabled = false;
      sendBtn.classList.remove("acw-send--disabled");
      // Desabilita o input enquanto espera
      input.disabled = true;
      // Ativa borda gradiente no container do input
      const inputContainer = shadow.querySelector(".acw-input-container");
      if (inputContainer) inputContainer.classList.add("thinking");
      // Troca o ícone de estrelas para colorido
      const inputStar = shadow.getElementById("acw-input-star");
      if (inputStar) inputStar.src = CDN_BASE + "icon/stars.svg";
      // Cria controller para cancelar fetch
      currentAbortController = new AbortController();

      // request
      try {
        const user_id = getOrCreateUserId();
        const payload = CONFIG.api.buildPayload({
          history: history.slice(),
          message: text,
          user_id,
        });
        // fetch com abortController
        const res = await fetchWithTimeout(
          `${CONFIG.api.url}/chat`,
          {
            method: "POST",
            headers: CONFIG.api.headers,
            body: JSON.stringify(payload),
            signal: currentAbortController.signal,
          },
          CONFIG.api.timeoutMs
        );

        if (!res.ok) {
          const t = await res.text().catch(() => res.statusText);
          typing.classList.remove("acw-msg--pending");
          throw new Error(`Erro ${res.status}: ${t}`);
        }
        const reply = await CONFIG.api.parseResponse(res);
        const textEl = typing.querySelector(".acw-assistant-text");
        if (textEl) {
          textEl.innerHTML = linkify(reply || "(sem resposta)");
        }
        typing.classList.remove("acw-msg--pending");
        history.push({ role: "assistant", content: reply });
        // Scrolla para o final após a resposta ser exibida
        setTimeout(scrollInboxToBottom, 50);
        // Bloqueia o botão até digitar novamente
        sendBtn.disabled = true;
        sendBtn.classList.add("acw-send--disabled");
        // Reabilita o input
        input.disabled = false;
      } catch (e) {
        typing.classList.remove("acw-msg--pending");
        // Se foi cancelado pelo usuário, mostra mensagem amigável
        if (e?.name === "AbortError") {
          typing.classList.add("err");
          typing.querySelector(".acw-assistant-text").textContent =
            "Mensagem cancelada pelo usuário.";
          setTimeout(scrollInboxToBottom, 50);
          // Bloqueia o botão até digitar novamente
          sendBtn.disabled = true;
          sendBtn.classList.add("acw-send--disabled");
        } else {
          typing.classList.add("err");
          typing.querySelector(".acw-assistant-text").textContent =
            e?.message || "Erro";
          setTimeout(scrollInboxToBottom, 50);
        }
        // Reabilita o input
        input.disabled = false;
      } finally {
        // Restaura ícone do botão
        if (sendIcon && pauseIcon) {
          sendIcon.style.display = "";
          pauseIcon.style.display = "none";
        }
        // Remove borda gradiente do container do input
        if (inputContainer) inputContainer.classList.remove("thinking");
        // Volta o ícone de estrelas para cinza
        if (inputStar) inputStar.src = CDN_BASE + "icon/starsGray.svg";
        currentAbortController = null;
      }
    }

    // função para lidar com clique nos cards
    function handleCardClick(e) {
      const card = e.target.closest(".acw-card");
      if (!card) return;

      const text = card.querySelector("span")?.textContent?.trim();
      if (text) {
        input.value = text;
        input.focus();
        autoresize(input);
        updateSendBtnState();
        // Opcionalmente, envia a mensagem automaticamente
        sendBtn?.click();
      }
    }

    // eventos
    fab?.addEventListener("click", open);
    overlay?.addEventListener("click", close);
    // Adiciona evento de clique nos cards
    const swiperCards = shadow.querySelector(".acw-swiper-cards");
    swiperCards?.addEventListener("click", handleCardClick);
    // O primeiro .acw-close (ícone de lápis) limpa o chat, o segundo fecha
    if (closeBtns.length > 1) {
      closeBtns[0].addEventListener("click", clearChat);
      closeBtns[1].addEventListener("click", close);
    } else if (closeBtns.length === 1) {
      closeBtns[0].addEventListener("click", close);
    }
    sendBtn?.addEventListener("click", function () {
      // Se estiver pendente, cancela
      if (currentAbortController) {
        currentAbortController.abort();
        // Restaura ícone do botão
        const sendIcon = shadow.querySelector(".acw-send-icon");
        const pauseIcon = shadow.querySelector(".acw-pause-icon");
        if (sendIcon && pauseIcon) {
          sendIcon.style.display = "";
          pauseIcon.style.display = "none";
        }
        currentAbortController = null;
        return;
      }
      sendMessage();
    });
    input?.addEventListener("input", () => {
      autoresize(input);
      updateSendBtnState();
    });
    input?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendBtn?.click();
      }
    });

    // expõe uma API mínima (opcional)
    window.AtomChatWidget = {
      open,
      close,
      setTheme({ position }) {
        if (position && position !== CONFIG.ui.position) {
          CONFIG.ui.position = position;
          if (position === "left") {
            fab.style.left = "20px";
            fab.style.right = "";
            modal.style.left = "20px";
            modal.style.right = "";
          } else {
            fab.style.right = "20px";
            fab.style.left = "";
            modal.style.right = "20px";
            modal.style.left = "";
          }
        }
      },
    };

    // monta no body
    document.body.appendChild(host);
    // Após montar, carrega histórico
    loadHistory();
  }

  // inicia quando DOM pronto
  if (document.readyState === "loading") {
    window.addEventListener(
      "DOMContentLoaded",
      () => boot().catch(console.error),
      { once: true }
    );
  } else {
    boot().catch(console.error);
  }
})();
