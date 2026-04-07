import Link from "next/link";

export default function Lobby() {
  return (
    <main className="min-h-screen bg-neutral-900 text-white">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              Company Cookout
            </span>
            <span className="text-yellow-400 font-semibold">Gaming</span>
          </Link>
          <div className="text-neutral-400">
            Welcome back, neighbor!
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Lobby Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
            The Company Garage
          </h1>
          <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
            &ldquo;Welcome to the garage, neighbor! Choose your ride and start spinnin&apos;!&rdquo;
          </p>
        </div>

        {/* Game Selection Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Detective Game */}
          <Link href="/detective" className="group">
            <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-8 rounded-xl border border-neutral-700 hover:border-yellow-500/50 transition-all duration-300 group-hover:transform group-hover:scale-105 cursor-pointer">
              <div className="text-center">
                <div className="text-6xl mb-4">🕵️</div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-3 group-hover:text-yellow-300">
                  Who&apos;d Snitch?
                </h3>
                <p className="text-neutral-300 mb-6">
                  &ldquo;Someone snitched at the cookout! Find the rat and send &apos;em to the lake!&rdquo;
                </p>
                <div className="text-green-400 font-bold text-lg">
                  🟢 LIVE NOW
                </div>
              </div>
            </div>
          </Link>

          {/* Sun N Fun Slots */}
          <Link href="/slots" className="group">
            <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-8 rounded-xl border border-neutral-700 hover:border-yellow-500/50 transition-all duration-300 group-hover:transform group-hover:scale-105 cursor-pointer">
              <div className="text-center">
                <div className="text-6xl mb-4">🎰</div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-3 group-hover:text-yellow-300">
                  Sun N Fun Slots
                </h3>
                <p className="text-neutral-300 mb-6">
                  &ldquo;Lakeside cookout chaos! Kick them pigs and watch the money fly!&rdquo;
                </p>
                <div className="text-green-400 font-bold text-lg">
                  🟢 LIVE NOW
                </div>
              </div>
            </div>
          </Link>

          {/* White Jack Blackjack */}
          <Link href="/blackjack" className="group">
            <div className="bg-gradient-to-br from-green-800 to-green-900 p-8 rounded-xl border border-green-700 hover:border-white/50 transition-all duration-300 group-hover:transform group-hover:scale-105 cursor-pointer">
              <div className="text-center">
                <div className="text-6xl mb-4">🃏</div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-gray-200">
                  White Jack
                </h3>
                <p className="text-green-100 mb-6">
                  &ldquo;Lakeside elegance meets classic blackjack. Clean cards, cool stakes!&rdquo;
                </p>
                <div className="text-green-400 font-bold text-lg">
                  🟢 LIVE NOW
                </div>
              </div>
            </div>
          </Link>

          {/* Hiding in the Tree */}
          <Link href="/tree-hide" className="group">
            <div className="bg-gradient-to-br from-amber-800 to-amber-900 p-8 rounded-xl border border-amber-700 hover:border-yellow-500/50 transition-all duration-300 group-hover:transform group-hover:scale-105 cursor-pointer">
              <div className="text-center">
                <div className="text-6xl mb-4">🌳</div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-3 group-hover:text-yellow-300">
                  Hiding in the Tree
                </h3>
                <p className="text-amber-100 mb-6">
                  &ldquo;Spot the critters hidin&apos; in this mighty oak! Find &apos;em before time runs out!&rdquo;
                </p>
                <div className="text-green-400 font-bold text-lg">
                  🟢 LIVE NOW
                </div>
              </div>
            </div>
          </Link>

          {/* Moonshine Poker */}
          <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-8 rounded-xl border border-neutral-700 hover:border-yellow-500/50 transition-all duration-300 group cursor-pointer">
            <div className="text-center">
              <div className="text-6xl mb-4">🃏</div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-3 group-hover:text-yellow-300">
                Moonshine Poker
              </h3>
              <p className="text-neutral-300 mb-6">
                &ldquo;Get dealt a hand hotter than homemade moonshine! Five-card action with lake vibes!&rdquo;
              </p>
              <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg transition-colors">
                Coming Soon
              </button>
            </div>
          </div>

          {/* Cornbread Craps */}
          <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-8 rounded-xl border border-neutral-700 hover:border-yellow-500/50 transition-all duration-300 group cursor-pointer">
            <div className="text-center">
              <div className="text-6xl mb-4">🎲</div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-3 group-hover:text-yellow-300">
                Cornbread Craps
              </h3>
              <p className="text-neutral-300 mb-6">
                &ldquo;Roll them bones like you&apos;re shakin&apos; the dice at a backyard barbecue!&rdquo;
              </p>
              <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg transition-colors">
                Coming Soon
              </button>
            </div>
          </div>

          {/* Laundromat Plinko */}
          <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-8 rounded-xl border border-neutral-700 hover:border-yellow-500/50 transition-all duration-300 group cursor-pointer">
            <div className="text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-3 group-hover:text-yellow-300">
                Laundromat Plinko
              </h3>
              <p className="text-neutral-300 mb-6">
                &ldquo;Drop that chip and watch it bounce! More exciting than bingo night!&rdquo;
              </p>
              <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg transition-colors">
                Coming Soon
              </button>
            </div>
          </div>

          {/* Satellite Dish Roulette */}
          <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-8 rounded-xl border border-neutral-700 hover:border-yellow-500/50 transition-all duration-300 group cursor-pointer">
            <div className="text-center">
              <div className="text-6xl mb-4">🪙</div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-3 group-hover:text-yellow-300">
                Satellite Dish Roulette
              </h3>
              <p className="text-neutral-300 mb-6">
                &ldquo;Spin that wheel faster than channel surfin&apos;! Red or black, fortune favors the bold!&rdquo;
              </p>
              <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg transition-colors">
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        {/* Coming Soon Message */}
        <div className="text-center bg-neutral-800/50 backdrop-blur-sm p-8 rounded-xl border border-neutral-700 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">
            Cookin&apos; Up More Fun!
          </h2>
          <p className="text-neutral-300 mb-4">
            &ldquo;We&apos;re cookin&apos; up somethin&apos; special in the kitchen. These games are comin&apos; faster than a soap opera plot twist!&rdquo;
          </p>
          <p className="text-neutral-500 italic">
            Stay tuned for updates - we&apos;ll let you know when the fun begins! 🎰
          </p>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-neutral-500">
          <p className="italic">
            &ldquo;Remember: Gamble responsibly... or don&apos;t. We&apos;re not your mama! 😉&rdquo;
          </p>
          <p className="text-sm mt-2">© 2026 Company Cookout Gaming - All rights reserved</p>
        </footer>
      </div>
    </main>
  );
}