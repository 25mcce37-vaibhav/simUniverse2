let isChatProcessing = false;
let conversationHistory = [];
let currentUser = '';
let currentTopic = '';
let currentSubtopic = '';
let currentBreadcrumbTopic = '';

// STARS BACKGROUND
(function () {
  const c = document.getElementById('stars-canvas');
  const ctx = c.getContext('2d');
  let stars = [];
  function resize() {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      r: Math.random() * 1.5 + 0.2, a: Math.random(), da: Math.random() * 0.005 + 0.002
    }));
  }
  window.addEventListener('resize', resize);
  resize();
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    stars.forEach(s => {
      s.a += s.da;
      if (s.a > 1 || s.a < 0) s.da = -s.da;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180,160,255,${s.a * 0.7})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();



// NAVIGATION
function goHome(updateUrl = true) {
  if (updateUrl) history.pushState({}, '', '/');
  hide(['learning-screen', 'simulation-screen', 'engineering-screen']);
  show('topic-screen');
  document.getElementById('chat-panel').style.display = 'block';
  show('topic-screen');
  document.getElementById('chat-panel').style.display = 'none';
  document.getElementById('nav-breadcrumb').innerHTML = '';
  stopSim();
  setBreadcrumb([]);
}

function goToLearning(updateUrl = true) {
  if (currentTopic && updateUrl) {
    history.pushState({}, '', `/lessons/${currentTopic}`);
  }
  hide(['topic-screen', 'simulation-screen', 'engineering-screen']);
  show('learning-screen');
  document.getElementById('chat-panel').style.display = 'block';
  stopSim();
}

function show(id) { document.getElementById(id).style.display = 'block'; }
function hide(ids) { ids.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; }); }

function setBreadcrumb(parts, topicKey = null) {
  // Store the topic key for potential click action on the topic part
  currentBreadcrumbTopic = topicKey;

  // Build clickable breadcrumb items
  const items = parts.map((p, i) => {
    let content = p;
    let clickHandler = '';

    if (i === 0) {
      // First part: "SIMU-VERSE" – click goes to home
      clickHandler = `onclick="goHome()" style="cursor:pointer; text-decoration:underline;"`;
    }
    else if (i === 1 && topicKey) {
      // Second part: topic name – click goes to learning screen for that topic
      // Use the stored topicKey to call selectTopic
      clickHandler = `onclick="selectTopic('${topicKey}')" style="cursor:pointer; text-decoration:underline;"`;
    }
    else {
      // Last part (or any other) – not clickable
      clickHandler = '';
    }

    const isLast = (i === parts.length - 1);
    const separator = isLast ? '' : ' <span>›</span>';

    if (clickHandler) {
      return `<span ${clickHandler}>${content}</span>${separator}`;
    } else {
      return `<span>${content}</span>${separator}`;
    }
  }).join('');

  document.getElementById('nav-breadcrumb').innerHTML = items;
}

// TOPIC DATA
const TOPICS = {
  wave: {
    name: 'Wave Interference & Diffraction',
    subtopics: [
      { id: 'double', name: "Young's Double Slit", desc: 'Two coherent sources, interference patterns on screen' },
      { id: 'single', name: 'Single Slit Diffraction', desc: 'Wave bends and spreads through a narrow aperture' }
    ],
    concepts: [
      { eq: 'Δ = d·sinθ', label: 'Path Difference' },
      { eq: 'd·sinθ = nλ', label: 'Bright Fringes (double slit)' },
      { eq: 'a·sinθ = mλ', label: 'Dark Fringes (single slit)' },
      { eq: 'β = λD/d', label: 'Fringe Width' },
      { eq: 'I ∝ cos²(δ/2)', label: 'Intensity Distribution' }
    ],
    info: 'Wave optics explains phenomena where light behaves as a wave. When coherent light passes through slits, waves from different sources overlap and superpose — creating bright and dark fringes based on constructive and destructive interference.'
  },
  projectile: {
    name: 'Projectile Motion & Energy Conservation',
    subtopics: [
      { id: 'block', name: 'Oblique Projectile', desc: 'Block launched at angle θ with initial velocity v₀' }
    ],
    concepts: [
      { eq: 'x = v₀cosθ · t', label: 'Horizontal displacement' },
      { eq: 'y = v₀sinθ·t - ½gt²', label: 'Vertical displacement' },
      { eq: 'R = v₀²sin2θ/g', label: 'Horizontal Range' },
      { eq: 'H = v₀²sin²θ/2g', label: 'Maximum Height' },
      { eq: 'KE + PE = const', label: 'Energy Conservation' }
    ],
    info: 'A projectile moves under gravity alone (ignoring air resistance). The horizontal and vertical motions are independent. Total mechanical energy (KE + PE) remains constant throughout the flight — a beautiful example of energy conservation.'
  },
  electric: {
    name: 'Electric Field & Potential',
    subtopics: [
      { id: 'single', name: 'Single Charge Field', desc: 'Electric field and potential of one point charge' },
      { id: 'multi', name: 'Multiple Charges', desc: 'Superposition of fields from several charges' }
    ],
    concepts: [
      { eq: 'E = kq/r²', label: 'Electric Field' },
      { eq: 'V = kq/r', label: 'Electric Potential' },
      { eq: 'F = qE', label: 'Force on Test Charge' },
      { eq: 'E = -∇V', label: 'Field from Potential' },
      { eq: 'k = 9×10⁹ Nm²/C²', label: "Coulomb's Constant" }
    ],
    info: 'Electric fields radiate outward from positive charges and inward toward negative ones. Equipotential surfaces are perpendicular to field lines, and no work is done moving a charge along them. The superposition principle governs multi-charge systems.'
  }
};


function openEngineeringApplications(topic, updateUrl = true) {
  const topicKey = topic || currentTopic;
  const data = TOPICS[topicKey];
  if (!data || typeof EngineeringApplications !== 'function') return;

  currentTopic = topicKey;
  hide(['topic-screen', 'learning-screen', 'simulation-screen']);
  show('engineering-screen');
  document.getElementById('chat-panel').style.display = 'block';
  document.getElementById('chat-panel').style.display = 'none';
  stopSim();
  setBreadcrumb(['SIMU-VERSE', data.name, 'Engineering Applications'], topicKey);

  const screen = document.getElementById('engineering-screen');
  screen.innerHTML = EngineeringApplications({
    topicKey,
    topics: TOPICS,
    onBack: `selectTopic('${topicKey}')`,
    onOpenLesson: `selectTopic('${topicKey}')`
  });

  if (updateUrl) {
    history.pushState({}, '', `/lessons/${topicKey}/engineering-applications`);
  }
}

function handleRoute() {
  const lessonMatch = window.location.pathname.match(/^\/lessons\/([^/]+)(?:\/(engineering-applications|engineering))?\/?$/);
  if (!lessonMatch) return false;

  const [, topicKey, section] = lessonMatch;
  if (!TOPICS[topicKey]) return false;

  if (section) {
    openEngineeringApplications(topicKey, false);
  } else {
    selectTopic(topicKey, false);
    history.replaceState({}, '', `/lessons/${topicKey}`);
  }
  return true;
}

window.addEventListener('popstate', () => {
  if (!handleRoute()) goHome(false);
});
// ============================================================
// EVALUATION QUESTIONS (MCQs with numericals)
// ============================================================
const evaluationQuestions = {
  wave: [
    { text: "In Young's double slit experiment, the condition for constructive interference is:", options: ["d sinθ = (n+½)λ", "d sinθ = nλ", "a sinθ = nλ", "d sinθ = (2n+1)λ/2"], correct: 1, explanation: "Constructive interference occurs when the path difference is an integer multiple of wavelength." },
    { text: "The fringe width (β) in YDSE is given by:", options: ["λD/d", "λd/D", "Dd/λ", "λD/a"], correct: 0, explanation: "β = λD/d, where λ is wavelength, D is screen distance, d is slit separation." },
    { text: "If the slit separation is doubled in YDSE, the fringe width becomes:", options: ["double", "half", "same", "four times"], correct: 1, explanation: "β ∝ 1/d, so doubling d halves β." },
    { text: "A light of wavelength 600 nm is used in YDSE with slit separation 0.5 mm and screen distance 1 m. The fringe width is:", options: ["1.2 mm", "0.6 mm", "1.2 cm", "0.6 cm"], correct: 0, explanation: "β = (600e-9 * 1) / (0.5e-3) = 1.2e-3 m = 1.2 mm." },
    { text: "In single slit diffraction, the condition for first dark fringe is:", options: ["a sinθ = λ", "a sinθ = 2λ", "a sinθ = λ/2", "a sinθ = 3λ/2"], correct: 0, explanation: "First minimum: a sinθ = λ." },
    { text: "The central maximum width in single slit diffraction is:", options: ["2λD/a", "λD/a", "λD/2a", "2λa/D"], correct: 0, explanation: "Central maximum width = 2λD/a." },
    { text: "If slit width is reduced in single slit diffraction, the pattern becomes:", options: ["narrower", "wider", "brighter", "unchanged"], correct: 1, explanation: "Smaller a gives larger spread (wider pattern)." },
    { text: "In YDSE, if the whole apparatus is immersed in water (n=4/3), the fringe width will:", options: ["increase by factor 4/3", "decrease by factor 4/3", "remain same", "become zero"], correct: 1, explanation: "λ decreases by n, so β decreases by factor n." },
    { text: "Coherent sources are those having:", options: ["same frequency and constant phase difference", "same amplitude", "same intensity", "same wavelength only"], correct: 0, explanation: "Coherence requires constant phase difference and same frequency." },
    { text: "The phenomenon of light bending around edges is called:", options: ["interference", "diffraction", "polarisation", "refraction"], correct: 1, explanation: "Diffraction is bending of waves around obstacles." }
  ],
  projectile: [
    { text: "The horizontal component of velocity in projectile motion:", options: ["increases with time", "decreases with time", "remains constant", "becomes zero at peak"], correct: 2, explanation: "No horizontal acceleration, so Vx constant." },
    { text: "At maximum height, the vertical velocity of a projectile is:", options: ["maximum", "minimum", "zero", "equal to horizontal velocity"], correct: 2, explanation: "Vy = 0 at peak." },
    { text: "The range of a projectile is maximum when the launch angle is:", options: ["30°", "45°", "60°", "90°"], correct: 1, explanation: "R = u² sin2θ/g, max when sin2θ=1 → θ=45°." },
    { text: "A projectile is thrown with speed 20 m/s at 30°. The maximum height attained is (g=10 m/s²):", options: ["5 m", "10 m", "15 m", "20 m"], correct: 0, explanation: "H = u² sin²θ/2g = (400 * 0.25)/20 = 5 m." },
    { text: "Time of flight for a projectile is given by:", options: ["2u sinθ/g", "u sinθ/g", "2u cosθ/g", "u cosθ/g"], correct: 0, explanation: "T = 2u sinθ/g." },
    { text: "At the highest point, the kinetic energy is:", options: ["zero", "maximum", "equal to initial KE", "minimum but not zero"], correct: 3, explanation: "KE = ½m (u cosθ)², not zero because horizontal velocity remains." },
    { text: "A projectile's trajectory equation is y = x tanθ - (g x²)/(2u² cos²θ). This represents a:", options: ["circle", "ellipse", "parabola", "hyperbola"], correct: 2, explanation: "It's a parabola." },
    { text: "Two projectiles launched at 30° and 60° have same:", options: ["range", "height", "time of flight", "all of these"], correct: 0, explanation: "Complementary angles give same range." },
    { text: "If initial speed is doubled, the maximum height becomes:", options: ["double", "four times", "half", "unchanged"], correct: 1, explanation: "H ∝ u², so four times." },
    { text: "The horizontal range of a projectile is 40 m when launched at 45°. The initial speed (g=10) is:", options: ["20 m/s", "10 m/s", "15 m/s", "25 m/s"], correct: 0, explanation: "R = u²/g => 40 = u²/10 => u=20 m/s." }
  ],
  electric: [
    { text: "Electric field lines originate from:", options: ["negative charges", "positive charges", "both", "none"], correct: 1, explanation: "Lines start at positive charges and end at negative." },
    { text: "The electric field due to a point charge q at distance r is:", options: ["kq/r", "kq/r²", "kq/r³", "kq²/r"], correct: 1, explanation: "E = kq/r²." },
    { text: "Electric potential is a:", options: ["scalar", "vector", "tensor", "none"], correct: 0, explanation: "Potential is scalar." },
    { text: "Two charges 2 μC and -2 μC are 10 cm apart. The electric field at the midpoint is:", options: ["zero", "non-zero", "infinite", "cannot be determined"], correct: 1, explanation: "Fields add in same direction, not zero." },
    { text: "The SI unit of electric field is:", options: ["N/C", "V/m", "both A and B", "J/C"], correct: 2, explanation: "Both N/C and V/m are correct." },
    { text: "The work done to move a charge along an equipotential surface is:", options: ["maximum", "minimum", "zero", "negative"], correct: 2, explanation: "ΔV=0 so W=0." },
    { text: "The potential at a distance r from a point charge q is V = kq/r. If r is doubled, V becomes:", options: ["half", "double", "one-fourth", "same"], correct: 0, explanation: "V ∝ 1/r." },
    { text: "Coulomb's constant k = 9×10⁹ has units:", options: ["Nm²/C²", "Nm/C", "N/C", "J/C"], correct: 0, explanation: "k = 9×10⁹ Nm²/C²." },
    { text: "Two like charges of 1 μC each are 1 m apart. The force between them is:", options: ["9×10³ N", "9×10⁹ N", "9×10⁻³ N", "9 N"], correct: 0, explanation: "F = 9e9 * (1e-6 * 1e-6)/1² = 9e-3 N." },
    { text: "An electric dipole consists of charges +q and -q separated by 2a. The dipole moment is:", options: ["q×2a", "q×a", "2q×a", "q²×2a"], correct: 0, explanation: "p = q × distance between charges = q×2a." }
  ]
};
// ============================================================
// QUIZ / EVALUATION LOGIC
// ============================================================
let currentQuizTopic = '';
let currentQuestionIndex = 0;
let userAnswers = [];   // array to store selected option index for each question
let quizData = [];

function loadQuiz(topic) {
  currentQuizTopic = topic;
  quizData = evaluationQuestions[topic];
  if (!quizData) {
    console.error("No questions for topic", topic);
    return;
  }
  userAnswers = new Array(quizData.length).fill(null);
  currentQuestionIndex = 0;
  document.getElementById('quizTitle').innerHTML = `📝 ${topic.toUpperCase()} EVALUATION`;
  renderQuestion();
  // Show the modal
  document.getElementById('quizModal').classList.add('active');
  updateQuizNavButtons();
  document.getElementById('quizSubmitBtn').style.display = 'none';
}

function renderQuestion() {
  const q = quizData[currentQuestionIndex];
  if (!q) return;
  const body = document.getElementById('quizBody');
  body.innerHTML = `
        <div class="question-text">${currentQuestionIndex + 1}. ${q.text}</div>
        <div class="options-list" id="optionsList">
          ${q.options.map((opt, idx) => `
            <div class="quiz-option ${userAnswers[currentQuestionIndex] === idx ? 'selected' : ''}" data-opt-index="${idx}">
              <div class="quiz-option-letter">${String.fromCharCode(65 + idx)}</div>
              <div class="quiz-option-text">${opt}</div>
            </div>
          `).join('')}
        </div>
      `;
  // Attach click listeners to options
  document.querySelectorAll('.quiz-option').forEach(optDiv => {
    optDiv.addEventListener('click', (e) => {
      const idx = parseInt(optDiv.dataset.optIndex);
      // update userAnswers
      userAnswers[currentQuestionIndex] = idx;
      // re-render to show selection highlight
      renderQuestion();
    });
  });
  document.getElementById('quizCounter').innerText = `Question ${currentQuestionIndex + 1} / ${quizData.length}`;
}

function updateQuizNavButtons() {
  const prevBtn = document.getElementById('quizPrevBtn');
  const nextBtn = document.getElementById('quizNextBtn');
  prevBtn.disabled = (currentQuestionIndex === 0);
  if (currentQuestionIndex === quizData.length - 1) {
    nextBtn.style.display = 'none';
    document.getElementById('quizSubmitBtn').style.display = 'inline-block';
  } else {
    nextBtn.style.display = 'inline-block';
    document.getElementById('quizSubmitBtn').style.display = 'none';
  }
}

function nextQuestion() {
  if (currentQuestionIndex < quizData.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
    updateQuizNavButtons();
  }
}

function prevQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion();
    updateQuizNavButtons();
  }
}

function submitQuiz() {
  // Calculate score
  let score = 0;
  let incorrect = [];
  for (let i = 0; i < quizData.length; i++) {
    if (userAnswers[i] !== null && userAnswers[i] === quizData[i].correct) {
      score++;
    } else {
      incorrect.push({
        index: i,
        question: quizData[i].text,
        correctAnswer: quizData[i].options[quizData[i].correct],
        explanation: quizData[i].explanation
      });
    }
  }
  const percentage = (score / quizData.length) * 100;
  let feedback = "";
  if (percentage >= 80) feedback = "🎉 Excellent! You've mastered this topic!";
  else if (percentage >= 60) feedback = "👍 Good! Review the incorrect answers to improve.";
  else feedback = "📚 Needs improvement. Study the concepts and try again.";

  const body = document.getElementById('quizBody');
  body.innerHTML = `
        <div class="result-area">
          <h3>Evaluation Complete!</h3>
          <div class="result-score">${score} / ${quizData.length} (${percentage.toFixed(0)}%)</div>
          <div class="result-feedback">${feedback}</div>
          <div class="incorrect-list">
            ${incorrect.length > 0 ? '<strong>Review incorrect answers:</strong>' : '<strong>All answers correct! Well done.</strong>'}
            ${incorrect.map(inc => `
              <div class="incorrect-item">
                <b>Q${inc.index + 1}: ${inc.question}</b><br>
                Correct answer: ${inc.correctAnswer}<br>
                <span style="font-size:0.85rem; color:var(--text-muted);">💡 ${inc.explanation}</span>
              </div>
            `).join('')}
          </div>
          <button class="quiz-nav-btn" id="restartQuizBtn" style="margin-top:20px;">🔁 TRY AGAIN</button>
        </div>
      `;
  // Remove nav buttons and submit, only show restart
  document.getElementById('quizFooter').style.display = 'none';
  document.getElementById('restartQuizBtn').addEventListener('click', () => {
    // reset and restart quiz
    closeQuizModal();
    loadQuiz(currentQuizTopic);
  });
}

function closeQuizModal() {
  document.getElementById('quizModal').classList.remove('active');
  // Reset display of footer
  const footer = document.getElementById('quizFooter');
  if (footer) footer.style.display = 'flex';
}

// Attach event listeners for quiz controls (do once)
document.addEventListener('DOMContentLoaded', () => {
  const prevBtn = document.getElementById('quizPrevBtn');
  const nextBtn = document.getElementById('quizNextBtn');
  const submitBtn = document.getElementById('quizSubmitBtn');
  const closeBtn = document.getElementById('closeQuizBtn');
  if (prevBtn) prevBtn.addEventListener('click', prevQuestion);
  if (nextBtn) nextBtn.addEventListener('click', nextQuestion);
  if (submitBtn) submitBtn.addEventListener('click', submitQuiz);
  if (closeBtn) closeBtn.addEventListener('click', closeQuizModal);
});

// SELECT TOPIC - LEARNING SCREEN
function selectTopic(topic, updateUrl = true) {
  currentTopic = topic;
  const data = TOPICS[topic];
  hide(['topic-screen', 'simulation-screen', 'engineering-screen']);
  show('learning-screen');
  if (updateUrl) history.pushState({}, '', `/lessons/${topic}`);
  document.getElementById('chat-panel').style.display = 'block';
  setBreadcrumb(['SIMU-VERSE', data.name, 'Learning Phase'], topic);

  const accentRGB = topic === 'wave' ? '0,212,255' : topic === 'projectile' ? '0,255,159' : '255,107,43';
  const accent = topic === 'wave' ? 'var(--neon-blue)' : topic === 'projectile' ? 'var(--neon-green)' : 'var(--neon-orange)';

  // Build subtopic pill buttons
  const sl = document.getElementById('subtopic-list');
  sl.innerHTML = data.subtopics.map((s, i) => `
        <button id="stbtn-${s.id}" onclick="selectSubtopic('${s.id}')"
          style="padding:12px 22px; border-radius:12px; text-align:left; cursor:pointer; transition:all 0.2s;
          border:1px solid rgba(76, 201, 240, ${i === 0 ? '0.6' : '0.3'});
          background:rgba(26, 23, 48, ${i === 0 ? '0.9' : '0.7'});
          color:${i === 0 ? '#ffffff' : 'var(--text-secondary)'};
          font-family: 'Inter', sans-serif;">
          <div style="font-weight:700; letter-spacing:0.03em; margin-bottom:4px;">${s.name}</div>
          <div style="font-size:0.75rem; opacity:0.85;">${s.desc}</div>
        </button>
      `).join('');

  // Key concepts panel
  const info = document.getElementById('learning-info');
  info.innerHTML = `
    <div class="info-title">📘 Key Concepts</div>
    <p style="font-size:0.88rem;color:var(--muted);line-height:1.7;margin-bottom:20px;">${data.info}</p>
    <div class="key-concepts">
      ${data.concepts.map(c => `
        <div class="concept-pill">
          <div class="eq">${c.eq}</div>
          <div class="label">${c.label}</div>
        </div>`).join('')}
    </div>`;

  initChat(topic);
  selectSubtopic(data.subtopics[0].id);
  // Set default video for the first subtopic
  updateVideoForSubtopic(topic, currentSubtopic);
}

function selectSubtopic(id) {
  currentSubtopic = id;
  const topic = currentTopic;
  const data = TOPICS[topic];
  const sub = data.subtopics.find(s => s.id === id);
  const accentRGB = topic === 'wave' ? '0,212,255' : topic === 'projectile' ? '0,255,159' : '255,107,43';
  const accent = topic === 'wave' ? 'var(--neon-blue)' : topic === 'projectile' ? 'var(--neon-green)' : 'var(--neon-orange)';

  // Update button highlight
  data.subtopics.forEach(s => {
    const btn = document.getElementById('stbtn-' + s.id);
    if (!btn) return;
    const active = s.id === id;
    btn.style.borderColor = `rgba(${accentRGB},${active ? '0.5' : '0.2'})`;
    btn.style.background = `rgba(${accentRGB},${active ? '0.12' : '0.04'})`;
    btn.style.color = active ? accent : 'var(--muted)';
  });

  document.getElementById('video-title').textContent = sub.name;
  generateAILesson(topic, id, sub.name);
  // Update video when user switches subtopic
  updateVideoForSubtopic(currentTopic, id);
}

let lessonSlides = [];
let currentSlide = 0;
let autoPlayTimer = null;

const LESSON_PROMPTS = {
  'wave-double': `You are an expert physics teacher. Create exactly 6 teaching slides on Young's Double Slit Experiment. Respond ONLY with a valid JSON array of 6 objects, no markdown, no code fences. Each object must have: "title" (max 7 words), "narration" (3-4 clear sentences), "points" (array of 3-4 short bullets), "equation" (key equation or ""), "eqLabel" (label or ""), "concept" (one of: coherent_light, double_slit_setup, wavefronts, path_difference, fringe_pattern, fringe_formula). Cover: (1) coherent light and why it matters, (2) experimental setup laser+slits+screen, (3) circular wavefronts and overlap, (4) path difference d*sin(theta), (5) bright and dark fringes intensity pattern, (6) fringe width formula beta=lambdaD/d.`,
  'wave-single': `You are an expert physics teacher. Create exactly 6 teaching slides on Single Slit Diffraction. Respond ONLY with a valid JSON array of 6 objects, no markdown. Each object: "title", "narration" (3-4 sentences), "points" (3-4 bullets), "equation", "eqLabel", "concept" (one of: diffraction_intro, slit_geometry, huygens_wavelets, dark_fringe_condition, sinc_pattern, slit_effects). Cover: (1) what diffraction is, (2) single slit geometry width a, (3) Huygens wavelets from slit, (4) dark fringe a*sin(theta)=m*lambda, (5) sinc squared pattern, (6) effect of a and lambda.`,
  'projectile-block': `You are an expert physics teacher. Create exactly 6 teaching slides on Oblique Projectile Motion and Energy Conservation. Respond ONLY with a valid JSON array of 6 objects, no markdown. Each object: "title", "narration" (3-4 sentences), "points" (3-4 bullets), "equation", "eqLabel", "concept" (one of: projectile_intro, velocity_components, horizontal_motion, vertical_motion, energy_conservation, range_formula). Cover: (1) projectile definition only gravity, (2) velocity components Vx Vy, (3) horizontal uniform motion, (4) vertical deceleration, (5) KE+PE=constant, (6) range formula max at 45 degrees.`,
  'electric-single': `You are an expert physics teacher. Create exactly 6 teaching slides on Electric Field and Potential of a Point Charge. Respond ONLY with a valid JSON array of 6 objects, no markdown. Each object: "title", "narration" (3-4 sentences), "points" (3-4 bullets), "equation", "eqLabel", "concept" (one of: field_intro, coulombs_law, field_lines, electric_potential, equipotential, field_potential_link). Cover: (1) why define E, (2) Coulombs law, (3) field lines, (4) potential V=kq/r, (5) equipotential surfaces, (6) E=-dV/dr.`,
  'electric-multi': `You are an expert physics teacher. Create exactly 6 teaching slides on Electric Fields from Multiple Charges. Respond ONLY with a valid JSON array of 6 objects, no markdown. Each object: "title", "narration" (3-4 sentences), "points" (3-4 bullets), "equation", "eqLabel", "concept" (one of: superposition_intro, superposition_intro, electric_dipole, field_lines, potential_map, field_potential_link). Cover: (1) superposition principle, (2) vector addition of fields, (3) electric dipole, (4) dipole field lines, (5) potential scalar sum, (6) force on test charge.`
};

async function generateAILesson(topic, sub, name) {
  document.getElementById('vid-loading').style.display = 'flex';
  document.getElementById('vid-player').style.display = 'none';
  document.getElementById('vid-error').style.display = 'none';
  document.getElementById('video-title').textContent = name;
  document.getElementById('video-status').textContent = '🤖 NOVA is generating your lesson...';
  document.getElementById('loading-dots').style.display = 'flex';
  if (autoPlayTimer) { clearInterval(autoPlayTimer); autoPlayTimer = null; }

  const key = `${topic}-${sub}`;
  const prompt = LESSON_PROMPTS[key];
  if (!prompt) { showLessonError('No lesson template found.'); return; }

  try {
    const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:3000' : '';
    const res = await fetch(`${API_BASE}/api/lesson`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    const raw = data.text || '';
    const clean = raw.replace(/```json|```/g, '').trim();
    const slides = JSON.parse(clean);
    if (!Array.isArray(slides) || slides.length === 0) throw new Error('empty');
    lessonSlides = slides;
    currentSlide = 0;
    initSlidePlayer(topic, sub);
  } catch (e) {
    console.warn('API lesson failed, using fallback:', e);
    lessonSlides = getFallbackSlides(topic, sub);
    currentSlide = 0;
    initSlidePlayer(topic, sub);
  }
}

function showLessonError(msg) {
  document.getElementById('vid-loading').style.display = 'none';
  document.getElementById('vid-player').style.display = 'none';
  document.getElementById('vid-error').style.display = 'block';
  document.getElementById('error-msg').textContent = msg;
}

function retryLesson() {
  const sub = TOPICS[currentTopic].subtopics.find(s => s.id === currentSubtopic);
  generateAILesson(currentTopic, currentSubtopic, sub.name);
}

function initSlidePlayer(topic, sub) {
  document.getElementById('vid-loading').style.display = 'none';
  document.getElementById('vid-error').style.display = 'none';
  document.getElementById('vid-player').style.display = 'block';
  buildSlideDots();
  renderHTMLSlide(currentSlide, topic, sub);
}

function buildSlideDots() {
  const d = document.getElementById('slide-dots');
  d.innerHTML = lessonSlides.map((_, i) => `
    <div onclick="jumpSlide(${i})" style="
      width:${i === currentSlide ? 24 : 8}px;height:8px;border-radius:4px;
      background:${i === currentSlide ? 'var(--neon-blue)' : 'rgba(0,212,255,0.22)'};
      cursor:pointer;transition:all 0.3s;flex-shrink:0;"></div>`).join('');
}

function jumpSlide(i) {
  currentSlide = i;
  renderHTMLSlide(i, currentTopic, currentSubtopic);
  buildSlideDots();
  updateProgress();
}

function slideNav(dir) {
  currentSlide = Math.max(0, Math.min(lessonSlides.length - 1, currentSlide + dir));
  renderHTMLSlide(currentSlide, currentTopic, currentSubtopic);
  buildSlideDots();
  updateProgress();
}

function updateProgress() {
  const pct = ((currentSlide + 1) / lessonSlides.length * 100).toFixed(0);
  const bar = document.getElementById('slide-progress-bar');
  if (bar) bar.style.width = pct + '%';
  const ctr = document.getElementById('slide-counter');
  if (ctr) ctr.textContent = `SLIDE ${currentSlide + 1} / ${lessonSlides.length}`;
}

let autoPlaying = false;
function toggleAutoPlay() {
  autoPlaying = !autoPlaying;
  const btn = document.getElementById('btn-autoplay');
  if (autoPlaying) {
    btn.textContent = '⏸ PAUSE';
    btn.style.borderColor = 'rgba(255,107,43,0.4)';
    btn.style.color = 'var(--neon-orange)';
    autoPlayTimer = setInterval(() => {
      if (currentSlide < lessonSlides.length - 1) { slideNav(1); }
      else { toggleAutoPlay(); }
    }, 6000);
  } else {
    btn.style.borderColor = 'rgba(0,255,159,0.3)';
    btn.style.color = 'var(--neon-green)';
    btn.textContent = '▶ AUTO';
    if (autoPlayTimer) { clearInterval(autoPlayTimer); autoPlayTimer = null; }
  }
}

function renderHTMLSlide(idx, topic, sub) {
  const slide = lessonSlides[idx];
  if (!slide) return;
  const accent = topic === 'wave' ? '#00d4ff' : topic === 'projectile' ? '#00ff9f' : '#ff6b2b';
  const accentRGB = topic === 'wave' ? '0,212,255' : topic === 'projectile' ? '0,255,159' : '255,107,43';
  const container = document.getElementById('html-slide');
  const pointsHTML = (slide.points || []).map(p => `
    <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:10px;">
      <div style="width:6px;height:6px;border-radius:50%;background:${accent};margin-top:7px;flex-shrink:0;box-shadow:0 0 6px ${accent};"></div>
      <span style="font-size:0.93rem;color:rgba(224,217,255,0.88);line-height:1.55;">${p}</span>
    </div>`).join('');
  const svgDiagram = buildConceptSVG(slide.concept || '', topic, sub, accentRGB, accent);
  const eqHTML = slide.equation ? `
    <div style="display:inline-block;background:rgba(${accentRGB},0.1);border:1px solid rgba(${accentRGB},0.35);
      border-radius:12px;padding:14px 28px;margin-top:4px;text-align:center;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:1.2rem;font-weight:700;color:${accent};letter-spacing:0.04em;">${slide.equation}</div>
      ${slide.eqLabel ? `<div style="font-size:0.78rem;color:rgba(255,255,255,0.4);margin-top:5px;letter-spacing:0.08em;">${slide.eqLabel}</div>` : ''}
    </div>` : '';
  container.style.opacity = '0';
  container.style.transform = 'translateY(12px)';
  container.innerHTML = `
    <div style="height:3px;background:linear-gradient(90deg,${accent},transparent);border-radius:20px 20px 0 0;"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;min-height:477px;">
      <div style="padding:30px 28px 26px 30px;border-right:1px solid rgba(${accentRGB},0.1);display:flex;flex-direction:column;gap:18px;overflow-y:auto;">
        <div>
          <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(${accentRGB},0.1);border:1px solid rgba(${accentRGB},0.25);border-radius:20px;padding:3px 12px 3px 8px;margin-bottom:12px;">
            <div style="width:20px;height:20px;border-radius:50%;background:${accent};display:flex;align-items:center;justify-content:center;font-family:'Inter',monospace;font-size:0.6rem;font-weight:900;color:#03010a;">${idx + 1}</div>
            <span style="font-family:'Inter',monospace;font-size:0.62rem;font-weight:700;letter-spacing:0.15em;color:${accent};">SLIDE ${idx + 1} OF ${lessonSlides.length}</span>
          </div>
          <h2 style="font-family:'Inter',monospace;font-size:1rem;font-weight:700;color:#fff;line-height:1.4;letter-spacing:0.03em;margin:0;">${slide.title || ''}</h2>
        </div>
        <div style="background:rgba(255,255,255,0.03);border-left:3px solid rgba(${accentRGB},0.5);border-radius:0 10px 10px 0;padding:14px 16px;">
          <p style="font-size:0.93rem;color:rgba(224,217,255,0.9);line-height:1.75;margin:0;">${slide.narration || ''}</p>
        </div>
        <div>
          <div style="font-family:'Inter',monospace;font-size:0.62rem;font-weight:700;letter-spacing:0.2em;color:rgba(${accentRGB},0.7);margin-bottom:10px;">KEY POINTS</div>
          ${pointsHTML}
        </div>
        ${eqHTML ? `<div style="margin-top:auto;">${eqHTML}</div>` : ''}
      </div>
      <div style="display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(3,1,10,0.5);position:relative;overflow:hidden;">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,rgba(${accentRGB},0.04),transparent 70%);pointer-events:none;"></div>
        ${svgDiagram}
      </div>
    </div>`;
  requestAnimationFrame(() => {
    container.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    container.style.opacity = '1';
    container.style.transform = 'translateY(0)';
  });
  updateProgress();
}


function getFallbackSlides(topic, sub) {
  const key = topic + '-' + sub;
  const all = {
    'wave-double': [
      { title: "What is Coherent Light?", concept: "coherent_light", narration: "Coherent light has waves that are all in phase and share the same wavelength. A laser is the ideal source — unlike a bulb, every photon is synchronised. Without coherence, interference fringes wash out and disappear. This is why Young used a laser (or a pinhole+filter) in his experiment.", points: ["All waves have same phase", "Laser = perfect coherent source", "Needed for stable fringes", "Sunlight is incoherent — no stable pattern"], equation: "λ = constant", eqLabel: "Single wavelength required" },
      { title: "The Double Slit Setup", concept: "double_slit_setup", narration: "A laser beam hits a barrier with two thin slits S₁ and S₂ separated by distance d. A screen is placed at distance D from the barrier. Both slits act as independent coherent point sources. The arrangement is very simple — yet reveals the wave nature of light.", points: ["d = slit separation (mm range)", "D = screen distance (cm–m range)", "Both slits illuminated by same wave", "Screen shows bright/dark pattern"], equation: "d · sin θ = nλ", eqLabel: "Condition for bright fringe" },
      { title: "Circular Wavefronts Emerge", concept: "wavefronts", narration: "By Huygens' principle, each slit becomes a new point source emitting circular wavefronts. These wavefronts from S₁ and S₂ spread out and overlap in the space between barrier and screen. Where two crests meet, the waves add — constructive interference. Where a crest meets a trough, they cancel — destructive interference.", points: ["Each slit = new point source", "Wavefronts spread as semicircles", "Overlap creates interference", "Crests+crests → bright; crest+trough → dark"], equation: "", eqLabel: "" },
      { title: "Path Difference", concept: "path_difference", narration: "At any point P on the screen, wave from S₁ travels distance r₁ and wave from S₂ travels r₂. The path difference Δ = r₂ - r₁ determines the phase difference. For small angles, Δ = d · y / D where y is the position on screen. This is the key geometric relationship.", points: ["Δ = r₂ - r₁ = path difference", "Δ = d·sinθ (exact)", "Δ ≈ d·y/D (small angle approx)", "Δ = nλ → bright; Δ = (n+½)λ → dark"], equation: "Δ = d · y / D", eqLabel: "Path difference (small angle)" },
      { title: "Bright and Dark Fringes", concept: "fringe_pattern", narration: "Constructive interference (bright fringe) occurs whenever the path difference equals a whole number of wavelengths. Destructive interference (dark fringe) occurs for half-integer wavelengths. This produces the alternating bright-dark pattern — called Young's fringes — on the screen. The pattern is symmetric about the central bright fringe.", points: ["Bright: Δ = nλ  (n = 0, ±1, ±2...)", "Dark: Δ = (n+½)λ", "Central fringe is always bright (n=0)", "Pattern is equally spaced"], equation: "I = I₀ cos²(δ/2)", eqLabel: "Intensity distribution" },
      { title: "Fringe Width Formula", concept: "fringe_formula", narration: "The distance between two consecutive bright fringes is the fringe width β = λD/d. Increasing wavelength λ makes fringes wider. Increasing screen distance D also makes them wider. Increasing slit separation d makes fringes narrower. Try these in the simulation!", points: ["β = λD/d", "Larger λ → wider fringes", "Larger D → wider fringes", "Larger d → narrower fringes"], equation: "β = λD / d", eqLabel: "Fringe width" }
    ],
    'wave-single': [
      { title: "What is Diffraction?", concept: "diffraction_intro", narration: "Diffraction is the bending and spreading of waves when they pass through an opening or around an obstacle. It is most pronounced when the aperture width is comparable to the wavelength. A tiny slit causes light to spread in a wide fan — even into the geometric shadow region. This proves light behaves as a wave.", points: ["Waves bend around edges", "Most pronounced when a ≈ λ", "Light spreads into shadow region", "Proof of wave nature of light"], equation: "a ≈ λ", eqLabel: "Condition for significant diffraction" },
      { title: "Single Slit Geometry", concept: "slit_geometry", narration: "A single slit of width a is illuminated by a monochromatic plane wave. The slit width a is the key parameter — it controls how much the wave spreads. Smaller a means more spreading. The screen is at distance D. The diffraction pattern is measured as position y on the screen.", points: ["a = slit width (key parameter)", "Smaller a → more spreading", "D = distance to screen", "y = position on screen"], equation: "θ ≈ λ/a", eqLabel: "Angular spread (radians)" },
      { title: "Huygens Wavelets", concept: "huygens_wavelets", narration: "Huygens' principle states that every point across the slit acts as a secondary source of spherical wavelets. The diffraction pattern is found by adding (superposing) all these wavelets at the screen. Wavelets from different parts of the slit travel different path lengths to any screen point — creating a phase difference that determines intensity.", points: ["Each slit point = secondary source", "Wavelets spread as semicircles", "Path length varies across slit", "Phase difference → intensity variation"], equation: "", eqLabel: "" },
      { title: "Dark Fringe Condition", concept: "dark_fringe_condition", narration: "A dark fringe (minimum) occurs when waves from the top half and bottom half of the slit are exactly π out of phase and cancel. This happens when a · sinθ = mλ, where m = ±1, ±2,... The first dark fringe at m=1 defines the half-width of the central maximum. The narrower the slit, the wider the central maximum.", points: ["Dark fringe: a·sinθ = mλ", "m = ±1, ±2, ±3...", "First dark at y = λD/a", "Narrower slit → wider central max"], equation: "a · sinθ = mλ", eqLabel: "Condition for dark fringes" },
      { title: "The sinc² Intensity Pattern", concept: "sinc_pattern", narration: "The intensity at any point follows I = I₀ · sinc²(β) where β = π·a·sinθ/λ. The central maximum is twice as wide as secondary maxima. Secondary maxima are much dimmer than the centre (about 4.7% intensity). Most of the light energy is concentrated in the central bright maximum.", points: ["I = I₀ sinc²(πa sinθ/λ)", "Central max width = 2λD/a", "Secondary maxima at 1.5λD/a", "Secondary max ≈ 4.7% of centre"], equation: "I = I₀ sinc²(πa sinθ/λ)", eqLabel: "Diffraction intensity" },
      { title: "Effect of a and λ", concept: "slit_effects", narration: "Two parameters control the pattern: slit width a and wavelength λ. Halving the slit width doubles the central maximum width. Doubling the wavelength also doubles the spread. Red light (700nm) diffracts more than blue (400nm). In the simulation, drag the slit width slider and watch the pattern change live!", points: ["Smaller a → wider pattern", "Larger λ → wider pattern", "β₀ = 2λD/a (central max width)", "Red diffracts more than blue"], equation: "β₀ = 2λD / a", eqLabel: "Central maximum width" }
    ],
    'projectile-block': [
      { title: "What is a Projectile?", concept: "projectile_intro", narration: "A projectile is any object launched into the air that then moves only under the influence of gravity. After launch, no engine or thrust acts — only the downward gravitational force mg. Air resistance is ignored in ideal projectile motion. Examples: a thrown ball, a cannonball, a long-jumper.", points: ["Only gravity acts after launch", "No horizontal force → constant Vx", "Vertical: constant downward acceleration g", "Path is a parabola"], equation: "F = mg (downward only)", eqLabel: "Only force on projectile" },
      { title: "Resolving Velocity Components", concept: "velocity_components", narration: "The initial velocity v₀ at angle θ is split into two independent components. Horizontal: Vx = v₀cosθ — this stays constant throughout the flight. Vertical: Vy = v₀sinθ — this decreases due to gravity, reaches zero at the peak, then increases downward. The two components never affect each other.", points: ["Vx = v₀cosθ (constant forever)", "Vy = v₀sinθ - gt (changes)", "Components are independent", "Vector sum gives instantaneous velocity"], equation: "Vx = v₀cosθ,  Vy = v₀sinθ", eqLabel: "Initial velocity components" },
      { title: "Horizontal Motion", concept: "horizontal_motion", narration: "Horizontally, no force acts — so horizontal velocity Vx is constant throughout the flight. The projectile covers equal horizontal distances in equal time intervals. Horizontal displacement x = Vx · t = v₀cosθ · t. This is uniform motion — same as sliding on a frictionless surface.", points: ["No horizontal force → constant Vx", "x = v₀cosθ · t (uniform motion)", "Equal Δx in equal Δt", "Vx never changes, even at peak"], equation: "x = v₀ cosθ · t", eqLabel: "Horizontal displacement" },
      { title: "Vertical Motion", concept: "vertical_motion", narration: "Vertically, gravity decelerates the projectile at g = 9.8 m/s². The vertical velocity decreases linearly — at the peak, Vy = 0. Then gravity accelerates it back down. Vertical displacement y = v₀sinθ · t - ½gt². The time to reach the peak is t_peak = v₀sinθ/g.", points: ["Vy decreases at rate g", "Vy = 0 at maximum height", "y = v₀sinθ·t - ½gt²", "t_peak = v₀sinθ/g"], equation: "y = v₀sinθ · t - ½gt²", eqLabel: "Vertical displacement" },
      { title: "Energy Conservation", concept: "energy_conservation", narration: "Total mechanical energy E = KE + PE stays constant throughout the flight (no air resistance). As the projectile rises, KE converts to PE. At the peak, KE is minimum and PE is maximum. The speed at any height h can be found: v² = v₀² - 2gh. The total energy E = ½mv₀² is set at launch.", points: ["KE + PE = constant = ½mv₀²", "Rising: KE→PE; Falling: PE→KE", "At peak: KE = ½m·vx² (minimum)", "v² = v₀² - 2gh (speed at height h)"], equation: "½mv² + mgh = ½mv₀²", eqLabel: "Conservation of mechanical energy" },
      { title: "Range and Optimal Angle", concept: "range_formula", narration: "The total horizontal range R = v₀²sin2θ/g. This is maximised when sin2θ = 1, i.e. θ = 45°. The maximum height H = v₀²sin²θ/(2g) is greatest at θ = 90°. Complementary angles (e.g. 30° and 60°) give the same range. Try adjusting the angle in the simulation!", points: ["R = v₀²sin2θ/g", "Maximum range at θ = 45°", "H = v₀²sin²θ/2g", "30° and 60° give equal range"], equation: "R = v₀² sin2θ / g", eqLabel: "Horizontal range" }
    ],
    'electric-single': [
      { title: "Why Define Electric Field?", concept: "field_intro", narration: "Instead of describing the force between every pair of charges directly, we define the electric field E as the force per unit positive test charge at a point in space. E exists at every point around a charge, independent of whether a test charge is present. This lets us map the influence of a charge throughout space. E is a vector — it has both magnitude and direction.", points: ["E = F/q₀ (force per unit charge)", "E exists in space around any charge", "Direction: force on positive test charge", "E is a vector field"], equation: "E = F / q₀", eqLabel: "Definition of electric field" },
      { title: "Coulomb's Law", concept: "coulombs_law", narration: "Two point charges q₁ and q₂ separated by distance r exert forces on each other. The force is proportional to each charge and inversely proportional to r². Like charges repel; opposite charges attract. Coulomb's constant k = 9×10⁹ N·m²/C². This is the fundamental law governing all electrostatics.", points: ["F ∝ q₁·q₂ (product of charges)", "F ∝ 1/r² (inverse square law)", "Like charges repel, unlike attract", "k = 9×10⁹ N·m²/C²"], equation: "F = kq₁q₂ / r²", eqLabel: "Coulomb's Law" },
      { title: "Electric Field Lines", concept: "field_lines", narration: "Field lines are a visual tool to represent the electric field. They point in the direction a positive test charge would move. Lines radiate outward from positive charges and inward toward negative charges. Denser lines indicate a stronger field. Field lines never cross each other.", points: ["Point away from + charges", "Point toward - charges", "Denser = stronger field", "Lines never cross"], equation: "E = kq / r²", eqLabel: "Field magnitude at distance r" },
      { title: "Electric Potential V", concept: "electric_potential", narration: "Electric potential V at a point is the work done per unit charge to bring a positive test charge from infinity to that point. V = kq/r for a point charge. Unlike E, potential is a scalar — no direction, easier to calculate. Positive charges create positive potential; negative charges create negative potential.", points: ["V = work done per unit charge", "V = kq/r (scalar quantity)", "V > 0 near positive charges", "V < 0 near negative charges"], equation: "V = kq / r", eqLabel: "Electric potential" },
      { title: "Equipotential Surfaces", concept: "equipotential", narration: "Equipotential surfaces connect all points at the same potential V. For a point charge, they are spheres centred on the charge. Field lines are always perpendicular to equipotential surfaces. Moving a charge along an equipotential requires zero work, since ΔV = 0. This is why conductors in equilibrium are equipotential surfaces.", points: ["Same V at every point on surface", "Spheres for point charges", "Always ⊥ to field lines", "Zero work along equipotential"], equation: "W = q · ΔV = 0", eqLabel: "Work along an equipotential" },
      { title: "E and V are Linked", concept: "field_potential_link", narration: "The electric field points from high potential to low potential — it is the negative gradient of V. In one dimension: E = -dV/dr. The field is strongest where equipotentials are closely spaced. This relationship is powerful: compute V (scalar) first, then differentiate to get E (vector) — much easier than vector addition.", points: ["E points from high V to low V", "E = -dV/dr (gradient relationship)", "Close equipotentials → strong field", "Compute V first, then find E"], equation: "E = -dV/dr", eqLabel: "Field from potential gradient" }
    ],
    'electric-multi': [
      { title: "Superposition Principle", concept: "superposition_intro", narration: "When multiple charges are present, the total electric field at any point is the vector sum of fields from each individual charge. This is the superposition principle — electric fields add independently without affecting each other. Similarly, the total potential is the scalar sum of individual potentials. This principle underlies all of electrostatics.", points: ["E_net = ΣEᵢ (vector sum)", "Each charge contributes independently", "Fields don't interfere with each other", "Superposition is exact in electrostatics"], equation: "E_net = E₁ + E₂ + E₃ + ...", eqLabel: "Superposition of electric fields" },
      { title: "Adding Field Vectors", concept: "superposition_intro", narration: "To find the net field at point P, calculate E₁ and E₂ from each charge separately using E = kq/r². Each has a magnitude and a direction pointing away from (or toward) its source charge. Add them as vectors: break into x and y components, add components, recombine. The resultant gives the net field direction and magnitude.", points: ["Find E₁ and E₂ separately", "Direction: away from + , toward -", "Add as vectors (x and y components)", "Net field = vector resultant"], equation: "E_net = √(Ex² + Ey²)", eqLabel: "Magnitude of resultant field" },
      { title: "The Electric Dipole", concept: "electric_dipole", narration: "An electric dipole consists of two equal and opposite charges +q and -q separated by distance d. The dipole moment p = qd points from - to +. The field between the charges is strong and points from + to -. Far from the dipole, the field falls off as 1/r³, faster than a single charge (1/r²). Dipoles appear everywhere in chemistry and biology.", points: ["Equal and opposite charges ±q", "Dipole moment p = qd", "Strong field between charges", "Far field ∝ 1/r³"], equation: "p = qd", eqLabel: "Dipole moment" },
      { title: "Field Line Patterns", concept: "field_lines", narration: "For a positive-negative pair, field lines emerge from + and terminate on -. Lines curve from one charge to the other. In the region directly between the charges, field lines are dense — strongest field. Outside (perpendicular bisector region) lines curve outward and are less dense. No field lines ever cross.", points: ["Lines: + → -", "Dense between charges = strong E", "Lines curve — never straight for dipole", "No two lines can cross"], equation: "", eqLabel: "" },
      { title: "Potential of Multiple Charges", concept: "potential_map", narration: "The total electric potential at any point is simply the scalar sum V = Σ(kqᵢ/rᵢ). Scalars are much easier to add than vectors. For a +q and -q pair, V = 0 on the perpendicular bisector plane. Positive charges increase V; negative charges decrease it. Equipotential surfaces of a dipole are complex closed curves.", points: ["V = Σkqᵢ/rᵢ (scalar sum — easy!)", "V = 0 on bisector of dipole", "+q raises V; -q lowers V", "Equipotentials are complex curves"], equation: "V = Σ kqᵢ/rᵢ", eqLabel: "Total potential (scalar sum)" },
      { title: "Force on a Test Charge", concept: "field_potential_link", narration: "Once you know the net electric field E at a point, the force on any charge q₀ placed there is simply F = q₀ · E. For a positive q₀, force is in the field direction. For negative q₀, force is opposite to field. This is why mapping E first is so useful — you can instantly find the force on any charge without repeating all calculations.", points: ["F = q₀ · E_net", "Positive charge: F along E", "Negative charge: F opposite E", "One E calculation → forces on all charges"], equation: "F = q₀ · E_net", eqLabel: "Force on any test charge" }
    ]
  };
  return all[key] || all['wave-double'];
}


// SVG CONCEPT DIAGRAMS — one per slide concept

function buildConceptSVG(concept, topic, sub, accentRGB, accent) {
  const W = 340, H = 300;
  const svg = (inner) => `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"
    style="width:100%;max-width:340px;height:auto;filter:drop-shadow(0 0 12px rgba(${accentRGB},0.15));">${inner}</svg>`;

  const grd = `<defs>
    <radialGradient id="rg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(${accentRGB},0.12)"/>
      <stop offset="100%" stop-color="rgba(${accentRGB},0)"/>
    </radialGradient>
    <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="${accent}" opacity="0.85"/>
    </marker>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#rg)" rx="8"/>`;

  const txt = (x, y, s, col, sz = 11, anchor = 'middle', bold = false) =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Rajdhani,sans-serif"
     font-size="${sz}" fill="${col}" ${bold ? 'font-weight="700"' : ''}>${s}</text>`;
  const line = (x1, y1, x2, y2, col, w = 1.2, dash = '') =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${w}" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;
  const circle = (cx, cy, r, fill, stroke = 'none', sw = 1) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  const rect = (x, y, w, h, fill, stroke = 'none', rx = 4, sw = 1) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" rx="${rx}" stroke-width="${sw}"/>`;
  const arr = (x1, y1, x2, y2, col, w = 1.5) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${w}" marker-end="url(#arr)"/>`;

  // ─── wave / double slit concepts ───
  if (concept === 'coherent_light') {
    let waves = '';
    for (let i = 0; i < 4; i++) {
      const y = 80 + i * 40, phase = i * 0;
      let pts = '';
      for (let x = 30; x <= 300; x += 4) {
        const yy = y + 16 * Math.sin((x - 30) / 300 * 4 * Math.PI + phase);
        pts += (x === 30 ? 'M' : 'L') + x + ',' + yy.toFixed(1) + ' ';
      }
      waves += `<path d="${pts}" fill="none" stroke="${accent}" stroke-width="1.8" opacity="${0.4 + i * 0.15}"/>`;
    }
    return svg(grd + waves +
      txt(170, 260, 'All waves in phase → coherent', 'rgba(255,255,255,0.6)', 12) +
      txt(170, 20, 'Coherent Light Source', 'rgba(255,255,255,0.8)', 13, 'middle', true));
  }

  if (concept === 'double_slit_setup') {
    const bx = 130, s1 = 120, s2 = 160;
    return svg(grd +
      // laser beam
      `<rect x="10" y="134" width="80" height="12" fill="rgba(${accentRGB},0.15)" rx="3"/>
       <rect x="10" y="138" width="80" height="4" fill="${accent}" opacity="0.7" rx="2"/>
       ${txt(50, 128, 'Laser', 'rgba(255,255,255,0.6)', 10)}` +
      // rays
      `${line(90, 140, bx - 4, 140, `rgba(${accentRGB},0.5)`, 1.5)}
       ${line(90, 130, bx - 4, 130, `rgba(${accentRGB},0.3)`, 1)}
       ${line(90, 150, bx - 4, 150, `rgba(${accentRGB},0.3)`, 1)}` +
      // barrier
      `${rect(bx - 4, 10, 8, s1 - 16, 'rgba(200,170,80,0.9)')}
       ${rect(bx - 4, s1 + 6, 8, s2 - s1 - 12, 'rgba(200,170,80,0.9)')}
       ${rect(bx - 4, s2 + 6, 8, H - s2 - 16, 'rgba(200,170,80,0.9)')}
       ${rect(bx - 4, s1 - 6, 8, 12, `rgba(${accentRGB},0.2)`)}
       ${rect(bx - 4, s2 - 6, 8, 12, `rgba(${accentRGB},0.2)`)}` +
      // diverging rays
      [s1, s2].map(sy => [-40, -20, 0, 20, 40].map(a => {
        const ex = bx + 160, ey = sy + a * 1.5;
        return line(bx, sy, ex, ey, `rgba(${accentRGB},0.2)`, 1);
      }).join('')).join('') +
      // screen
      `${rect(285, 20, 8, H - 40, 'rgba(100,80,30,0.8)')}
       ${txt(289, H - 10, 'Screen', 'rgba(255,255,255,0.4)', 9)}` +
      // interference pattern on screen
      Array.from({ length: H - 40 }, (_, i) => {
        const y = 20 + i, dy1 = y - s1, dy2 = y - s2;
        const r1 = Math.sqrt(155 * 155 + dy1 * dy1), r2 = Math.sqrt(155 * 155 + dy2 * dy2);
        const I = Math.cos(Math.PI * (r1 - r2) / 14) ** 2;
        return `<rect x="293" y="${y}" width="10" height="1" fill="rgba(${accentRGB},${(I * 0.85).toFixed(2)})"/>`;
      }).join('') +
      // d label
      line(bx + 10, s1, bx + 10, s2, `rgba(255,255,255,0.3)`, 1, '4,3') +
      txt(bx + 22, (s1 + s2) / 2 + 4, 'd', 'rgba(255,255,255,0.6)', 11) +
      // D label
      line(bx, H - 8, 285, H - 8, `rgba(255,255,255,0.2)`, 1, '4,3') +
      txt((bx + 285) / 2, H - 2, 'D', 'rgba(255,255,255,0.5)', 10) +
      txt(bx - 12, s1 - 8, 'S₁', 'rgba(255,255,255,0.7)', 10) +
      txt(bx - 12, s2 + 14, 'S₂', 'rgba(255,255,255,0.7)', 10)
    );
  }

  if (concept === 'wavefronts') {
    const bx = 100, s1 = 105, s2 = 155;
    let rings = '';
    [s1, s2].forEach(sy => {
      for (let r = 15; r < 220; r += 20) {
        const alpha = (0.5 - r / 220 * 0.45).toFixed(2);
        rings += `<path d="M${bx},${sy} A${r},${r} 0 0 1 ${bx},${sy}" fill="none"/>`;
        rings += `<arc/>`;
        // draw right semicircle
        rings += `<path d="M ${bx} ${sy - r} A ${r} ${r} 0 0 1 ${bx} ${sy + r}"
          fill="none" stroke="${accent}" stroke-width="1.2" opacity="${alpha}" clip-path="url(#rclip)"/>`;
      }
    });
    return svg(grd +
      `<defs><clipPath id="rclip"><rect x="${bx}" y="0" width="${W}" height="${H}"/></clipPath></defs>` +
      rings +
      // barrier
      rect(bx - 4, 10, 8, s1 - 14, 'rgba(200,170,80,0.9)') +
      rect(bx - 4, s1 + 6, 8, s2 - s1 - 12, 'rgba(200,170,80,0.9)') +
      rect(bx - 4, s2 + 6, 8, H - s2 - 14, 'rgba(200,170,80,0.9)') +
      circle(bx, s1, 5, accent) + circle(bx, s2, 5, accent) +
      txt(bx - 12, s1 + 4, 'S₁', 'rgba(255,255,255,0.8)', 10, 'end') +
      txt(bx - 12, s2 + 4, 'S₂', 'rgba(255,255,255,0.8)', 10, 'end') +
      // bright spot
      circle(220, 130, 8, 'rgba(255,255,100,0.7)', 'rgba(255,255,100,0.4)', 8) +
      txt(220, 110, 'Constructive', 'rgba(255,255,100,0.8)', 9) +
      // dark cross
      `<line x1="235" y1="75" x2="247" y2="87" stroke="rgba(255,80,80,0.7)" stroke-width="1.5"/>
       <line x1="247" y1="75" x2="235" y2="87" stroke="rgba(255,80,80,0.7)" stroke-width="1.5"/>`+
      txt(241, 70, 'Destructive', 'rgba(255,80,80,0.7)', 9)
    );
  }

  if (concept === 'path_difference') {
    const bx = 90, s1 = 100, s2 = 170, px = 260, py = 100;
    return svg(grd +
      rect(bx - 4, 10, 8, s1 - 14, 'rgba(200,170,80,0.9)') +
      rect(bx - 4, s1 + 6, 8, s2 - s1 - 12, 'rgba(200,170,80,0.9)') +
      rect(bx - 4, s2 + 6, 8, H - s2 - 14, 'rgba(200,170,80,0.9)') +
      circle(bx, s1, 5, accent) + circle(bx, s2, 5, accent) +
      // r1 path
      line(bx, s1, px, py, `rgba(${accentRGB},0.9)`, 1.8) +
      txt((bx + px) / 2 - 10, (s1 + py) / 2 - 6, 'r₁', 'rgba(255,255,255,0.8)', 11) +
      // r2 path
      line(bx, s2, px, py, `rgba(255,180,50,0.9)`, 1.8) +
      txt((bx + px) / 2 + 6, (s2 + py) / 2 + 4, 'r₂', 'rgba(255,180,50,0.8)', 11) +
      // point P
      circle(px, py, 6, 'rgba(255,255,255,0.85)') +
      txt(px + 10, py + 4, 'P', 'rgba(255,255,255,0.8)', 11, 'start') +
      // Δ indicator
      `<path d="M ${bx} ${s2 + 20} L ${bx + 26} ${s2 + 20}" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1" stroke-dasharray="3,3"/>
       <path d="M ${bx} ${s2 + 20} L ${bx} ${s1 + 20}" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>` +
      txt(bx + 8, (s1 + s2) / 2 + 24, 'd', 'rgba(255,255,255,0.6)', 10) +
      txt(170, H - 12, 'Δ = d·sinθ = r₂ - r₁', `rgba(${accentRGB},0.9)`, 12, 'middle', true)
    );
  }

  if (concept === 'fringe_pattern') {
    // Show intensity vs y graph
    let path = 'M 60 ' + H / 2;
    const sc = 120;
    for (let y = -H / 2 + 20; y <= H / 2 - 20; y++) {
      const I = Math.cos(y / 15) ** 2;
      const x = 60 + I * sc;
      path += ` L ${x} ${(H / 2 + y).toFixed(1)}`;
    }
    return svg(grd +
      `<line x1="60" y1="20" x2="60" y2="${H - 20}" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
       <line x1="60" y1="${H / 2}" x2="${60 + sc + 10}" y2="${H / 2}" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="3,3"/>` +
      `<path d="${path}" fill="rgba(${accentRGB},0.15)" stroke="${accent}" stroke-width="1.8"/>` +
      // bright labels
      [0, 1, -1, 2, -2].map(n => {
        const yc = H / 2 + n * 30;
        return circle(60 + sc, yc, 4, accent) + txt(50, yc + 4, n === 0 ? 'n=0' : 'n=' + n, 'rgba(255,255,255,0.5)', 8, 'end');
      }).join('') +
      txt(170, H - 8, 'I = I₀ cos²(δ/2)', `rgba(${accentRGB},0.8)`, 11, 'middle', true) +
      txt(65, 14, 'Bright (n=0)', 'rgba(255,255,255,0.5)', 9, 'start') +
      txt(40, H / 2 + 4, 'y', 'rgba(255,255,255,0.4)', 10, 'end')
    );
  }

  if (concept === 'fringe_formula') {
    return svg(grd +
      // central formula big
      `<rect x="60" y="100" width="220" height="60" fill="rgba(${accentRGB},0.1)" stroke="rgba(${accentRGB},0.4)" stroke-width="1.5" rx="10"/>
       <text x="170" y="138" text-anchor="middle" font-family='JetBrains Mono,monospace" font-size="22" fill="${accent}" font-weight="700">β = λD/d</text>` +
      txt(170, 92, 'Fringe Width Formula', 'rgba(255,255,255,0.7)', 12, 'middle', true) +
      // effect arrows
      arr(80, 190, 80, 230, 'rgba(255,255,100,0.7)') + txt(80, 245, '↑λ → wider', 'rgba(255,255,100,0.7)', 10) +
      arr(170, 190, 170, 230, 'rgba(0,255,159,0.7)') + txt(170, 245, '↑D → wider', 'rgba(0,255,159,0.7)', 10) +
      arr(260, 230, 260, 190, 'rgba(255,107,43,0.7)') + txt(260, 245, '↑d → narrower', 'rgba(255,107,43,0.7)', 10)
    );
  }

  // ─── single slit concepts ───
  if (concept === 'diffraction_intro') {
    return svg(grd +
      // plane waves
      [60, 90, 120, 150].map(x =>
        line(x, 20, x, H - 20, `rgba(${accentRGB},0.35)`, 1.5)
      ).join('') +
      // barrier with gap
      rect(170, 0, 8, 110, 'rgba(200,170,80,0.9)') +
      rect(170, 150, 8, H - 150, 'rgba(200,170,80,0.9)') +
      // fan spreading waves
      [-60, -40, -20, 0, 20, 40, 60].map(a => {
        const rad = a * Math.PI / 180;
        return line(175, 130, 175 + 130 * Math.cos(rad), 130 + 130 * Math.sin(rad),
          `rgba(${accentRGB},0.25)`, 1.2);
      }).join('') +
      // shadow region highlight
      `<path d="M 178 110 L 310 10 L 310 0 L 178 0 Z" fill="rgba(255,255,255,0.02)"/>
       <path d="M 178 150 L 310 ${H} L 178 ${H} Z" fill="rgba(255,255,255,0.02)"/>` +
      txt(260, 50, 'Light in', 'rgba(255,255,255,0.35)', 9) +
      txt(260, 60, 'shadow!', 'rgba(255,255,255,0.35)', 9) +
      txt(170, H - 8, 'Diffraction: light bends around edges', `rgba(${accentRGB},0.7)`, 10)
    );
  }

  if (concept === 'slit_geometry') {
    const sx = 140, st = 90, sb = 190;
    return svg(grd +
      rect(sx - 4, 10, 8, st - 10, 'rgba(200,170,80,0.9)') +
      rect(sx - 4, sb, 8, H - sb - 10, 'rgba(200,170,80,0.9)') +
      // a indicator
      line(sx - 20, st, sx - 20, sb, `rgba(0,255,159,0.7)`, 1.5) +
      line(sx - 24, st, sx - 12, st, `rgba(0,255,159,0.7)`, 1.5) +
      line(sx - 24, sb, sx - 12, sb, `rgba(0,255,159,0.7)`, 1.5) +
      txt(sx - 32, (st + sb) / 2 + 4, 'a', 'rgba(0,255,159,0.85)', 12) +
      // D arrow
      line(sx, H - 16, 290, H - 16, `rgba(255,255,255,0.25)`, 1, '4,3') +
      txt((sx + 290) / 2, H - 6, 'D', 'rgba(255,255,255,0.5)', 10) +
      // screen
      rect(290, 20, 8, H - 40, 'rgba(100,80,30,0.8)') +
      txt(289, H - 14, 'Screen', 'rgba(255,255,255,0.35)', 9) +
      // fan
      [-50, -30, 0, 30, 50].map(a => {
        const rad = a * Math.PI / 180;
        return line(sx, (st + sb) / 2, sx + 150 * Math.cos(rad), (st + sb) / 2 + 150 * Math.sin(rad),
          `rgba(${accentRGB},0.2)`, 1.2);
      }).join('') +
      txt(170, 22, 'Smaller a → bigger spread', `rgba(${accentRGB},0.7)`, 10)
    );
  }

  if (concept === 'huygens_wavelets') {
    const sx = 110, st = 100, sb = 170;
    let wavelets = '';
    const N = 5;
    for (let i = 0; i < N; i++) {
      const sy = st + (sb - st) * i / (N - 1);
      for (let r = 15; r < 200; r += 20) {
        const a = (0.45 - r / 200 * 0.4).toFixed(2);
        wavelets += `<path d="M ${sx} ${sy - r} A ${r} ${r} 0 0 1 ${sx} ${sy + r}"
          fill="none" stroke="${accent}" stroke-width="1" opacity="${a}" clip-path="url(#rc2)"/>`;
      }
    }
    return svg(grd +
      `<defs><clipPath id="rc2"><rect x="${sx}" y="0" width="${W}" height="${H}"/></clipPath></defs>` +
      wavelets +
      rect(sx - 4, 10, 8, st - 10, 'rgba(200,170,80,0.9)') +
      rect(sx - 4, sb, 8, H - sb - 10, 'rgba(200,170,80,0.9)') +
      Array.from({ length: N }, (_, i) => {
        const sy = st + (sb - st) * i / (N - 1);
        return circle(sx, sy, 3, accent);
      }).join('') +
      txt(170, H - 8, 'Huygens: each slit point = new source', `rgba(${accentRGB},0.7)`, 10)
    );
  }

  if (concept === 'dark_fringe_condition') {
    return svg(grd +
      `<rect x="55" y="80" width="230" height="52" fill="rgba(${accentRGB},0.1)" stroke="rgba(${accentRGB},0.4)" stroke-width="1.5" rx="10"/>
       <text x="170" y="113" text-anchor="middle" font-family='JetBrains Mono,monospace" font-size="18" fill="${accent}" font-weight="700">a·sinθ = mλ</text>` +
      txt(170, 74, 'Dark Fringe Condition', 'rgba(255,255,255,0.7)', 12, 'middle', true) +
      txt(170, 150, 'm = ±1, ±2, ±3 ...', 'rgba(255,255,255,0.55)', 11) +
      txt(170, 172, '1st dark: y = λD/a', `rgba(${accentRGB},0.8)`, 11) +
      txt(170, 194, 'Narrower slit → wider central max', 'rgba(255,255,255,0.5)', 10) +
      // visual pattern bars
      Array.from({ length: H - 40 }, (_, i) => {
        const y = 20 + i, dy = (y - H / 2) / 3;
        const beta = (Math.PI * dy) / 50;
        const I = beta === 0 ? 1 : (Math.sin(beta) / beta) ** 2;
        return `<rect x="240" y="${y}" width="40" height="1" fill="rgba(${accentRGB},${(I * 0.85).toFixed(2)})"/>`;
      }).join('') +
      line(238, H / 2, 285, H / 2, 'rgba(255,255,255,0.2)', 1, '3,3') +
      txt(258, 14, 'I(y)', `rgba(${accentRGB},0.6)`, 9)
    );
  }

  if (concept === 'sinc_pattern') {
    let path = 'M 40 ' + H / 2;
    for (let y = -(H / 2 - 20); y <= (H / 2 - 20); y++) {
      const beta = (Math.PI * y) / 55;
      const sinc = beta === 0 ? 1 : Math.sin(beta) / beta;
      const I = sinc * sinc;
      const x = 40 + I * 180;
      path += ` L ${x.toFixed(1)} ${(H / 2 + y).toFixed(1)}`;
    }
    return svg(grd +
      line(40, 20, 40, H - 20, 'rgba(255,255,255,0.2)', 1) +
      `<path d="${path}" fill="rgba(${accentRGB},0.15)" stroke="${accent}" stroke-width="2"/>` +
      // labels
      circle(220, H / 2, 4, 'rgba(255,255,255,0.8)') +
      txt(230, H / 2 + 4, 'Central max', `rgba(${accentRGB},0.8)`, 9, 'start') +
      circle(40 + Math.pow(Math.sin(Math.PI * 55 / 55) / (Math.PI * 55 / 55), 2) * 180, H / 2 - 55, 3, `rgba(${accentRGB},0.6)`) +
      txt(170, H - 8, 'I = I₀ sinc²(πa sinθ/λ)', `rgba(${accentRGB},0.8)`, 10, 'middle', true) +
      txt(35, H / 2 + 4, 'y', 'rgba(255,255,255,0.4)', 10, 'end')
    );
  }

  if (concept === 'slit_effects') {
    return svg(grd +
      txt(170, 22, 'Effect of Slit Width a', `rgba(${accentRGB},0.85)`, 13, 'middle', true) +
      // narrow slit → wide pattern
      [0, 1].map(row => {
        const label = row === 0 ? 'Narrow slit' : 'Wide slit';
        const width = row === 0 ? 20 : 70;
        const spread = row === 0 ? 100 : 30;
        const cy = 90 + row * 110;
        let p = `M 30 ${cy}`;
        for (let y = -(spread); y <= spread; y++) {
          const beta = (Math.PI * y) / spread * 1.5;
          const sinc = beta === 0 ? 1 : Math.sin(beta) / beta;
          const x = 30 + sinc * sinc * 160;
          p += ` L ${x.toFixed(1)} ${(cy + y).toFixed(1)}`;
        }
        return `<path d="${p}" fill="rgba(${accentRGB},0.12)" stroke="${accent}" stroke-width="1.8" opacity="0.9"/>` +
          txt(200, cy + 4, label, `rgba(${accentRGB},0.8)`, 10) +
          rect(215, cy - width / 2, 8, width, 'rgba(200,170,80,0.9)');
      }).join('') +
      line(20, H - 30, 300, H - 30, 'rgba(255,255,255,0.1)', 1, '4,4') +
      txt(170, H - 10, 'β₀ = 2λD/a  (central max width)', `rgba(${accentRGB},0.7)`, 10, 'middle', true)
    );
  }

  // ─── projectile concepts ───
  if (concept === 'projectile_intro') {
    return svg(grd +
      // ground
      line(20, 240, 320, 240, `rgba(0,255,159,0.3)`, 1.5) +
      // parabola
      `<path d="M 30 240 Q 170 60 310 240" fill="rgba(0,255,159,0.08)" stroke="rgba(0,255,159,0.5)" stroke-width="1.5" stroke-dasharray="6,4"/>` +
      // gravity arrow
      arr(170, 120, 170, 180, 'rgba(255,107,43,0.8)', 2.5) +
      txt(182, 158, 'g', 'rgba(255,107,43,0.9)', 14, 'start', true) +
      // ball at peak
      circle(170, 115, 10, 'rgba(0,255,159,0.9)') +
      txt(186, 118, 'Only gravity!', 'rgba(255,255,255,0.6)', 10, 'start') +
      // launch angle
      `<path d="M 30 240 L 90 240" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
       <path d="M 30 240 L 68 200" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
       <path d="M 50 240 A 20 20 0 0 0 44 221" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>`+
      txt(62, 232, 'θ', 'rgba(255,255,255,0.6)', 11) +
      txt(170, H - 8, 'Parabolic trajectory under gravity', 'rgba(0,255,159,0.6)', 10)
    );
  }

  if (concept === 'velocity_components') {
    return svg(grd +
      circle(100, 180, 10, 'rgba(0,255,159,0.9)') +
      // v0 vector
      arr(100, 180, 220, 80, 'rgba(255,255,255,0.9)', 2.5) +
      txt(172, 118, 'v₀', 'rgba(255,255,255,0.85)', 13, 'middle', true) +
      // Vx component
      arr(100, 180, 220, 180, 'rgba(0,212,255,0.9)', 2) +
      txt(160, 198, 'Vx = v₀cosθ', 'rgba(0,212,255,0.85)', 11) +
      // Vy component
      arr(100, 180, 100, 80, 'rgba(255,107,43,0.9)', 2) +
      txt(58, 132, 'Vy = v₀sinθ', 'rgba(255,107,43,0.85)', 11) +
      // dashed lines completing rectangle
      line(220, 80, 220, 180, 'rgba(255,255,255,0.2)', 1, '4,3') +
      line(100, 80, 220, 80, 'rgba(255,255,255,0.2)', 1, '4,3') +
      // angle arc
      `<path d="M 130 180 A 30 30 0 0 0 118 154" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.2"/>` +
      txt(142, 168, 'θ', 'rgba(255,255,255,0.7)', 11) +
      txt(170, H - 8, 'Independent horizontal & vertical', 'rgba(0,255,159,0.6)', 10)
    );
  }

  if (concept === 'horizontal_motion') {
    return svg(grd +
      line(20, 220, 300, 220, 'rgba(0,255,159,0.2)', 1.5) +
      // ball positions at equal time intervals
      [50, 120, 190, 260].map((x, i) => {
        const y = 220 - 80 * Math.sin((i / 3) * Math.PI);
        return circle(x, y, 9, 'rgba(0,255,159,0.8)') +
          arr(x, y, x + 30, y, 'rgba(0,212,255,0.8)', 2) +
          txt(x + 15, y - 14, 'Vx', 'rgba(0,212,255,0.65)', 9);
      }).join('') +
      // equal spacing markers
      [50, 120, 190, 260].map(x => line(x, 225, x, 235, 'rgba(255,255,255,0.3)', 1)).join('') +
      txt(170, 248, 'Equal Δx in equal Δt', 'rgba(255,255,255,0.5)', 10) +
      txt(170, H - 8, 'x = v₀cosθ · t  (constant velocity)', 'rgba(0,212,255,0.7)', 10)
    );
  }

  if (concept === 'vertical_motion') {
    return svg(grd +
      line(20, 220, 300, 220, 'rgba(0,255,159,0.2)', 1.5) +
      // parabola
      `<path d="M 30 220 Q 170 40 310 220" fill="none" stroke="rgba(0,255,159,0.35)" stroke-width="1.5" stroke-dasharray="5,4"/>` +
      // Vy vectors at positions
      [0, 1, 2, 3].map(i => {
        const x = 30 + i * 90, frac = i / 3;
        const px = 30 + 280 * frac;
        const py = 220 - (220 - 40) * (4 * frac * (1 - frac));
        const vy = (1 - 2 * frac) * 40;
        return circle(px, py, 8, 'rgba(0,255,159,0.8)') + arr(px, py, px, py + vy, 'rgba(255,107,43,0.8)', 2);
      }).join('') +
      // gravity
      arr(170, 80, 170, 120, 'rgba(255,107,43,0.6)', 2) +
      txt(182, 104, 'g', 'rgba(255,107,43,0.8)', 12, 'start', true) +
      txt(170, H - 8, 'Vy = 0 at peak  |  y = v₀sinθ·t - ½gt²', 'rgba(255,107,43,0.6)', 10)
    );
  }

  if (concept === 'energy_conservation') {
    const positions = [[60, 200], [130, 130], [200, 80], [270, 130]];
    const KEvals = [1, 0.6, 0.3, 0.6], PEvals = [0, 0.4, 0.7, 0.4];
    return svg(grd +
      `<path d="M 60 200 Q 170 40 280 200" fill="none" stroke="rgba(0,255,159,0.35)" stroke-width="1.5" stroke-dasharray="5,4"/>` +
      positions.map(([x, y], i) => {
        const kh = KEvals[i] * 50, ph = PEvals[i] * 50;
        return circle(x, y, 7, 'rgba(0,255,159,0.85)') +
          rect(x - 16, y + 10, 12, kh, 'rgba(0,255,159,0.7)', 'none', 2) +
          rect(x + 4, y + 10, 12, ph, 'rgba(0,212,255,0.7)', 'none', 2);
      }).join('') +
      txt(60, H - 20, 'KE', 'rgba(0,255,159,0.7)', 9) +
      txt(80, H - 20, 'PE', 'rgba(0,212,255,0.7)', 9) +
      txt(170, H - 8, 'KE + PE = constant', 'rgba(0,255,159,0.8)', 11, 'middle', true)
    );
  }

  if (concept === 'range_formula') {
    return svg(grd +
      line(20, 220, 310, 220, 'rgba(0,255,159,0.2)', 1.5) +
      // multiple trajectories
      [30, 45, 60].map((angle, i) => {
        const pts = [];
        const a = angle * Math.PI / 180, v = 180, g = 800;
        const T = 2 * v * Math.sin(a) / g;
        for (let tt = 0; tt <= T; tt += T / 30) {
          const x = 20 + v * Math.cos(a) * tt * 0.9;
          const y = 220 - v * Math.sin(a) * tt * 0.9 + 0.5 * g * tt * tt * 0.9;
          pts.push(`${x.toFixed(0)},${y.toFixed(0)}`);
        }
        const cols = ['rgba(0,212,255,0.5)', 'rgba(0,255,159,0.8)', 'rgba(255,107,43,0.5)'];
        const labels = ['30°', '45°', '60°'];
        return `<polyline points="${pts.join(' ')}" fill="rgba(0,255,159,0.05)" stroke="${cols[i]}" stroke-width="${i === 1 ? 2.5 : 1.5}"/>` +
          txt(20 + 12 * i * 3, 195 - i * 6, labels[i], cols[i], 9);
      }).join('') +
      `<rect x="90" y="100" width="160" height="38" fill="rgba(0,255,159,0.1)" stroke="rgba(0,255,159,0.4)" stroke-width="1.5" rx="8"/>
       <text x="170" y="125" text-anchor="middle" font-family='JetBrains Mono,monospace" font-size="15" fill="rgba(0,255,159,0.95)" font-weight="700">R = v₀²sin2θ/g</text>`+
      txt(170, H - 8, 'Max range at θ = 45°', 'rgba(0,255,159,0.7)', 10)
    );
  }

  // ─── electric concepts ───
  const drawFieldLines = (charges, W, H, accent, accentRGB) => {
    let lines = '';
    charges.forEach(ch => {
      for (let i = 0; i < 14; i++) {
        const a0 = i / 14 * Math.PI * 2;
        const startR = 18;
        let x = ch.x + startR * Math.cos(a0), y = ch.y + startR * Math.sin(a0);
        let pts = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
        for (let s = 0; s < 80; s++) {
          let Ex = 0, Ey = 0;
          charges.forEach(c => {
            const dx = x - c.x, dy = y - c.y, r2 = dx * dx + dy * dy + 1;
            const E = c.q / r2;
            Ex += E * dx / Math.sqrt(r2); Ey += E * dy / Math.sqrt(r2);
          });
          const mag = Math.sqrt(Ex * Ex + Ey * Ey) || 1;
          x += 3.5 * Ex / mag; y += 3.5 * Ey / mag;
          if (x < 2 || x > W - 2 || y < 2 || y > H - 2) break;
          pts += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
          let near = false;
          charges.forEach(c => { if (c.q < 0 && Math.sqrt((x - c.x) ** 2 + (y - c.y) ** 2) < 18) near = true; });
          if (near) break;
        }
        lines += `<path d="${pts}" fill="none" stroke="${accent}" stroke-width="1.1" opacity="0.55"/>`;
      }
      const g = `<radialGradient id="cg${ch.x}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${ch.q > 0 ? 'rgba(255,80,80,0.95)' : 'rgba(80,80,255,0.95)'}"/>
        <stop offset="100%" stop-color="${ch.q > 0 ? 'rgba(200,50,50,0)' : 'rgba(50,50,200,0)'}"/>
      </radialGradient>`;
      lines += `<defs>${g}</defs>`;
      lines += circle(ch.x, ch.y, 16, `url(#cg${ch.x})`, 'none');
      lines += `<text x="${ch.x}" y="${ch.y + 6}" text-anchor="middle" font-size="18" font-weight="700" fill="white">${ch.q > 0 ? '+' : '-'}</text>`;
    });
    return lines;
  };

  if (concept === 'field_intro') {
    return svg(grd +
      drawFieldLines([{ x: 170, y: H / 2, q: 1 }], W, H, accent, accentRGB) +
      // test charge with F arrow
      circle(250, H / 2, 8, 'rgba(255,255,255,0.8)') +
      arr(258, H / 2, 290, H / 2, 'rgba(0,255,159,0.9)', 2.5) +
      txt(274, H / 2 - 12, 'F = qE', 'rgba(0,255,159,0.85)', 10) +
      txt(170, H - 8, 'E = F/q₀  at every point in space', `rgba(${accentRGB},0.75)`, 10)
    );
  }

  if (concept === 'coulombs_law') {
    return svg(grd +
      circle(90, H / 2, 18, 'rgba(255,80,80,0.9)', 'rgba(255,80,80,0.4)', 2) +
      `<text x="90" y="${H / 2 + 6}" text-anchor="middle" font-size="20" font-weight="700" fill="white">+</text>` +
      circle(250, H / 2, 18, 'rgba(80,80,255,0.9)', 'rgba(80,80,255,0.4)', 2) +
      `<text x="250" y="${H / 2 + 6}" text-anchor="middle" font-size="20" font-weight="700" fill="white">-</text>` +
      arr(108, H / 2 - 4, 230, H / 2 - 4, 'rgba(0,255,159,0.9)', 2.5) +
      arr(232, H / 2 + 4, 110, H / 2 + 4, 'rgba(0,255,159,0.9)', 2.5) +
      line(90, H / 2 + 30, 250, H / 2 + 30, 'rgba(255,255,255,0.25)', 1, '5,4') +
      txt(170, H / 2 + 44, 'r', 'rgba(255,255,255,0.6)', 12) +
      txt(90, H / 2 - 26, 'q₁', 'rgba(255,100,100,0.8)', 11) +
      txt(250, H / 2 - 26, 'q₂', 'rgba(100,100,255,0.8)', 11) +
      `<rect x="55" y="${H - 55}" width="230" height="36" fill="rgba(${accentRGB},0.1)" stroke="rgba(${accentRGB},0.3)" stroke-width="1.5" rx="8"/>
       <text x="170" y="${H - 31}" text-anchor="middle" font-family='JetBrains Mono,monospace" font-size="15" fill="${accent}" font-weight="700">F = kq₁q₂/r²</text>`
    );
  }

  if (concept === 'field_lines') {
    const charges = sub === 'multi' || topic === 'electric' && sub === 'multi'
      ? [{ x: 120, y: H / 2, q: 1 }, { x: 220, y: H / 2, q: -1 }]
      : [{ x: 170, y: H / 2, q: 1 }];
    return svg(grd + drawFieldLines(charges, W, H, accent, accentRGB) +
      txt(170, H - 8, charges.length > 1 ? 'Lines: + → - (attract)' : 'Lines radiate outward from +', `rgba(${accentRGB},0.7)`, 10)
    );
  }

  if (concept === 'electric_potential') {
    return svg(grd +
      drawFieldLines([{ x: 170, y: H / 2, q: 1 }], W, H, accent, accentRGB) +
      // equipotential circles
      [40, 70, 100].map(r => {
        const V = (60 / r * 5).toFixed(0);
        return `<circle cx="170" cy="${H / 2}" r="${r}" fill="none" stroke="rgba(0,255,159,0.5)" stroke-width="1.2" stroke-dasharray="5,4"/>
                <text x="${170 + r + 4}" y="${H / 2 + 4}" font-size="9" fill="rgba(0,255,159,0.7)" font-family='JetBrains Mono,monospace">V=${V}</text>`;
      }).join('') +
      txt(170, H - 8, 'V = kq/r  (scalar, decreases with r)', `rgba(${accentRGB},0.75)`, 10)
    );
  }

  if (concept === 'equipotential') {
    return svg(grd +
      drawFieldLines([{ x: 170, y: H / 2, q: 1 }], W, H, accent, accentRGB) +
      [35, 60, 90, 120].map(r =>
        `<circle cx="170" cy="${H / 2}" r="${r}" fill="none" stroke="rgba(0,255,159,0.5)" stroke-width="1.5" stroke-dasharray="6,4"/>`
      ).join('') +
      // perpendicular indicator
      `<path d="M 210 ${H / 2} L 225 ${H / 2 - 15} L 240 ${H / 2}" fill="none" stroke="rgba(255,255,100,0.6)" stroke-width="1.2"/>` +
      txt(248, H / 2 - 6, '⊥', 'rgba(255,255,100,0.7)', 14) +
      txt(170, H - 8, 'Field lines ⊥ equipotentials always', `rgba(${accentRGB},0.75)`, 10)
    );
  }

  if (concept === 'superposition_intro') {
    const px = 200, py = 130;
    return svg(grd +
      circle(100, 200, 16, 'rgba(255,80,80,0.9)') +
      `<text x="100" y="206" text-anchor="middle" font-size="18" font-weight="700" fill="white">+</text>` +
      circle(250, 80, 16, 'rgba(80,80,255,0.9)') +
      `<text x="250" y="86" text-anchor="middle" font-size="18" font-weight="700" fill="white">+</text>` +
      circle(px, py, 7, 'rgba(255,255,255,0.8)') +
      txt(px + 10, py - 10, 'P', 'rgba(255,255,255,0.8)', 11, 'start') +
      arr(px, py, px - 38, py + 38, 'rgba(255,100,100,0.8)', 2) +
      txt(px - 50, py + 55, 'E₁', 'rgba(255,100,100,0.85)', 11) +
      arr(px, py, px + 25, py - 38, 'rgba(100,100,255,0.8)', 2) +
      txt(px + 28, py - 40, 'E₂', 'rgba(100,100,255,0.85)', 11) +
      arr(px, py, px - 18, py - 10, 'rgba(0,255,159,0.9)', 2.5) +
      txt(px - 40, py - 18, 'E_net', 'rgba(0,255,159,0.9)', 11) +
      txt(170, H - 8, 'E_net = vector sum of all fields', `rgba(${accentRGB},0.75)`, 10)
    );
  }

  if (concept === 'electric_dipole') {
    return svg(grd +
      drawFieldLines([{ x: 120, y: H / 2, q: 1 }, { x: 220, y: H / 2, q: -1 }], W, H, accent, accentRGB) +
      // dipole moment arrow
      arr(120, H / 2 + 40, 220, H / 2 + 40, 'rgba(255,255,100,0.8)', 2.5) +
      txt(170, H / 2 + 58, 'p = qd', 'rgba(255,255,100,0.85)', 11) +
      txt(120, H / 2 - 26, '+q', 'rgba(255,100,100,0.8)', 10) +
      txt(220, H / 2 - 26, '-q', 'rgba(100,100,255,0.8)', 10) +
      txt(170, H - 8, 'Dipole: equal & opposite charges', `rgba(${accentRGB},0.7)`, 10)
    );
  }

  if (concept === 'potential_map') {
    // simplified potential heatmap
    let heatmap = '';
    const charges = [{ x: 120, y: H / 2, q: 1 }, { x: 220, y: H / 2, q: -1 }];
    for (let py2 = 10; py2 < H - 10; py2 += 4) {
      for (let px2 = 10; px2 < W - 10; px2 += 4) {
        let V = 0;
        charges.forEach(c => {
          const r = Math.sqrt((px2 - c.x) ** 2 + (py2 - c.y) ** 2);
          if (r > 4) V += c.q * 25 / r;
        });
        const n = Math.max(-1, Math.min(1, V / 2));
        let r2, g2, b2;
        if (n > 0) { r2 = Math.round(n * 200); g2 = Math.round(n * 60); b2 = 0; }
        else { r2 = 0; g2 = Math.round(-n * 60); b2 = Math.round(-n * 200); }
        heatmap += `<rect x="${px2}" y="${py2}" width="4" height="4" fill="rgba(${r2},${g2},${b2},0.65)"/>`;
      }
    }
    return svg(grd + heatmap +
      charges.map(c =>
        circle(c.x, c.y, 14, c.q > 0 ? 'rgba(255,80,80,0.95)' : 'rgba(80,80,255,0.95)') +
        `<text x="${c.x}" y="${c.y + 5}" text-anchor="middle" font-size="16" font-weight="700" fill="white">${c.q > 0 ? '+' : '-'}</text>`
      ).join('') +
      txt(170, H - 8, 'Red=+V  Blue=-V  |  V = Σkqᵢ/rᵢ', `rgba(${accentRGB},0.75)`, 10)
    );
  }

  if (concept === 'field_potential_link') {
    return svg(grd +
      drawFieldLines([{ x: 170, y: H / 2, q: 1 }], W, H, accent, accentRGB) +
      [40, 70, 100].map(r =>
        `<circle cx="170" cy="${H / 2}" r="${r}" fill="none" stroke="rgba(0,255,159,0.45)" stroke-width="1.2" stroke-dasharray="5,4"/>`
      ).join('') +
      // E arrow pointing outward (high V to low V)
      arr(210, H / 2, 258, H / 2, 'rgba(255,255,100,0.9)', 2.5) +
      txt(238, H / 2 - 14, 'E', 'rgba(255,255,100,0.9)', 14, 'middle', true) +
      txt(210, H / 2 + 20, 'High V', 'rgba(255,80,80,0.6)', 9) +
      txt(258, H / 2 + 20, 'Low V', 'rgba(100,100,255,0.6)', 9) +
      `<rect x="35" y="${H - 52}" width="270" height="34" fill="rgba(${accentRGB},0.1)" stroke="rgba(${accentRGB},0.3)" stroke-width="1.5" rx="8"/>
       <text x="170" y="${H - 28}" text-anchor="middle" font-family='JetBrains Mono,monospace" font-size="14" fill="${accent}" font-weight="700">E = -dV/dr</text>`
    );
  }

  // Default fallback
  return svg(grd +
    `<text x="170" y="${H / 2 + 8}" text-anchor="middle" font-family="Inter,monospace" font-size="13" fill="${accent}" opacity="0.6">${concept.replace(/_/g, ' ').toUpperCase()}</text>`
  );
}


// GO TO SIMULATION

function goToSimulation() {
  hide(['topic-screen', 'learning-screen', 'engineering-screen']);
  show('simulation-screen');
  document.getElementById('chat-panel').style.display = 'block';
  const data = TOPICS[currentTopic];
  setBreadcrumb(['SIMU-VERSE', data.name, 'Simulation'], currentTopic);
  initSimulation(currentTopic, currentSubtopic);
  showToast('🔬 Simulation loaded! Adjust parameters and run.');
}

// SIMULATION ENGINE

let simState = { running: false, animId: null };

function stopSim() {
  simState.running = false;
  if (simState.animId) { cancelAnimationFrame(simState.animId); simState.animId = null; }
  if (window._waveAnimId) { cancelAnimationFrame(window._waveAnimId); window._waveAnimId = null; }
  if (window._projectileAnimId) { cancelAnimationFrame(window._projectileAnimId); window._projectileAnimId = null; }
  const canvas = document.getElementById('simCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function initSimulation(topic, sub) {
  stopSim();
  const canvas = document.getElementById('simCanvas');
  const panel = document.getElementById('controls-panel');
  const title = document.getElementById('sim-canvas-title');
  const measurements = document.getElementById('measurements-display');

  // Size canvas
  const area = canvas.parentElement;
  canvas.width = area.clientWidth - 48;
  canvas.height = topic === 'projectile'
    ? Math.min(700, Math.max(560, window.innerHeight * 0.68))
    : Math.min(420, window.innerHeight * 0.45);

  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const badge = document.getElementById('sim-subtopic-badge');
  if (badge) badge.textContent = '';

  if (topic === 'wave') initWaveSim(canvas, panel, title, measurements, sub);
  else if (topic === 'projectile') initProjectileSim(canvas, panel, title, measurements);
  else if (topic === 'electric') initElectricSim(canvas, panel, title, measurements, sub);
}

// WAVE SIMULATION  (fully rewritten — correct physics

// Convert wavelength (nm) to [R,G,B] integers 0-255
function nmToRGB(nm) {
  let r, g, b;
  if (nm < 380) { r = 0.5; g = 0; b = 0.5; }
  else if (nm < 440) { r = (440 - nm) / 60; g = 0; b = 1; }
  else if (nm < 490) { r = 0; g = (nm - 440) / 50; b = 1; }
  else if (nm < 510) { r = 0; g = 1; b = (510 - nm) / 20; }
  else if (nm < 580) { r = (nm - 510) / 70; g = 1; b = 0; }
  else if (nm < 645) { r = 1; g = (645 - nm) / 65; b = 0; }
  else if (nm <= 700) { r = 1; g = 0; b = 0; }
  else { r = 0.5; g = 0; b = 0; }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function sinc(x) {
  return x === 0 ? 1 : Math.sin(x) / x;
}

function initWaveSim(canvas, panel, title, meas, sub) {
  title.textContent = sub === 'double' ? "Young's Double Slit Experiment" : "Single Slit Diffraction";
  const badge = document.getElementById('sim-subtopic-badge');
  if (badge) badge.textContent = sub === 'double' ? 'DOUBLE SLIT MODE' : 'SINGLE SLIT MODE';
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  window.waveP = sub === 'double'
    ? { lambda: 550, d: 2.0, D: 100 }
    : { lambda: 550, a: 1.0, D: 100 };

  // t drives wave phase animation
  let waveT = 0;

  window.drawWave = function () { /* params read fresh each frame — nothing to do */ };

  // Cancel any previous wave animation
  if (window._waveAnimId) { cancelAnimationFrame(window._waveAnimId); window._waveAnimId = null; }

  // Wrap loop so _waveAnimId always points to the live rAF handle
  function animLoop() {
    waveT += 0.04;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#03010a'; ctx.fillRect(0, 0, W, H);
    const p = window.waveP;
    const [R, G, B] = nmToRGB(p.lambda);
    if (sub === 'double') drawDoubleSlit(ctx, W, H, p, R, G, B, meas, waveT);
    else drawSingleSlit(ctx, W, H, p, R, G, B, meas, waveT);
    window._waveAnimId = requestAnimationFrame(animLoop);
  }
  animLoop();

  // ---- build controls ----
  if (sub === 'double') {
    panel.innerHTML = `
      <div class="controls-card">
        <div class="ctrl-title">⚙️ Parameters</div>
        <div class="param-row">
          <div class="param-label">Wavelength λ <span class="val" id="lv">550 nm</span></div>
          <input type="range" min="380" max="700" step="5" value="550"
            oninput="window.waveP.lambda=+this.value; document.getElementById('lv').textContent=this.value+' nm'; window.drawWave();">
        </div>
        <div class="param-row">
          <div class="param-label">Slit Separation d <span class="val" id="dv">2.0 mm</span></div>
          <input type="range" min="0.5" max="5" step="0.1" value="2.0"
            oninput="window.waveP.d=+this.value; document.getElementById('dv').textContent=(+this.value).toFixed(1)+' mm'; window.drawWave();">
        </div>
        <div class="param-row">
          <div class="param-label">Screen Distance D <span class="val" id="Dv">100 cm</span></div>
          <input type="range" min="20" max="200" step="5" value="100"
            oninput="window.waveP.D=+this.value; document.getElementById('Dv').textContent=this.value+' cm'; window.drawWave();">
        </div>
      </div>
      <div class="controls-card">
        <div class="ctrl-title">📊 Measurements</div>
        <div id="wave-meas-panel">
          <div class="meas-row"><span class="meas-key">Fringe width β</span><span class="meas-val" id="m-beta">—</span></div>
          <div class="meas-row"><span class="meas-key">1st bright (n=1)</span><span class="meas-val" id="m-y1">—</span></div>
          <div class="meas-row"><span class="meas-key">1st dark</span><span class="meas-val" id="m-dark">—</span></div>
          <div class="meas-row"><span class="meas-key">Path diff (n=1)</span><span class="meas-val" id="m-pd">—</span></div>
        </div>
      </div>
    `;
  } else {
    panel.innerHTML = `
      <div class="controls-card">
        <div class="ctrl-title">⚙️ Parameters</div>
        <div class="param-note">Single slit diffraction forms a broad central maximum and weaker side minima. Narrower slit width a increases spread; longer wavelength λ increases fringe spacing.</div>
        <div class="param-row">
          <div class="param-label">Wavelength λ <span class="val" id="lv">550 nm</span></div>
          <input type="range" min="380" max="700" step="5" value="550"
            oninput="window.waveP.lambda=+this.value; document.getElementById('lv').textContent=this.value+' nm'; window.drawWave();">
        </div>
        <div class="param-row">
          <div class="param-label">Slit Width a <span class="val" id="av">1.0 mm</span></div>
          <input type="range" min="0.2" max="3.0" step="0.05" value="1.0"
            oninput="window.waveP.a=+this.value; document.getElementById('av').textContent=(+this.value).toFixed(2)+' mm'; window.drawWave();">
        </div>
        <div class="param-row">
          <div class="param-label">Screen Distance D <span class="val" id="Dv">100 cm</span></div>
          <input type="range" min="20" max="200" step="5" value="100"
            oninput="window.waveP.D=+this.value; document.getElementById('Dv').textContent=this.value+' cm'; window.drawWave();">
        </div>
      </div>
      <div class="controls-card">
        <div class="ctrl-title">📊 Measurements</div>
        <div id="wave-meas-panel">
          <div class="meas-row"><span class="meas-key">Central max width</span><span class="meas-val" id="m-cw">—</span></div>
          <div class="meas-row"><span class="meas-key">1st dark (min)</span><span class="meas-val" id="m-d1">—</span></div>
          <div class="meas-row"><span class="meas-key">2nd dark (min)</span><span class="meas-val" id="m-d2">—</span></div>
          <div class="meas-row"><span class="meas-key">Angular half-width</span><span class="meas-val" id="m-aw">—</span></div>
        </div>
      </div>
    `;
  }
}

// DOUBLE SLIT — animated drawing (t = phase time)

function drawDoubleSlit(ctx, W, H, p, R, G, B, meas, t) {
  const slitX = Math.round(W * 0.28);
  const screenX = W - 50;
  const patternW = 55;
  const waveSpacing = 28;

  const maxSep = H * 0.38;
  const slitSepPx = Math.min(p.d * 28, maxSep);
  const s1Y = H / 2 - slitSepPx / 2;
  const s2Y = H / 2 + slitSepPx / 2;
  const halfGap = 6;

  // ── background grid ──
  ctx.strokeStyle = 'rgba(255,255,255,0.03)'; ctx.lineWidth = 1;
  for (let gx = 0; gx < W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
  for (let gy = 0; gy < H; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }

  // ── incoming plane waves (animated — scroll right) ──
  const planeOffset = (t * waveSpacing * 0.55) % waveSpacing;
  for (let x = planeOffset; x < slitX - 2; x += waveSpacing) {
    const alpha = 0.08 + 0.2 * (x / (slitX - 2));
    ctx.beginPath(); ctx.moveTo(x, 2); ctx.lineTo(x, H - 2);
    ctx.strokeStyle = `rgba(${R},${G},${B},${alpha.toFixed(2)})`;
    ctx.lineWidth = 1.8; ctx.stroke();
  }

  // ── barrier ──
  ctx.fillStyle = 'rgba(200,170,80,0.9)';
  ctx.fillRect(slitX - 4, 0, 8, s1Y - halfGap);
  ctx.fillRect(slitX - 4, s1Y + halfGap, 8, s2Y - s1Y - 2 * halfGap);
  ctx.fillRect(slitX - 4, s2Y + halfGap, 8, H - s2Y - halfGap);
  ctx.fillStyle = `rgba(${R},${G},${B},0.12)`;
  ctx.fillRect(slitX - 4, s1Y - halfGap, 8, halfGap * 2);
  ctx.fillRect(slitX - 4, s2Y - halfGap, 8, halfGap * 2);

  // ── animated circular wavefronts from each slit ──
  const maxR = screenX - slitX;
  [s1Y, s2Y].forEach(sy => {
    for (let ring = 0; ring < 10; ring++) {
      const r = ((ring * waveSpacing + t * waveSpacing * 0.6) % maxR);
      if (r < 3) continue;
      const fade = Math.max(0, 1 - r / maxR);
      const crest = 0.5 + 0.5 * Math.cos(ring * Math.PI);
      const alpha = fade * 0.55 * crest;
      ctx.beginPath();
      ctx.arc(slitX, sy, r, -Math.PI * 0.55, Math.PI * 0.55);
      ctx.strokeStyle = `rgba(${R},${G},${B},${alpha.toFixed(3)})`;
      ctx.lineWidth = 1.4; ctx.stroke();
    }
  });

  // ── screen ──
  ctx.fillStyle = 'rgba(100,80,30,0.8)';
  ctx.fillRect(screenX, 0, 7, H);

  const lambda_m = p.lambda * 1e-9;
  const d_m = p.d * 1e-3;
  const D_m = p.D * 1e-2;
  const beta_mm = (lambda_m * D_m / d_m) * 1e3;  // fringe width in mm

  const halfWindow_mm = 15.0;
  const mmPerPx = halfWindow_mm / (H / 2);

  for (let py = 0; py < H; py++) {
    const y_mm = (py - H / 2) * mmPerPx;
    const delta = (d_m * y_mm * 1e-3) / D_m;
    const phase = (2 * Math.PI * delta) / lambda_m;
    const I = Math.cos(phase / 2) ** 2;
    ctx.fillStyle = `rgba(${R},${G},${B},${(I * 0.95).toFixed(2)})`;
    ctx.fillRect(screenX + 7, py, patternW, 1);
  }

  // scale bar: show 1mm reference
  const oneMmPx = 1 / mmPerPx;
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(screenX + 7, H - 18); ctx.lineTo(screenX + 7 + oneMmPx, H - 18); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(screenX + 7, H - 22); ctx.lineTo(screenX + 7, H - 14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(screenX + 7 + oneMmPx, H - 22); ctx.lineTo(screenX + 7 + oneMmPx, H - 14); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '8px Rajdhani'; ctx.textAlign = 'center';
  ctx.fillText('1mm', screenX + 7 + oneMmPx / 2, H - 6);

  // ── labels ──
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '11px Rajdhani';
  ctx.fillText('S₁', slitX + 8, s1Y + 4);
  ctx.fillText('S₂', slitX + 8, s2Y + 4);
  ctx.fillStyle = `rgba(${R},${G},${B},0.7)`; ctx.font = '10px Inter';
  ctx.fillText('λ=' + p.lambda + 'nm', 8, H - 8);

  // intensity axis
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(screenX + 7 + patternW + 3, 8); ctx.lineTo(screenX + 7 + patternW + 3, H - 10); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '9px Rajdhani';
  ctx.fillText('I', screenX + 7 + patternW + 7, H / 2 + 4);

  // ── measurements (throttled — only update every ~20 frames) ──
  const y1_mm = beta_mm, dark_mm = beta_mm / 2;
  if (document.getElementById('m-beta')) {
    document.getElementById('m-beta').textContent = beta_mm.toFixed(3) + ' mm';
    document.getElementById('m-y1').textContent = '±' + y1_mm.toFixed(3) + ' mm';
    document.getElementById('m-dark').textContent = '±' + dark_mm.toFixed(3) + ' mm';
    document.getElementById('m-pd').textContent = p.lambda + ' nm';
  }
  meas.innerHTML = `
    <div class="meas-row"><span class="meas-key">Fringe width β</span><span class="meas-val">${beta_mm.toFixed(3)} mm</span></div>
    <div class="meas-row"><span class="meas-key">1st bright (n=1)</span><span class="meas-val">±${y1_mm.toFixed(3)} mm</span></div>
    <div class="meas-row"><span class="meas-key">1st dark</span><span class="meas-val">±${dark_mm.toFixed(3)} mm</span></div>
    <div class="meas-row"><span class="meas-key">Path diff (n=1)</span><span class="meas-val">${p.lambda} nm</span></div>
  `;
}

// SINGLE SLIT — animated drawing (t = phase time)

function drawSingleSlit(ctx, W, H, p, R, G, B, meas, t) {
  const slitX = Math.round(W * 0.26);
  const screenX = W - 52;
  const patternW = 60;
  const waveSpacing = 28;
  const barrierWidth = 10;

  const slitPx = Math.max(10, Math.min(p.a * 20, H * 0.42));
  const slitTop = H / 2 - slitPx / 2;
  const slitBottom = H / 2 + slitPx / 2;
  const slitCenterY = H / 2;

  // ── background grid ──
  ctx.strokeStyle = 'rgba(255,255,255,0.03)'; ctx.lineWidth = 1;
  for (let gx = 0; gx < W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
  for (let gy = 0; gy < H; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }

  // ── incoming plane waves ──
  const planeOffset = (t * waveSpacing * 0.65) % waveSpacing;
  for (let x = planeOffset; x < slitX - barrierWidth; x += waveSpacing) {
    const alpha = 0.08 + 0.22 * (x / (slitX - barrierWidth));
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H);
    ctx.strokeStyle = `rgba(${R},${G},${B},${alpha.toFixed(2)})`;
    ctx.lineWidth = 1.6; ctx.stroke();
  }

  // ── barrier & slit ──
  ctx.fillStyle = 'rgba(14,10,26,0.98)';
  ctx.fillRect(slitX - barrierWidth / 2, 0, barrierWidth, slitTop);
  ctx.fillRect(slitX - barrierWidth / 2, slitBottom, barrierWidth, H - slitBottom);
  ctx.fillStyle = `rgba(${R},${G},${B},0.14)`;
  ctx.fillRect(slitX - barrierWidth / 2, slitTop, barrierWidth, slitPx);
  ctx.strokeStyle = `rgba(${R},${G},${B},0.4)`; ctx.lineWidth = 1.4;
  ctx.strokeRect(slitX - barrierWidth / 2, slitTop, barrierWidth, slitPx);

  // ── Huygens wavelets behind slit ──
  const sourcePoints = 12;
  const maxR = screenX - slitX - 6;
  for (let i = 0; i < sourcePoints; i++) {
    const sy = slitTop + (slitPx * i / (sourcePoints - 1));
    for (let ring = 0; ring < 12; ring++) {
      const rawR = (ring * waveSpacing + t * waveSpacing * 0.45) % (maxR + waveSpacing);
      const r = rawR < 5 ? rawR + 5 : rawR;
      if (r > maxR) continue;
      const fade = Math.max(0, 1 - r / maxR);
      const phase = Math.cos((r / waveSpacing) * Math.PI * 0.8);
      const alpha = Math.max(0, fade * 0.4 * (0.4 + 0.6 * phase));
      if (alpha < 0.02) continue;
      ctx.beginPath();
      ctx.arc(slitX + 2, sy, r, -Math.PI / 2, Math.PI / 2);
      ctx.strokeStyle = `rgba(${R},${G},${B},${alpha.toFixed(3)})`;
      ctx.lineWidth = 1.1;
      ctx.stroke();
    }
  }

  // ── screen panel ──
  ctx.fillStyle = 'rgba(18,18,30,0.95)';
  ctx.fillRect(screenX, 0, 8, H);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(screenX + 8, 0, patternW, H);

  // ── diffraction intensity pattern ──
  const lambda_m = p.lambda * 1e-9;
  const a_m = Math.max(p.a * 1e-3, 0.0003);
  const D_m = Math.max(p.D * 1e-2, 0.1);
  const y1_mm = (lambda_m * D_m / a_m) * 1e3;
  const halfWindow_mm = 30.0;
  const mmPerPx = halfWindow_mm / (H / 2);

  for (let py = 0; py < H; py++) {
    const y_mm = (py - H / 2) * mmPerPx;
    const theta = Math.atan2(y_mm * 1e-3, D_m);
    const beta = Math.PI * a_m * Math.sin(theta) / lambda_m;
    const I = sinc(beta) ** 2;
    ctx.fillStyle = `rgba(${R},${G},${B},${Math.min(1, I * 0.92).toFixed(3)})`;
    ctx.fillRect(screenX + 8, py, patternW, 1);
  }

  // ── screen labels and guide lines ──
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1;
  ctx.setLineDash([4, 5]);
  ctx.beginPath();
  ctx.moveTo(screenX + 8, H / 2);
  ctx.lineTo(screenX + 8 + patternW, H / 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = `rgba(${R},${G},${B},0.75)`;
  ctx.font = '10px Inter'; ctx.textAlign = 'left';
  ctx.fillText('λ=' + p.lambda + ' nm', 10, H - 10);
  ctx.fillText('Single slit', slitX - 50, slitTop - 12);

  // ── central width and slit label ──
  ctx.strokeStyle = 'rgba(0,255,159,0.65)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(slitX - 18, slitTop); ctx.lineTo(slitX - 18, slitBottom); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(slitX - 18, slitTop); ctx.lineTo(slitX - 9, slitTop); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(slitX - 18, slitBottom); ctx.lineTo(slitX - 9, slitBottom); ctx.stroke();
  ctx.fillStyle = 'rgba(0,255,159,0.75)'; ctx.font = '10px Rajdhani';
  ctx.fillText('a', slitX - 26, H / 2 + 4);

  // ── measurement cards ──
  const y2_mm = 2 * y1_mm;
  const ang_deg = (Math.asin(Math.min(1, lambda_m / a_m)) * 180 / Math.PI).toFixed(2);
  if (document.getElementById('m-cw')) {
    document.getElementById('m-cw').textContent = (2 * y1_mm).toFixed(3) + ' mm';
    document.getElementById('m-d1').textContent = '±' + y1_mm.toFixed(3) + ' mm';
    document.getElementById('m-d2').textContent = '±' + y2_mm.toFixed(3) + ' mm';
    document.getElementById('m-aw').textContent = ang_deg + '°';
  }
  meas.innerHTML = `
    <div class="meas-row"><span class="meas-key">Central max width</span><span class="meas-val">${(2 * y1_mm).toFixed(3)} mm</span></div>
    <div class="meas-row"><span class="meas-key">1st dark (m=1)</span><span class="meas-val">±${y1_mm.toFixed(3)} mm</span></div>
    <div class="meas-row"><span class="meas-key">2nd dark (m=2)</span><span class="meas-val">±${y2_mm.toFixed(3)} mm</span></div>
    <div class="meas-row"><span class="meas-key">Angular half-width</span><span class="meas-val">${ang_deg}°</span></div>
  `;
}

const PROJECTILE_EPS = 1e-6;

function clampNumber(value, min, max, fallback = min) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function snapTrig(value) {
  return Math.abs(value) < PROJECTILE_EPS ? 0 : value;
}

function buildProjectilePhysics(params) {
  const angleDeg = clampNumber(params.angle, 0, 180, 45);
  const theta = angleDeg * Math.PI / 180;
  const v0 = clampNumber(params.v0, 0.1, 100, 20);
  const g = clampNumber(params.g, 0.1, 50, 9.8);
  const mass = clampNumber(params.mass, 0.01, 50, 1);
  const sin = snapTrig(Math.sin(theta));
  const cos = snapTrig(Math.cos(theta));
  const vx0 = v0 * cos;
  const vy0 = v0 * sin;
  const horizontalMode = Math.abs(sin) < PROJECTILE_EPS;
  const duration = horizontalMode
    ? clampNumber(30 / Math.max(Math.abs(vx0), 0.1), 1.2, 6, 2.5)
    : Math.max((2 * vy0) / g, 0.05);
  const totalEnergy = 0.5 * mass * v0 * v0;

  function at(time) {
    const t = clampNumber(time, 0, duration, 0);
    const x = vx0 * t;
    const rawY = horizontalMode ? 0 : vy0 * t - 0.5 * g * t * t;
    const y = Math.max(0, rawY);
    const vy = horizontalMode ? 0 : vy0 - g * t;
    const speed2 = vx0 * vx0 + vy * vy;
    const KE = 0.5 * mass * speed2;
    const PE = mass * g * y;
    return { t, x, y, vx: vx0, vy, speed: Math.sqrt(speed2), KE, PE, TE: totalEnergy };
  }

  const maxHeight = horizontalMode ? 0 : (vy0 * vy0) / (2 * g);
  const landingX = vx0 * duration;
  return { angleDeg, theta, v0, g, mass, sin, cos, vx0, vy0, horizontalMode, duration, totalEnergy, maxHeight, landingX, at };
}

function initProjectileSim(canvas, panel, title, meas) {
  title.textContent = 'Projectile Motion — 0° to 180° + Energy Conservation';
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // Larger graph region: old graph used ~30% of a 420px canvas (~126px).
  // The new projectile canvas is 560–700px tall and reserves 42% for energy.
  const TRAJ_H = Math.floor(H * 0.58);
  const GRAPH_Y = TRAJ_H + 8;
  const GRAPH_H = H - GRAPH_Y - 6;
  const GROUND_PAD = 34;
  const TOP_PAD = 24;
  const SIDE_PAD = 54;

  let p = { v0: 20, angle: 45, g: 9.8, mass: 1.0 };
  let physics = buildProjectilePhysics(p);
  let animRunning = false, paused = false, animId = null, t = 0, trail = [], lastFrame = null;

  function refreshPhysics() {
    p.v0 = clampNumber(p.v0, 0.1, 100, 20);
    p.angle = clampNumber(p.angle, 0, 180, 45);
    p.g = clampNumber(p.g, 0.1, 50, 9.8);
    p.mass = clampNumber(p.mass, 0.01, 50, 1);
    physics = buildProjectilePhysics(p);
    t = Math.min(t, physics.duration);
  }

  function sampleTrajectory(steps = 160) {
    return Array.from({ length: steps + 1 }, (_, i) => physics.at(physics.duration * i / steps));
  }

  function getViewport(samples) {
    const xs = samples.map(pt => pt.x).concat([0, physics.landingX]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const maxY = Math.max(1, physics.maxHeight, ...samples.map(pt => pt.y));
    const xSpan = Math.max(1, maxX - minX);
    const scaleX = (W - SIDE_PAD * 2) / xSpan;
    const scaleY = (TRAJ_H - GROUND_PAD - TOP_PAD) / maxY;
    const scale = Math.max(4, Math.min(scaleX, scaleY, 28));
    const groundY = TRAJ_H - GROUND_PAD;
    const originX = xSpan < 1.2 ? W / 2 : SIDE_PAD - minX * scale;
    return { minX, maxX, maxY, scale, groundY, originX };
  }

  function toCanvas(pt, viewport) {
    return {
      x: viewport.originX + pt.x * viewport.scale,
      y: viewport.groundY - pt.y * viewport.scale
    };
  }

  function arrow(x1, y1, x2, y2, color, w = 2) {
    const dx = x2 - x1, dy = y2 - y1;
    if (Math.hypot(dx, dy) < 0.5) return;
    ctx.strokeStyle = color; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const a = Math.atan2(dy, dx);
    ctx.fillStyle = color; ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 10 * Math.cos(a - 0.4), y2 - 10 * Math.sin(a - 0.4));
    ctx.lineTo(x2 - 10 * Math.cos(a + 0.4), y2 - 10 * Math.sin(a + 0.4));
    ctx.closePath(); ctx.fill();
  }

  function drawScene(curT) {
    const samples = sampleTrajectory();
    const viewport = getViewport(samples);
    const launch = toCanvas({ x: 0, y: 0 }, viewport);
    const current = toCanvas(physics.at(curT), viewport);
    const landing = toCanvas({ x: physics.landingX, y: 0 }, viewport);

    ctx.fillStyle = '#03010a'; ctx.fillRect(0, 0, W, TRAJ_H);

    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
    for (let gx = 0; gx < W; gx += 50) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, TRAJ_H); ctx.stroke(); }
    for (let gy = 0; gy < TRAJ_H; gy += 50) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }

    ctx.fillStyle = 'rgba(0,255,159,0.08)'; ctx.fillRect(0, viewport.groundY, W, TRAJ_H - viewport.groundY);
    ctx.strokeStyle = 'rgba(0,255,159,0.42)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, viewport.groundY); ctx.lineTo(W, viewport.groundY); ctx.stroke();

    const scaleLenM = Math.max(1, Math.round(60 / viewport.scale));
    const scaleLenPx = scaleLenM * viewport.scale;
    ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W - SIDE_PAD - scaleLenPx, viewport.groundY + 18); ctx.lineTo(W - SIDE_PAD, viewport.groundY + 18); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.42)'; ctx.font = '10px Rajdhani'; ctx.textAlign = 'center';
    ctx.fillText(`${scaleLenM} m`, W - SIDE_PAD - scaleLenPx / 2, viewport.groundY + 31);

    ctx.beginPath();
    samples.forEach((pt, i) => {
      const c = toCanvas(pt, viewport);
      i === 0 ? ctx.moveTo(c.x, c.y) : ctx.lineTo(c.x, c.y);
    });
    ctx.strokeStyle = 'rgba(0,255,159,0.22)'; ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]); ctx.stroke(); ctx.setLineDash([]);

    trail.forEach((pt, i) => {
      const c = toCanvas(pt, viewport);
      ctx.beginPath(); ctx.arc(c.x, c.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,255,159,${Math.max(0.12, i / Math.max(1, trail.length) * 0.65).toFixed(2)})`; ctx.fill();
    });

    const guideR = 30;
    ctx.strokeStyle = 'rgba(180,79,255,0.55)'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(launch.x, launch.y, guideR, 0, -physics.theta, true);
    ctx.stroke();
    const launchLen = 54;
    arrow(launch.x, launch.y, launch.x + physics.cos * launchLen, launch.y - physics.sin * launchLen, 'rgba(180,79,255,0.8)', 2);
    ctx.fillStyle = 'rgba(180,79,255,0.85)'; ctx.font = 'bold 11px Rajdhani'; ctx.textAlign = 'center';
    ctx.fillText(`${physics.angleDeg.toFixed(0)}°`, launch.x + Math.cos(-physics.theta / 2) * 45, launch.y + Math.sin(-physics.theta / 2) * 45 - 4);

    ctx.fillStyle = 'rgba(0,212,255,0.95)'; ctx.beginPath(); ctx.arc(launch.x, launch.y, 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,107,43,0.85)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(landing.x - 8, landing.y - 8); ctx.lineTo(landing.x + 8, landing.y + 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(landing.x + 8, landing.y - 8); ctx.lineTo(landing.x - 8, landing.y + 8); ctx.stroke();
    ctx.fillStyle = 'rgba(255,107,43,0.85)'; ctx.font = '10px Rajdhani'; ctx.textAlign = 'center';
    ctx.fillText('landing', landing.x, landing.y - 13);

    ctx.shadowColor = 'rgba(0,255,159,0.95)'; ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.arc(current.x, current.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,255,159,0.96)'; ctx.fill();
    ctx.shadowBlur = 0;

    const cur = physics.at(curT);
    arrow(current.x, current.y, current.x + cur.vx * 2.0, current.y, 'rgba(0,212,255,0.85)');
    arrow(current.x, current.y, current.x, current.y - cur.vy * 2.0, 'rgba(255,107,43,0.85)');
    ctx.fillStyle = 'rgba(0,212,255,0.78)'; ctx.font = 'bold 11px Rajdhani'; ctx.textAlign = 'left';
    ctx.fillText('Vx', current.x + cur.vx, current.y - 8);
    ctx.fillStyle = 'rgba(255,107,43,0.78)';
    ctx.fillText('Vy', current.x + 8, current.y - cur.vy);

    ctx.fillStyle = 'rgba(255,255,255,0.36)'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'left';
    ctx.fillText(`t = ${cur.t.toFixed(2)} s`, 8, 16);
    ctx.fillText(`x = ${cur.x.toFixed(2)} m`, 8, 31);
    if (physics.horizontalMode) ctx.fillText('horizontal launch mode: y stays at ground level', 8, 46);
    if (paused) {
      ctx.fillStyle = 'rgba(255,107,43,0.85)'; ctx.font = 'bold 12px Inter'; ctx.textAlign = 'center';
      ctx.fillText('⏸ PAUSED', W / 2, 22);
    }
    ctx.textAlign = 'left';
  }

  function drawGraph(curT) {
    ctx.fillStyle = 'rgba(6,2,18,0.96)'; ctx.fillRect(0, GRAPH_Y, W, GRAPH_H);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
    ctx.strokeRect(0, GRAPH_Y, W, GRAPH_H);

    const PAD_L = 72, PAD_R = 26, PAD_T = 36, PAD_B = 42;
    const gW = W - PAD_L - PAD_R;
    const gH = GRAPH_H - PAD_T - PAD_B;
    const GX = PAD_L, GY = GRAPH_Y + PAD_T;
    const maxE = Math.max(physics.totalEnergy, 1);
    const T = Math.max(physics.duration, 0.05);
    const toX = (tv) => GX + (clampNumber(tv, 0, T, 0) / T) * gW;
    const toY = (e) => GY + gH - (clampNumber(e, 0, maxE, 0) / maxE) * gH;
    const samples = sampleTrajectory(180);

    ctx.fillStyle = 'rgba(255,255,255,0.72)'; ctx.font = 'bold 12px Inter'; ctx.textAlign = 'left';
    ctx.fillText('Potential Energy vs Kinetic Energy', GX, GRAPH_Y + 20);

    ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(GX, GY); ctx.lineTo(GX, GY + gH); ctx.lineTo(GX + gW, GY + gH); ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.42)'; ctx.font = '10px JetBrains Mono';
    [0, 0.25, 0.5, 0.75, 1].forEach(frac => {
      const gy = GY + gH - frac * gH;
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 0.8; ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.moveTo(GX, gy); ctx.lineTo(GX + gW, gy); ctx.stroke(); ctx.setLineDash([]);
      ctx.textAlign = 'right'; ctx.fillText(`${(frac * maxE).toFixed(0)} J`, GX - 8, gy + 3);
    });

    [0, 0.5, 1].forEach(frac => {
      const tx = GX + frac * gW;
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.beginPath(); ctx.moveTo(tx, GY); ctx.lineTo(tx, GY + gH); ctx.stroke();
      ctx.textAlign = 'center'; ctx.fillText(`${(frac * T).toFixed(1)} s`, tx, GY + gH + 18);
    });

    ctx.save();
    ctx.translate(18, GY + gH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
    ctx.fillText('Energy (J)', 0, 0);
    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
    ctx.fillText('Time (s)', GX + gW / 2, GY + gH + 34);

    ctx.strokeStyle = 'rgba(180,79,255,0.55)'; ctx.lineWidth = 1.2; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(GX, toY(maxE)); ctx.lineTo(GX + gW, toY(maxE)); ctx.stroke(); ctx.setLineDash([]);

    ctx.beginPath();
    samples.forEach((pt, i) => { i === 0 ? ctx.moveTo(toX(pt.t), toY(pt.KE)) : ctx.lineTo(toX(pt.t), toY(pt.KE)); });
    ctx.strokeStyle = 'rgba(0,255,159,0.95)'; ctx.lineWidth = 2.4; ctx.stroke();

    ctx.beginPath();
    samples.forEach((pt, i) => { i === 0 ? ctx.moveTo(toX(pt.t), toY(pt.PE)) : ctx.lineTo(toX(pt.t), toY(pt.PE)); });
    ctx.strokeStyle = 'rgba(0,212,255,0.95)'; ctx.lineWidth = 2.4; ctx.stroke();

    const cur = physics.at(curT);
    const playX = toX(cur.t);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(playX, GY); ctx.lineTo(playX, GY + gH); ctx.stroke();

    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(0,255,159,0.8)'; ctx.fillStyle = 'rgba(0,255,159,1)'; ctx.beginPath(); ctx.arc(playX, toY(cur.KE), 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.shadowColor = 'rgba(0,212,255,0.8)'; ctx.fillStyle = 'rgba(0,212,255,1)'; ctx.beginPath(); ctx.arc(playX, toY(cur.PE), 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    const legendX = Math.max(GX + 180, GX + gW - 245);
    ctx.font = 'bold 10px Rajdhani'; ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(0,255,159,0.95)'; ctx.fillText('■ KE (J)', legendX, GRAPH_Y + 20);
    ctx.fillStyle = 'rgba(0,212,255,0.95)'; ctx.fillText('■ PE (J)', legendX + 78, GRAPH_Y + 20);
    ctx.fillStyle = 'rgba(180,79,255,0.8)'; ctx.fillText('─ Total Energy', legendX + 156, GRAPH_Y + 20);
  }

  function updateMeas(curT) {
    const cur = physics.at(curT);
    const rangeLabel = physics.horizontalMode ? `${physics.landingX.toFixed(3)} m (display)` : `${physics.landingX.toFixed(3)} m`;
    meas.innerHTML = `
      <div class="meas-row"><span class="meas-key">Time t</span><span class="meas-val">${cur.t.toFixed(3)} s</span></div>
      <div class="meas-row"><span class="meas-key">Height h</span><span class="meas-val">${cur.y.toFixed(3)} m</span></div>
      <div class="meas-row"><span class="meas-key">x displacement</span><span class="meas-val">${cur.x.toFixed(3)} m</span></div>
      <div class="meas-row"><span class="meas-key">Speed |v|</span><span class="meas-val">${cur.speed.toFixed(3)} m/s</span></div>
      <div class="meas-row"><span class="meas-key">Vx</span><span class="meas-val">${cur.vx.toFixed(3)} m/s</span></div>
      <div class="meas-row"><span class="meas-key">Vy</span><span class="meas-val">${cur.vy.toFixed(3)} m/s</span></div>
      <div style="margin:10px 0 6px;border-top:1px solid rgba(0,255,159,0.15);padding-top:10px;">
        <div class="meas-row"><span class="meas-key" style="color:rgba(0,255,159,0.9);">KE</span><span class="meas-val" style="color:rgba(0,255,159,1);font-size:0.9rem;">${cur.KE.toFixed(4)} J</span></div>
        <div class="meas-row"><span class="meas-key" style="color:rgba(0,212,255,0.9);">PE</span><span class="meas-val" style="color:rgba(0,212,255,1);font-size:0.9rem;">${cur.PE.toFixed(4)} J</span></div>
        <div class="meas-row"><span class="meas-key" style="color:rgba(180,79,255,0.9);">TE = KE+PE</span><span class="meas-val" style="color:rgba(180,79,255,1);font-size:0.9rem;">${cur.TE.toFixed(4)} J</span></div>
        <div class="meas-row"><span class="meas-key">KE / TE</span><span class="meas-val">${(cur.KE / cur.TE * 100).toFixed(2)}%</span></div>
        <div class="meas-row"><span class="meas-key">PE / TE</span><span class="meas-val">${(cur.PE / cur.TE * 100).toFixed(2)}%</span></div>
      </div>
      <div style="margin:10px 0 6px;border-top:1px solid rgba(255,255,255,0.06);padding-top:10px;">
        <div class="meas-row"><span class="meas-key">Max Height</span><span class="meas-val">${physics.maxHeight.toFixed(3)} m</span></div>
        <div class="meas-row"><span class="meas-key">Landing x</span><span class="meas-val">${rangeLabel}</span></div>
        <div class="meas-row"><span class="meas-key">Flight Time</span><span class="meas-val">${physics.duration.toFixed(3)} s</span></div>
      </div>
    `;
  }

  function render(curT) {
    refreshPhysics();
    drawScene(curT);
    drawGraph(curT);
    updateMeas(curT);
  }

  function syncProjectileControls() {
    [['v0', p.v0.toFixed(1), 'v0v', ' m/s'], ['angle', p.angle.toFixed(0), 'angv', '°'], ['mass', p.mass.toFixed(1), 'massv', ' kg'], ['g', p.g.toFixed(1), 'gv', ' m/s²']].forEach(([key, value, labelId, unit]) => {
      const slider = document.getElementById(`${key}-slider`);
      const number = document.getElementById(`${key}-number`);
      const label = document.getElementById(labelId);
      if (slider) slider.value = value;
      if (number) number.value = value;
      if (label) label.textContent = `${value}${unit}`;
    });
  }

  function setProjectileParam(key, value) {
    if (value === '') return;
    p[key] = value;
    refreshPhysics();
    trail = [];
    syncProjectileControls();
    render(t);
  }

  function startAnim() {
    if (animRunning) {
      stopAnimLocal();
      return;
    }
    animRunning = true; paused = false; t = 0; trail = []; lastFrame = null;
    document.getElementById('btn-sim-play').textContent = '⏹ STOP';
    document.getElementById('btn-pause').disabled = false;
    document.getElementById('btn-pause').textContent = '⏸ PAUSE';
    document.getElementById('btn-pause').style.borderColor = 'rgba(255,107,43,0.4)';
    document.getElementById('btn-pause').style.color = 'var(--neon-orange)';
    step();
  }

  function step(ts) {
    if (!animRunning || paused) return;
    if (lastFrame == null) lastFrame = ts || performance.now();
    const now = ts || performance.now();
    const dt = Math.min(0.04, Math.max(0, (now - lastFrame) / 1000));
    lastFrame = now;
    t = Math.min(physics.duration, t + dt);
    const cur = physics.at(t);
    trail.push({ x: cur.x, y: cur.y });
    if (trail.length > 120) trail.shift();
    render(t);

    if (t < physics.duration && animRunning) {
      animId = requestAnimationFrame(step);
      window._projectileAnimId = animId;
    } else {
      animRunning = false; paused = false; window._projectileAnimId = null;
      document.getElementById('btn-sim-play').textContent = '▶ LAUNCH';
      document.getElementById('btn-pause').textContent = '⏸ PAUSE';
      document.getElementById('btn-pause').disabled = true;
    }
  }

  function stopAnimLocal() {
    animRunning = false; paused = false;
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    if (window._projectileAnimId) { cancelAnimationFrame(window._projectileAnimId); window._projectileAnimId = null; }
    document.getElementById('btn-sim-play').textContent = '▶ LAUNCH';
    const pb = document.getElementById('btn-pause');
    if (pb) { pb.textContent = '⏸ PAUSE'; pb.disabled = true; }
    t = 0; trail = [];
    render(0);
  }

  panel.innerHTML = `
    <div class="controls-card">
      <div class="ctrl-title">⚙️ Parameters</div>
      <div class="param-row">
        <div class="param-label">Initial Velocity v₀ <span class="val" id="v0v">${p.v0.toFixed(1)} m/s</span></div>
        <div class="range-number-row">
          <input id="v0-slider" type="range" min="1" max="60" step="0.1" value="${p.v0}" oninput="projSetParam('v0', this.value)">
          <input id="v0-number" class="param-number-input" type="number" min="1" max="60" step="0.1" value="${p.v0}" oninput="projSetParam('v0', this.value)">
        </div>
      </div>
      <div class="param-row">
        <div class="param-label">Launch Angle θ <span class="val" id="angv">${p.angle.toFixed(0)}°</span></div>
        <div class="range-number-row">
          <input id="angle-slider" type="range" min="0" max="180" step="1" value="${p.angle}" oninput="projSetParam('angle', this.value)">
          <input id="angle-number" class="param-number-input" type="number" min="0" max="180" step="1" value="${p.angle}" oninput="projSetParam('angle', this.value)">
        </div>
      </div>
      <div class="param-row">
        <div class="param-label">Mass m <span class="val" id="massv">${p.mass.toFixed(1)} kg</span></div>
        <div class="range-number-row">
          <input id="mass-slider" type="range" min="0.1" max="5" step="0.1" value="${p.mass}" oninput="projSetParam('mass', this.value)">
          <input id="mass-number" class="param-number-input" type="number" min="0.1" max="5" step="0.1" value="${p.mass}" oninput="projSetParam('mass', this.value)">
        </div>
      </div>
      <div class="param-row">
        <div class="param-label">Gravity g <span class="val" id="gv">${p.g.toFixed(1)} m/s²</span></div>
        <div class="range-number-row">
          <input id="g-slider" type="range" min="1" max="25" step="0.1" value="${p.g}" oninput="projSetParam('g', this.value)">
          <input id="g-number" class="param-number-input" type="number" min="1" max="25" step="0.1" value="${p.g}" oninput="projSetParam('g', this.value)">
        </div>
      </div>
    </div>
    <div class="controls-card">
      <button class="btn-sim primary" id="btn-sim-play" onclick="projLaunch()">▶ LAUNCH</button>
      <button class="btn-sim" id="btn-pause" onclick="projPause()" disabled
        style="width:100%;padding:13px;border-radius:10px;font-family:'Inter',monospace;font-size:0.82rem;font-weight:700;letter-spacing:0.1em;cursor:pointer;transition:all 0.3s;border:1px solid rgba(255,107,43,0.4);background:transparent;color:var(--neon-orange);margin-bottom:10px;opacity:0.5;">
        ⏸ PAUSE
      </button>
      <button class="btn-sim reset" onclick="projReset()">↺ RESET</button>
      <div style="font-size:0.78rem;color:var(--muted);line-height:1.55;margin-top:12px;">
        θ supports 0° horizontal forward, 90° vertical, and 180° horizontal backward.
      </div>
    </div>
  `;

  if (!document.getElementById('projectile-pause-style')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'projectile-pause-style';
    styleEl.textContent = '#btn-pause:not([disabled]){opacity:1!important;}';
    document.head.appendChild(styleEl);
  }

  window.projP = p;
  window.projSetParam = setProjectileParam;
  window.projLaunch = startAnim;
  window.projPause = () => {
    if (!animRunning) return;
    const pb = document.getElementById('btn-pause');
    if (!paused) {
      paused = true;
      if (animId) { cancelAnimationFrame(animId); animId = null; }
      if (window._projectileAnimId) { cancelAnimationFrame(window._projectileAnimId); window._projectileAnimId = null; }
      pb.textContent = '▶ RESUME';
      pb.style.color = 'var(--neon-green)';
      pb.style.borderColor = 'rgba(0,255,159,0.4)';
      render(t);
    } else {
      paused = false; lastFrame = null;
      pb.textContent = '⏸ PAUSE';
      pb.style.color = 'var(--neon-orange)';
      pb.style.borderColor = 'rgba(255,107,43,0.4)';
      step();
    }
  };
  window.projReset = stopAnimLocal;

  syncProjectileControls();
  render(0);
}


// ELECTRIC FIELD SIMULATION
function initElectricSim(canvas, panel, title, meas, sub) {
  title.textContent = sub === 'single' ? 'Electric Field & Potential — Single Charge' : 'Electric Field — Multiple Charges (Superposition)';
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let charges = [{ x: W / 2, y: H / 2, q: 1, id: Date.now() }];
  let showField = true, showEquipotential = true, showForce = true;
  let dragId = null, dragOff = { x: 0, y: 0 };
  let testCharge = { x: W * 0.75, y: H / 2 };
  const k = 50;

  function getField(px, py) {
    let Ex = 0, Ey = 0;
    charges.forEach(c => {
      const dx = px - c.x, dy = py - c.y, r2 = dx * dx + dy * dy;
      if (r2 < 1) return;
      const E = k * c.q / r2;
      Ex += E * dx / Math.sqrt(r2); Ey += E * dy / Math.sqrt(r2);
    });
    return { Ex, Ey };
  }

  function getPotential(px, py) {
    let V = 0;
    charges.forEach(c => {
      const r = Math.sqrt((px - c.x) ** 2 + (py - c.y) ** 2);
      if (r > 0.5) V += k * c.q / r;
    });
    return V;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#03010a'; ctx.fillRect(0, 0, W, H);

    // Equipotential
    if (showEquipotential) {
      const levels = [-4, -2, -1, -0.5, 0.5, 1, 2, 4].map(v => v * 8);
      levels.forEach(V_level => {
        ctx.beginPath();
        let first = true;
        for (let y = 5; y < H; y += 4) {
          for (let x = 5; x < W; x += 4) {
            const V = getPotential(x, y);
            if (Math.abs(V - V_level) < 0.4 * Math.abs(V_level || 1) + 0.3) {
              if (first) { ctx.moveTo(x, y); first = false; } else { ctx.lineTo(x, y); }
            }
          }
        }
        const hue = V_level > 0 ? '0,180,255' : '255,80,80';
        ctx.strokeStyle = `rgba(${hue},0.35)`;
        ctx.lineWidth = 1; ctx.stroke();
      });
    }

    // Field lines
    if (showField) {
      charges.forEach(c => {
        const nLines = 16;
        for (let i = 0; i < nLines; i++) {
          const angle = i / nLines * Math.PI * 2;
          let x = c.x + (c.q > 0 ? 18 : -18) * Math.cos(angle);
          let y = c.y + (c.q > 0 ? 18 : -18) * Math.sin(angle);
          ctx.beginPath(); ctx.moveTo(x, y);
          for (let s = 0; s < 300; s++) {
            const { Ex, Ey } = getField(x, y);
            const mag = Math.sqrt(Ex * Ex + Ey * Ey);
            if (mag < 0.01) break;
            const dir = c.q > 0 ? 1 : -1;
            x += dir * 4 * Ex / mag; y += dir * 4 * Ey / mag;
            if (x < 0 || x > W || y < 0 || y > H) break;
            ctx.lineTo(x, y);
            let near = false;
            charges.forEach(c2 => { if (c2.q < 0 && Math.sqrt((x - c2.x) ** 2 + (y - c2.y) ** 2) < 18) near = true; });
            if (near) break;
          }
          ctx.strokeStyle = `rgba(255,107,43,0.6)`; ctx.lineWidth = 1.3; ctx.stroke();
        }
      });
    }

    // Test charge force
    if (showForce) {
      const { Ex, Ey } = getField(testCharge.x, testCharge.y);
      const mag = Math.sqrt(Ex * Ex + Ey * Ey);
      if (mag > 0.01) {
        const len = Math.min(60, mag * 5);
        const nx = Ex / mag, ny = Ey / mag;
        ctx.beginPath();
        ctx.moveTo(testCharge.x, testCharge.y);
        ctx.lineTo(testCharge.x + nx * len, testCharge.y + ny * len);
        ctx.strokeStyle = 'rgba(0,255,159,0.9)'; ctx.lineWidth = 2.5; ctx.stroke();
        // Arrow
        const a2 = Math.atan2(ny, nx);
        ctx.beginPath();
        ctx.moveTo(testCharge.x + nx * len, testCharge.y + ny * len);
        ctx.lineTo(testCharge.x + nx * len - 12 * Math.cos(a2 - 0.4), testCharge.y + ny * len - 12 * Math.sin(a2 - 0.4));
        ctx.lineTo(testCharge.x + nx * len - 12 * Math.cos(a2 + 0.4), testCharge.y + ny * len - 12 * Math.sin(a2 + 0.4));
        ctx.closePath(); ctx.fillStyle = 'rgba(0,255,159,0.9)'; ctx.fill();
        // Test charge circle
        ctx.beginPath(); ctx.arc(testCharge.x, testCharge.y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,255,159,0.8)'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = 'rgba(0,255,159,0.3)'; ctx.fill();
        ctx.fillStyle = 'rgba(0,255,159,0.9)'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center';
        ctx.fillText('+', testCharge.x, testCharge.y + 4); ctx.textAlign = 'left';
      }
    }

    // Charges
    charges.forEach(c => {
      const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 20);
      if (c.q > 0) { grad.addColorStop(0, 'rgba(255,100,100,0.9)'); grad.addColorStop(1, 'rgba(200,50,50,0)'); }
      else { grad.addColorStop(0, 'rgba(100,100,255,0.9)'); grad.addColorStop(1, 'rgba(50,50,200,0)'); }
      ctx.beginPath(); ctx.arc(c.x, c.y, 20, 0, Math.PI * 2);
      ctx.fillStyle = grad; ctx.fill();
      ctx.beginPath(); ctx.arc(c.x, c.y, 16, 0, Math.PI * 2);
      ctx.strokeStyle = c.q > 0 ? 'rgba(255,150,150,0.8)' : 'rgba(150,150,255,0.8)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = 'white'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center';
      ctx.fillText(c.q > 0 ? '+' : '-', c.x, c.y + 6); ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '9px Rajdhani';
      ctx.fillText(`${c.q > 0 ? '+' : ''}${c.q}C`, c.x - 10, c.y - 22);
    });

    // Measurements
    const V = getPotential(testCharge.x, testCharge.y);
    const { Ex, Ey } = getField(testCharge.x, testCharge.y);
    const Emag = Math.sqrt(Ex * Ex + Ey * Ey);
    meas.innerHTML = `
      <div class="meas-row"><span class="meas-key">V at test charge</span><span class="meas-val">${V.toFixed(2)} V</span></div>
      <div class="meas-row"><span class="meas-key">|E| at test charge</span><span class="meas-val">${Emag.toFixed(3)} N/C</span></div>
      <div class="meas-row"><span class="meas-key">F on +1C test</span><span class="meas-val">${Emag.toFixed(3)} N</span></div>
      <div class="meas-row"><span class="meas-key">Total charges</span><span class="meas-val">${charges.length}</span></div>
    `;
  }

  // Mouse interaction. Assigned handlers prevent duplicate callbacks
  // when users leave and re-enter the electric simulation.
  const pointerToCanvas = e => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: clampNumber((e.clientX - rect.left) * (W / rect.width), 8, W - 8, W / 2),
      y: clampNumber((e.clientY - rect.top) * (H / rect.height), 8, H - 8, H / 2)
    };
  };

  canvas.onmousedown = e => {
    const { x: mx, y: my } = pointerToCanvas(e);
    if (Math.sqrt((mx - testCharge.x) ** 2 + (my - testCharge.y) ** 2) < 15) { dragId = 'test'; return; }
    charges.forEach(c => {
      if (Math.sqrt((mx - c.x) ** 2 + (my - c.y) ** 2) < 20) { dragId = c.id; dragOff = { x: mx - c.x, y: my - c.y }; }
    });
  };
  canvas.onmousemove = e => {
    if (!dragId) return;
    const { x: mx, y: my } = pointerToCanvas(e);
    if (dragId === 'test') { testCharge.x = mx; testCharge.y = my; }
    else { const c = charges.find(c => c.id === dragId); if (c) { c.x = clampNumber(mx - dragOff.x, 20, W - 20, c.x); c.y = clampNumber(my - dragOff.y, 20, H - 20, c.y); } }
    draw();
  };
  canvas.onmouseup = () => { dragId = null; };
  canvas.onmouseleave = () => { dragId = null; };

  // Build controls
  function buildElectricControls() {
    panel.innerHTML = `
      <div class="controls-card">
        <div class="ctrl-title">⚙️ Add Charges</div>
        <div class="radio-group">
          <div class="radio-btn active" id="rpos" onclick="setChargeSign(1)">+ Positive</div>
          <div class="radio-btn" id="rneg" onclick="setChargeSign(-1)">- Negative</div>
        </div>
        <div class="param-number-row">
          <label>Magnitude (C)</label>
          <input type="number" id="charge-mag" value="1" min="0.5" max="5" step="0.5">
        </div>
        <button class="btn-sim primary" onclick="addCharge()">+ Add Charge</button>
        <button class="btn-sim reset" onclick="clearCharges()">↺ Clear All</button>
      </div>
      <div class="controls-card">
        <div class="ctrl-title">👁 Visibility</div>
        <div class="radio-group">
          <div class="radio-btn active" onclick="toggleLayer('field',this)">Field Lines</div>
          <div class="radio-btn active" onclick="toggleLayer('equi',this)">Equipotential</div>
          <div class="radio-btn active" onclick="toggleLayer('force',this)">Force Vector</div>
        </div>
        <div style="font-size:0.78rem;color:var(--muted);margin-top:10px;line-height:1.5;">
          💡 Drag charges or the green test charge to explore the field
        </div>
      </div>
    `;
  }

  let chargeSign = 1;
  window.setChargeSign = s => {
    chargeSign = s;
    document.getElementById('rpos').classList.toggle('active', s > 0);
    document.getElementById('rneg').classList.toggle('active', s < 0);
  };
  window.addCharge = () => {
    if (sub === 'single' && charges.length >= 1) { charges = []; }
    const mag = +(document.getElementById('charge-mag').value) || 1;
    charges.push({ x: 100 + Math.random() * (W - 200), y: 100 + Math.random() * (H - 200), q: chargeSign * mag, id: Date.now() });
    draw();
  };
  window.clearCharges = () => { charges = []; draw(); };
  window.toggleLayer = (layer, el) => {
    el.classList.toggle('active');
    if (layer === 'field') showField = el.classList.contains('active');
    else if (layer === 'equi') showEquipotential = el.classList.contains('active');
    else showForce = el.classList.contains('active');
    draw();
  };

  buildElectricControls();
  draw();

  // Auto-draw loop for smooth interaction
  function loop() { draw(); simState.animId = requestAnimationFrame(loop); }
  loop();
}

// TOAST

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.5s'; setTimeout(() => t.remove(), 500); }, 3000);
}

// AI CHATBOT

const CHAT_SYSTEM_PROMPT = 'Physics Assistant: Answer only physics questions concisely. Always use LaTeX for math formulas (e.g., $E=mc^2$ or \\[V=IR\\]).';


const CHAT_CHIPS = {
  wave: ['Explain this simulation', 'Why fringes form?', 'Give me a formula'],
  projectile: ['Explain this simulation', 'What is KE?', 'Give me a formula'],
  electric: ['Explain this simulation', 'What is potential?', 'Give me a formula'],
  default: ['Explain this simulation', 'What is KE?', 'Give me a formula']
};

function initChat(topic) {
  const msgs = document.getElementById('chat-messages');
  msgs.innerHTML = '';
  conversationHistory = [];
  updateChatChips(topic);
  const greetings = {
    wave: "Hi! I'm NOVA 💬 Ask me about interference, diffraction, fringe width, or how the wave simulation works.",
    projectile: "Hi! I'm NOVA 💬 Ask me about trajectories, velocity components, KE/PE, range, or the projectile simulation.",
    electric: "Hi! I'm NOVA 💬 Ask me about field lines, potential, Coulomb's law, or the electric-field simulation."
  };
  addBotMsg(greetings[topic] || "Hi! I'm NOVA 💬 Your physics tutor. Open a lesson or ask any physics question.", false);
}

function updateChatChips(topic = currentTopic) {
  const chips = document.getElementById('chat-chips');
  if (!chips) return;
  chips.innerHTML = (CHAT_CHIPS[topic] || CHAT_CHIPS.default).map(label =>
    `<button type="button" onclick="sendChipPrompt('${label.replace(/'/g, "\\'")}')">${label}</button>`
  ).join('');
}

function addUserMsg(text, save = true) {
  const msgs = document.getElementById('chat-messages');
  const el = document.createElement('div');
  el.className = 'msg user';
  el.textContent = text;
  msgs.appendChild(el);
  msgs.scrollTop = msgs.scrollHeight;
  if (save) rememberChatMessage('user', text);
  if (window.playClickSound) window.playClickSound();
}

function addBotMsg(text, thinking = '', save = true) {
  const msgs = document.getElementById('chat-messages');
  const el = document.createElement('div');
  el.className = 'msg bot';
  
  if (thinking) {
    const thinkEl = document.createElement('div');
    thinkEl.className = 'thinking-block';
    thinkEl.innerHTML = `<em>Thinking: ${thinking.substring(0, 150)}${thinking.length > 150 ? '...' : ''}</em>`;
    el.appendChild(thinkEl);
  }

  const contentEl = document.createElement('div');
  contentEl.className = 'msg-content';
  contentEl.innerHTML = text.replace(/\n/g, '<br>');
  el.appendChild(contentEl);

  msgs.appendChild(el);
  msgs.scrollTop = msgs.scrollHeight;

  if (window.renderMathInElement) {
    window.renderMathInElement(el, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true }
      ],
      throwOnError: false
    });
  }

  if (save) rememberChatMessage('assistant', text);
  if (window.playMessageSound) window.playMessageSound();
  if (window.speakText) window.speakText(text);
}

function rememberChatMessage(role, text) {
  conversationHistory.push({ role, content: text });
  conversationHistory = conversationHistory.slice(-10);
}

function addTyping() {
  const msgs = document.getElementById('chat-messages');
  const el = document.createElement('div');
  el.className = 'msg bot typing'; el.id = 'typing-ind';
  el.innerHTML = '<div class="dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>';
  msgs.appendChild(el); msgs.scrollTop = msgs.scrollHeight;
  return el;
}

function getChatContext() {
  const topic = currentTopic || 'general physics';
  const topicName = TOPICS[topic]?.name || 'General Physics';
  const subtopicName = TOPICS[topic]?.subtopics?.find(s => s.id === currentSubtopic)?.name || '';
  const view = document.getElementById('simulation-screen')?.style.display === 'block'
    ? 'simulation'
    : document.getElementById('engineering-screen')?.style.display === 'block'
      ? 'engineering applications'
      : document.getElementById('learning-screen')?.style.display === 'block'
        ? 'lesson'
        : 'topic selection';
  view
};


async function sendChat(messageOverride = '') {
  if (isChatProcessing) {
    addBotMsg("⏳ I'm still thinking... Please wait a moment.", false);
    return;
  }

  const input = document.getElementById('chat-input');
  const text = (messageOverride || input.value).trim();
  if (!text) return;
  if (!messageOverride) input.value = '';

  addUserMsg(text);
  isChatProcessing = true;
  const typing = addTyping();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:3000' : '';
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        systemPrompt: CHAT_SYSTEM_PROMPT,
        messages: conversationHistory.slice(-10),
        context: getChatContext()
      })
    });

    console.log(`[Chat] Response status: ${response.status}`);

    clearTimeout(timeoutId);
    const data = await response.json().catch(() => ({}));
    typing.remove();

    if (!response.ok) {
      console.error('Chat function error:', data);
      const errorMsg = data.error ? ` (${data.error})` : '';
      addBotMsg(data.fallback || `⚠️ NOVA can't connect right now. Please try again in a moment.${errorMsg}`);
      return;
    }

    addBotMsg(data.reply || "I couldn't process that. Please try rephrasing your question.", data.thinking || '');
  } catch (e) {
    clearTimeout(timeoutId);
    typing.remove();
    console.error("Fetch exception details:", e);
    if (e.name === 'AbortError') {
      addBotMsg('⏰ NOVA took too long to respond. Please try a shorter question.');
    } else {
      console.error(e);
      addBotMsg(`❌ NOVA is offline for a moment. (Error: ${e.message})`);
    }
  } finally {
    isChatProcessing = false;
  }
}

function sendChipPrompt(text) {
  sendChat(text);
}

function chatKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChat();
  }
}

function toggleChat() {
  const w = document.getElementById('chat-window');
  w.classList.toggle('open');
  updateChatChips(currentTopic);
  if (w.classList.contains('open')) document.getElementById('chat-input')?.focus();
}

// VIDEO BLOCK FUNCTIONALITY

let currentVideoUrl = "";
function getYoutubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Function to load the video (replaces thumbnail with iframe)
function loadYouTubeVideo(videoId) {
  const container = document.getElementById('video-container');
  const thumbWrapper = document.getElementById('video-thumb-wrapper');
  if (!container || !thumbWrapper) return;

  // Create iframe
  const iframe = document.createElement('iframe');
  iframe.width = "100%";
  iframe.height = "100%";
  iframe.style.aspectRatio = "16/9";
  iframe.style.border = "none";
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0&color=white&iv_load_policy=3`;
  iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
  iframe.allowFullscreen = true;

  // Replace the thumbnail wrapper with iframe
  thumbWrapper.style.display = 'none';
  container.appendChild(iframe);
}

// Set up the video block for a given YouTube URL
function setupVideoBlock(youtubeUrl) {
  const videoBlock = document.getElementById('topic-video-block');
  const thumbnailImg = document.getElementById('video-thumbnail');
  const playOverlay = document.getElementById('play-overlay');
  const captionEl = document.getElementById('video-caption');

  if (!videoBlock) return;

  const videoId = getYoutubeId(youtubeUrl);
  if (!videoId) {
    // Invalid URL → hide the video block
    videoBlock.style.display = 'none';
    return;
  }

  // Build thumbnail URL (maxresdefault, hqdefault, etc.)
  const thumbUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  // Fallback if maxresdefault is not available (YouTube sometimes doesn't have it)
  thumbnailImg.onerror = function () {
    this.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };
  thumbnailImg.src = thumbUrl;

  // Show the block
  videoBlock.style.display = 'block';

  // Attach click event to play overlay
  if (playOverlay) {
    // Remove any previous listener
    const newPlayOverlay = playOverlay.cloneNode(true);
    playOverlay.parentNode.replaceChild(newPlayOverlay, playOverlay);
    newPlayOverlay.addEventListener('click', function (e) {
      e.stopPropagation();
      loadYouTubeVideo(videoId);
    });
  }

  // Optional: set a custom caption based on topic
  if (captionEl && currentTopic) {
    const topicNames = { wave: 'Wave Optics', projectile: 'Projectile Motion', electric: 'Electrostatics' };
    captionEl.textContent = `📺 Related video about ${topicNames[currentTopic] || 'Physics'} – click to play.`;
  }
}

const topicVideoMap = {
  // Wave – Double Slit
  'wave-double': 'https://www.youtube.com/watch?v=Pk6s2OlKzKQ',  // replace with your own URL
  // Wave – Single Slit
  'wave-single': 'https://www.youtube.com/watch?v=7CmbItRjM-Y',
  // Projectile
  'projectile-block': 'https://www.youtube.com/watch?v=txJP95lBv98',
  // Electric – Single charge
  'electric-single': 'https://www.youtube.com/watch?v=_4VC3IHbuW8',
  // Electric – Multiple charges
  'electric-multi': 'https://www.youtube.com/watch?v=ClLmdWL0bIQ'
};

// Call this inside selectSubtopic() after generating the lesson
function updateVideoForSubtopic(topic, subtopic) {
  const key = `${topic}-${subtopic}`;
  const videoUrl = topicVideoMap[key] || '';
  if (videoUrl) {
    setupVideoBlock(videoUrl);
  } else {
    // Hide video block if no URL provided
    const block = document.getElementById('topic-video-block');
    if (block) block.style.display = 'none';
  }
}
// BOOK REFERENCES SLIDESHOWS
const refsImages = {
  projectile: [
    '/book_refs/projectile/01.jpg',
    '/book_refs/projectile/02.jpg',
    '/book_refs/projectile/03.jpg',
    '/book_refs/projectile/04.jpg',
    '/book_refs/projectile/05.jpg',
    '/book_refs/projectile/06.jpg',
    '/book_refs/projectile/07.jpg',
    '/book_refs/projectile/08.jpg',
    '/book_refs/projectile/09.jpg',
    '/book_refs/projectile/10.jpg',
    '/book_refs/projectile/11.jpg'
  ],
  wave: [
    '/book_refs/wave/01.jpg',
    '/book_refs/wave/02.jpg',
    '/book_refs/wave/03.jpg',
    '/book_refs/wave/04.jpg',
    '/book_refs/wave/05.jpg',
    '/book_refs/wave/06.jpg',
    '/book_refs/wave/07.jpg',
    '/book_refs/wave/08.jpg',
    '/book_refs/wave/09.jpg',
    '/book_refs/wave/10.jpg',
    '/book_refs/wave/11.jpg',
    '/book_refs/wave/12.jpg',
    '/book_refs/wave/13.jpg',
    '/book_refs/wave/14.jpg',
    '/book_refs/wave/15.jpg',
    '/book_refs/wave/16.jpg',
    '/book_refs/wave/17.jpg',
    '/book_refs/wave/18.jpg',
    '/book_refs/wave/19.jpg',
    '/book_refs/wave/20.jpg'
  ],
  electric: [
    '/book_refs/electric/01.jpg',
    '/book_refs/electric/02.jpg',
    '/book_refs/electric/03.jpg',
    '/book_refs/electric/04.jpg',
    '/book_refs/electric/05.jpg',
    '/book_refs/electric/06.jpg',
    '/book_refs/electric/07.jpg',
    '/book_refs/electric/08.jpg',
    '/book_refs/electric/09.jpg',
    '/book_refs/electric/10.jpg',
    '/book_refs/electric/11.jpg',
    '/book_refs/electric/12.jpg',
    '/book_refs/electric/13.jpg',
    '/book_refs/electric/14.jpg',
    '/book_refs/electric/15.jpg',
    '/book_refs/electric/16.jpg',
    '/book_refs/electric/17.jpg'
  ]
};

let currentRefsTopic = 'projectile';
let currentRefsIndex = 0;

function updateRefsSlide() {
  const img = document.getElementById('refsSlideImg');
  const counter = document.getElementById('refsCounter');
  const images = refsImages[currentRefsTopic];
  if (images && images.length > 0) {
    img.src = images[currentRefsIndex];
    counter.textContent = `${currentRefsIndex + 1} / ${images.length}`;
  } else {
    img.src = '';
    counter.textContent = '0 / 0';
  }
}

function changeRefsTopic(topic) {
  currentRefsTopic = topic;
  currentRefsIndex = 0;
  updateRefsSlide();
  // Update active tab styling
  document.querySelectorAll('.refs-tab').forEach(tab => {
    if (tab.getAttribute('data-topic') === topic) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
}

function nextRefsSlide() {
  const images = refsImages[currentRefsTopic];
  if (images && currentRefsIndex < images.length - 1) {
    currentRefsIndex++;
    updateRefsSlide();
  }
}

function prevRefsSlide() {
  if (currentRefsIndex > 0) {
    currentRefsIndex--;
    updateRefsSlide();
  }
}

// Open modal and set default topic
function openBookReferences() {
  const modal = document.getElementById('refsModal');
  modal.classList.add('active');
  // Optionally sync with current learning topic
  if (currentTopic === 'projectile') changeRefsTopic('projectile');
  else if (currentTopic === 'wave') changeRefsTopic('wave');
  else if (currentTopic === 'electric') changeRefsTopic('electric');
  else changeRefsTopic('projectile');
}

function closeBookReferences() {
  const modal = document.getElementById('refsModal');
  modal.classList.remove('active');
}

// Event listeners (run after DOM loads)
document.addEventListener('DOMContentLoaded', () => {
  const prevBtn = document.getElementById('refsPrevBtn');
  const nextBtn = document.getElementById('refsNextBtn');
  const closeBtn = document.getElementById('closeRefsBtn');
  const openBtn = document.getElementById('openRefsBtn');
  const tabs = document.querySelectorAll('.refs-tab');

  if (prevBtn) prevBtn.addEventListener('click', prevRefsSlide);
  if (nextBtn) nextBtn.addEventListener('click', nextRefsSlide);
  if (closeBtn) closeBtn.addEventListener('click', closeBookReferences);
  if (openBtn) openBtn.addEventListener('click', openBookReferences);
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const topic = tab.getAttribute('data-topic');
      changeRefsTopic(topic);
    });
  });
  const evalBtn = document.getElementById('attemptEvalBtn');
  if (evalBtn) {
    evalBtn.addEventListener('click', () => {
      if (currentTopic) {
        loadQuiz(currentTopic);
      } else {
        alert("Please select a topic first.");
      }
    });
  }
});
// --- SOUND EFFECTS ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(freq, type, duration, vol = 0.1) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}
window.playClickSound = function () {
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  playTone(600, 'sine', 0.1, 0.05);
};
window.playMessageSound = function () {
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  playTone(800, 'sine', 0.15, 0.05);
  setTimeout(() => playTone(1200, 'sine', 0.2, 0.05), 100);
};

// --- SPEECH SYNTHESIS ---
let isMuted = false;
window.toggleMute = function () {
  isMuted = !isMuted;
  const btn = document.getElementById('btn-mute');
  if (isMuted) {
    btn.textContent = '🔇';
    btn.style.color = 'var(--muted)';
    window.speechSynthesis.cancel();
    document.getElementById('btn-stop-speak').style.display = 'none';
  } else {
    btn.textContent = '🔊';
    btn.style.color = 'var(--neon-blue)';
  }
};
window.stopSpeaking = function () {
  window.speechSynthesis.cancel();
  document.getElementById('btn-stop-speak').style.display = 'none';
};
window.speakText = function (text) {
  if (isMuted || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.05;
  utterance.pitch = 1.1;
  // Optionally select a specific voice if available
  const voices = window.speechSynthesis.getVoices();
  const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google UK English Female'));
  if (femaleVoice) utterance.voice = femaleVoice;

  utterance.onstart = () => { document.getElementById('btn-stop-speak').style.display = 'inline-block'; };
  utterance.onend = () => { document.getElementById('btn-stop-speak').style.display = 'none'; };
  utterance.onerror = () => { document.getElementById('btn-stop-speak').style.display = 'none'; };

  window.speechSynthesis.speak(utterance);
};

// --- SPEECH RECOGNITION ---
let recognition = null;
let isRecording = false;
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = function () {
    isRecording = true;
    const btn = document.getElementById('btn-mic');
    btn.textContent = '🔴';
    btn.style.animation = 'pulse 1s infinite';
    document.getElementById('chat-input').placeholder = "Listening...";
  };

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    const input = document.getElementById('chat-input');
    input.value = transcript;
    sendChat();
  };

  recognition.onerror = function (event) {
    console.error("Speech recognition error", event.error);
    stopRecordingUI();
  };

  recognition.onend = function () {
    stopRecordingUI();
  };
}

function stopRecordingUI() {
  isRecording = false;
  const btn = document.getElementById('btn-mic');
  btn.textContent = '🎤';
  btn.style.animation = 'none';
  document.getElementById('chat-input').placeholder = "Ask about any concept...";
}

window.toggleVoiceRecording = function () {
  if (!recognition) {
    alert("Speech Recognition API is not supported in this browser.");
    return;
  }
  if (isRecording) {
    recognition.stop();
  } else {
    // Ensure audio context is ready
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    recognition.start();
  }
};

// --- ABOUT MODAL ---
window.openAboutModal = function () {
  document.getElementById('aboutModal').classList.add('active');
  if (window.playClickSound) window.playClickSound();
};
window.closeAboutModal = function () {
  document.getElementById('aboutModal').classList.remove('active');
  if (window.playClickSound) window.playClickSound();
};

// APP INITIALIZATION
(function initApp() {
  document.getElementById('app').style.display = 'flex';
  document.getElementById('chat-panel').style.display = 'block';
  if (!handleRoute()) {
    initChat();
    goHome(false);
  }
  handleRoute();
})();
