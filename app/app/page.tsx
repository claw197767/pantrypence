export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f7ef] text-[#183b2b]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="text-2xl font-black tracking-tight">
          Pantry<span className="text-[#8a9b50]">Pence</span>
        </div>
        <div className="flex items-center gap-5 text-sm font-semibold">
          <a href="#features" className="hidden sm:block">Features</a>
          <a href="#how" className="hidden sm:block">How it works</a>
          <form action="/api/checkout" method="post">
<button type="submit" className="rounded-full bg-[#183b2b] px-5 py-3 text-white">
            Get started
          </button>
</form>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-1 md:py-28">
        <div>
          <span className="mb-6 inline-block rounded-full bg-[#e7ead8] px-4 py-2 text-sm font-bold text-[#536b37]">
            SMARTER NUMBERS. STRONGER BUSINESSES.
          </span>
          <h1 className="text-5xl font-black leading-tight tracking-tight md:text-7xl">
            Make every
            <span className="block text-[#8a9b50]">penny count.</span>
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-[#647266]">
            Take control of your food business finances.
            Understand your costs, improve your margins
            and discover where your money is going.
          </p>
          <div className="mt-9 flex flex-wrap gap-4"> 
<form action= "/api/checkout" method="post">
    <button
    type="submit"
    className="rounded-full bg [#183b2b] px-8 py-4 font-bold text-white"
    >
        get started today
    </button>
    </form>
            <a href="#features" className="rounded-full border border-[#183b2b] px-8 py-4 font-bold">
              Explore features
            </a>
          </div>
          <p className="mt-6 text-sm text-[#7c887b]">
            Built for independent restaurants, cafes and food businesses.
          </p>
        </div>

        <div className="rounded-3xl bg-[#183b2b] p-7 text-white shadow-2xl md:p-10">
          <p className="text-sm font-semibold tracking-widest text-[#c5d19b]">
            YOUR BUSINESS AT A GLANCE
          </p>
          <h2 className="mt-3 text-3xl font-bold">Know your numbers.</h2>
          <div className="mt-9 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-sm text-[#c5d19b]">Food costs</p>
              <p className="mt-3 text-3xl font-bold">Track</p>
              <p className="mt-2 text-xs text-white/60">Understand spending</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-sm text-[#c5d19b]">Profit margins</p>
              <p className="mt-3 text-3xl font-bold">Improve</p>
              <p className="mt-2 text-xs text-white/60">Protect profitability</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-sm text-[#c5d19b]">Waste</p>
              <p className="mt-3 text-3xl font-bold">Reduce</p>
              <p className="mt-2 text-xs text-white/60">Spot opportunities</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-sm text-[#c5d19b]">Purchasing</p>
              <p className="mt-3 text-3xl font-bold">Control</p>
              <p className="mt-2 text-xs text-white/60">Make smarter decisions</p>
            </div>
          </div>
          <div className="mt-6 rounded-2xl bg-[#c5d19b] p-5 text-[#183b2b]">
            <p className="font-bold">Small improvements add up.</p>
            <p className="mt-1 text-sm">Make better decisions with clearer business insights.</p>
          </div>
        </div>
      </section>

      <section id="features" className="bg-white px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="font-bold uppercase tracking-widest text-[#8a9b50]">
              Everything in one place
            </p>
            <h2 className="mt-4 text-4xl font-black">
              Run a smarter food business.
            </h2>
            <p className="mt-5 leading-7 text-[#647266]">
              Practical tools to help you understand performance
              and make more informed decisions.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              ["📊", "Invoice analysis", "Understand supplier spending and identify changes in purchasing costs."],
              ["🍽️", "Menu profitability", "Review dish costs, selling prices and gross profit margins."],
              ["♻️", "Waste management", "Identify waste patterns and opportunities to reduce unnecessary costs."],
              ["📦", "Supplier insights", "Keep track of supplier prices and purchasing trends."],
              ["💷", "Cost control", "Understand where your money goes and where improvements may be possible."],
              ["📈", "Business insights", "Turn your numbers into practical actions for your business."]
            ].map(([icon, title, description]) => (
              <div key={title} className="rounded-3xl bg-[#f7f7ef] p-8">
                <div className="text-4xl">{icon}</div>
                <h3 className="mt-5 text-xl font-bold">{title}</h3>
                <p className="mt-3 leading-7 text-[#647266]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <p className="font-bold uppercase tracking-widest text-[#8a9b50]">Simple by design</p>
          <h2 className="mt-4 text-4xl font-black">Better decisions start here.</h2>
          <div className="mt-12 grid gap-8 text-left md:grid-cols-3">
            {[
              ["01", "Add your information", "Bring together your invoices, costs and business figures."],
              ["02", "Understand the numbers", "Review your costs, margins and spending patterns."],
              ["03", "Take action", "Use practical insights to make better business decisions."]
            ].map(([number, title, description]) => (
              <div key={number}>
                <p className="text-4xl font-black text-[#8a9b50]">{number}</p>
                <h3 className="mt-4 text-xl font-bold">{title}</h3>
                <p className="mt-3 leading-7 text-[#647266]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-[#183b2b] px-6 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-4xl font-black md:text-5xl">
            Your business deserves better numbers.
          </h2>
          <p className="mx-auto mt-6 max-w-xl leading-7 text-white/70">
            Discover a smarter way to understand your food business
            and make every penny work harder.
          </p>
          <a href="mailto:hello@pantrypence.co.uk" className="mt-9 inline-block rounded-full bg-[#c5d19b] px-9 py-4 font-bold text-[#183b2b]">
            Contact PantryPence →
          </a>
        </div>
      </section>

      <footer className="bg-[#102a1e] px-6 py-8 text-center text-sm text-white/60">
        © 2026 PantryPence. All rights reserved.
      </footer>
    </main>
  );
}