<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <title>Inovabi ERP — API</title>
    <style>
        :root {
            --bg: #0f1117;
            --surface: #161922;
            --surface-2: #1d212d;
            --border: #262b3a;
            --text: #e6e8ef;
            --text-soft: #b9bdcc;
            --text-muted: #7a8095;
            --text-faint: #555a6c;
            --accent: #6aa7ff;
            --accent-soft: #1f2d4a;
            --success: #6cd991;
            --warning: #f3c265;
            --danger:  #f17878;
            --info:    #7fbdff;
        }
        * { box-sizing: border-box; }
        html, body {
            margin: 0;
            padding: 0;
            background: var(--bg);
            color: var(--text);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;
            font-size: 15px;
            line-height: 1.55;
            -webkit-font-smoothing: antialiased;
        }
        a { color: var(--accent); text-decoration: none; }
        a:hover { text-decoration: underline; }
        code, pre, .mono {
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", monospace;
            font-size: 13px;
        }

        .wrap { max-width: 920px; margin: 0 auto; padding: 0 24px; }

        .hero {
            padding: 80px 0 56px;
            border-bottom: 1px solid var(--border);
            background:
                radial-gradient(ellipse at top right, rgba(106, 167, 255, 0.10), transparent 60%),
                var(--bg);
        }
        .brand {
            display: inline-flex; align-items: center; gap: 10px;
            font-size: 13px; color: var(--text-muted);
            letter-spacing: 0.08em; text-transform: uppercase;
            margin-bottom: 18px;
        }
        .brand-mark {
            width: 22px; height: 22px;
            border-radius: 6px;
            background: linear-gradient(135deg, #6aa7ff, #b06aff);
            display: inline-flex; align-items: center; justify-content: center;
            color: #fff; font-weight: 700; font-size: 13px;
        }
        h1 {
            font-size: 40px;
            font-weight: 700;
            letter-spacing: -0.02em;
            margin: 0 0 12px;
            color: var(--text);
        }
        .lead {
            font-size: 17px;
            color: var(--text-soft);
            max-width: 640px;
            margin: 0 0 24px;
        }
        .base {
            display: inline-flex; align-items: center; gap: 10px;
            padding: 10px 14px;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 8px;
            font-family: ui-monospace, monospace;
            font-size: 14px;
            color: var(--text);
        }
        .base .lbl {
            font-size: 11px;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-right: 4px;
        }
        .pills {
            display: flex; flex-wrap: wrap; gap: 8px;
            margin-top: 18px;
        }
        .pill {
            padding: 4px 10px;
            background: var(--surface-2);
            border: 1px solid var(--border);
            border-radius: 999px;
            font-size: 12px;
            color: var(--text-soft);
        }

        section { padding: 48px 0; border-bottom: 1px solid var(--border); }
        section:last-of-type { border-bottom: 0; }
        h2 {
            font-size: 22px;
            font-weight: 600;
            letter-spacing: -0.01em;
            margin: 0 0 6px;
            color: var(--text);
        }
        .section-sub {
            color: var(--text-muted);
            font-size: 14px;
            margin: 0 0 24px;
        }

        .endpoints {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 10px;
            overflow: hidden;
        }
        .endpoints th, .endpoints td {
            padding: 11px 14px;
            text-align: left;
            font-size: 13.5px;
        }
        .endpoints thead th {
            background: var(--surface-2);
            color: var(--text-muted);
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            border-bottom: 1px solid var(--border);
        }
        .endpoints tbody tr + tr td { border-top: 1px solid var(--border); }
        .endpoints td.path { font-family: ui-monospace, monospace; font-size: 13px; color: var(--text); white-space: nowrap; }
        .endpoints td.desc { color: var(--text-soft); }

        .method {
            display: inline-block;
            padding: 2px 7px;
            border-radius: 4px;
            font-family: ui-monospace, monospace;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.04em;
        }
        .method-get    { background: rgba(127, 189, 255, 0.15); color: var(--info); }
        .method-post   { background: rgba(108, 217, 145, 0.15); color: var(--success); }
        .method-put    { background: rgba(243, 194, 101, 0.18); color: var(--warning); }
        .method-delete { background: rgba(241, 120, 120, 0.18); color: var(--danger); }

        .auth-badge {
            display: inline-block;
            margin-left: 8px;
            padding: 1px 6px;
            background: var(--surface-2);
            color: var(--text-muted);
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
        }

        pre {
            margin: 0;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 16px 18px;
            overflow-x: auto;
            line-height: 1.55;
            color: var(--text);
        }
        pre .c { color: var(--text-muted); }
        pre .s { color: var(--success); }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 14px;
        }
        .grid-card {
            padding: 16px;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 10px;
        }
        .grid-card h3 {
            font-size: 14px;
            font-weight: 600;
            margin: 0 0 6px;
            color: var(--text);
        }
        .grid-card p {
            margin: 0;
            font-size: 13px;
            color: var(--text-muted);
            line-height: 1.45;
        }

        footer {
            padding: 36px 0 56px;
            color: var(--text-faint);
            font-size: 13px;
        }
        footer .row { display: flex; flex-wrap: wrap; gap: 18px; align-items: center; justify-content: space-between; }

        @media (max-width: 600px) {
            h1 { font-size: 30px; }
            .hero { padding: 56px 0 40px; }
            section { padding: 36px 0; }
            .endpoints td.path { white-space: normal; }
        }
    </style>
</head>
<body>

<header class="hero">
    <div class="wrap">
        <div class="brand">
            <span class="brand-mark">i</span>
            <span>Inovabi ERP · API</span>
        </div>
        <h1>API REST do Inovabi ERP</h1>
        <p class="lead">
            Backend Laravel servindo o ERP web e futuras integrações: PDV, estoque, financeiro, relatórios, notificações.
            Multi-tenant por estabelecimento, autenticação via Sanctum (Bearer token), respostas em JSON.
        </p>
        <div class="base">
            <span class="lbl">Base URL</span>
            <span>{{ url('/api') }}</span>
        </div>
        <div class="pills">
            <span class="pill">Laravel 12</span>
            <span class="pill">Sanctum · Bearer token</span>
            <span class="pill">UUID v7</span>
            <span class="pill">Multi-tenant</span>
            <span class="pill">JSON</span>
        </div>
    </div>
</header>

<section>
    <div class="wrap">
        <h2>Autenticação</h2>
        <p class="section-sub">
            Faça login com email/senha; o endpoint devolve um token Sanctum que vai no header
            <code>Authorization: Bearer …</code> de todas as requisições subsequentes.
        </p>
<pre><span class="c"># 1. Login — obtém o token</span>
curl -X POST {{ url('/api/auth/login') }} \
  -H <span class="s">"Content-Type: application/json"</span> \
  -H <span class="s">"Accept: application/json"</span> \
  -d <span class="s">'{"email":"admin@example.com","password":"secret"}'</span>

<span class="c"># 2. Use o token nas demais chamadas</span>
curl {{ url('/api/auth/me') }} \
  -H <span class="s">"Authorization: Bearer SEU_TOKEN_AQUI"</span> \
  -H <span class="s">"Accept: application/json"</span>

<span class="c"># 3. Logout — revoga só o token corrente</span>
curl -X POST {{ url('/api/auth/logout') }} \
  -H <span class="s">"Authorization: Bearer SEU_TOKEN_AQUI"</span></pre>
    </div>
</section>

<section>
    <div class="wrap">
        <h2>Endpoints principais</h2>
        <p class="section-sub">
            Visão geral por módulo. Todas as rotas (exceto <code>POST /auth/login</code>) exigem o header
            <code>Authorization</code> e respeitam permissões do usuário.
        </p>

        <table class="endpoints">
            <thead>
                <tr><th>Método</th><th>Caminho</th><th>Descrição</th></tr>
            </thead>
            <tbody>
                <tr><td><span class="method method-post">POST</span></td><td class="path">/auth/login</td><td class="desc">Login (público). Retorna o token Sanctum.</td></tr>
                <tr><td><span class="method method-post">POST</span></td><td class="path">/auth/logout</td><td class="desc">Revoga o token corrente.<span class="auth-badge">auth</span></td></tr>
                <tr><td><span class="method method-get">GET</span></td><td class="path">/auth/me</td><td class="desc">Dados do usuário autenticado + permissões.<span class="auth-badge">auth</span></td></tr>

                <tr><td><span class="method method-get">GET</span></td><td class="path">/me/profile</td><td class="desc">Lê o próprio perfil.<span class="auth-badge">auth</span></td></tr>
                <tr><td><span class="method method-put">PUT</span></td><td class="path">/me/profile</td><td class="desc">Atualiza nome, email, telefone.<span class="auth-badge">auth</span></td></tr>
                <tr><td><span class="method method-post">POST</span></td><td class="path">/me/password</td><td class="desc">Troca a senha (exige senha atual).<span class="auth-badge">auth</span></td></tr>
                <tr><td><span class="method method-post">POST</span></td><td class="path">/me/avatar</td><td class="desc">Upload de avatar (multipart, JPG/PNG/WEBP até 2MB).<span class="auth-badge">auth</span></td></tr>

                <tr><td><span class="method method-get">GET</span></td><td class="path">/dashboard</td><td class="desc">Métricas (escopo "self" para vendedor, "all" para gerência).<span class="auth-badge">dashboard.view</span></td></tr>
                <tr><td><span class="method method-get">GET</span></td><td class="path">/establishment</td><td class="desc">Dados do estabelecimento corrente.<span class="auth-badge">settings.view</span></td></tr>

                <tr><td><span class="method method-get">GET</span></td><td class="path">/customers</td><td class="desc">Lista de clientes (paginada, filtros).<span class="auth-badge">customers.view</span></td></tr>
                <tr><td><span class="method method-get">GET</span></td><td class="path">/suppliers</td><td class="desc">Lista de fornecedores.<span class="auth-badge">suppliers.view</span></td></tr>
                <tr><td><span class="method method-get">GET</span></td><td class="path">/categories</td><td class="desc">Categorias de produtos (com <code>?all=1</code> para dropdown).<span class="auth-badge">categories.view</span></td></tr>
                <tr><td><span class="method method-get">GET</span></td><td class="path">/products</td><td class="desc">Produtos com estoque e flag low_stock.<span class="auth-badge">products.view</span></td></tr>
                <tr><td><span class="method method-get">GET</span></td><td class="path">/stock-movements</td><td class="desc">Log imutável de movimentações de estoque.<span class="auth-badge">stock.view</span></td></tr>

                <tr><td><span class="method method-get">GET</span></td><td class="path">/orders</td><td class="desc">Vendas/PDV — listar, criar, pagar, cancelar.<span class="auth-badge">sales.view</span></td></tr>
                <tr><td><span class="method method-get">GET</span></td><td class="path">/financial-transactions</td><td class="desc">Contas a pagar/receber (CRUD + pagamento).<span class="auth-badge">finance.view</span></td></tr>

                <tr><td><span class="method method-get">GET</span></td><td class="path">/reports/sales</td><td class="desc">Relatórios de vendas / top produtos / fluxo de caixa / contas (CSV).<span class="auth-badge">reports.view</span></td></tr>
                <tr><td><span class="method method-get">GET</span></td><td class="path">/notifications</td><td class="desc">Notificações pessoais e broadcast do estabelecimento.<span class="auth-badge">auth</span></td></tr>
                <tr><td><span class="method method-get">GET</span></td><td class="path">/audit-logs</td><td class="desc">Trilha de auditoria imutável.<span class="auth-badge">audit.view</span></td></tr>
                <tr><td><span class="method method-get">GET</span></td><td class="path">/users</td><td class="desc">CRUD de colaboradores do estabelecimento.<span class="auth-badge">users.view</span></td></tr>
            </tbody>
        </table>
    </div>
</section>

<section>
    <div class="wrap">
        <h2>Convenções</h2>
        <p class="section-sub">Padrões aplicados em todas as rotas para previsibilidade nas integrações.</p>
        <div class="grid">
            <div class="grid-card">
                <h3>Multi-tenant</h3>
                <p>Todo recurso pertence a um <code>establishment_id</code>. As queries são automaticamente escopadas pelo estabelecimento do usuário autenticado — não é possível ver dados de outro tenant.</p>
            </div>
            <div class="grid-card">
                <h3>UUID v7</h3>
                <p>Todos os IDs são UUID versão 7 (ordenáveis por tempo). Não há IDs incrementais expostos.</p>
            </div>
            <div class="grid-card">
                <h3>Paginação</h3>
                <p>Listagens retornam <code>{ data: [...], meta: { current_page, last_page, per_page, total } }</code>. Padrão de 20 itens por página.</p>
            </div>
            <div class="grid-card">
                <h3>Erros de validação</h3>
                <p>Status <code>422</code> com payload <code>{ message, errors: { campo: ["..."] } }</code> — mensagens já em português.</p>
            </div>
            <div class="grid-card">
                <h3>Autorização granular</h3>
                <p>Cada rota é gateada por uma permissão específica (ex.: <code>customers.edit</code>). Sem a permissão, resposta é <code>403</code>.</p>
            </div>
            <div class="grid-card">
                <h3>Filtros</h3>
                <p>Listagens aceitam filtros via query string (<code>?search=&status=&date_from=&date_to=</code>). Consulte cada endpoint para os filtros suportados.</p>
            </div>
        </div>
    </div>
</section>

<section>
    <div class="wrap">
        <h2>Integrações</h2>
        <p class="section-sub">
            Pontos previstos de extensão para sistemas externos (frente de caixa físico, ERPs contábeis, plataformas de pagamento, BI).
            Use o token de um usuário dedicado com permissões mínimas.
        </p>
        <div class="grid">
            <div class="grid-card">
                <h3>Webhooks (futuro)</h3>
                <p>Notificações push de eventos como <code>OrderPaid</code>, <code>OrderCancelled</code>, <code>stock.critical</code>. Ainda não disponível.</p>
            </div>
            <div class="grid-card">
                <h3>Tokens de longa duração</h3>
                <p>Para integrações server-to-server, crie um usuário dedicado e gere um token via login. Ainda não há rotação automática.</p>
            </div>
            <div class="grid-card">
                <h3>Exportação CSV</h3>
                <p>Os endpoints de relatórios aceitam <code>?format=csv</code> e devolvem o arquivo direto, ideal pra BI/Excel.</p>
            </div>
        </div>
    </div>
</section>

<footer>
    <div class="wrap row">
        <span>Inovabi ERP · API v1.0</span>
        <span class="mono">{{ url('/up') }} · healthcheck</span>
    </div>
</footer>

</body>
</html>
