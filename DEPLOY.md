# 🚀 Deploy no Render (gratuito)

**Stack:** Next.js 16 + SQLite (persistente) + Prisma 7

---

## 1. Pré-requisitos

- Conta gratuita em [render.com](https://render.com) (login com GitHub)
- Repositório no GitHub com o código do app

## 2. Push do código

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/seu-usuario/roda-da-vida.git
git push -u origin main
```

## 3. Deploy via Blueprint (automático)

1. Faça login no [Render Dashboard](https://dashboard.render.com)
2. Clique em **New → Blueprint**
3. Conecte seu repositório GitHub
4. Render detecta o `render.yaml` e configura automaticamente:
   - Web service `roda-da-vida`
   - Persistent Disk de 1GB montado em `/data`
   - Variáveis de ambiente (`DATABASE_URL`, `AUTH_SECRET`)
5. Clique em **Apply**

## 4. Primeiro deploy

O Render vai:
1. **Build:** `npx prisma generate && npm run build`
2. **Start:** `npx prisma db push && npx prisma db seed && npm run start`

O primeiro deploy leva ~2-3 minutos.

## 5. Acessar

Após o deploy, seu app estará em:
```
https://roda-da-vida.onrender.com
```

## 6. Próximos deploys

A cada `git push`, o Render automaticamente:
1. Faz o build da nova versão
2. Substitui o código em execução
3. **Seus dados no banco permanecem intactos** (no Persistent Disk)

## 7. Conta de teste

Após o deploy, crie uma conta no próprio app ou registre manualmente via API:
```bash
curl -X POST https://roda-da-vida.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@email.com","password":"123456","role":"INDIVIDUAL"}'
```

## 8. Dicas

| Problema | Solução |
|----------|---------|
| App lento no primeiro acesso | Free tier "dorme" após 15 min. Aguarde ~30s (cold start) |
| Banco corrompido | Pare o serviço → Render Dashboard → **Shell** → `rm -f /data/dev.db` → reinicie |
| Logs | Render Dashboard → seu serviço → **Logs** |
| Variáveis de ambiente | Render Dashboard → seu serviço → **Environment** |
