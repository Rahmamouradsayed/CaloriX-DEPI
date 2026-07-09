// ═══════════════════════════════════════════
// CALORIX — HOME PAGE
// ═══════════════════════════════════════════

function renderHome() {
  const page = document.createElement('div');
  page.innerHTML = `

    <!-- HERO -->
    <section class="hero">
      <div class="container">
        <div class="hero-inner">
          <div class="hero-content">
            <div class="hero-eyebrow anim-fade-up">AI-Powered Nutrition Intelligence</div>
            <h1 class="anim-fade-up delay-1">
              Eat with<br><em>intention.</em><br>Live fully.
            </h1>
            <p class="hero-desc anim-fade-up delay-2">
              CaloriX combines machine learning and natural language processing to give you personalized food recommendations, precise calorie tracking, and a nutrition assistant that truly understands you.
            </p>
            <div class="hero-actions anim-fade-up delay-3">
              <button class="btn btn-primary" onclick="Router.navigate('/chat')" style="font-size:1rem;padding:1rem 2.2rem">
                ✦ Chat with AI
              </button>
              <button class="btn btn-ghost" onclick="Router.navigate('/recipes')" style="font-size:1rem;padding:1rem 2.2rem">
                Browse Recipes →
              </button>
            </div>
            <div class="hero-social-proof anim-fade-up delay-4">
              <div class="avatar-stack">
                <div class="av">👨</div><div class="av">👩</div><div class="av">🧑</div><div class="av">👨‍🦱</div>
              </div>
              <span><strong>5,000+</strong> meals planned this week</span>
            </div>
          </div>

          <div class="hero-visual anim-fade-left delay-2">
            <div class="hero-bg-blob blob-slow"></div>

            <div class="hero-card-main float">
              <h4>Today's Meal Plan</h4>
              <div class="hero-macro-row">
                <div class="hero-macro">
                  <div class="val" style="color:var(--saffron)">1,840</div>
                  <div class="lbl">kcal</div>
                </div>
                <div class="hero-macro">
                  <div class="val" style="color:#5B8CF0">124g</div>
                  <div class="lbl">protein</div>
                </div>
                <div class="hero-macro">
                  <div class="val" style="color:var(--gold)">198g</div>
                  <div class="lbl">carbs</div>
                </div>
                <div class="hero-macro">
                  <div class="val" style="color:#E87A5A">62g</div>
                  <div class="lbl">fat</div>
                </div>
              </div>
              <div style="background:var(--cream-dark);border-radius:12px;padding:0.8rem;display:flex;gap:0.8rem;align-items:center">
                <span style="font-size:1.8rem">🍗</span>
                <div>
                  <div style="font-weight:600;font-size:0.9rem">Grilled Chicken Breast</div>
                  <div style="font-size:0.75rem;color:var(--text3)">323 kcal · 34g protein · 27 min</div>
                </div>
                <span class="tag tag-sage" style="margin-left:auto">Top pick</span>
              </div>
              <div style="margin-top:0.8rem">
                <div style="font-size:0.75rem;font-weight:600;color:var(--text3);margin-bottom:0.4rem">Daily Progress</div>
                <div class="progress-track">
                  <div class="progress-fill calories" style="width:62%;background:linear-gradient(90deg,var(--saffron),var(--gold))"></div>
                </div>
                <div style="font-size:0.72rem;color:var(--text3);margin-top:0.3rem">1,840 / 2,000 kcal</div>
              </div>
            </div>

            <div class="hero-ai-bubble float-slow" style="animation-delay:0.5s">
              I found 3 high-protein recipes under 350 kcal perfect for your goal 🎯
            </div>

            <div class="hero-floating-badge float" style="animation-delay:1s">
              <div class="badge-icon">🏆</div>
              <div class="badge-text">
                <strong>Health Score 85</strong>
                <span>Salmon with Asparagus</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section class="features-section section">
      <div class="container">
        <div class="section-header reveal">
          <span class="section-eyebrow">What CaloriX offers</span>
          <h2>Everything you need to eat better</h2>
          <p style="margin-top:1rem">From AI-powered conversations to real-time calorie tracking — CaloriX is your complete nutrition companion.</p>
        </div>
        <div class="grid-2" style="gap:2rem">
          <div class="feature-card-big reveal delay-1">
            <div class="feature-icon-wrap" style="background:rgba(232,135,58,0.1)">🤖</div>
            <h3>AI Nutrition Chatbot</h3>
            <p>Ask anything in plain language — or Arabic. Our NLP engine understands your goals, dietary restrictions, and preferences to give personalized meal advice.</p>
            <button class="btn btn-ghost" style="margin-top:1.5rem" onclick="Router.navigate('/chat')">Try Chat →</button>
          </div>
          <div class="feature-card-big reveal delay-2">
            <div class="feature-icon-wrap" style="background:rgba(122,158,126,0.1)">🍽️</div>
            <h3>Smart Recipe Explorer</h3>
            <p>Browse 1,000+ recipes filtered by calories, protein, cuisine, dietary goal, and cook time. Every recipe shows full macros and a health score.</p>
            <button class="btn btn-ghost" style="margin-top:1.5rem" onclick="Router.navigate('/recipes')">Explore →</button>
          </div>
          <div class="feature-card-big reveal delay-3">
            <div class="feature-icon-wrap" style="background:rgba(212,168,83,0.1)">📊</div>
            <h3>Live Calorie Tracker</h3>
            <p>Log meals and watch your daily macros update in real-time. Visual donut chart, macro breakdowns, and goal-based daily targets that persist between sessions.</p>
            <button class="btn btn-ghost" style="margin-top:1.5rem" onclick="Router.navigate('/tracker')">Start Tracking →</button>
          </div>
          <div class="feature-card-big reveal delay-4">
            <div class="feature-icon-wrap" style="background:rgba(91,140,240,0.1)">🎯</div>
            <h3>Personalized Goals</h3>
            <p>Set weight loss, muscle gain, or maintenance goals. The system adjusts macro targets dynamically — more protein for athletes, lower carbs for keto dieters.</p>
            <button class="btn btn-ghost" style="margin-top:1.5rem" onclick="Router.navigate('/tracker')">Set Goals →</button>
          </div>
        </div>

        <!-- Stats band -->
        <div class="stats-band reveal" style="margin-top:4rem">
          <div>
            <div class="stat-num" id="stat-recipes">0</div>
            <div class="stat-lbl">Recipes in database</div>
          </div>
          <div>
            <div class="stat-num" id="stat-cuisines">0</div>
            <div class="stat-lbl">World cuisines</div>
          </div>
          <div>
            <div class="stat-num" id="stat-score">0%</div>
            <div class="stat-lbl">NLP accuracy</div>
          </div>
          <div>
            <div class="stat-num" id="stat-users">0K+</div>
            <div class="stat-lbl">Meals planned</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="home-cta">
      <div class="container">
        <span class="section-eyebrow reveal">Ready to start?</span>
        <h2 class="reveal delay-1">Your healthier life<br>starts with one question.</h2>
        <p class="reveal delay-2">Ask CaloriX anything — no signup required. Get instant nutrition advice powered by real AI.</p>
        <div class="reveal delay-3" style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-top:2.5rem">
          <button class="btn btn-accent" style="font-size:1rem;padding:1rem 2.5rem" onclick="Router.navigate('/chat')">
            ✦ Start AI Chat
          </button>
          <button class="btn btn-ghost" style="font-size:1rem;padding:1rem 2rem" onclick="Router.navigate('/recipes')">
            Browse Recipes
          </button>
        </div>
      </div>
    </section>

    <footer style="text-align:center;padding:2.5rem;color:var(--text3);font-size:0.82rem;border-top:1px solid var(--border)">
      <p>© 2025 CaloriX · Built with ❤️ by Team DEPI · Mohamed Alaa · Youssif · Zeyad · Rahma · Ahmed · Abanob</p>
    </footer>
  `;

  // Start stat counters when visible
  const statObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(document.getElementById('stat-recipes'), 1000, 1600, '+');
        animateCounter(document.getElementById('stat-cuisines'), 50, 1400, '+');
        document.getElementById('stat-score').innerHTML = '';
        animateCounter(document.getElementById('stat-score'), 95, 1500, '%');
        document.getElementById('stat-users').textContent = '5K+';
        statObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });
  setTimeout(() => {
    const band = page.querySelector('.stats-band');
    if (band) statObserver.observe(band);
  }, 100);

  return page;
}
