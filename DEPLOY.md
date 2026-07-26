# 🚀 Deploy no Render (gratuito) com Turso

**Stack:** Next.js 16 + Turso (SQLite remoto) + Prisma 7

---

## 1. Criar database no Turso

1. Acesse **https://turso.tech** e faça login com GitHub
2. **Create Database:**
   - Nome: `roda-da-vida`
   - Location: `gru-1` (São Paulo)
   - Create
3. Na página da database, clique em **"Generate Token"** → copie o token

## 2. Configurar env vars no Render

No **Render Dashboard → seu serviço → Environment**, adicione:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `libsql://roda-da-vida-SEU_USUARIO.turso.io?authToken=SEU_TOKEN` |
| `AUTH_SECRET` | (Render gera automático) |

Substitua `SEU_USUARIO` pelo seu org do Turso e `SEU_TOKEN` pelo token gerado.

## 3. Push do código

```bash
cd /c/Users/lugos/roda-da-vida
git add .
git commit -m "Turso: SQLite na nuvem"
git push
```

## 4. Deploy via Blueprint

1. **Render Dashboard → New → Blueprint**
2. Conecte o repositório `LuisGSVasconcelos/roda-da-vida`
3. Render detecta o `render.yaml`
4. Antes de Apply, clique em **"Environment"** e cole a `DATABASE_URL` do Turso
5. Clique **Apply**

## 5. Acessar

```
https://roda-da-vida.onrender.com
```

## 6. Próximos deploys

```bash
git add .
git commit -m "descrição das mudanças"
git push
# Render atualiza automaticamente em ~2 min
```

## 7. Desenvolvimento local

```bash
# Setup inicial (uma vez)
npm run db:setup

# Rodar servidor
npm run dev
# → http://localhost:3004
```

## Dicas

| Problema | Solução |
|----------|---------|
| App lento no primeiro acesso | Free tier "dorme" após 15 min. Aguarde ~30s (cold start) |
| Logs | Render Dashboard → seu serviço → **Logs** |
| Token expirou | Gere novo token no Turso e atualize a env var no Render |
| Rodar seed manual | `npm run db:seed` (ou no Render: Shell → `npx prisma db seed`) |
