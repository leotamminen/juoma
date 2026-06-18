export default function Support() {
  return (
    <div className="min-h-screen text-white px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Page heading */}
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-1">Tietoja</h1>
          <p className="text-gray-400 text-sm">Vastuuvapauslauseke ja tekijätiedot</p>
        </div>

        {/* Vastuuvapauslauseke */}
        <div className="bg-black/30 border border-white/10 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Vastuuvapauslauseke</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Juoma on tehty omaan ja kaveriporukan käyttöön. Emme suosittele juomaan alkoholia humaltumistarkoituksessa. Sovellus ei ole kaupallinen, eikä tavoittele voittoa.
          </p>
        </div>

        {/* Juomafaktat */}
        <div className="bg-black/30 border border-white/10 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Juomafaktat</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            Faktat on lainattu vapaasti ja suomennettu sivuilta{" "}
            <span className="text-amber-400">thebottleclub.com</span> ja{" "}
            <span className="text-amber-400">adtbreathalysers.com.au</span>.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Faktat voivat toisinaan olla epätarkkoja tai puhtaasti huumorimielessä — tarkoitus on viihdyttää. Emme vastaa faktojen totuudenmukaisuudesta.
          </p>
        </div>

        {/* Musiikki */}
        <div className="bg-black/30 border border-white/10 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Musiikki</h2>
          <p className="text-gray-400 text-sm mb-4">
            Kaikki kappaleet kuuluvat alkuperäisille tekijöilleen.
          </p>
          <div className="space-y-2.5">
            {[
              { title: "Piiska (remix)", info: "Oma remix. Alkuperäinen: Pisk Mig Hårdt!!! · Dario Von Slutty, 2004" },
              { title: "Häkkine", info: "Mika Häkkinen juomapeli, YouTube, Dj Visage" },
              { title: "Salamanisku", info: "AC/DC, Thunderstruck, 1990" },
              { title: "Tempo", info: "Bess, Tempo, 2019" },
            ].map(({ title, info }) => (
              <div key={title} className="flex gap-3 text-sm">
                <span className="text-amber-400 font-medium shrink-0">{title}</span>
                <span className="text-gray-400">— {info}</span>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-xs mt-4 leading-relaxed">
            Kappaleet ovat sovelluksessa pelkästään juomapelitarkoitukseen, eivät väärinkäyttöön. Pidätämme oikeuden lisätä kappaleita tulevaisuudessa.
          </p>
        </div>

        {/* Pelit */}
        <div className="bg-black/30 border border-white/10 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Pelit</h2>
          <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
            <p>
              Hitler-juomapeli on klassinen opiskelijapeli. Pelin tarkoituksena ei ole loukata ketään.
            </p>
            <p>
              Anna Clauden päättää ei ole oikea tekoäly — se on huumorilla tehty tekstipohjainen juomapelichatbotti.
            </p>
            <p className="text-gray-400">
              Kaikki pelit on tarkoitettu vain viihdekäyttöön.
            </p>
          </div>
        </div>

        {/* Palaute */}
        <div className="bg-black/30 border border-white/10 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Palaute</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            Palaute ja peliehdotukset ovat tervetulleita.
          </p>
          <a
            href="https://github.com/leotamminen"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/40 hover:bg-white/10 text-sm text-gray-300 hover:text-white transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>

      </div>
    </div>
  );
}
