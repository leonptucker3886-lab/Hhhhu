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
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
              Company Cookout
            </h1>
            <div className="text-2xl md:text-4xl font-bold text-yellow-400 mb-4">
              SunNFun Slots
            </div>
            <p className="text-xl md:text-2xl text-neutral-300 max-w-3xl mx-auto">
              Where the slots are hotter than a prison cafeteria chili cook-off!
            </p>
          </div>

          {/* Main CTA */}
          <div className="text-center mb-16">
            <Link
              href="/lobby"
              className="inline-block bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold text-xl px-12 py-6 rounded-full transform hover:scale-105 transition-all duration-200 shadow-2xl"
            >
              🚪 Enter the Big House 🏠
            </Link>
            <p className="mt-4 text-neutral-400 italic">
              &ldquo;Come on in, partner - the warden&apos;s waitin&apos; with some jackpots!&rdquo;
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-neutral-800/50 backdrop-blur-sm p-8 rounded-xl border border-neutral-700 text-center">
              <div className="text-4xl mb-4">🎰</div>
              <h3 className="text-xl font-bold text-yellow-400 mb-3">High-Stakes Shenanigans</h3>
              <p className="text-neutral-300">
                Spin &apos;em wild like you&apos;re breakin&apos; rocks in the hot sun!
                Big payouts that&apos;ll make you holler louder than a jailbreak siren.
              </p>
            </div>

            <div className="bg-neutral-800/50 backdrop-blur-sm p-8 rounded-xl border border-neutral-700 text-center">
              <div className="text-4xl mb-4">🍺</div>
              <h3 className="text-xl font-bold text-yellow-400 mb-3">No Bull Cornbread</h3>
              <p className="text-neutral-300">
                Honest-to-goodness fun without the baloney.
                Straight shootin&apos; slots that&apos;ll treat you fair and square.
              </p>
            </div>

            <div className="bg-neutral-800/50 backdrop-blur-sm p-8 rounded-xl border border-neutral-700 text-center">
              <div className="text-4xl mb-4">🔥</div>
              <h3 className="text-xl font-bold text-yellow-400 mb-3">Red-Hot Jackpots</h3>
              <p className="text-neutral-300">
                Hotter than a pepper in the prison garden!
                Life-changin&apos; wins that&apos;ll have you dancin&apos; like you&apos;re free at last.
              </p>
            </div>
          </div>

          {/* Footer Message */}
          <div className="text-center mt-16">
            <p className="text-neutral-500 italic">
              &ldquo;Remember folks, what happens in the slots stays in the slots... or does it? 😉&rdquo;
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
