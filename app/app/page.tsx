const sectors = [
  "Public houses",
  "Hotels",
  "Quick Service Restaurants",
  "Fine Dining",
  "Contract Catering",
];

const features = [
  ["📊", "Invoice analysis", "Understand supplier spending and identify changes in purchasing costs."],
  ["🍽️", "Menu profitability", "Review dish costs, selling prices and gross profit margins."],
  ["♻️", "Waste management", "Identify waste patterns and opportunities to reduce unnecessary costs."],
  ["📦", "Supplier insights", "Keep track of supplier prices and purchasing trends."],
  ["💷", "Cost control", "Understand where your money goes and where improvements may be possible."],
  ["📈", "Business insights", "Turn your numbers into practical actions for your business."],
];

const steps = [
  ["01", "Add your information", "Bring together your invoices, costs and business figures."],
  ["02", "Understand the numbers", "Review your costs, margins and spending patterns."],
  ["03", "Take action", "Use practical insights to make better business decisions."],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#111318] text-[#f4f1ea]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between border-b border-white/10 px-6 py-6">
        <a href="#top" className="text-2xl font-black tracking-tight" id="top">
          Pantry<span className="text-[#d6b36a]">Pence</span>
        </a>
        <div className="flex items-center gap-5 text-sm font-semibold text-[#c2c3c6]">
          <a href="#features" className="hidden transition hover:text-[#d6b36a] sm:block">What we review</a>
          <a href="#how" className="hidden transition hover:text-[#d6b36a] sm:block">How it works</a>
          <a href="/login?next=%2Fmembers" className="rounded-full border border-white/20 px-5 py-3 transition hover:border-[#d6b36a] hover:text-[#e2c681]">Log in</a>
          <form action="/api/checkout" method="post">
            <button type="submit" className="rounded-full bg-[#d6b36a] px-5 py-3 font-bold text-[#171717] transition hover:bg-[#e4c989]">
              Get started
            </button>
          </form>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 md:grid-cols-[1.05fr_0.95fr] md:py-28">
        <div>
          <span className="mb-6 inline-flex rounded-full border border-[#d6b36a]/30 bg-[#d6b36a]/10 px-4 py-2 text-xs font-bold tracking-[0.18em] text-[#e2c681]">
            MONTHLY PROFIT &amp; MARGIN AUDITS
          </span>
          <h1 className="text-5xl font-semibold leading-[1.08] tracking-tight md:text-7xl">
            Make every
            <span className="block text-[#d6b36a]">penny count.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[#b3b5bb]">
            Take control of your food business finances. Understand your costs,
            improve your margins and discover where your money is going.
          </p>

          <div className="mt-9">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#858991]">
              Built for your sector
            </p>
            <div className="mt-4 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {sectors.map((sector) => (
                <div
                  key={sector}
                  className="flex min-h-16 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-3 py-4 text-center text-sm font-semibold text-[#e7e4dc] transition hover:border-[#d6b36a]/60 hover:bg-[#d6b36a]/[0.07]"
                >
                  {sector}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a href="/login?next=%2Ffiles" className="rounded-full bg-[#d6b36a] px-8 py-4 font-bold text-[#171717] transition hover:bg-[#e4c989]">
              Log in to your files
            </a>
            <form action="/api/checkout" method="post">
              <button
                type="submit"
                className="rounded-full border border-white/20 bg-transparent px-8 py-4 font-bold text-[#f4f1ea] transition hover:border-[#d6b36a] hover:text-[#e2c681]"
              >
                Get started today
              </button>
            </form>
          </div>
          <p className="mt-6 text-sm text-[#858991]">
            Independent, human-reviewed insight for hospitality businesses.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#252932] to-[#191c22] p-7 shadow-2xl shadow-black/30 md:p-10">
          <div aria-hidden="true" className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#d6b36a]/[0.08] blur-3xl" />
          <div className="relative">
            <p className="text-xs font-bold tracking-[0.2em] text-[#d6b36a]">
              YOUR BUSINESS, IN FOCUS
            </p>
            <h2 className="mt-4 text-3xl font-semibold">Know your numbers.</h2>
            <p className="mt-2 text-sm leading-6 text-[#aeb1b8]">
              A clearer view of the levers that shape your monthly profit.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                ["Food costs", "Understand spending"],
                ["Profit margins", "Protect profitability"],
                ["Waste", "Spot opportunities"],
                ["Purchasing", "Make smarter decisions"],
              ].map(([title, detail]) => (
                <div key={title} className="rounded-2xl border border-white/[0.07] bg-black/20 p-5">
                  <p className="text-sm font-semibold text-[#d6b36a]">{title}</p>
                  <p className="mt-3 text-sm text-[#e7e4dc]">{detail}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-[#d6b36a]/20 bg-[#d6b36a]/[0.08] p-5">
              <p className="font-semibold text-[#e9d39f]">Small improvements add up.</p>
              <p className="mt-1 text-sm text-[#b3b5bb]">Three practical actions, grounded in your numbers.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-y border-white/[0.06] bg-[#171a20] px-6 py-20 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d6b36a]">
              The monthly review
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Clarity for better decisions.
            </h2>
            <p className="mt-5 leading-7 text-[#aeb1b8]">
              Practical, human-reviewed analysis to help you understand performance
              and make more informed decisions.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {features.map(([icon, title, description]) => (
              <div key={title} className="rounded-2xl border border-white/[0.07] bg-[#1d2027] p-7 transition hover:border-[#d6b36a]/35">
                <div className="text-3xl" aria-hidden="true">{icon}</div>
                <h3 className="mt-5 text-lg font-semibold text-[#f4f1ea]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#aeb1b8]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="px-6 py-20 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d6b36a]">Simple by design</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">Better decisions start here.</h2>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {steps.map(([number, title, description]) => (
              <div key={number} className="border-t border-white/15 pt-6">
                <p className="text-sm font-bold tracking-[0.2em] text-[#d6b36a]">{number}</p>
                <h3 className="mt-4 text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#aeb1b8]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="border-y border-white/[0.06] bg-[#1b1e25] px-6 py-20 text-center md:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d6b36a]">PantryPence</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Your business deserves better numbers.
          </h2>
          <p className="mx-auto mt-6 max-w-xl leading-7 text-[#b3b5bb]">
            Discover a smarter way to understand your food business
            and make every penny work harder.
          </p>
          <a href="mailto:hello@pantrypence.co.uk" className="mt-9 inline-block rounded-full bg-[#d6b36a] px-9 py-4 font-bold text-[#171717] transition hover:bg-[#e4c989]">
            Contact PantryPence →
          </a>
        </div>
      </section>

      <footer className="bg-[#0b0d11] px-6 py-8 text-center text-sm text-[#858991]">
        © 2026 PantryPence. All rights reserved.
      </footer>
    </main>
  );
}
