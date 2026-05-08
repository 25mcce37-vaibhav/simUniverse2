const ENGINEERING_APPLICATIONS = {
  wave: [
    {
      title: 'Optical Metrology & Precision Alignment',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Engineer working with optical laboratory equipment',
      field: 'Manufacturing • Photonics',
      description: 'Interference fringes reveal tiny changes in distance, flatness, and vibration, helping engineers align mirrors, inspect precision surfaces, and calibrate laser-based measurement systems.',
      highlights: ['Laser interferometers for micron-scale motion', 'Surface-flatness testing', 'Vibration and strain monitoring']
    },
    {
      title: 'Diffraction Gratings in Spectrometers',
      image: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Laboratory spectrometer and optical instruments',
      field: 'Materials • Chemical Engineering',
      description: 'Engineered grating spacings separate light into wavelengths, allowing spectrometers to identify materials, monitor emissions, and verify the purity of industrial processes.',
      highlights: ['Wavelength separation', 'Emission-line analysis', 'Quality-control sensors']
    },
    {
      title: 'Anti-Reflective Coatings',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Solar panels using light-management coatings',
      field: 'Energy • Optics',
      description: 'Thin films are designed so reflected waves cancel by destructive interference, improving camera lenses, eyeglasses, solar panels, and high-power optical devices.',
      highlights: ['Thin-film phase control', 'Higher optical transmission', 'Reduced glare and losses']
    },
    {
      title: 'Antenna Arrays & Beam Steering',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Communication antenna and network equipment',
      field: 'Telecommunications',
      description: 'The same superposition ideas behind interference help engineers combine radio waves from many antennas to strengthen signals in selected directions and reduce noise elsewhere.',
      highlights: ['Constructive signal combining', 'Directional beams', '5G and radar arrays']
    }
  ],
  projectile: [
    {
      title: 'Ballistics & Safety Envelopes',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Open field used for trajectory and safety planning',
      field: 'Mechanical • Defense Safety',
      description: 'Trajectory models help engineers predict range, impact speed, and clearance zones for launched objects, test rigs, sports equipment, and controlled safety studies.',
      highlights: ['Range prediction', 'Impact-energy estimation', 'Safe test-zone design']
    },
    {
      title: 'Robotics Pick-and-Place Arcs',
      image: 'https://images.unsplash.com/photo-1516192518150-0d8fee5425e3?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Industrial robot arm in a manufacturing cell',
      field: 'Automation • Robotics',
      description: 'Robotic systems use projectile-like motion planning to move parts through smooth arcs while balancing speed, actuator limits, collision avoidance, and energy consumption.',
      highlights: ['Motion path optimization', 'Energy-aware actuation', 'Collision clearance']
    },
    {
      title: 'Sports Equipment Engineering',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Athletics track and sports training environment',
      field: 'Product Design • Biomechanics',
      description: 'Engineers tune launch angle, initial speed, spin, and energy transfer in equipment such as balls, bats, javelins, and training devices to improve performance and consistency.',
      highlights: ['Launch-angle analysis', 'Energy transfer', 'Performance testing']
    },
    {
      title: 'Water Jets & Firefighting Nozzles',
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Engineered fluid systems and nozzles',
      field: 'Civil • Fluid Systems',
      description: 'Nozzle designers combine projectile motion with fluid mechanics to set spray reach, clearance height, pressure requirements, and coverage patterns for water jets and suppression systems.',
      highlights: ['Spray trajectory', 'Pressure-to-range design', 'Coverage planning']
    }
  ],
  electric: [
    {
      title: 'High-Voltage Insulation Design',
      image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'High-voltage electrical transmission infrastructure',
      field: 'Power Engineering',
      description: 'Electric-field maps reveal where breakdown is most likely, helping engineers shape insulators, set clearances, and prevent arcing in substations, cables, and switchgear.',
      highlights: ['Field-stress control', 'Arc-prevention clearances', 'Dielectric material choices']
    },
    {
      title: 'Capacitive Touchscreens & Sensors',
      image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Modern electronic device with touchscreen interface',
      field: 'Electronics • Human Interfaces',
      description: 'Touchscreens detect changes in electric potential and capacitance when a finger approaches, turning invisible field perturbations into precise input locations.',
      highlights: ['Capacitance changes', 'Potential sensing grids', 'Noise filtering']
    },
    {
      title: 'Electrostatic Precipitators',
      image: 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Industrial plant with emission-control systems',
      field: 'Environmental • Industrial',
      description: 'Charged plates create strong electric fields that pull particulate matter out of exhaust streams, reducing pollution in power plants, cement factories, and industrial facilities.',
      highlights: ['Particle charging', 'Field-driven collection', 'Air-quality control']
    },
    {
      title: 'Medical & Scientific Field Shaping',
      image: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Research laboratory equipment for scientific engineering',
      field: 'Biomedical • Instrumentation',
      description: 'Engineers shape electric fields in ion traps, particle optics, biosensors, and diagnostic instruments to guide charged particles or detect tiny electrical signals.',
      highlights: ['Charged-particle control', 'Sensitive detection', 'Field geometry optimization']
    }
  ]
};

function getEngineeringTopicMeta(topicKey, topics = {}) {
  const topic = topics[topicKey] || {};
  const accents = {
    wave: { css: 'var(--neon-blue)', rgb: '0,212,255', icon: '🌊' },
    projectile: { css: 'var(--neon-green)', rgb: '0,255,159', icon: '🚀' },
    electric: { css: 'var(--neon-orange)', rgb: '255,107,43', icon: '⚡' }
  };

  return {
    name: topic.name || 'Physics',
    accent: accents[topicKey] || accents.wave,
    applications: ENGINEERING_APPLICATIONS[topicKey] || []
  };
}

function EngineeringApplications({ topicKey, topics = {}, onBack = '', onOpenLesson = '' }) {
  const { name, accent, applications } = getEngineeringTopicMeta(topicKey, topics);

  return `
    <section class="engineering-page" style="--engineering-accent:${accent.css};--engineering-accent-rgb:${accent.rgb};">
      <div class="engineering-hero">
        <div class="engineering-kicker">${accent.icon} ENGINEERING CONNECTIONS</div>
        <h1>${name} Engineering Applications</h1>
        <p>See how this physics topic moves from equations and simulations into devices, infrastructure, instrumentation, and design decisions used by working engineers.</p>
        <div class="engineering-actions">
          <button class="btn-back engineering-back" onclick="${onBack}">← Back to Lesson</button>
          <button class="engineering-lesson-btn" onclick="${onOpenLesson}">Review Core Concepts →</button>
        </div>
      </div>

      <div class="engineering-grid">
        ${applications.map((item, index) => `
          <article class="engineering-card" style="animation-delay:${index * 70}ms;">
            <div class="engineering-image-wrap">
              <img src="${item.image}" alt="${item.imageAlt}" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/900x540/0e0826/00d4ff?text=Engineering+Application';">
              <span class="engineering-field">${item.field}</span>
            </div>
            <div class="engineering-card-body">
              <h2>${item.title}</h2>
              <p>${item.description}</p>
              <ul>
                ${item.highlights.map(point => `<li>${point}</li>`).join('')}
              </ul>
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

if (typeof window !== 'undefined') {
  window.ENGINEERING_APPLICATIONS = ENGINEERING_APPLICATIONS;
  window.EngineeringApplications = EngineeringApplications;
}
