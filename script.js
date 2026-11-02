// ===== CONFIG =====
const WHATSAPP = '5541996654199';
const INSTAGRAM_URL = 'https://www.instagram.com/rosadosventos_salaoebarbearia/'; // cole aqui o link do Instagram
const FACEBOOK_URL = '#';  // cole aqui o link do Facebook

// Horários: dia da semana (0=Dom ... 6=Sáb) -> [abre, fecha] em horas
const HORARIOS = {
  0: null,
  1: [8, 19], 2: [8, 19], 3: [8, 19], 4: [8, 19], 5: [8, 19],
  6: [9, 19],
};

const waLink = (msg) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

// ===== Links =====
document.getElementById('whats').href = waLink('Olá! Vim pelo site da Rosa dos Ventos e gostaria de agendar um horário.');
document.getElementById('instagram').href = INSTAGRAM_URL;
document.getElementById('instaBtn').href = INSTAGRAM_URL;
document.getElementById('facebook').href = FACEBOOK_URL;
document.getElementById('ano').textContent = new Date().getFullYear();

// ===== Menu mobile =====
const menuBtn = document.getElementById('menuBtn');
const nav = document.getElementById('nav');
menuBtn.addEventListener('click', () => {
  const aberto = nav.classList.toggle('aberto');
  menuBtn.setAttribute('aria-expanded', aberto);
});
nav.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => nav.classList.remove('aberto'))
);

// ===== Aberto / Fechado agora =====
function atualizarStatus() {
  const agora = new Date();
  const dia = agora.getDay();
  const hora = agora.getHours() + agora.getMinutes() / 60;
  const faixa = HORARIOS[dia];
  const status = document.getElementById('status');
  const aberto = faixa && hora >= faixa[0] && hora < faixa[1];

  status.className = 'status ' + (aberto ? 'aberto' : 'fechado');
  status.textContent = aberto
    ? `Aberto agora · fecha às ${faixa[1]}h`
    : 'Fechado no momento';

  document.querySelectorAll('#hours li').forEach((li) => {
    li.classList.toggle('hoje', li.dataset.days.split(',').includes(String(dia)));
  });
}
atualizarStatus();
setInterval(atualizarStatus, 60000);

// ===== Formulário -> WhatsApp =====
const INTERVALO_MIN = 30;     // intervalo entre horários (minutos)
const ANTECEDENCIA_MIN = 60;  // antecedência mínima para agendar (minutos)

const inputData = document.getElementById('data');
const selectHora = document.getElementById('hora');
const pad = (n) => String(n).padStart(2, '0');

// Não permite datas passadas
const hoje = new Date();
inputData.min = `${hoje.getFullYear()}-${pad(hoje.getMonth() + 1)}-${pad(hoje.getDate())}`;

// Converte "2026-11-05" em Date local (evita bug de fuso)
const parseData = (v) => { const [a, m, d] = v.split('-').map(Number); return new Date(a, m - 1, d); };

const novaOpcao = (texto, valor = '', desabilitada = false) => {
  const o = new Option(texto, valor);
  o.disabled = desabilitada;
  o.selected = desabilitada;
  selectHora.add(o);
};

// Gera horários de 30 em 30 min, respeitando funcionamento e antecedência
function gerarHorarios() {
  selectHora.innerHTML = '';
  inputData.setCustomValidity('');
  if (!inputData.value) return novaOpcao('Escolha a data primeiro', '', true);

  const data = parseData(inputData.value);
  const faixa = HORARIOS[data.getDay()];
  if (!faixa) {
    novaOpcao('Fechado neste dia', '', true);
    inputData.setCustomValidity('Fechado aos domingos. Escolha outro dia.');
    return inputData.reportValidity();
  }

  const limite = new Date(Date.now() + ANTECEDENCIA_MIN * 60000);
  const horarios = [];
  for (let m = faixa[0] * 60; m + INTERVALO_MIN <= faixa[1] * 60; m += INTERVALO_MIN) {
    const slot = new Date(data);
    slot.setHours(0, m, 0, 0);
    if (slot >= limite) horarios.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
  }

  if (!horarios.length) {
    novaOpcao('Sem horários neste dia', '', true);
    inputData.setCustomValidity('Não há mais horários disponíveis neste dia. Escolha outra data.');
    return inputData.reportValidity();
  }

  novaOpcao('Escolha o horário', '', true);
  horarios.forEach((h) => novaOpcao(h, h));
}
inputData.addEventListener('change', gerarHorarios);

// Abre o calendário nativo ao clicar no campo
inputData.addEventListener('click', () => { try { inputData.showPicker(); } catch (_) {} });

document.getElementById('form').addEventListener('submit', (e) => {
  e.preventDefault();

  // Revalida (caso a página tenha ficado aberta por muito tempo)
  const [hh, mm] = selectHora.value.split(':').map(Number);
  const escolhido = parseData(inputData.value);
  escolhido.setHours(hh, mm, 0, 0);
  if (escolhido < new Date(Date.now() + ANTECEDENCIA_MIN * 60000)) {
    alert('Esse horário não está mais disponível. Escolha outro.');
    return gerarHorarios();
  }

  const nome = document.getElementById('nome').value.trim();
  const servico = document.getElementById('servico').value;
  const dataBR = escolhido.toLocaleDateString('pt-BR');
  const msg = `Olá! Meu nome é ${nome}. Gostaria de agendar: ${servico}, no dia ${dataBR} às ${selectHora.value}.`;
  window.open(waLink(msg), '_blank');
});

// ===== Animação ao rolar =====
const observer = new IntersectionObserver(
  (entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('visible'); observer.unobserve(en.target); }
  }),
  { threshold: 0.15 }
);
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));