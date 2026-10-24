# Configurando o Supabase

O site é estático (HTML, CSS e JS sem build). Login, banco de dados e fotos ficam no Supabase, acessado direto do navegador. Enquanto `src/js/config.js` estiver vazio, o site funciona, mas sem anúncios e com o login desabilitado.

## 1. Criar o projeto

1. Crie um projeto em [supabase.com](https://supabase.com) (região sugerida: South America, São Paulo).
   No campo **Database Password**, gere uma senha forte e guarde num gerenciador de senhas. O site não usa essa senha: ela só serve para conexões diretas ao Postgres (psql, DBeaver, CLI do Supabase) e dá acesso total ao banco, então nunca a coloque no `config.js` nem no repositório. Se perder, troque em **Project Settings > Database**.
2. Abra **SQL Editor > New query**, cole o conteúdo de [`supabase/schema.sql`](../supabase/schema.sql) e rode.
   Isso cria as tabelas `animals` e `animal_contacts`, as regras de acesso (RLS) e o bucket de fotos `animal-photos`.
3. Se o banco foi criado com uma versão anterior do `schema.sql`, rode também as migrações de [`supabase/migrations`](../supabase/migrations) em ordem. Exemplo: a `002_varias_fotos.sql` troca a foto única por uma lista de até 5 fotos.

## 2. Ligar o site ao projeto

Em **Project Settings > API**, copie a **Project URL** e a **anon public key** para [`src/js/config.js`](../src/js/config.js):

```js
export const SUPABASE_URL = 'https://xxxx.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJ...';
```

A anon key pode ficar no código público: quem protege os dados são as regras do `schema.sql`. Nunca coloque a `service_role` key no site.

No mesmo arquivo ficam os canais de contato da Pet Friends (`CONTACT`). Vazios, a seção de contato mostra "em breve".

## 3. Login com email e senha

Em **Authentication > Sign In / Providers > Email**, deixe **Confirm email** ligado. Assim a conta só funciona depois que a pessoa clica no link enviado por email.

Em **Authentication > URL Configuration**:

- **Site URL**: o endereço do site. Sem domínio próprio, use o da Vercel (em **Vercel > projeto > Settings > Domains**), ex.: `https://pet-friends.vercel.app`
- **Redirect URLs**: adicione
  - `https://pet-friends.vercel.app/**` (o mesmo endereço da Site URL)
  - `http://localhost:8765/**` (para testar localmente)

Quando tiver um domínio próprio, troque a Site URL e acrescente o domínio novo nas Redirect URLs e no Google.

### Envio de emails

O envio padrão do Supabase serve só para testes: tem um limite baixo de emails por hora e só entrega para os endereços da equipe do projeto. Antes de abrir para o público, configure um SMTP próprio em **Authentication > Emails > SMTP Settings** (Resend, Brevo ou outro).

Em **Authentication > Emails > Templates** dá para traduzir os emails de confirmação e de nova senha para português.

## 4. Login com Google

No [Google Cloud Console](https://console.cloud.google.com), a tela de consentimento fica em **APIs e serviços > Tela de consentimento OAuth** (área chamada **Google Auth Platform**).

1. **Projeto**: crie um projeto novo ("Pet Friends") e selecione ele.
2. **Começar**: nome do app "Pet Friends", seu email de suporte, público **Externo** e email de contato.
3. **Marca**: em **Domínios autorizados**, adicione `xxxx.supabase.co` (o domínio da Project URL). Deixe o logo em branco por enquanto: enviar um logo exige verificação da marca pelo Google.
4. **Acesso a dados**: adicione só os escopos `openid`, `.../auth/userinfo.email` e `.../auth/userinfo.profile`. São básicos e não precisam de verificação.
5. **Público**: enquanto o app estiver em **Teste**, só os **usuários de teste** cadastrados conseguem entrar (adicione seu email). Para abrir para todo mundo, clique em **Publicar app**.
6. **Clientes > Criar cliente**, tipo **Aplicativo da Web**:
   - **Origens JavaScript autorizadas**: o endereço do site na Vercel e `http://localhost:8765`
   - **URIs de redirecionamento autorizados**: `https://xxxx.supabase.co/auth/v1/callback` (a Project URL + `/auth/v1/callback`)
7. Copie o **Client ID** e o **Client Secret** logo ao criar (em clientes novos o secret só aparece nessa hora) e cole em **Authentication > Sign In / Providers > Google** no Supabase, ativando o provedor.

Erros comuns: `redirect_uri_mismatch` quer dizer que o URI do passo 6 não está exatamente igual (sem barra no final); "acesso bloqueado" com o app em Teste quer dizer que o email não está nos usuários de teste. Mudanças no Google podem levar alguns minutos para valer.

## 5. Rodar localmente

O site usa módulos ES, então precisa de um servidor (abrir o `index.html` direto pelo arquivo não funciona):

```bash
python3 -m http.server 8765
```

E acesse `http://localhost:8765`.

## Como os dados ficam protegidos

| O quê | Quem pode |
| --- | --- |
| Ver anúncios disponíveis | qualquer pessoa, sem login |
| Ver o WhatsApp do anunciante | só quem está logado (a tabela `animal_contacts` é bloqueada para visitantes) |
| Criar anúncio e enviar foto | só quem está logado, sempre em nome próprio |
| Editar, marcar como adotado ou excluir | só o dono do anúncio |
