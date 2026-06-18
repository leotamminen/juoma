export default function Learn() {
  return (
    <div className="min-h-screen text-white px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Page heading */}
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-1">Peliohjeet</h1>
          <p className="text-gray-400 text-sm">Miten pelejä pelataan</p>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-900/30 border border-amber-700/50 rounded-2xl px-5 py-4">
          <p className="text-amber-300 text-sm leading-relaxed">
            <span className="font-bold">Disclaimer:</span> Juoma ei suosittele juomaan alkoholijuomia humaltumistarkoituksessa.
          </p>
        </div>

        {/* Music games */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Musiikkipelit</p>
          <div className="space-y-3">

            <div className="bg-black/30 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🎵</span>
                <h2 className="text-base font-bold text-white">Piiskapeli</h2>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Yksi aloittaa juomaan kappaleen alusta. Kun kuuluu <span className="text-amber-300 font-medium">"piiska"</span>, hänen täytyy ajoittaa kädellä lyönti johonkin toiseen pelaajaan, ikään kuin ilmamapiiskata. Jos onnistuu, vuoro vaihtuu ja osuttu pelaaja jatkaa juomista. Mitä isompi porukka, sen parempi. Pienellä porukalla juotua tulee paljon.
              </p>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🏎️</span>
                <h2 className="text-base font-bold text-white">Häkkine</h2>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-3">
                Kaikki juovat aina kun kuuluu jokin näistä:
              </p>
              <div className="flex flex-wrap gap-2">
                {["Häkkinen", "Mika", "Hyvä Suomi", "Huippu jännittävä tilanne"].map(w => (
                  <span key={w} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-amber-300 font-medium">
                    {w}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">⚡</span>
                <h2 className="text-base font-bold text-white">Salamanisku</h2>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-2">
                AC/DC — Thunderstruck. Yksi aloittaa juomaan ja jatkaa, kunnes kuuluu <span className="text-amber-300 font-medium">"Thunder"</span> — silloin vuoro vaihtuu seuraavalle. Mennään piirissä.
              </p>
              <p className="text-gray-500 text-xs">
                Kevyempi versio: kun "Thunder", kaikki ottaa yhden huikan.
              </p>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🎶</span>
                <h2 className="text-base font-bold text-white">Tempo</h2>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-2">
                Joka ikisellä <span className="text-amber-300 font-medium">"Tempo"</span> tai sen taivutusmuodolla jokainen juo yhden huikan.
              </p>
              <div className="bg-red-900/30 border border-red-700/40 rounded-xl px-4 py-2.5 mt-3">
                <p className="text-red-300 text-xs leading-relaxed">
                  Kappaleessa on <span className="font-bold">66 "tempoa"</span> — vastaa kahta (2) 0,33 l tölkkiä per pelaaja. Emme suosittele kenellekään kokeilemaan.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* App games */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Sovelluksen pelit</p>
          <div className="space-y-3">

            <div className="bg-black/30 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🃏</span>
                <h2 className="text-base font-bold text-white">Malte</h2>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Nelivaiheinen korttipeli. Peli ohjaa pelaajia eteenpäin suoraan sovelluksessa.
              </p>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🍺</span>
                <h2 className="text-base font-bold text-white">Hitler</h2>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Jaetaan kortteja, jokaisella kortilla on oma tehtävänsä. Peli ohjaa eteenpäin sovelluksessa.
              </p>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🍾 🎯 🤖</span>
              </div>
              <h2 className="text-base font-bold text-white mb-2">Pullon Pyöritys, Juomakortit, Anna Clauden päättää</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                Kaikki selkeitä — sovellus ohjaa pelaajia suoraan.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
