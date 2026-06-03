# 🌸 FloraFem — Ciclo & Fertilidade

App completo de monitoramento de ciclo menstrual e fertilidade.  
Inspirado no Flo, Clue e Premom. Desenvolvido com React + PWA.

---

## ✨ Funcionalidades

- 📅 **Dashboard** — Dia do ciclo, ovulação, janela fértil, chance de gravidez
- 📆 **Calendário interativo** — Fases coloridas, detalhe por dia
- ✏️ **Registro completo** — Menstruação, sintomas, humor, atividade sexual, saúde
- 🌸 **Dashboard de fertilidade** — Gráfico hormonal, temperatura basal, modo tentante
- 📊 **Relatórios** — Exportação CSV e JSON, gráficos de tendências
- 👫 **Compartilhamento** — QR Code, link e e-mail para parceiro
- 🤖 **Assistente de IA** — Dúvidas sobre fertilidade e ciclo
- 🌙 **Modo escuro/claro**
- 📱 **PWA** — Instalável no celular como app nativo

---

## 🚀 Como fazer o deploy (passo a passo)

### Pré-requisitos
- Node.js instalado (versão 18 ou superior)
- Conta gratuita no Netlify ou Vercel

### 1. Instalar dependências
```bash
npm install
```

### 2. Gerar o build de produção
```bash
npm run build
```
Isso cria a pasta `build/` com o app otimizado.

### 3. Deploy no Netlify (opção mais fácil)
1. Acesse netlify.com e crie uma conta gratuita
2. Clique em **"Add new site" → "Deploy manually"**
3. Arraste a pasta `build/` para a área indicada
4. Pronto! Você receberá uma URL pública

### 4. Deploy no Vercel
```bash
npm install -g vercel
vercel --prod
```

---

## 📱 Instalar como app no celular (PWA)

Após o deploy, abra a URL no **Chrome (Android)**:
1. Toque no menu ⋮ (3 pontos)
2. "Adicionar à tela inicial"
3. O FloraFem aparece como app com ícone na tela inicial
4. Funciona offline!

**No iPhone (Safari):**
1. Toque no botão de compartilhar ↑
2. "Adicionar à tela de início"

---

## 🏗️ Estrutura do projeto

```
ciclo-app/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── App.jsx                  ← Componente raiz
│   ├── index.js                 ← Entry point
│   ├── index.css                ← Design system completo
│   ├── contexts/
│   │   └── AppContext.jsx       ← Estado global + lógica do ciclo
│   ├── components/
│   │   ├── Layout.jsx           ← Navegação inferior + header
│   │   └── DailyPopup.jsx       ← Pop-up diário inteligente
│   └── pages/
│       ├── Dashboard.jsx        ← Tela inicial
│       ├── Calendar.jsx         ← Calendário mensal
│       ├── LogPage.jsx          ← Registro de dados
│       ├── Fertility.jsx        ← Dashboard de fertilidade
│       ├── Reports.jsx          ← Relatórios e gráficos
│       └── Profile.jsx          ← Perfil + parceiro + IA
└── package.json
```

---

## 🔧 Tecnologias

| Tecnologia | Uso |
|---|---|
| React 18 | Framework principal |
| React Router 6 | Navegação |
| Recharts | Gráficos |
| date-fns | Manipulação de datas |
| localStorage | Armazenamento local (sem servidor) |
| PWA / manifest.json | Instalação no celular |

---

## 🔮 Próximos passos (para versão completa)

- [ ] Firebase Auth (login Google/Apple)
- [ ] Firestore (sincronização na nuvem)
- [ ] Firebase Cloud Messaging (notificações push reais)
- [ ] Capacitor (gerar APK para Play Store)
- [ ] Integração com API de IA (OpenAI/Gemini)
- [ ] Exportação em PDF

---

## 💜 Créditos

Desenvolvido com carinho pela Zapia AI para Evellin Lanna.  
Inspirado nos melhores apps de ciclo do mundo: Flo, Clue e Premom.
