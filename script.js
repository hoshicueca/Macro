
// --- estado e templates ---
const originalTemplates = {}; // id -> template com placeholders
let isHidratei = false;

// emoji maps
const emojiMap = {
  bb_to_h: { '💜': '💙', '🔥': '💧' },
  h_to_bb: { '💙': '💜', '💧': '🔥' }
};

// campos
const fields = {
  nome: document.getElementById('nomeInput'),
  codigo: document.getElementById('codigoInput'),
  link: document.getElementById('linkInput'),
  data: document.getElementById('dataInput')
};

// carrega todas as macros da pasta /macros/
async function loadMacros() {
  try {
    const macrosDiv = document.getElementById('cards');
    macrosDiv.innerHTML = '';
    // lista de arquivos pré-definida (não há API local, então listamos manualmente)
    const files = await fetch('macros/list.json').then(r => r.json());
    for (const file of files) {
      const data = await fetch('macros/' + file).then(r => r.json());
      const section = document.createElement('section');
      section.className = 'card';
      const h2 = document.createElement('h2');
      h2.textContent = data.titulo;
      const pre = document.createElement('pre');
      pre.className = 'macro';
      pre.textContent = data.mensagem;
      const meta = document.createElement('div');
      meta.className = 'meta';
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.dataset.action = 'copy';
      btn.textContent = '💜 Copiar';
      const note = document.createElement('div');
      note.className = 'note';
      note.textContent = 'Clique para copiar esta macro.';
      meta.appendChild(btn);
      meta.appendChild(note);
      section.appendChild(h2);
      section.appendChild(pre);
      section.appendChild(meta);
      macrosDiv.appendChild(section);
    }
    initTemplates();
    renderAllMacros();
    attachCopyHandlers();
  } catch (err) {
    console.error('Erro ao carregar macros:', err);
  }
}

// captura templates
function initTemplates() {
  document.querySelectorAll('pre.macro').forEach((pre, idx) => {
    if (!pre.id) pre.id = 'macro-' + idx + '-' + Math.random().toString(36).slice(2,8);
    if (!originalTemplates[pre.id]) originalTemplates[pre.id] = pre.innerText;
  });
}

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

function applyEmojiMapping(text) {
  if (isHidratei) {
    return text.replace(/💜/g, '💙').replace(/🔥/g, '💧');
  } else {
    return text.replace(/💙/g, '💜').replace(/💧/g, '🔥');
  }
}

function renderAllMacros() {
  document.querySelectorAll('pre.macro').forEach(pre => {
    const template = originalTemplates[pre.id] ?? pre.innerText;
    const filled = fillPlaceholders(template);
    pre.innerText = applyEmojiMapping(filled);
  });
  document.querySelectorAll('.card h2').forEach(h => {
    h.innerHTML = applyEmojiMapping(h.textContent);
  });
  document.querySelectorAll('.btn[data-action="copy"]').forEach(btn => {
    btn.innerHTML = applyEmojiMapping(btn.textContent);
  });
  document.getElementById('footer').innerText = applyEmojiMapping(document.getElementById('footer').textContent);
  document.getElementById('panelTitle').innerText = applyEmojiMapping(document.getElementById('panelTitle').textContent);
  document.getElementById('subtitle').innerText = isHidratei
    ? 'Mensagens automáticas com tom leve e refrescante 💙💧'
    : 'Coleção organizada de mensagens prontas para Zendesk & WhatsApp — tom: carinhoso, acolhedor 💜🔥';
}

function attachCopyHandlers() {
  document.querySelectorAll('.btn[data-action="copy"]').forEach(btn => {
    btn.replaceWith(btn.cloneNode(true));
  });
  document.querySelectorAll('.btn[data-action="copy"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.card');
      if (!card) return;
      const pre = card.querySelector('pre.macro');
      if (!pre) return;
      navigator.clipboard.writeText(pre.innerText).then(() => {
        btn.innerText = 'Copiado ✅';
        setTimeout(() => { renderAllMacros(); }, 900);
      }).catch(() => {
        alert('Erro ao copiar — permita acesso à área de transferência.');
      });
    });
  });
}

const themeSwitch = document.getElementById('themeSwitch');
themeSwitch.addEventListener('change', () => {
  isHidratei = themeSwitch.checked;
  applyTheme();
});

function applyTheme() {
  const root = document.documentElement;
  const logo = document.getElementById('logo');
  const title = document.getElementById('title');
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

Object.values(fields).forEach(input => {
  input.addEventListener('input', () => {
    renderAllMacros();
  });
});

document.getElementById('resetNames').addEventListener('click', () => {
  Object.values(fields).forEach(i => i.value = '');
  renderAllMacros();
});

window.addEventListener('DOMContentLoaded', async () => {
  await loadMacros();
  applyTheme();
});
