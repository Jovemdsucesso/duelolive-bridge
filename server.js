import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';
import http from 'node:http';

// ==== Configuração (variáveis de ambiente) ====
const USERNAME = (process.env.TIKTOK_USERNAME || '').trim();
const SECRET = (process.env.BRIDGE_SECRET || '').trim();
const WEBHOOK_URL = (process.env.WEBHOOK_URL || 'https://duelolive.base44.app/functions/tiktokLiveWebhook').trim();
const FLUSH_MS = 1500;

if (!USERNAME) {
  console.error('Defina a variável TIKTOK_USERNAME (ex: @seuperfil)');
  process.exit(1);
}
if (!SECRET) {
  console.error('Defina a variável BRIDGE_SECRET (a mesma senha salva no app)');
  process.exit(1);
}

// ==== Envio dos eventos para o app ====
let buffer = [];

async function flush() {
  if (buffer.length === 0) return;
  const events = buffer;
  buffer = [];
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: SECRET, events }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) console.error('App respondeu erro', res.status);
  } catch (err) {
    console.error('Falha ao enviar eventos:', err.message);
  }
}

setInterval(flush, FLUSH_MS);

async function ping() {
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: SECRET, ping: true }),
      signal: AbortSignal.timeout(10000),
    });
    console.log('Sinal enviado ao app.');
  } catch (err) {
    console.error('Falha no sinal:', err.message);
  }
}

// ==== Conexão com a Live do TikTok ====
let reconnectTimer = null;

function start() {
  const connection = new TikTokLiveConnection(USERNAME, {
    enableExtendedGiftInfo: true,
    processInitialData: false,
  });

  connection.on(WebcastEvent.CHAT, (data) => {
    const text = data?.comment;
    if (typeof text === 'string' && text.trim()) {
      buffer.push({ kind: 'comment', text: text.slice(0, 200) });
    }
  });

  connection.on(WebcastEvent.GIFT, (data) => {
    const giftType = data?.giftDetails?.giftType;
    // Presentes em combo (tipo 1) só contam quando o combo termina
    if (giftType === 1 && !data?.repeatEnd) return;
    const giftName = data?.giftDetails?.giftName || data?.extendedGiftInfo?.giftName;
    const count = Math.max(1, Number(data?.repeatCount) || 1);
    if (giftName) {
      buffer.push({ kind: 'gift', giftName: String(giftName).slice(0, 100), count });
    }
  });

  connection.on(WebcastEvent.DISCONNECTED, () => {
    console.log('Desconectado. Tentando de novo em 5s...');
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(start, 5000);
  });

  connection.connect().then(() => {
    console.log('Conectado à Live de', USERNAME);
    ping();
  }).catch((err) => {
    console.error('Não conectou:', err.message, '- nova tentativa em 15s');
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(start, 15000);
  });
}

start();
setInterval(ping, 60000); // avisa ao app a cada minuto que está online

// ==== Health check (exigido pelo Render/Railway) ====
const port = Number(process.env.PORT) || 3000;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('ok');
}).listen(port, () => console.log('Ponte rodando na porta', port));