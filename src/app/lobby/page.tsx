import Link from "next/link";

export default function Lobby() {
  return (
    <main className="min-h-screen bg-neutral-900 text-white">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              cookout
            </span>
            <span className="text-yellow-400 font-semibold">SunNFun Slots</span>
          </Link>
          <Link
            href="/"
            className="text-neutral-400 hover:text-yellow-400 transition-colors"
          >
            ← Back to Front Porch
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Lobby Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
            The Big House Lobby
          </h1>
          <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
            &ldquo;Welcome to the pokey, partner! Choose your cell block and start spinnin&apos;!&rdquo;
          </p>
        </div>

        {/* Game Selection Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Game 1 */}
          <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-8 rounded-xl border border-neutral-700 hover:border-yellow-500/50 transition-all duration-300 group cursor-pointer">
            <div className="text-center">
              <div className="text-6xl mb-4">🎰</div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-3 group-hover:text-yellow-300">
                Chain Gang Slots
              </h3>
              <p className="text-neutral-300 mb-6">
                &ldquo;Break free from the shackles of boredom! Three reels of pure hillbilly havoc that&apos;ll have you singin&apos; the blues... or greens!&rdquo;
              </p>
              <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg transition-colors">
                Play Now (Coming Soon)
              </button>
            </div>
          </div>

          {/* Game 2 */}
          <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-8 rounded-xl border border-neutral-700 hover:border-yellow-500/50 transition-all duration-300 group cursor-pointer">
            <div className="text-center">
              <div className="text-6xl mb-4">🃏</div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-3 group-hover:text-yellow-300">
                Moonshine Poker
              </h3>
              <p className="text-neutral-300 mb-6">
                &ldquo;Get dealt a hand hotter than homemade hooch! Five-card draw that&apos;ll test your poker face faster than a lie detector test.&rdquo;
              </p>
              <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg transition-colors">
                Play Now (Coming Soon)
              </button>
            </div>
          </div>

          {/* Game 3 */}
          <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-8 rounded-xl border border-neutral-700 hover:border-yellow-500/50 transition-all duration-300 group cursor-pointer">
            <div className="text-center">
              <div className="text-6xl mb-4">🎲</div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-3 group-hover:text-yellow-300">
                Cornbread Craps
              </h3>
              <p className="text-neutral-300 mb-6">
                &ldquo;Roll them bones like you&apos;re shakin&apos; the dice in a backwoods game! Come seven or come eleven, the fun never ends!&rdquo;
              </p>
              <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg transition-colors">
                Play Now (Coming Soon)
              </button>
            </div>
          </div>

          {/* Game 4 */}
          <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-8 rounded-xl border border-neutral-700 hover:border-yellow-500/50 transition-all duration-300 group cursor-pointer">
            <div className="text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-3 group-hover:text-yellow-300">
                Prison Yard Plinko
              </h3>
              <p className="text-neutral-300 mb-6">
                &ldquo;Drop that chip and watch it bounce! More exciting than mail call and twice as unpredictable!&rdquo;
              </p>
              <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg transition-colors">
                Play Now (Coming Soon)
              </button>
            </div>
          </div>

          {/* Game 5 */}
          <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-8 rounded-xl border border-neutral-700 hover:border-yellow-500/50 transition-all duration-300 group cursor-pointer">
            <div className="text-center">
              <div className="text-6xl mb-4">🪙</div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-3 group-hover:text-yellow-300">
                Tin Cup Roulette
              </h3>
              <p className="text-neutral-300 mb-6">
                &ldquo;Spin that wheel faster than a prison riot! Red or black, the house always wins... or does it?&rdquo;
              </p>
              <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg transition-colors">
                Play Now (Coming Soon)
              </button>
            </div>
          </div>

          {/* Game 6 */}
          <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-8 rounded-xl border border-neutral-700 hover:border-yellow-500/50 transition-all duration-300 group cursor-pointer">
            <div className="text-center">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-3 group-hover:text-yellow-300">
                Get Out of Jail Free
              </h3>
              <p className="text-neutral-300 mb-6">
                &ldquo;The ultimate jackpot game! Win big enough and you might just earn your freedom... or at least a fancy new pair of shoes!&rdquo;
              </p>
              <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg transition-colors">
                Play Now (Coming Soon)
              </button>
            </div>
          </div>
        </div>

        {/* Coming Soon Message */}
        <div className="text-center bg-neutral-800/50 backdrop-blur-sm p-8 rounded-xl border border-neutral-700 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">
            Hold Your Horses, Partner!
          </h2>
          <p className="text-neutral-300 mb-4">
            &ldquo;We&apos;re cookin&apos; up somethin&apos; special in the kitchen. These games are comin&apos; faster than a jailbreak at midnight!&rdquo;
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
          <p className="text-sm mt-2">© 2026 cookout SunNFun Slots - All rights reserved</p>
        </footer>
      </div>
    </main>
  );
}