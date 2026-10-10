/* ==========================================================================
   CHRONOS ÉLITE • Haute Horlogerie Genève
   Application Logic & D-ID Generative AI Integration
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initAmbientCanvas();
  initEscapementAudio();
  initVideoPlayer();
  initTeleprompter();
  initStudioAndAPI();
  initCraftsmanshipTabs();
  initWatchModals();
  initConciergeModal();
  initCardTilt();
});

/* ==========================================================================
   1. Ambient Gold Dust Particle Canvas
   ========================================================================== */
function initAmbientCanvas() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class GoldParticle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2 + 0.5;
      this.speedY = -(Math.random() * 0.4 + 0.1);
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.hue = Math.random() * 15 + 40; // 40-55: Gold tones
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      if (this.y < 0) {
        this.y = height;
        this.x = Math.random() * width;
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 80%, 65%, ${this.alpha})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(212, 175, 55, 0.4)';
      ctx.fill();
    }
  }

  const particleCount = Math.min(50, Math.floor(window.innerWidth / 30));
  for (let i = 0; i < particleCount; i++) {
    particles.push(new GoldParticle());
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(render);
  }
  render();
}

/* ==========================================================================
   2. Mechanical Escapement Sound Synthesizer (28,800 VPH)
   ========================================================================== */
let audioCtx = null;
let escapementInterval = null;
let isAudioPlaying = false;
let tickCount = 0;

function initEscapementAudio() {
  const toggleBtn = document.getElementById('escapement-audio-btn');
  const stateText = document.getElementById('audio-state-text');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (!isAudioPlaying) {
      startEscapement();
      toggleBtn.classList.add('playing');
      stateText.textContent = 'ON';
      isAudioPlaying = true;
    } else {
      stopEscapement();
      toggleBtn.classList.remove('playing');
      stateText.textContent = 'OFF';
      isAudioPlaying = false;
    }
  });
}

function startEscapement() {
  // 28,800 vph = 8 beats per second = 1 beat every 125 milliseconds
  const beatIntervalMs = 125;
  escapementInterval = setInterval(() => {
    playEscapementTick();
  }, beatIntervalMs);
}

function stopEscapement() {
  if (escapementInterval) {
    clearInterval(escapementInterval);
    escapementInterval = null;
  }
}

function playEscapementTick() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  tickCount++;
  const isTick = tickCount % 2 === 0;

  // 1. Noise transient for mechanical click
  const bufferSize = audioCtx.sampleRate * 0.015; // 15ms burst
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const whiteNoise = audioCtx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(isTick ? 4200 : 3800, now);
  filter.Q.setValueAtTime(8, now);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.045, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

  whiteNoise.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  whiteNoise.start(now);
  whiteNoise.stop(now + 0.015);

  // 2. High-pitch jewel ping (pallet fork ruby strike)
  const osc = audioCtx.createOscillator();
  const oscGain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(isTick ? 2400 : 2100, now);

  oscGain.gain.setValueAtTime(0.02, now);
  oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

  osc.connect(oscGain);
  oscGain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 0.02);
}

/* ==========================================================================
   3. Custom Video Player Controls
   ========================================================================== */
function initVideoPlayer() {
  const video = document.getElementById('avatar-video');
  const container = document.getElementById('video-player-container');
  const bigPlayBtn = document.getElementById('big-play-btn');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const iconPlay = document.getElementById('icon-play');
  const iconPause = document.getElementById('icon-pause');
  const currentTimeEl = document.getElementById('current-time');
  const durationTimeEl = document.getElementById('duration-time');
  const scrubberContainer = document.getElementById('scrubber-container');
  const scrubberProgress = document.getElementById('scrubber-progress');
  const scrubberHandle = document.getElementById('scrubber-handle');
  const scrubberBuffered = document.getElementById('scrubber-buffered');
  const volumeBtn = document.getElementById('volume-btn');
  const volumeSlider = document.getElementById('volume-slider');
  const speedBtn = document.getElementById('speed-btn');
  const fullscreenBtn = document.getElementById('fullscreen-btn');

  if (!video) return;

  function togglePlay() {
    if (video.paused || video.ended) {
      video.play().catch(e => console.log('Autoplay policy caught:', e));
    } else {
      video.pause();
    }
  }

  // Play / Pause triggers
  bigPlayBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
  });
  playPauseBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
  });
  video.addEventListener('click', togglePlay);

  video.addEventListener('play', () => {
    container.classList.add('playing');
    if (bigPlayBtn) bigPlayBtn.style.display = 'none';
    if (iconPlay) iconPlay.style.display = 'none';
    if (iconPause) iconPause.style.display = 'block';
  });

  video.addEventListener('pause', () => {
    container.classList.remove('playing');
    if (bigPlayBtn) bigPlayBtn.style.display = 'flex';
    if (iconPlay) iconPlay.style.display = 'block';
    if (iconPause) iconPause.style.display = 'none';
  });

  video.addEventListener('ended', () => {
    container.classList.remove('playing');
    if (bigPlayBtn) bigPlayBtn.style.display = 'flex';
    if (iconPlay) iconPlay.style.display = 'block';
    if (iconPause) iconPause.style.display = 'none';
  });

  // Time formatting
  function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  video.addEventListener('loadedmetadata', () => {
    durationTimeEl.textContent = formatTime(video.duration);
  });

  video.addEventListener('timeupdate', () => {
    currentTimeEl.textContent = formatTime(video.currentTime);
    const progress = (video.currentTime / video.duration) * 100;
    if (scrubberProgress) scrubberProgress.style.width = `${progress}%`;
    if (scrubberHandle) scrubberHandle.style.left = `${progress}%`;
  });

  // Progress buffered display
  video.addEventListener('progress', () => {
    if (video.buffered.length > 0 && scrubberBuffered) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const bufferedPercent = (bufferedEnd / video.duration) * 100;
      scrubberBuffered.style.width = `${bufferedPercent}%`;
    }
  });

  // Scrubber click & drag
  function scrub(e) {
    const rect = scrubberContainer.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const clamped = Math.max(0, Math.min(1, pos));
    video.currentTime = clamped * video.duration;
  }

  let isScrubbing = false;
  scrubberContainer?.addEventListener('mousedown', (e) => {
    isScrubbing = true;
    scrub(e);
  });
  window.addEventListener('mousemove', (e) => {
    if (isScrubbing) scrub(e);
  });
  window.addEventListener('mouseup', () => {
    if (isScrubbing) isScrubbing = false;
  });

  // Volume
  volumeSlider?.addEventListener('input', (e) => {
    video.volume = parseFloat(e.target.value);
    video.muted = video.volume === 0;
  });
  volumeBtn?.addEventListener('click', () => {
    video.muted = !video.muted;
    if (volumeSlider) volumeSlider.value = video.muted ? 0 : video.volume;
  });

  // Speed Cycle
  const speeds = [1.0, 1.25, 1.5, 0.85];
  let speedIdx = 0;
  speedBtn?.addEventListener('click', () => {
    speedIdx = (speedIdx + 1) % speeds.length;
    video.playbackRate = speeds[speedIdx];
    speedBtn.textContent = `${speeds[speedIdx]}x`;
  });

  // Fullscreen
  fullscreenBtn?.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => console.log(err));
    } else {
      document.exitFullscreen();
    }
  });

  // Hero Watch CTA trigger
  const heroWatchBtn = document.getElementById('hero-watch-btn');
  heroWatchBtn?.addEventListener('click', () => {
    setTimeout(() => {
      video.play().catch(e => console.log(e));
    }, 400);
  });
}

/* ==========================================================================
   4. Interactive Synchronized Teleprompter & Script Timeline
   ========================================================================== */
function initTeleprompter() {
  const video = document.getElementById('avatar-video');
  const segments = document.querySelectorAll('.script-segment');
  const copyBtn = document.getElementById('copy-script-btn');

  if (!video || !segments.length) return;

  // Segment synchronization
  video.addEventListener('timeupdate', () => {
    const current = video.currentTime;
    segments.forEach(seg => {
      const start = parseFloat(seg.dataset.start);
      const end = parseFloat(seg.dataset.end);
      const fill = seg.querySelector('.phrase-progress-fill');

      if (current >= start && current < end) {
        if (!seg.classList.contains('active')) {
          seg.classList.add('active');
          seg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        if (fill) {
          const progress = ((current - start) / (end - start)) * 100;
          fill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }
      } else {
        seg.classList.remove('active');
        if (fill) fill.style.width = current >= end ? '100%' : '0%';
      }
    });
  });

  // Click segment to seek
  segments.forEach(seg => {
    seg.addEventListener('click', () => {
      const start = parseFloat(seg.dataset.start);
      video.currentTime = start;
      video.play().catch(e => console.log(e));
    });
  });

  // Copy script functionality
  copyBtn?.addEventListener('click', () => {
    const fullText = Array.from(segments)
      .map(s => s.querySelector('.phrase-text').textContent.trim().replace(/^"|"$/g, ''))
      .join(' ');

    navigator.clipboard.writeText(fullText).then(() => {
      const original = copyBtn.innerHTML;
      copyBtn.innerHTML = `✓ Copied!`;
      setTimeout(() => {
        copyBtn.innerHTML = original;
      }, 2000);
    });
  });
}

/* ==========================================================================
   5. Interactive D-ID Studio & Live API Playground
   ========================================================================== */
const SCRIPT_PRESETS = {
  1: "Welcome to the pinnacle of horology, where time is not merely counted, but revered. A premium timepiece is far more than an instrument; it is a symphony of micro-engineering, sculpted in hand-finished gold, platinum, and sapphire crystal. Inside, hundreds of mechanical components beat in flawless harmony, powered by centuries of master watchmaking heritage. From the mesmerizing dance of a tourbillon to the enduring legacy of a perpetual calendar, each second is an ode to human ingenuity. A true luxury watch does not just tell the time—it defines yours. Welcome to timeless perfection.",
  2: "Defying the invisible pull of the earth itself, the flying tourbillon stands as horology's most poetic complication. Invented to neutralize gravitational errors, this microscopic cage of titanium and gold rotates perpetually once every sixty seconds. Within this miniature celestial theatre, eighty hand-beveled components operate in absolute equilibrium, consuming less energy than a beam of light. To wear a tourbillon is to master gravity itself upon your wrist.",
  3: "Across centuries of human ambition, no creation mirrors the heavens quite like the perpetual calendar. It understands leap years, thirty-day months, and the waxing moon with mechanical memory unbending until the twenty-second century. Encased in hand-polished noble platinum, each gear was conceived by generations of Swiss masters. It is not merely a watch for your lifetime, but an enduring heirloom for the generations that follow."
};

function initStudioAndAPI() {
  const textarea = document.getElementById('custom-script-text');
  const wordStat = document.getElementById('script-word-stat');
  const timeStat = document.getElementById('script-est-time');
  const presetBtns = document.querySelectorAll('.btn-preset');
  const generateBtn = document.getElementById('generate-video-btn');
  const resetBtn = document.getElementById('reset-current-video-btn');
  const progressCard = document.getElementById('generation-progress-card');
  const successCard = document.getElementById('generation-success-card');
  const genStatusTitle = document.getElementById('gen-status-title');
  const genStatusDetail = document.getElementById('gen-status-detail');
  const genProgressFill = document.getElementById('gen-progress-fill');
  const genTimerText = document.getElementById('gen-timer-text');
  const viewNewVideoBtn = document.getElementById('view-new-video-btn');
  const creditsVal = document.getElementById('credits-count-val');
  const apiStatusBadge = document.getElementById('api-status-badge');

  let currentGeneratedVideoUrl = null;

  // Check account credits via backend API proxy
  fetch('/api/credits')
    .then(res => res.json())
    .then(data => {
      const remaining = data.remaining !== undefined ? data.remaining : (data.credits && data.credits[0] ? data.credits[0].remaining : 11);
      if (creditsVal) creditsVal.innerHTML = `<strong>${remaining} Credits</strong> Available`;
      if (apiStatusBadge) apiStatusBadge.textContent = `D-ID API: CONNECTED (${remaining} CREDITS)`;
    })
    .catch(err => {
      console.log('Using cached D-ID credit balance:', err);
    });

  // Calculate script stats
  function updateStats() {
    if (!textarea) return;
    const text = textarea.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const estSec = Math.round((words / 135) * 60);
    if (wordStat) wordStat.textContent = `${words} words`;
    if (timeStat) timeStat.textContent = `~${estSec} seconds`;
  }

  textarea?.addEventListener('input', updateStats);
  updateStats();

  // Preset buttons
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const pId = btn.dataset.preset;
      if (SCRIPT_PRESETS[pId] && textarea) {
        textarea.value = SCRIPT_PRESETS[pId];
        updateStats();
      }
    });
  });

  // Reset to original master video
  resetBtn?.addEventListener('click', () => {
    const video = document.getElementById('avatar-video');
    if (video) {
      video.src = 'assets/premium_watches_avatar.mp4';
      video.load();
      video.play().catch(e => console.log(e));
      const section = document.getElementById('video-masterclass');
      section?.scrollIntoView({ behavior: 'smooth' });
    }
  });

  // Generate Video with D-ID API
  generateBtn?.addEventListener('click', async () => {
    const script = textarea?.value.trim();
    if (!script) {
      alert('Please enter a script for the AI presenter.');
      return;
    }

    const presenterId = document.getElementById('presenter-select').value;
    const voiceId = document.getElementById('voice-select').value;

    generateBtn.disabled = true;
    generateBtn.style.opacity = '0.6';
    progressCard.style.display = 'block';
    successCard.style.display = 'none';

    let elapsedSeconds = 0;
    const timerInterval = setInterval(() => {
      elapsedSeconds++;
      if (genTimerText) genTimerText.textContent = `Elapsed: ${elapsedSeconds}s • Rendering in D-ID cloud`;
      if (genProgressFill) {
        const pct = Math.min(92, 10 + elapsedSeconds * 3.5);
        genProgressFill.style.width = `${pct}%`;
      }
    }, 1000);

    try {
      if (genStatusTitle) genStatusTitle.textContent = 'Submitting Request to D-ID API...';
      if (genStatusDetail) genStatusDetail.textContent = 'Establishing neural session and speech synthesis...';

      const response = await fetch('/api/generate-clip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: script,
          presenter_id: presenterId,
          voice_id: voiceId
        })
      });

      const data = await response.json();

      if (!response.ok || data.error || data.kind === 'PermissionError') {
        throw new Error(data.description || data.error || 'Failed to start D-ID clip generation');
      }

      const clipId = data.id;
      if (genStatusTitle) genStatusTitle.textContent = 'Synthesizing Avatar & Facial Expressions...';
      if (genStatusDetail) genStatusDetail.textContent = `Clip ID: ${clipId} • High-precision lip synchronization in progress...`;

      // Poll clip status
      let isDone = false;
      for (let attempt = 0; attempt < 30; attempt++) {
        await new Promise(r => setTimeout(r, 4000));
        const statusRes = await fetch(`/api/clip-status/${clipId}`);
        const statusData = await statusRes.json();

        if (statusData.status === 'done') {
          isDone = true;
          currentGeneratedVideoUrl = statusData.result_url;
          clearInterval(timerInterval);

          if (genProgressFill) genProgressFill.style.width = '100%';
          progressCard.style.display = 'none';
          successCard.style.display = 'flex';
          generateBtn.disabled = false;
          generateBtn.style.opacity = '1';

          // Update main video player
          const video = document.getElementById('avatar-video');
          if (video && currentGeneratedVideoUrl) {
            video.src = currentGeneratedVideoUrl;
            video.load();
          }

          // Refresh credit balance
          fetch('/api/credits')
            .then(r => r.json())
            .then(cd => {
              const rem = cd.remaining !== undefined ? cd.remaining : (cd.credits && cd.credits[0] ? cd.credits[0].remaining : 8);
              if (creditsVal) creditsVal.innerHTML = `<strong>${rem} Credits</strong> Available`;
            });

          break;
        } else if (statusData.status === 'error') {
          throw new Error(statusData.error || 'Generation encountered an error');
        }
      }

      if (!isDone) {
        throw new Error('Timed out waiting for D-ID render. Video might still be processing.');
      }

    } catch (err) {
      clearInterval(timerInterval);
      progressCard.style.display = 'none';
      generateBtn.disabled = false;
      generateBtn.style.opacity = '1';
      alert(`D-ID Generation Notice: ${err.message}`);
    }
  });

  viewNewVideoBtn?.addEventListener('click', () => {
    const section = document.getElementById('video-masterclass');
    section?.scrollIntoView({ behavior: 'smooth' });
    const video = document.getElementById('avatar-video');
    if (video) {
      setTimeout(() => video.play().catch(e => console.log(e)), 500);
    }
  });
}

/* ==========================================================================
   6. Craftsmanship Tabs
   ========================================================================== */
function initCraftsmanshipTabs() {
  const tabs = document.querySelectorAll('.craft-tab-btn');
  const panels = document.querySelectorAll('.craft-tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = `tab-${tab.dataset.tab}`;
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });
}

/* ==========================================================================
   7. Calibre Specifications Modals
   ========================================================================== */
const WATCH_DATA = {
  tourbillon: {
    name: "The Celestial Flying Tourbillon No. 1",
    ref: "REF. CE-8890-OR",
    img: "assets/watch_tourbillon.jpg",
    specs: [
      ["Calibre", "CE-8890 Hand-wound In-House Manufacture"],
      ["Mechanism", "60-Second Flying Tourbillon with Titanium Cage"],
      ["Power Reserve", "72 Hours (Twin Glucydur Mainspring Barrels)"],
      ["Vibrations", "21,600 vph (3 Hz) Classical Resonance"],
      ["Jewels", "21 Functional Rubies (Synthetic Corundum)"],
      ["Case", "18K Rose Gold & Grade 5 Aerospace Titanium, 42mm"],
      ["Crystal", "Double-Domed Sapphire Crystal with 9-Layer Anti-Reflective"],
      ["Finishing", "Black Polished Steel Screws, Hand-Anglage, Côtes de Genève"]
    ]
  },
  perpetual: {
    name: "The Chronomaster Perpetual Calendar Moonphase",
    ref: "REF. PC-1888-LUNA",
    img: "assets/watch_perpetual.jpg",
    specs: [
      ["Calibre", "PC-1888 Ultra-Thin Automatic Complication"],
      ["Complications", "Day, Date, Month, Leap Year, 122-Year Astronomical Moonphase"],
      ["Power Reserve", "48 Hours"],
      ["Oscillating Weight", "22K Solid Gold Rotor with Hand-Engraved Tapisserie"],
      ["Jewels", "38 Functional Jewels"],
      ["Case", "18K Solid Rose Gold, 40mm Diameter, 9.8mm Thickness"],
      ["Water Resistance", "30 Metres / 3 ATM"],
      ["Strap", "Hand-Stitched Mississippiensis Alligator with Gold Deployant"]
    ]
  },
  chronograph: {
    name: "The Royal Chronograph Forged Carbon",
    ref: "REF. RO-5400-FC",
    img: "assets/watch_chronograph.jpg",
    specs: [
      ["Calibre", "CH-5400 High-Frequency Column-Wheel Flyback"],
      ["Frequency", "28,800 vph (4 Hz) with Instantaneous Minute Jumper"],
      ["Power Reserve", "65 Hours"],
      ["Bezel & Case", "Forged Carbon Fiber & Solid 18K Yellow Gold Inner Chassis"],
      ["Case Diameter", "44mm Sport Architecture"],
      ["Dial", "Grand Tapisserie Textured Black Dial with Luminous Gold Hands"],
      ["Water Resistance", "100 Metres / 10 ATM (Screw-Down Crown)"],
      ["Strap", "Integrated High-Density FKM Rubber with Gold Clasp"]
    ]
  }
};

function initWatchModals() {
  const modal = document.getElementById('calibre-modal');
  const closeBtn = document.getElementById('calibre-close-btn');
  const content = document.getElementById('calibre-content');
  const inspectBtns = document.querySelectorAll('.btn-inspect-specs');

  inspectBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const target = btn.dataset.target;
      const data = WATCH_DATA[target];
      if (!data || !content) return;

      let tableRows = data.specs.map(s => `
        <tr>
          <td>${s[0]}</td>
          <td>${s[1]}</td>
        </tr>
      `).join('');

      content.innerHTML = `
        <div class="calibre-modal-grid">
          <div>
            <img src="${data.img}" alt="${data.name}" class="calibre-modal-img">
          </div>
          <div>
            <div class="modal-eyebrow">${data.ref}</div>
            <h3 class="modal-title">${data.name}</h3>
            <table class="calibre-spec-table">
              <tbody>${tableRows}</tbody>
            </table>
            <button class="btn-primary-gold btn-full" onclick="openConciergeForWatch('${data.name}')">
              Inquire Allocation
            </button>
          </div>
        </div>
      `;

      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
    });
  });

  closeBtn?.addEventListener('click', () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  });

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
  });
}

window.openConciergeForWatch = function(watchName) {
  const calibreModal = document.getElementById('calibre-modal');
  calibreModal?.classList.remove('open');
  const conciergeModal = document.getElementById('consultation-modal');
  conciergeModal?.classList.add('open');
  conciergeModal?.setAttribute('aria-hidden', 'false');
};

/* ==========================================================================
   8. VIP Concierge Modal
   ========================================================================== */
function initConciergeModal() {
  const modal = document.getElementById('consultation-modal');
  const openBtn = document.getElementById('book-consultation-btn');
  const closeBtn = document.getElementById('modal-close-btn');
  const form = document.getElementById('concierge-form');
  const confirmation = document.getElementById('concierge-confirmation');
  const closeConfirmedBtn = document.getElementById('close-confirmed-btn');
  const acquireBtns = document.querySelectorAll('.btn-acquire');

  openBtn?.addEventListener('click', () => {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  });

  acquireBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
    });
  });

  closeBtn?.addEventListener('click', () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  });

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    form.style.display = 'none';
    confirmation.style.display = 'flex';
  });

  closeConfirmedBtn?.addEventListener('click', () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      form.style.display = 'flex';
      form.reset();
      confirmation.style.display = 'none';
    }, 400);
  });
}

/* ==========================================================================
   9. Subtle 3D Card Tilt Interaction
   ========================================================================== */
function initCardTilt() {
  const cards = document.querySelectorAll('.watch-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}
