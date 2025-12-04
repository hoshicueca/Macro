// --- estado e templates ---
    const originalTemplates = {}; // id -> template with placeholders (base theme = Beleza Brasileira)
    let isHidratei = false; // false = Beleza Brasileira; true = Hidratei

    // emoji maps
    const emojiMap = {
      bb_to_h: { '💜': '💙', '🔥': '💧' },
      h_to_bb: { '💙': '💜', '💧': '🔥' }
    };

    // placeholders inputs
    const fields = {
      nome: document.getElementById('nomeInput'),
      codigo: document.getElementById('codigoInput'),
      link: document.getElementById('linkInput'),
      data: document.getElementById('dataInput')
    };

    // assign ids to macros and capture original template
    function initTemplates() {
      document.querySelectorAll('pre.macro').forEach((pre, idx) => {
        if (!pre.id) pre.id = 'macro-' + idx + '-' + Math.random().toString(36).slice(2,8);
        // store as base template only once
        if (!originalTemplates[pre.id]) originalTemplates[pre.id] = pre.innerText;
      });
    }

    // apply placeholder replacements to a template
    function fillPlaceholders(template) {
      let text = template;
      const nome = fields.nome.value.trim();
      const codigo = fields.codigo.value.trim();
      const link = fields.link.value.trim();
      const data = fields.data.value.trim();
      if (nome) text = text.replace(/\[Nome da cliente\]|\[Nome\]/gi, nome);
      if (codigo) text = text.replace(/\[CÓDIGO_DE_RASTREIO\]/gi, codigo);
      if (link) text = text.replace(/\[LINK_DE_RASTREIO\]/gi, link);
      if (data) text = text.replace(/\[DATA_PREVISTA\]/gi, data);
      return text;
    }

    // apply emoji mapping to text according to current theme
    function applyEmojiMapping(text) {
      if (isHidratei) {
        return text.replace(/💜/g, '💙').replace(/🔥/g, '💧');
      } else {
        return text.replace(/💙/g, '💜').replace(/💧/g, '🔥');
      }
    }

    // render all macros based on original template + placeholders + emoji map
    function renderAllMacros() {
      document.querySelectorAll('pre.macro').forEach(pre => {
        const template = originalTemplates[pre.id] ?? pre.innerText;
        const filled = fillPlaceholders(template);
        pre.innerText = applyEmojiMapping(filled);
      });
      // also update card titles, buttons, footer and panel
      document.querySelectorAll('.card h2').forEach(h => {
        h.innerHTML = applyEmojiMapping(h.textContent);
      });
      document.querySelectorAll('.btn[data-action="copy"]').forEach(btn => {
        btn.innerHTML = applyEmojiMapping(btn.textContent);
      });
      document.getElementById('footer').innerText = applyEmojiMapping(document.getElementById('footer').textContent);
      document.getElementById('panelTitle').innerText = applyEmojiMapping(document.getElementById('panelTitle').textContent);
      document.getElementById('subtitle').innerText = isHidratei ? 'Mensagens automáticas com tom leve e refrescante 💙💧' : 'Coleção organizada de mensagens prontas para Zendesk & WhatsApp — tom: carinhoso, acolhedor 💜🔥';
    }

    // copy handler - copies the macro text related to the clicked button
    function attachCopyHandlers() {
      document.querySelectorAll('.btn[data-action="copy"]').forEach(btn => {
        // remove existing listener to avoid duplicates
        btn.replaceWith(btn.cloneNode(true));
      });
      document.querySelectorAll('.btn[data-action="copy"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          // find closest card and the macro inside it
          const card = btn.closest('.card');
          if (!card) return;
          const pre = card.querySelector('pre.macro');
          if (!pre) return;
          navigator.clipboard.writeText(pre.innerText).then(()=>{
            // small inline feedback instead of alert
            const old = btn.innerText;
            btn.innerText = 'Copiado ✅';
            setTimeout(()=>{ renderAllMacros(); }, 900);
          }).catch(()=>{
            alert('Erro ao copiar — permita acesso à área de transferência.');
          });
        });
      });
    }

    // theme toggle
    const themeSwitch = document.getElementById('themeSwitch');
    themeSwitch.addEventListener('change', () => {
      isHidratei = themeSwitch.checked;
      applyTheme();
    });

    function applyTheme() {
      const root = document.documentElement;
      const logo = document.getElementById('logo');
      const title = document.getElementById('title');
      const subtitle = document.getElementById('subtitle');
      const footer = document.getElementById('footer');
      const panelTitle = document.getElementById('panelTitle');

      if (isHidratei) {
        root.style.setProperty('--bg','#f0f8ff');
        root.style.setProperty('--card','#ffffff');
        root.style.setProperty('--accent','#2196f3');
        root.style.setProperty('--accent-2','#1976d2');
        root.style.setProperty('--muted','#444');
        document.body.style.background = 'linear-gradient(180deg, rgba(33,150,243,0.08), rgba(25,118,210,0.03))';

        logo.innerText = 'H';
        title.innerText = 'Macros — Hidratei';
        footer.innerText = 'Macros Hidratei — use com carinho 💙💧';
        panelTitle.innerText = 'Automatizar campos 💙';
      } else {
        root.style.setProperty('--bg','#fff9fe');
        root.style.setProperty('--card','#fff');
        root.style.setProperty('--accent','#7b3bd8');
        root.style.setProperty('--accent-2','#9b59ff');
        root.style.setProperty('--muted','#6b6b6b');
        document.body.style.background = 'linear-gradient(180deg, rgba(123,59,216,0.06), rgba(155,89,255,0.02))';

        logo.innerText = 'BB';
        title.innerText = 'Macros — Beleza Brasileira';
        footer.innerText = 'Macros geradas automaticamente — adapte conforme necessidade. 💜🔥';
        panelTitle.innerText = 'Automatizar campos 💜';
      }
      renderAllMacros();
      attachCopyHandlers();
    }

    // inputs -> rerender
    Object.values(fields).forEach(input => {
      input.addEventListener('input', () => {
        renderAllMacros();
      });
    });

    // reset button
    document.getElementById('resetNames').addEventListener('click', () => {
      Object.values(fields).forEach(i => i.value = '');
      // restore templates to original stored ones
      Object.keys(originalTemplates).forEach(k => {
        // no change to originalTemplates needed; just re-render
      });
      renderAllMacros();
    });

    // initialize everything on load
    window.addEventListener('DOMContentLoaded', () => {
      initTemplates();
      // make sure panelTitle id exists for updates
      if (!document.getElementById('panelTitle')) {
        const h4 = document.createElement('h4');
        h4.id = 'panelTitle';
        h4.innerText = 'Automatizar campos 💜';
        document.getElementById('auto-panel').prepend(h4);
      }
      applyTheme(); // also renders macros and attach handlers
    });
