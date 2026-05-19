export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 px-4">
      <div className="text-center space-y-6 max-w-md">

        <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-2xl bg-zinc-900">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
          </svg>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">ERP Comercial</h1>
          <p className="mt-1 text-sm text-zinc-500">inovabi.com</p>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm px-8 py-6 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <p className="text-sm font-semibold text-zinc-700">Sistema em construção</p>
          </div>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Estamos desenvolvendo algo incrível. Em breve o sistema estará disponível para acesso.
          </p>
        </div>

        <a
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-700 transition"
        >
          Acesso administrativo
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </a>

      </div>
    </div>
  );
}
