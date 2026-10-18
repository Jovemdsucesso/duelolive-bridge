# Ponte da Live TikTok — DuelPoints Live

Este servicinho roda 24h de graça em um host (Render/Railway), conecta na sua Live do TikTok e envia os comentários e presentes para o seu app, que pontua automaticamente.

## Arquivos

- `server.js` — a ponte em si
- `package.json` — dependências (tiktok-live-connector)

## Passo a passo (Render, plano gratuito)

1. Crie uma conta no [GitHub](https://github.com) e crie um repositório novo (pode ser público).
2. Suba nessa pasta os arquivos `server.js` e `package.json` (botão "Add file" → "Upload files").
3. Crie uma conta no [Render](https://render.com) e clique em **New + → Web Service**.
4. Conecte o repositório que você criou.
5. Configure:
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instância**: Free
6. Em **Environment**, adicione as variáveis:
   - `TIKTOK_USERNAME` → seu @ do TikTok (ex: `@seuperfil`)
   - `BRIDGE_SECRET` → a MESMA senha que você salvou no app (secreto "TIKTOK_BRIDGE_SECRET")
7. Clique em **Create Web Service** e aguarde o deploy.

## Manter acordado (importante no plano free)

O plano gratuito do Render "dorme" o serviço depois de 15 minutos sem ninguém acessar. Para evitar:

1. Copie a URL do serviço no Render (algo como `https://seu-app.onrender.com`).
2. Crie uma conta no [UptimeRobot](https://uptimerobot.com) e adicione um monitor HTTP a cada 5 minutos apontando para essa URL.

## Como testar

- Abra a página **Live TikTok** no app: se aparecer "Ponte online", está funcionando.
- Entre ao vivo no TikTok e peça para alguém comentar uma palavra-chave de um dos duelistas: o placar sobe sozinho.
- Presentes que combinarem com os nomes configurados valem mais pontos.

## Alternativa: Railway

1. Crie uma conta no [Railway](https://railway.com), **New Project → Deploy from GitHub repo** apontando para o mesmo repositório.
2. Em **Variables**, adicione `TIKTOK_USERNAME` e `BRIDGE_SECRET` (os mesmos valores).
3. Ele detecta o Node e roda `npm start` automaticamente. O plano gratuito mensal costuma cobrir as lives.

## Observação importante

A leitura da Live usa a biblioteca `tiktok-live-connector`, que não é oficial do TikTok. Se o TikTok mudar algo no sistema deles, a ponte pode parar de funcionar até a biblioteca ser atualizada (basta fazer o deploy de novo no Render/Railway para pegar a versão nova).