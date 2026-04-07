import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.1),transparent_70%)]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
          {/* Header */}
          <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent flex items-center justify-center gap-4">
            <span className="text-8xl md:text-9xl">🎰</span>
            Company Cookout
          </h1>
          <div className="text-2xl md:text-4xl font-bold text-yellow-400 mb-4">
            presents SunNFun Slots
          </div>
            <p className="text-xl md:text-2xl text-neutral-300 max-w-3xl mx-auto italic">
              "Forget about it! Dis casino's got more action than a mob family reunion!"
            </p>
          </div>

          {/* Main CTAs */}
          <div className="text-center mb-16 space-y-8">
            <div className="flex flex-col md:flex-row justify-center items-center gap-8">
              <div className="text-center max-w-sm">
                <Link
                  href="/lobby"
                  className="inline-block bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold text-xl px-12 py-6 rounded-full transform hover:scale-105 transition-all duration-200 shadow-2xl"
                >
                  🚪 Garage Casino #1 🏠
                </Link>
                <p className="mt-3 text-yellow-300 text-sm font-semibold">Classic Casino Games</p>
                <div className="mt-4 text-left bg-yellow-900/20 rounded-lg p-4 text-xs text-yellow-200 space-y-1">
                  <div>"Fuhgeddaboudit, this slots game is da real deal!"</div>
                  <div>"You wanna play blackjack? Make sure you don't break da bank!"</div>
                  <div>"Snitches get stitches, but this detective game pays da bills!"</div>
                  <div>"Hide in da trees all you want, but da loot calls your name!"</div>
                  <div>"Swing dat axe like you're choppin' down da competition!"</div>
                  <div>"Duck and cover, boys - da action never stops!"</div>
                  <div>"Pool balls flyin' like bullets in a drive-by!"</div>
                  <div>"Show me your pitties? Make 'em winners or walk away!"</div>
                  <div>"Drinkin' again? Dis game's da ultimate buzz!"</div>
                  <div>"Night vision peepin'? We see everything comin'!"</div>
                </div>
              </div>

              <div className="text-center max-w-sm">
                <Link
                  href="/move-in"
                  className="inline-block bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold text-xl px-12 py-6 rounded-full transform hover:scale-105 transition-all duration-200 shadow-2xl"
                >
                  🏚️ SunNFun Residents Casino #2 🏠
                </Link>
                <p className="mt-3 text-purple-300 text-sm font-semibold">Social Slot Machine Experience</p>
                <div className="mt-4 text-left bg-purple-900/20 rounded-lg p-4 text-xs text-purple-200 space-y-1">
                  <div>"Dis cluster slots game? It's off da charts, capisce?"</div>
                  <div>"Park coins? More like mob money - untraceable!"</div>
                  <div>"Your profile? We know who you are, and what you did last summer!"</div>
                  <div>"Leaderboards? Only da best make it to da top, see?"</div>
                  <div>"Admin panel? That's for da boss, not for you!"</div>
                  <div>"Daily bonuses? Like protection money, but you get somethin' back!"</div>
                  <div>"Mobile PWA? Dis game goes wherever da action is!"</div>
                  <div>"Auto-spin? Let da machine do da work while you count da dough!"</div>
                  <div>"Free spins? Like gettin' off on a technicality!"</div>
                  <div>"Local storage? Your secrets are safe wit' us!"</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-neutral-400 italic text-lg">
                "Ey, you gonna play or what? Da tables are waitin'!"
              </p>
              <div className="text-sm text-neutral-500 space-y-1">
                <p>🟡 <strong>Garage Casino #1:</strong> "Da joint where wiseguys become high-rollers!"</p>
                <p>🟣 <strong>SunNFun Residents Casino #2:</strong> "Trailer park meets da big city - social slots wit' attitude!"</p>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-neutral-800/50 backdrop-blur-sm p-8 rounded-xl border border-neutral-700 text-center">
              <div className="text-4xl mb-4">🎰</div>
              <h3 className="text-xl font-bold text-yellow-400 mb-3">Slot Machines</h3>
              <p className="text-neutral-300">
                Sun N Fun Slots with cookout themes, progressive jackpots, and bonus rounds!
              </p>
            </div>

            <div className="bg-neutral-800/50 backdrop-blur-sm p-8 rounded-xl border border-neutral-700 text-center">
              <div className="text-4xl mb-4">🃏</div>
              <h3 className="text-xl font-bold text-yellow-400 mb-3">Table Games</h3>
              <p className="text-neutral-300">
                White Jack blackjack and other classic casino table games with pondside flair.
              </p>
            </div>

            <div className="bg-neutral-800/50 backdrop-blur-sm p-8 rounded-xl border border-neutral-700 text-center">
              <div className="text-4xl mb-4">🕵️</div>
              <h3 className="text-xl font-bold text-yellow-400 mb-3">Specialty Games</h3>
              <p className="text-neutral-300">
                Detective mysteries, axe throwing, duck hunting, and unique casino experiences!
              </p>
            </div>
          </div>

          {/* Footer Message */}
          <div className="text-center mt-16">
            <p className="text-neutral-500 italic">
              "Remember, in dis casino, what happens at da tables stays at da tables... unless you owe us money! 💰"
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
