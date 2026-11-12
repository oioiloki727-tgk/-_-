'use strict';
const $ = s => document.querySelector(s);
const FOODS = [
  {id:'seed',n:'Семечки',i:'🌻',p:3,h:18,j:2},
  {id:'carrot',n:'Морковка',i:'🥕',p:6,h:30,j:4},
  {id:'corn',n:'Кукуруза',i:'🌽',p:9,h:40,j:6},
  {id:'cheese',n:'Сыр',i:'🧀',p:14,h:35,j:15}
];
const COLORS = [
  {id:'c0',t:'color',n:'Классика',i:'🟠',p:0,f:''},
  {id:'c1',t:'color',n:'Лунный',i:'🔵',p:60,f:'hue-rotate(150deg)'},
  {id:'c2',t:'color',n:'Розовый',i:'🩷',p:60,f:'hue-rotate(300deg) saturate(1.3)'},
  {id:'c3',t:'color',n:'Мятный',i:'🟢',p:80,f:'hue-rotate(80deg)'},
  {id:'c4',t:'color',n:'Призрак',i:'⚪',p:120,f:'grayscale(1) brightness(1.4)'}
];
const HATS = [
  {id:'h0',t:'hat',n:'Без шапки',i:'🚫',p:0,e:''},
  {id:'h1',t:'hat',n:'Бант',i:'🎀',p:30,e:'🎀'},
  {id:'h2',t:'hat',n:'Кепка',i:'🧢',p:40,e:'🧢'},
  {id:'h3',t:'hat',n:'Цилиндр',i:'🎩',p:50,e:'🎩'},
  {id:'h4',t:'hat',n:'Колпак',i:'🎅',p:70,e:'🎅'},
  {id:'h5',t:'hat',n:'Корона',i:'👑',p:150,e:'👑'}
];
const ALL = [...COLORS, ...HATS];
const KEY = 'hamster-save-v1';
const clamp = v => Math.max(0, Math.min(100, v));
const fresh = () => ({name:'',coins:25,hunger:80,joy:80,energy:80,clean:80,own:['c0','h0'],color:'c0',hat:'h0',sleep:false,born:Date.now(),last:Date.now()});

let S;
try { S = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY))); } catch (e) { S = fresh(); }
let tab = 'care', msgTimer;

const save = () => { S.last = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

function say(t) {
  const m = $('#msg'); m.textContent = t; m.classList.add('show');
  clearTimeout(msgTimer); msgTimer = setTimeout(() => m.classList.remove('show'), 2200);
}

function tick(sec) {
  const m = sec / 60;
  if (S.sleep) {
    S.energy = clamp(S.energy + 4 * m);
    S.hunger = clamp(S.hunger - .3 * m);
    if (S.energy >= 100) S.sleep = false;
  } else {
    S.hunger = clamp(S.hunger - 1.2 * m);
    S.joy = clamp(S.joy - .8 * m);
    S.clean = clamp(S.clean - .6 * m);
    S.energy = clamp(S.energy - .5 * m);
  }
  if (S.hunger < 10) S.joy = clamp(S.joy - .5 * m);
}

function mood() {
  if (S.sleep) return ['😴', 'Спит…'];
  if (S.hunger < 25) return ['🍽️', 'Хочет есть!'];
  if (S.clean < 25) return ['🫧', 'Нужна ванна'];
  if (S.energy < 20) return ['🥱', 'Очень устал'];
  if (S.joy < 25) return ['😢', 'Скучает'];
  return S.joy > 70 && S.hunger > 50 ? ['😊', 'Счастлив!'] : ['🙂', 'Всё хорошо'];
}

function stats() {
  $('#coins').textContent = Math.floor(S.coins);
  for (const k of ['hunger', 'joy', 'energy', 'clean']) {
    const b = $('#b-' + k); b.style.width = S[k] + '%'; b.classList.toggle('low', S[k] < 25);
  }
  const [em, txt] = mood();
  $('#mood').textContent = em; $('#status').textContent = txt;
  $('#room').classList.toggle('night', S.sleep);
  $('#age').textContent = 'День ' + (Math.floor((Date.now() - S.born) / 864e5) + 1);
}

const item = x => {
  const own = S.own.includes(x.id), on = S.color === x.id || S.hat === x.id;
  return `<button class="${on ? 'on' : ''}" data-s="${x.id}"><span class="big">${x.i}</span>${x.n}<small>${on ? 'надето' : own ? 'надеть' : '🪙 ' + x.p}</small></button>`;
};

function panel() {
  const col = ALL.find(x => x.id === S.color), hat = ALL.find(x => x.id === S.hat);
  $('#body').style.filter = col.f; $('#hat').textContent = hat.e;
  $('#name').textContent = S.name;
  let h = '';
  if (tab === 'care') h =
    `<button data-a="play">🎡 Бегать в колесе <small>+монеты, −силы</small></button>
     <button data-a="wash">🛁 Помыть <small>бесплатно</small></button>
     <button data-a="sleep">${S.sleep ? '☀️ Разбудить' : '😴 Уложить спать'} <small>силы восстанавливаются</small></button>`;
  if (tab === 'food') h = FOODS.map(f => `<button data-f="${f.id}">${f.i} ${f.n} <small>🪙 ${f.p}</small></button>`).join('');
  if (tab === 'shop') h = '<h3>Цвет шерсти</h3><div class="grid">' + COLORS.map(item).join('') + '</div><h3>Аксессуары</h3><div class="grid">' + HATS.map(item).join('') + '</div>';
  $('#panel').innerHTML = h;
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
}

const redraw = () => { stats(); panel(); save(); };

$('#panel').onclick = e => {
  const b = e.target.closest('button'); if (!b) return;
  const d = b.dataset;
  if (d.a === 'play') {
    if (S.sleep) return say('Он спит 😴');
    if (S.energy < 15) return say('Слишком устал для колеса');
    const g = 4 + Math.floor(Math.random() * 5);
    S.energy = clamp(S.energy - 15); S.hunger = clamp(S.hunger - 6); S.joy = clamp(S.joy + 22); S.coins += g;
    say(`Побегал! +${g} 🪙`);
  } else if (d.a === 'wash') {
    S.clean = 100; S.joy = clamp(S.joy - 4); say('Чистенький! ✨');
  } else if (d.a === 'sleep') {
    S.sleep = !S.sleep; say(S.sleep ? 'Спокойной ночи' : 'Доброе утро!');
  } else if (d.f) {
    const f = FOODS.find(x => x.id === d.f);
    if (S.sleep) return say('Он спит 😴');
    if (S.hunger > 95) return say('Не хочет — он сыт');
    if (S.coins < f.p) return say('Не хватает монет');
    S.coins -= f.p; S.hunger = clamp(S.hunger + f.h); S.joy = clamp(S.joy + f.j); say('Ням! ' + f.i);
  } else if (d.s) {
    const x = ALL.find(v => v.id === d.s);
    if (!S.own.includes(x.id)) {
      if (S.coins < x.p) return say('Не хватает монет');
      S.coins -= x.p; S.own.push(x.id);
    }
    S[x.t] = x.id; say('Надето: ' + x.n);
  }
  redraw();
};

$('#tabs').onclick = e => { const b = e.target.closest('button'); if (b) { tab = b.dataset.tab; panel(); } };

$('#hamster').onclick = () => {
  if (S.sleep) return say('Тсс, он спит');
  const h = $('#hamster'); h.classList.remove('bounce'); void h.offsetWidth; h.classList.add('bounce');
  S.joy = clamp(S.joy + 2);
  if (Math.random() < .3) { S.coins += 1; say('Пи! +1 🪙'); }
  else say(['Пи!', 'Пи-пи!', 'Хрум?'][Math.floor(Math.random() * 3)]);
  stats();
};

$('#name').onclick = () => {
  const n = prompt('Новое имя хомяка:', S.name);
  if (n && n.trim()) { S.name = n.trim().slice(0, 16); redraw(); }
};

$('#reset').onclick = () => {
  if (!confirm('Начать заново? Весь прогресс будет удалён.')) return;
  S = fresh(); S.name = (prompt('Как назовёшь хомяка?', 'Хомка') || 'Хомка').slice(0, 16); redraw();
};

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  const gap = (Date.now() - S.last) / 1000 - 1;
  if (gap > 2) { tick(Math.min(gap, 10800)); redraw(); }
});

// старт
if (!S.name) S.name = (prompt('Как назовёшь хомяка?', 'Хомка') || 'Хомка').slice(0, 16);
tick(Math.min((Date.now() - S.last) / 1000, 10800));
redraw();
setInterval(() => { tick(1); stats(); save(); }, 1000);
