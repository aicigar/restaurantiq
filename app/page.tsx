import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-navy relative overflow-x-hidden">

      {/* ── Background atmosphere ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* dot grid */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,107,53,0.12) 1px, transparent 0)",
            backgroundSize: "36px 36px",
          }} />
        {/* top-center orange glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(255,107,53,0.18) 0%, transparent 70%)" }} />
        {/* bottom-left amber glow */}
        <div className="absolute bottom-0 -left-64 w-[700px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(255,181,71,0.1) 0%, transparent 70%)" }} />
        {/* top-right teal glow */}
        <div className="absolute top-1/4 -right-32 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(0,201,167,0.07) 0%, transparent 70%)" }} />
      </div>

      {/* ── Nav ── */}
      <nav className="relative border-b border-brd/60 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 btn-orange rounded-xl flex items-center justify-center font-black text-white text-lg shadow-glow-orange">
            R
          </div>
          <span className="text-white font-bold text-lg tracking-tight">RestaurantIQ</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/pricing" className="text-gray-400 hover:text-white text-sm transition-colors">Pricing</Link>
          <Link href="/login" className="text-gray-400 hover:text-white text-sm transition-colors">Sign In</Link>
          <Link href="/signup"
            className="btn-orange text-white text-sm font-semibold px-5 py-2 rounded-xl">
            Start Free Trial
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative max-w-5xl mx-auto px-6 pt-24 pb-28 text-center">
        {/* badge */}
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-8 border border-orange/30"
          style={{ background: "linear-gradient(135deg, rgba(255,107,53,0.15), rgba(255,181,71,0.08))", color: "#FFB547" }}>
          ✦ Powered by AI with live web search
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.08] mb-6 tracking-tight">
          Restaurant Intelligence,<br />
          <span className="text-grad-orange">Powered by AI</span>
        </h1>

        <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Smarter location scouting, review analysis, and competitive intelligence — for any restaurant, anywhere in the world.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup"
            className="btn-orange text-white font-bold px-10 py-4 rounded-2xl text-lg inline-block">
            Start Free Trial
          </Link>
          <Link href="/pricing"
            className="border border-brd hover:border-orange/40 text-white font-semibold px-10 py-4 rounded-2xl text-lg transition-all hover:bg-orange/5">
            View Pricing
          </Link>
        </div>

        {/* floating tags */}
        <div className="flex flex-wrap justify-center gap-2.5 mt-10">
          {["🇺🇸 United States","🇨🇦 Canada","🇬🇧 United Kingdom","🇦🇪 UAE / Dubai","🇵🇰 Pakistan","🇮🇳 India"].map(c => (
            <span key={c} className="text-xs text-gray-400 border border-brd/80 rounded-full px-3 py-1 bg-navy2/60 backdrop-blur-sm">{c}</span>
          ))}
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section className="relative max-w-6xl mx-auto px-6 pb-28">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              gradient: "card-glow-orange",
              iconBg: "bg-gradient-to-br from-orange to-amber2",
              shadow: "shadow-glow-orange",
              icon: "📍",
              module: "Module 1",
              textGrad: "text-grad-orange",
              title: "Location Scorer",
              description: "Enter any address + restaurant concept worldwide. Get a scored go/no-go with 8 demographic and market factors — backed by live local data.",
              outputs: ["Overall score 0–100", "8-factor breakdown", "Nearby competitor map", "3 alternative locations"],
            },
            {
              gradient: "card-glow-teal",
              iconBg: "bg-gradient-to-br from-teal to-cyan",
              shadow: "shadow-glow-teal",
              icon: "⭐",
              module: "Module 2",
              textGrad: "text-grad-teal",
              title: "Review Analyzer",
              description: "Our AI searches live reviews across Google, Zomato, Swiggy, Just Eat, Deliveroo, Talabat — then surfaces urgent issues and a ranked fix list.",
              outputs: ["6 sentiment categories", "Top praised dishes", "Urgent issues + fixes", "Ranked action plan"],
            },
            {
              gradient: "card-glow-coral",
              iconBg: "bg-gradient-to-br from-coral to-orange",
              shadow: "shadow-glow-coral",
              icon: "🔍",
              module: "Module 3",
              textGrad: "text-grad-coral",
              title: "Competitor Radar",
              description: "Map all real nearby competitors with ratings, price ranges, and threat levels. Identify market gaps and get positioning advice for your concept.",
              outputs: ["Full competitor map", "Market gap analysis", "Threat level scoring", "Positioning advice"],
            },
          ].map((f) => (
            <div key={f.title} className={`${f.gradient} p-6 transition-all duration-300 hover:-translate-y-1 hover:${f.shadow}`}>
              <div className="text-xs font-bold uppercase tracking-widest mb-4 opacity-60 text-gray-300">{f.module}</div>
              <div className={`w-12 h-12 ${f.iconBg} rounded-2xl flex items-center justify-center text-2xl mb-4`}>{f.icon}</div>
              <h3 className={`text-xl font-bold mb-2 ${f.textGrad}`}>{f.title}</h3>
              <p className="text-gray-400 text-sm mb-5 leading-relaxed">{f.description}</p>
              <ul className="space-y-2">
                {f.outputs.map((o) => (
                  <li key={o} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${f.iconBg}`} />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="relative max-w-4xl mx-auto px-6 pb-28 text-center">
        <div className="inline-block text-xs font-bold uppercase tracking-widest text-amber mb-3 opacity-70">Simple Process</div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">How It Works</h2>
        <p className="text-gray-500 mb-14">From question to insight in under a minute</p>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { step: "01", title: "Select your country", desc: "Choose from US, Canada, UK, UAE, Pakistan, India — the analysis adapts to local data sources and platforms." },
            { step: "02", title: "AI searches live data", desc: "Our AI searches census data, review platforms, and competitor listings in real time for your market." },
            { step: "03", title: "Get scored analysis", desc: "Receive a complete scored report with action items, exportable as PDF, HTML, or email." },
          ].map((s) => (
            <div key={s.step} className="relative">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-lg mx-auto mb-5"
                style={{ background: "linear-gradient(135deg, #FF6B35, #FFB547)", boxShadow: "0 4px 20px rgba(255,107,53,0.3)" }}>
                {s.step}
              </div>
              <h3 className="text-white font-semibold mb-2 text-lg">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="relative max-w-6xl mx-auto px-6 pb-28">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">Built for restaurant operators worldwide</h2>
          <p className="text-gray-500">Making data-driven decisions accessible to independent owners</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { quote: "I was about to sign a 10-year lease in the wrong neighborhood. RestaurantIQ showed me a better spot 2 miles away with far better demographics.", name: "Ahmed K.", role: "Pakistani restaurant, Chicago 🇺🇸" },
            { quote: "Found out 40% of our 1-star reviews mentioned slow delivery, not food quality. Fixed our settings and rating jumped from 3.8 to 4.4 in 6 weeks.", name: "Fatima M.", role: "Chicken restaurant, Dubai 🇦🇪" },
            { quote: "Spotted a gap — no quality Italian in our area despite strong demand. Opened 4 months ago and we're already profitable.", name: "Yusuf A.", role: "Italian restaurant, London 🇬🇧" },
          ].map((t) => (
            <div key={t.name} className="card p-6 hover:-translate-y-0.5 transition-transform duration-200">
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ background: "linear-gradient(135deg, #FF6B35, #FFB547)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>★</span>
                ))}
              </div>
              <p className="text-gray-300 text-sm italic mb-5 leading-relaxed">"{t.quote}"</p>
              <div>
                <div className="text-white font-semibold text-sm">{t.name}</div>
                <div className="text-gray-500 text-xs mt-0.5">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing preview ── */}
      <section className="relative max-w-4xl mx-auto px-6 pb-28 text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Simple Pricing</h2>
        <p className="text-gray-500 mb-10">Start with a free trial. No credit card required.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-5 mb-8">
          {[
            { name: "Starter", price: "$49", period: "/mo", desc: "5 reports/month", popular: false },
            { name: "Growth",  price: "$149", period: "/mo", desc: "25 reports/month", popular: true },
            { name: "Chain",   price: "$399", period: "/mo", desc: "Unlimited reports", popular: false },
          ].map((p) => (
            <div key={p.name}
              className={`flex-1 rounded-2xl px-6 py-6 text-center relative transition-all ${p.popular ? "card-glow-orange shadow-glow-orange" : "card"}`}>
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 btn-orange text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="text-white font-bold text-lg mb-1">{p.name}</div>
              <div className="mb-1">
                <span className="text-3xl font-black text-grad-orange">{p.price}</span>
                <span className="text-gray-500 text-sm">{p.period}</span>
              </div>
              <div className="text-gray-500 text-xs">{p.desc}</div>
            </div>
          ))}
        </div>
        <Link href="/pricing" className="text-grad-orange text-sm font-medium hover:opacity-80 transition-opacity">
          See full plan details →
        </Link>
      </section>

      {/* ── CTA ── */}
      <section className="relative max-w-3xl mx-auto px-6 pb-28 text-center">
        <div className="relative rounded-3xl p-12 overflow-hidden border border-orange/20"
          style={{ background: "linear-gradient(145deg, rgba(255,107,53,0.12) 0%, rgba(255,181,71,0.06) 50%, rgba(15,22,38,0.8) 100%)" }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,107,53,0.2) 0%, transparent 70%)" }} />
          <h2 className="relative text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            Ready to make smarter<br />restaurant decisions?
          </h2>
          <p className="relative text-gray-400 mb-8 max-w-md mx-auto">
            Join restaurant operators using AI to find better locations, fix review issues, and outposition competitors.
          </p>
          <Link href="/signup"
            className="inline-block btn-orange text-white font-bold px-12 py-4 rounded-2xl text-lg">
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative border-t border-brd/60 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 btn-orange rounded-lg flex items-center justify-center font-black text-white text-sm">R</div>
            <span className="text-white font-bold">RestaurantIQ</span>
            <span className="text-gray-600 text-sm ml-2">AI-powered restaurant intelligence</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/login"   className="hover:text-white transition-colors">Login</Link>
            <Link href="/signup"  className="hover:text-white transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
