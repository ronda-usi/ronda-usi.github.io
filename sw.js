/* Estrelas da Ronda — service worker (versão 1.1.1).
 * Guarda só os arquivos do app para abrir sem internet. Nunca intercepta a planilha (outro domínio) nem guarda dados.
 * Mesmo domínio do calendário de Férias (ferias-usinagem.github.io): só apaga os próprios caches (estrelas-*), nunca os do Férias (cal-ferias-*). */
const CACHE = 'estrelas-1.1.1';
const BASE = ['./', 'index.html', 'manifest.webmanifest', 'estrelas-regras.js', 'logo_ksb.svg', 'icones/icone-192.png', 'icones/icone-512.png', 'icones/apple-180.png', 'icones/favicon.svg',
  'vendor/bootstrap-icons/bootstrap-icons.min.css', 'vendor/bootstrap-icons/fonts/bootstrap-icons.woff2',
  'vendor/poppins/poppins-latin-400-normal.woff2', 'vendor/poppins/poppins-latin-500-normal.woff2', 'vendor/poppins/poppins-latin-600-normal.woff2', 'vendor/poppins/poppins-latin-700-normal.woff2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n.indexOf('estrelas-') === 0 && n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return; // planilha e qualquer outro site: direto pela rede
  if (r.mode === 'navigate' || u.pathname.endsWith('.html') || u.pathname.endsWith('/') || u.pathname.endsWith('.js')) {
    // página e scripts: rede primeiro (pega versão nova), cópia se estiver sem internet
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(CACHE).then(x => x.put(r, c)); return res; }).catch(() => caches.match(r).then(x => x || caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(r).then(x => x || fetch(r).then(res => { const c = res.clone(); caches.open(CACHE).then(y => y.put(r, c)); return res; })));
});
