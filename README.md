# ITSM Pro Infrastructure

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat&logo=supabase)

Sistema moderno de gestão de Infraestrutura e Serviços de TI (ITSM - IT Service Management). Esta aplicação centraliza o controle de ativos, almoxarifado, documentação e painéis interativos de relatórios de infraestrutura.

## 🚀 Funcionalidades

- **Dashboard Interativo:** Visão geral em tempo real com gráficos e métricas utilizando Recharts.
- **Gestão de Ativos e Almoxarifado:** Controle completo de entrada e saída de equipamentos e suprimentos de TI.
- **Geração de QR Codes:** Sistema para gerar QR codes integrados para etiquetas de ativos.
- **Exportação de Relatórios:** Capacidade de gerar e exportar relatórios em PDF e planilhas Excel (XLSX).
- **Base de Conhecimento (Wiki):** Editor de texto rico (TipTap) para documentação de processos, manuais e guias de infraestrutura.
- **Visualização 3D:** Suporte integrado a ambientes ou objetos em 3D usando Three.js e React Three Fiber.
- **Banco de Dados Real-time:** Arquitetura serverless e banco de dados moderno com Supabase.

## 🛠 Tecnologias Utilizadas

- **Frontend:** [Next.js](https://nextjs.org/) (App Router), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Database:** [Supabase](https://supabase.com/)
- **Gráficos e UI:** [Recharts](https://recharts.org/), [Lucide React](https://lucide.dev/)
- **Visualização 3D:** [Three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/)
- **Editor Rico (Wiki):** [TipTap](https://tiptap.dev/)
- **Utilitários:** `jspdf` (PDF), `xlsx` (Excel), `html5-qrcode` & `qrcode.react` (Códigos QR)

## 📦 Como rodar o projeto localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 20 ou superior recomendada)
- Chaves do Supabase (para o `.env.local`)

### Passo a passo

1. **Clone o repositório:**
```bash
git clone https://github.com/DevByronKing/ITSM-Infraestuture.git
```

2. **Acesse a pasta do projeto:**
```bash
cd ITSM-Pro-Infrastructure
```

3. **Instale as dependências:**
```bash
npm install
```

4. **Configuração de Ambiente:**
Crie um arquivo `.env.local` na raiz da pasta `ITSM-Pro-Infrastructure` e adicione as chaves necessárias do Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_key_aqui
```

5. **Inicie o servidor de desenvolvimento:**
```bash
npm run dev
```

6. **Acesse a aplicação:**
Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📜 Scripts Disponíveis

- `npm run dev`: Inicia o servidor local de desenvolvimento.
- `npm run build`: Cria a versão de produção otimizada.
- `npm run start`: Inicia o servidor com a versão de produção.
- `npm run lint`: Executa a verificação de código (ESLint).

---
*Desenvolvido para gestão eficiente de Infraestrutura de TI.*
