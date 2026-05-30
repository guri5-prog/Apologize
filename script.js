// DOM Elements
const bearContainer = document.getElementById('bear-container');
const boardFront = document.getElementById('board-front');
const boardBehind = document.getElementById('board-behind');
const boardFrontTitle = document.getElementById('board-front-title');
const boardFrontButtons = document.getElementById('board-front-buttons');
const htmlBoardFront = document.getElementById('html-board-front');
const thoughtLeft = document.getElementById('thought-left');
const thoughtRight = document.getElementById('thought-right');
const particlesContainer = document.getElementById('particles-container');
const rainCloudContainer = document.getElementById('rain-cloud-container');
const lightning = document.getElementById('lightning');
const discoBallContainer = document.getElementById('disco-ball-container');
const discoBeam = document.getElementById('disco-beam');
const confettiCanvas = document.getElementById('confetti-canvas');
const customAlert = document.getElementById('custom-alert');
const butterfly1 = document.getElementById('butterfly-1');
const butterfly2 = document.getElementById('butterfly-2');
const romanceContainer = document.getElementById('romance-container');

// Confetti Setup
const ctx = confettiCanvas.getContext('2d');
let confettiActive = false;
let confettiParticles = [];
const confettiColors = ['#ff6b8b', '#ff4770', '#ffccd5', '#4facfe', '#00f2fe', '#ffd700', '#ff9f43'];

// State variables
let sceneTimeout = null;
let currentScene = '';
let clickCount = 0;
let idleTimer = null;
let idlePhase = 0;
let cryingInterval = null;
let notesInterval = null;
let isGrumpy = false;
let savedBearState = {};

// Initialize Page
window.addEventListener('load', () => {
  resizeConfettiCanvas();
  window.addEventListener('resize', resizeConfettiCanvas);
  
  // Set initial bear offscreen left
  bearContainer.style.left = '-400px';
  setBearState({
    eyes: 'normal',
    mouth: 'nervous',
    blushing: true,
    pose: 'arms-behind'
  });
  
  // Start the story!
  runScene1();
});

// Canvas resizing
function resizeConfettiCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}

/* ==========================================
   STATE & EXPRESSION CONTROLLER
   ========================================== */

function setBearState({ eyes, mouth, blushing, pose, specialClass }) {
  // Clear eye classes
  bearContainer.classList.remove('crying-eyes', 'puppy-eyes', 'grumpy-eyes');
  if (eyes === 'closed') bearContainer.classList.add('crying-eyes');
  else if (eyes === 'puppy') bearContainer.classList.add('puppy-eyes');
  else if (eyes === 'grumpy') bearContainer.classList.add('grumpy-eyes');
  
  // Clear mouth classes
  bearContainer.classList.remove('nervous-mouth', 'sad-mouth', 'open-mouth', 'smile-mouth');
  if (mouth === 'nervous') bearContainer.classList.add('nervous-mouth');
  else if (mouth === 'sad') bearContainer.classList.add('sad-mouth');
  else if (mouth === 'open') bearContainer.classList.add('open-mouth');
  else if (mouth === 'smile') bearContainer.classList.add('smile-mouth');
  
  // Blushing
  if (blushing) {
    bearContainer.classList.add('blushing');
  } else {
    bearContainer.classList.remove('blushing');
  }
  
  // Arm pose
  bearContainer.classList.remove('arms-behind', 'arms-holding');
  if (pose === 'arms-behind') bearContainer.classList.add('arms-behind');
  else if (pose === 'arms-holding') bearContainer.classList.add('arms-holding');
  
  // Reset special classes (tripping, dancing, etc.)
  bearContainer.classList.remove(
    'walk-anim', 'tripping-anim', 'trip-board-fly', 'board-slip',
    'crying-anim', 'power-active', 'dance-bharata', 'dance-bhangra',
    'dance-hiphop', 'hiphop-fail-anim', 'show-front-board', 'board-thrown'
  );
  
  if (specialClass) {
    bearContainer.classList.add(specialClass);
  }
}

// Save the current state of the bear (to restore after grumpy easter egg)
function saveBearState() {
  savedBearState = {
    eyes: bearContainer.classList.contains('crying-eyes') ? 'closed' : 
          bearContainer.classList.contains('puppy-eyes') ? 'puppy' : 
          bearContainer.classList.contains('grumpy-eyes') ? 'grumpy' : 'normal',
    mouth: bearContainer.classList.contains('nervous-mouth') ? 'nervous' : 
           bearContainer.classList.contains('sad-mouth') ? 'sad' : 
           bearContainer.classList.contains('open-mouth') ? 'open' : 
           bearContainer.classList.contains('smile-mouth') ? 'smile' : 'normal',
    blushing: bearContainer.classList.contains('blushing'),
    pose: bearContainer.classList.contains('arms-behind') ? 'arms-behind' : 'arms-holding',
    classList: Array.from(bearContainer.classList)
  };
}

function restoreBearState() {
  setBearState({
    eyes: savedBearState.eyes,
    mouth: savedBearState.mouth,
    blushing: savedBearState.blushing,
    pose: savedBearState.pose
  });
  
  // Re-add classes that were stripped
  savedBearState.classList.forEach(cls => {
    if (!bearContainer.classList.contains(cls)) {
      bearContainer.classList.add(cls);
    }
  });
}

/* ==========================================
   PARTICLE & VISUAL EFFECTS
   ========================================== */

// Background Hearts & Sparkles Generator
function startAmbientParticles() {
  setInterval(() => {
    const isHeart = Math.random() > 0.4;
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.innerText = isHeart ? '🌸' : '✨';
    if (Math.random() > 0.8) particle.innerText = '💖';
    
    particle.style.left = Math.random() * 100 + 'vw';
    particle.style.fontSize = Math.random() * 14 + 12 + 'px';
    particle.style.setProperty('--drift', (Math.random() * 100 - 50) + 'px');
    particle.style.setProperty('--rot', (Math.random() * 90 - 45) + 'deg');
    particle.style.animationDuration = Math.random() * 2 + 3 + 's';
    
    particlesContainer.appendChild(particle);
    
    setTimeout(() => {
      particle.remove();
    }, 5000);
  }, 400);
}
startAmbientParticles();

// Thought Bubble Manager
function showThought(bubble, text, duration = 3000) {
  bubble.innerText = text;
  bubble.classList.add('show');
  
  setTimeout(() => {
    bubble.classList.remove('show');
  }, duration);
}

// Crying Tears
function startCryingEffect() {
  if (cryingInterval) clearInterval(cryingInterval);
  cryingInterval = setInterval(() => {
    // Left Tear
    createTear(170, 160, -25);
    // Right Tear
    createTear(230, 160, 25);
  }, 180);
}

function stopCryingEffect() {
  if (cryingInterval) {
    clearInterval(cryingInterval);
    cryingInterval = null;
  }
}

function createTear(x, y, drift) {
  const tear = document.createElement('div');
  tear.className = 'tear';
  
  // Align tear source to the bear container's relative position
  const rect = bearContainer.getBoundingClientRect();
  const scale = rect.width / 400; // SVG viewBox is 400
  
  const tearX = rect.left + (x * scale) + (Math.random() * 6 - 3);
  const tearY = rect.top + (y * scale);
  
  tear.style.left = tearX + 'px';
  tear.style.top = tearY + 'px';
  tear.style.setProperty('--tear-drift', (drift * scale + (Math.random() * 20 - 10)) + 'px');
  
  document.body.appendChild(tear);
  setTimeout(() => tear.remove(), 800);
}

// Dust Puff (tripping/running)
function triggerDustPuff(leftPos, bottomPos) {
  const puff = document.createElement('div');
  puff.className = 'dust-puff dust-active';
  puff.style.width = '40px';
  puff.style.height = '30px';
  puff.style.left = leftPos + 'px';
  puff.style.bottom = bottomPos + 'px';
  
  document.body.appendChild(puff);
  setTimeout(() => puff.remove(), 800);
}

// Rain Drops for Storm Cloud
let rainInterval = null;
function startRain() {
  if (rainInterval) clearInterval(rainInterval);
  rainInterval = setInterval(() => {
    const drop = document.createElement('div');
    drop.className = 'rain-drop';
    drop.style.left = Math.random() * 140 + 10 + 'px'; // width of cloud is 160
    drop.style.top = '40px';
    drop.style.animationDuration = Math.random() * 0.4 + 0.6 + 's';
    rainCloudContainer.appendChild(drop);
    
    setTimeout(() => drop.remove(), 1000);
  }, 60);
  
  // Lightning interval
  setInterval(() => {
    if (currentScene === '5B' || currentScene === '6B') {
      lightning.style.opacity = 1;
      setTimeout(() => { lightning.style.opacity = 0; }, 150);
      setTimeout(() => { lightning.style.opacity = 1; }, 250);
      setTimeout(() => { lightning.style.opacity = 0; }, 400);
    }
  }, 8000);
}

function stopRain() {
  if (rainInterval) {
    clearInterval(rainInterval);
    rainInterval = null;
  }
  rainCloudContainer.innerHTML = '<div class="rain-cloud"><span class="lightning" id="lightning">⚡</span></div>';
}

// Music Notes for Bhangra Dance
function startMusicNotes() {
  if (notesInterval) clearInterval(notesInterval);
  notesInterval = setInterval(() => {
    const note = document.createElement('div');
    note.className = 'music-note';
    note.innerText = Math.random() > 0.5 ? '🎵' : '🎶';
    
    const rect = bearContainer.getBoundingClientRect();
    note.style.left = rect.left + rect.width/2 + (Math.random() * 80 - 40) + 'px';
    note.style.top = rect.top + 'px';
    note.style.setProperty('--drift', (Math.random() * 120 - 60) + 'px');
    note.style.setProperty('--rot', (Math.random() * 60 - 30) + 'deg');
    
    document.body.appendChild(note);
    setTimeout(() => note.remove(), 1500);
  }, 350);
}

function stopMusicNotes() {
  if (notesInterval) {
    clearInterval(notesInterval);
    notesInterval = null;
  }
}

// Confetti System
function startConfetti() {
  confettiActive = true;
  confettiParticles = [];
  for (let i = 0; i < 150; i++) {
    confettiParticles.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * -confettiCanvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * confettiCanvas.height,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.07 + 0.02,
      tiltAngle: 0
    });
  }
  requestAnimationFrame(updateConfetti);
}

function updateConfetti() {
  if (!confettiActive) return;
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  
  let complete = true;
  confettiParticles.forEach((p, index) => {
    p.tiltAngle += p.tiltAngleIncremental;
    p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
    p.x += Math.sin(p.tiltAngle);
    p.tilt = Math.sin(p.tiltAngle - index / 3) * 15;
    
    if (p.y < confettiCanvas.height) {
      complete = false;
    }
    
    ctx.beginPath();
    ctx.lineWidth = p.r;
    ctx.strokeStyle = p.color;
    ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
    ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
    ctx.stroke();
    
    // Recycle falling off-screen
    if (p.y > confettiCanvas.height) {
      p.x = Math.random() * confettiCanvas.width;
      p.y = -20;
      p.tilt = Math.random() * 10 - 5;
    }
  });
  
  if (!complete) {
    requestAnimationFrame(updateConfetti);
  }
}

function stopConfetti() {
  confettiActive = false;
  setTimeout(() => {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }, 100);
}


/* ==========================================
   STORY SCENE PROGRESSION (STATE MACHINE)
   ========================================== */

// SCENE 1: The Nervous Entrance 🌸
function runScene1() {
  currentScene = '1';
  clearTimeouts();
  
  // 1. Initial State: empty stage for 2 seconds.
  sceneTimeout = setTimeout(() => {
    // 2. Peeking Out: Head peeks in.
    bearContainer.style.left = 'calc(50% - 380px)'; // Head and ears visible
    setBearState({
      eyes: 'normal',
      mouth: 'nervous',
      blushing: true,
      pose: 'arms-behind',
      specialClass: 'walk-anim'
    });
    
    // 3. Looks Left after 1.0s of peeking
    sceneTimeout = setTimeout(() => {
      bearContainer.classList.remove('walk-anim');
      const headGroup = document.getElementById('head-group');
      headGroup.style.transform = 'rotate(-15deg)';
      showThought(thoughtLeft, "Uh oh...", 1500);
      
      // 4. Looks Right
      sceneTimeout = setTimeout(() => {
        headGroup.style.transform = 'rotate(15deg)';
        
        // 5. Looks at Viewer
        sceneTimeout = setTimeout(() => {
          headGroup.style.transform = 'rotate(0deg)';
          setBearState({ eyes: 'puppy', mouth: 'open', blushing: true, pose: 'arms-behind' });
          
          // 6. Quickly hides again
          sceneTimeout = setTimeout(() => {
            bearContainer.style.left = '-400px';
            setBearState({
              eyes: 'normal',
              mouth: 'nervous',
              blushing: true,
              pose: 'arms-behind',
              specialClass: 'walk-anim'
            });
            
            // 7. Gathers courage and steps out (Start Walk of Regret)
            sceneTimeout = setTimeout(() => {
              bearContainer.classList.remove('walk-anim');
              runScene2();
            }, 1200);
          }, 1000);
        }, 1000);
      }, 1500);
    }, 1200);
  }, 2000);
}

// SCENE 2: The Walk of Regret 🧸
function runScene2() {
  currentScene = '2';
  clearTimeouts();
  
  // Show butterflies
  butterfly1.style.display = 'block';
  butterfly2.style.display = 'block';
  
  // Board behind back
  boardBehind.classList.add('show-behind-board');
  document.getElementById('board-behind-title').innerText = "Uh oh...";
  document.getElementById('board-behind-subtitle').innerText = "Please don't throw slippers...";
  
  // Start walking to center-left
  bearContainer.style.left = 'calc(50% - 280px)'; // Trip point
  setBearState({
    eyes: 'normal',
    mouth: 'nervous',
    blushing: true,
    pose: 'arms-behind',
    specialClass: 'walk-anim'
  });
  
  // Regret Thoughts
  sceneTimeout = setTimeout(() => {
    showThought(thoughtRight, "I hope she's not too angry...", 2200);
    
    // Look up at viewer briefly
    sceneTimeout = setTimeout(() => {
      // Pause walk
      bearContainer.classList.remove('walk-anim');
      setBearState({ eyes: 'puppy', mouth: 'nervous', blushing: true, pose: 'arms-behind' });
      
      sceneTimeout = setTimeout(() => {
        // Resume walk
        bearContainer.classList.add('walk-anim');
        showThought(thoughtLeft, "Please don't throw slippers... 🥿", 2000);
        
        sceneTimeout = setTimeout(() => {
          // Trip and fall!
          runScene3();
        }, 2000);
      }, 1000);
    }, 2200);
  }, 1500);
}

// SCENE 3: The Great Embarrassment 😂
function runScene3() {
  currentScene = '3';
  clearTimeouts();
  
  // Stop walking & butterfly animations
  bearContainer.classList.remove('walk-anim');
  butterfly1.style.display = 'none';
  butterfly2.style.display = 'none';
  
  // Trigger trip sequence
  setBearState({
    eyes: 'closed',
    mouth: 'open',
    blushing: true,
    pose: 'arms-holding', // arms flail
    specialClass: 'tripping-anim'
  });
  
  // Trigger board fly!
  boardBehind.classList.remove('show-behind-board');
  boardBehind.classList.add('trip-board-fly');
  
  // Trigger stars
  bearContainer.classList.add('stars-active');
  
  // Emit dust puff at fall time (approx 0.3s into trip keyframe)
  setTimeout(() => {
    const rect = bearContainer.getBoundingClientRect();
    triggerDustPuff(rect.left, 100);
  }, 350);
  
  // Pause 2.5 seconds on face
  sceneTimeout = setTimeout(() => {
    // Thought bubble: "Pretend that didn't happen."
    showThought(thoughtLeft, "Pretend that didn't happen. 🫣", 2500);
    
    sceneTimeout = setTimeout(() => {
      // Stand up, cheeks bright pink
      bearContainer.classList.remove('tripping-anim', 'stars-active');
      boardBehind.classList.remove('trip-board-fly');
      
      setBearState({
        eyes: 'closed',
        mouth: 'nervous',
        blushing: true,
        pose: 'arms-behind'
      });
      
      // Look left/right quickly
      const headGroup = document.getElementById('head-group');
      headGroup.style.transform = 'rotate(-15deg)';
      
      sceneTimeout = setTimeout(() => {
        headGroup.style.transform = 'rotate(15deg)';
        
        sceneTimeout = setTimeout(() => {
          headGroup.style.transform = 'rotate(0deg)';
          setBearState({ eyes: 'normal', mouth: 'nervous', blushing: true, pose: 'arms-behind' });
          
          // Dust off (small visual arms twitching)
          setTimeout(() => {
            const rect = bearContainer.getBoundingClientRect();
            triggerDustPuff(rect.left + 50, 110);
            triggerDustPuff(rect.right - 50, 110);
          }, 200);
          
          // Continue walk to center
          sceneTimeout = setTimeout(() => {
            bearContainer.style.left = 'calc(50% - 160px)'; // Center of screen
            bearContainer.classList.add('walk-anim');
            
            sceneTimeout = setTimeout(() => {
              runScene4();
            }, 1800);
          }, 800);
        }, 600);
      }, 600);
    }, 2500);
  }, 2500);
}

// SCENE 4: The Question ❤️
function runScene4() {
  currentScene = '4';
  clearTimeouts();
  resetIdleTimer();
  
  // Stop walking
  bearContainer.classList.remove('walk-anim');
  
  // Dramatic pause, look puppy eyed/nervous
  setBearState({
    eyes: 'normal',
    mouth: 'nervous',
    blushing: true,
    pose: 'arms-behind'
  });
  
  sceneTimeout = setTimeout(() => {
    // Lift board
    setBearState({
      eyes: 'puppy',
      mouth: 'nervous',
      blushing: true,
      pose: 'arms-holding',
      specialClass: 'show-front-board'
    });
    
    boardFrontTitle.innerText = "Are you angry?";
    boardFrontButtons.innerHTML = `
      <button class="board-btn btn-yes" onclick="handleYesClick()">YES 🩷</button>
      <button class="board-btn btn-no" onclick="handleNoClick()">NO 🩷</button>
    `;
    
    // Enable interactive easter eggs
    setupInteractiveBear();
  }, 1200);
}

/* ==========================================
   IF SHE CLICKS "YES" (DANCE ROUTE)
   ========================================== */

function handleYesClick() {
  clearTimeouts();
  stopIdleTimer();
  
  // emergency panic
  setBearState({
    eyes: 'closed',
    mouth: 'open',
    blushing: true,
    pose: 'arms-holding',
    specialClass: 'show-front-board'
  });
  
  showThought(thoughtLeft, "Must deploy cute mode! 🚨", 1500);
  boardFrontButtons.innerHTML = '';
  boardFrontTitle.innerText = "DEPLOYING DANCE...";
  
  sceneTimeout = setTimeout(() => {
    // Animate throwing the board away
    setBearState({
      eyes: 'puppy',
      mouth: 'smile',
      blushing: true,
      pose: 'arms-behind',
      specialClass: 'board-thrown'
    });
    
    // Start dancing after board is thrown (0.8s)
    sceneTimeout = setTimeout(() => {
      // 1. Bharatanatyam Dance (3s)
      runBharatanatyam();
    }, 800);
  }, 1500);
}

function runBharatanatyam() {
  currentScene = 'dance-1';
  setBearState({
    eyes: 'puppy',
    mouth: 'smile',
    blushing: true,
    specialClass: 'dance-bharata'
  });
  
  showThought(thoughtRight, "Mudra power! 🌸 Ta-Dha-Kit-Tak...", 2800);
  
  sceneTimeout = setTimeout(() => {
    // 2. Bhangra Dance (4s)
    runBhangra();
  }, 3000);
}

function runBhangra() {
  currentScene = 'dance-2';
  setBearState({
    eyes: 'closed',
    mouth: 'open',
    blushing: true,
    specialClass: 'dance-bhangra'
  });
  
  startMusicNotes();
  showThought(thoughtLeft, "Balle Balle! 🕺 *dhol beats* 🥁", 3800);
  
  sceneTimeout = setTimeout(() => {
    stopMusicNotes();
    // 3. Hip Hop Dance (4s)
    runHipHop();
  }, 4000);
}

function runHipHop() {
  currentScene = 'dance-3';
  setBearState({
    eyes: 'normal',
    mouth: 'smile',
    blushing: true,
    specialClass: 'dance-hiphop'
  });
  
  // Slide bear left and right for moonwalk
  bearContainer.style.transition = 'left 1s ease-in-out';
  bearContainer.style.left = 'calc(50% - 240px)';
  
  setTimeout(() => {
    bearContainer.style.left = 'calc(50% - 80px)';
  }, 1000);
  
  showThought(thoughtRight, "Moonwalking... smooth style! 😎", 2000);
  
  // Disco Ball drops suddenly
  setTimeout(() => {
    discoBallContainer.style.top = '0px';
    discoBeam.style.opacity = '0.6';
    showThought(thoughtLeft, "Who installed that?! 🪩", 2000);
  }, 1200);
  
  sceneTimeout = setTimeout(() => {
    // Fails moonwalk & falls flat!
    bearContainer.style.transition = 'left 0.8s ease-out, transform 0.5s ease-out';
    bearContainer.style.left = 'calc(50% - 160px)';
    
    setBearState({
      eyes: 'closed',
      mouth: 'open',
      blushing: true,
      pose: 'arms-holding',
      specialClass: 'hiphop-fail-anim'
    });
    
    setTimeout(() => {
      const rect = bearContainer.getBoundingClientRect();
      triggerDustPuff(rect.left, 100);
    }, 250);
    
    showThought(thoughtRight, "Oof! 🤕 Falling styles...", 1800);
    
    sceneTimeout = setTimeout(() => {
      // Stands up, continues dancing
      bearContainer.classList.remove('hiphop-fail-anim');
      setBearState({
        eyes: 'puppy',
        mouth: 'smile',
        blushing: true,
        specialClass: 'dance-hiphop'
      });
      
      sceneTimeout = setTimeout(() => {
        // Retire disco ball
        discoBallContainer.style.top = '-150px';
        discoBeam.style.opacity = '0';
        
        runScene6A();
      }, 1500);
    }, 2000);
  }, 4000);
}

// SCENE 6A: Please Laugh 🥺
function runScene6A() {
  currentScene = '6A';
  clearTimeouts();
  
  setBearState({
    eyes: 'puppy',
    mouth: 'nervous',
    blushing: true,
    pose: 'arms-holding',
    specialClass: 'show-front-board'
  });
  
  boardFrontTitle.innerText = "Did that help?";
  boardFrontButtons.innerHTML = `
    <button class="board-btn btn-yes" onclick="handleYesCheered()">YES 😄</button>
    <button class="board-btn btn-no" onclick="handleNotReally()">NOT REALLY 😑</button>
  `;
}

function handleYesCheered() {
  clearTimeouts();
  
  // Confetti explosion
  startConfetti();
  
  // Sparkles and heart showers
  let count = 0;
  const heartRain = setInterval(() => {
    if (count > 25) clearInterval(heartRain);
    createSuccessHeart();
    count++;
  }, 100);
  
  setBearState({
    eyes: 'puppy',
    mouth: 'smile',
    blushing: true,
    pose: 'arms-holding',
    specialClass: 'show-front-board'
  });
  
  boardFrontTitle.innerText = "Progress detected! 💖";
  boardFrontButtons.innerHTML = `<button class="board-btn btn-yes" onclick="resetStory()">Aww, Yay! 🥰</button>`;
  
  showThought(thoughtRight, "Yay! Mission accomplished! 🐻💕", 4000);
}

function createSuccessHeart() {
  const heart = document.createElement('div');
  heart.className = 'particle';
  heart.innerText = Math.random() > 0.5 ? '💖' : '🌸';
  heart.style.left = Math.random() * 100 + 'vw';
  heart.style.fontSize = Math.random() * 20 + 15 + 'px';
  heart.style.setProperty('--drift', (Math.random() * 160 - 80) + 'px');
  heart.style.setProperty('--rot', (Math.random() * 180 - 90) + 'deg');
  heart.style.animationDuration = Math.random() * 1.5 + 2 + 's';
  particlesContainer.appendChild(heart);
  setTimeout(() => heart.remove(), 3500);
}

function handleNotReally() {
  clearTimeouts();
  
  setBearState({
    eyes: 'closed',
    mouth: 'sad',
    blushing: true,
    pose: 'arms-holding',
    specialClass: 'show-front-board'
  });
  
  boardFrontTitle.innerText = "Okay... activating maximum apology mode.";
  boardFrontButtons.innerHTML = '';
  
  sceneTimeout = setTimeout(() => {
    // Transitions into the heartbreak crying path automatically!
    runHeartbreakPath();
  }, 2500);
}


/* ==========================================
   IF SHE CLICKS "NO" (EMOTIONAL ROUTE)
   ========================================== */

function handleNoClick() {
  clearTimeouts();
  stopIdleTimer();
  runHeartbreakPath();
}

function runHeartbreakPath() {
  currentScene = '5B';
  
  // 1. Bear freezes.
  setBearState({
    eyes: 'normal',
    mouth: 'nervous',
    blushing: true,
    pose: 'arms-holding',
    specialClass: 'show-front-board'
  });
  
  boardFrontButtons.innerHTML = '';
  
  // 2. Comic confusion thought bubble
  showThought(thoughtLeft, "Wait... NO as in 'I'm not angry' or 'NO, I don't forgive you'?! 🤔", 3000);
  
  sceneTimeout = setTimeout(() => {
    setBearState({
      eyes: 'closed',
      mouth: 'sad',
      blushing: true,
      pose: 'arms-holding',
      specialClass: 'show-front-board'
    });
    
    showThought(thoughtRight, "Oh no... it's a trap! She's actually devastated! 😭", 2500);
    
    sceneTimeout = setTimeout(() => {
      // 3. Board slips from his hands
      bearContainer.classList.add('board-slip');
      
      sceneTimeout = setTimeout(() => {
        // Rain cloud appears above him
        rainCloudContainer.style.transform = 'translateX(-50%) scale(1)';
        startRain();
        
        // Crying dramatic loop starts
        runCryingScene();
      }, 1000);
    }, 2500);
  }, 3200);
}

// SCENE 6B: Dramatic Crying
function runCryingScene() {
  currentScene = '6B';
  clearTimeouts();
  
  setBearState({
    eyes: 'closed',
    mouth: 'sad',
    blushing: true,
    pose: 'arms-holding', // hands over face in cry state
    specialClass: 'crying-anim'
  });
  
  startCryingEffect();
  
  // Crying thought cycles
  let cryCycle = 0;
  const cryThoughts = [
    "Mission failed... 💔",
    "She's really upset... 🥺",
    "Think, teddy, think! 🧠",
    "Please don't be mad... 😭"
  ];
  
  const cycleThoughts = () => {
    if (currentScene !== '6B') return;
    const side = cryCycle % 2 === 0 ? thoughtRight : thoughtLeft;
    showThought(side, cryThoughts[cryCycle % cryThoughts.length], 3000);
    cryCycle++;
    sceneTimeout = setTimeout(cycleThoughts, 4200);
  };
  
  cycleThoughts();
  
  // End crying after 18 seconds of high drama
  setTimeout(() => {
    stopCryingEffect();
    stopRain();
    rainCloudContainer.style.transform = 'translateX(-50%) scale(0)';
    runScene7B();
  }, 18000);
}

// SCENE 7B: New Determination ✨
function runScene7B() {
  currentScene = '7B';
  clearTimeouts();
  
  // Bear stands up, determined eyes
  setBearState({
    eyes: 'grumpy', // Use slanted eyebrows as determined eyes
    mouth: 'nervous',
    blushing: false,
    pose: 'arms-holding',
    specialClass: 'power-active'
  });
  
  showThought(thoughtRight, "I won't give up! 🔥", 2000);
  
  sceneTimeout = setTimeout(() => {
    // Runs offscreen
    bearContainer.style.transition = 'left 0.4s cubic-bezier(0.6, -0.28, 0.735, 0.045)';
    bearContainer.style.left = '-400px';
    
    // Spawn dust puff at center
    const rect = bearContainer.getBoundingClientRect();
    triggerDustPuff(rect.left + rect.width/2 - 20, 100);
    
    sceneTimeout = setTimeout(() => {
      // 3 seconds offscreen, then bring promise board
      runScene8B();
    }, 2500);
  }, 2200);
}

// SCENE 8B: The Promise Board
function runScene8B() {
  currentScene = '8B';
  clearTimeouts();
  
  // Enlarge board styles dynamically
  htmlBoardFront.style.transform = 'scale(1.2) translateY(-20px)';
  htmlBoardFront.style.boxShadow = '0 15px 30px rgba(0,0,0,0.4)';
  
  // Reset transitions
  bearContainer.style.transition = 'left 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.15)';
  bearContainer.style.left = 'calc(50% - 160px)';
  
  // Remove power class
  bearContainer.classList.remove('power-active');
  
  // Bear struggling to hold huge board
  setBearState({
    eyes: 'puppy',
    mouth: 'open',
    blushing: true,
    pose: 'arms-holding',
    specialClass: 'show-front-board'
  });
  
  // Wiggle bear slightly as if board is heavy
  bearContainer.style.animation = 'cryShake 0.4s infinite alternate ease-in-out';
  
  const promises = [
    "I will do anything you say. 🫡",
    "I will be less of a headache. 🤕",
    "I will listen better. 👂",
    "I will try harder. 💪",
    "But please don't stay mad forever... 🥺"
  ];
  
  let promiseIndex = 0;
  boardFrontButtons.innerHTML = '';
  
  const cyclePromises = () => {
    if (currentScene !== '8B') return;
    boardFrontTitle.innerText = promises[promiseIndex];
    
    if (promiseIndex < promises.length - 1) {
      promiseIndex++;
      sceneTimeout = setTimeout(cyclePromises, 3000);
    } else {
      // Final message, then transition to slideshow!
      bearContainer.style.animation = ''; // stop heavy shaking
      sceneTimeout = setTimeout(() => {
        runRomanceSlideshow();
      }, 3000);
    }
  };
  
  cyclePromises();
}

// ROMANTIC SLIDESHOW SEQUENCE 💕
function runRomanceSlideshow() {
  currentScene = 'romance';
  clearTimeouts();
  
  // Hide main bear and front board
  bearContainer.style.transition = 'opacity 0.6s ease-in-out, left 0.6s';
  bearContainer.style.opacity = '0';
  boardFront.classList.remove('show-front-board');
  
  // Show romance container
  romanceContainer.classList.add('show');
  
  const romanceScenes = [
    {
      html: `
        <div class="romance-card">
          <div class="romance-scene-area r-scene-date">
            <div class="sunset-bg">
              <div class="sun"></div>
              <div class="birds">🌅</div>
            </div>
            <div class="swing-holder">
              <div class="chain chain-l"></div>
              <div class="chain chain-r"></div>
              <div class="swing-bench">
                <div class="r-bear r-bear-male">
                  <div class="ear-l"><div class="ear-inner"></div></div>
                  <div class="ear-r"><div class="ear-inner"></div></div>
                  <div class="body"></div>
                  <div class="head">
                    <div class="eye-l"></div><div class="eye-r"></div>
                    <div class="blush blush-l"></div><div class="blush blush-r"></div>
                    <div class="muzzle"><div class="nose"></div></div>
                  </div>
                </div>
                <div class="r-bear r-bear-female">
                  <div class="ear-l"><div class="ear-inner"></div></div>
                  <div class="ear-r"><div class="ear-inner"></div></div>
                  <div class="body"></div>
                  <div class="head">
                    <div class="bow"></div>
                    <div class="eye-l"></div><div class="eye-r"></div>
                    <div class="blush blush-l"></div><div class="blush blush-r"></div>
                    <div class="muzzle"><div class="nose"></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="romance-caption-area">
            Remember our beautiful sunset dates? I promise many more... 🌅
          </div>
        </div>
      `,
      duration: 5000
    },
    {
      html: `
        <div class="romance-card">
          <div class="romance-scene-area r-scene-kiss">
            <div class="starry-bg"></div>
            <div class="kissing-bears">
              <div class="r-bear r-bear-male r-kiss-male">
                <div class="ear-l"><div class="ear-inner"></div></div>
                <div class="ear-r"><div class="ear-inner"></div></div>
                <div class="body"></div>
                <div class="head">
                  <div class="eye-l closed"></div><div class="eye-r closed"></div>
                  <div class="blush blush-l"></div><div class="blush blush-r"></div>
                  <div class="muzzle"><div class="nose"></div></div>
                </div>
              </div>
              <div class="r-bear r-bear-female r-kiss-female">
                <div class="ear-l"><div class="ear-inner"></div></div>
                <div class="ear-r"><div class="ear-inner"></div></div>
                <div class="body"></div>
                <div class="head">
                  <div class="bow"></div>
                  <div class="eye-l closed"></div><div class="eye-r closed"></div>
                  <div class="blush blush-l"></div><div class="blush blush-r"></div>
                  <div class="muzzle"><div class="nose"></div></div>
                </div>
              </div>
            </div>
            <div class="kiss-hearts">💖🌸💕✨</div>
          </div>
          <div class="romance-caption-area">
            Every kiss with you is magic. I miss your sweet kisses... 💋
          </div>
        </div>
      `,
      duration: 5000
    },
    {
      html: `
        <div class="romance-card">
          <div class="romance-scene-area r-scene-cuddle">
            <div class="bedroom-bg">
              <div class="lamp">💡</div>
            </div>
            <div class="cozy-bed">
              <div class="pillows"></div>
              <div class="cuddling-bears-bed">
                <div class="r-bear r-bear-male r-cuddle-male">
                  <div class="ear-l"><div class="ear-inner"></div></div>
                  <div class="ear-r"><div class="ear-inner"></div></div>
                  <div class="head">
                    <div class="eye-l closed"></div><div class="eye-r closed"></div>
                    <div class="blush blush-l"></div><div class="blush blush-r"></div>
                    <div class="muzzle"><div class="nose"></div></div>
                  </div>
                </div>
                <div class="r-bear r-bear-female r-cuddle-female">
                  <div class="ear-l"><div class="ear-inner"></div></div>
                  <div class="ear-r"><div class="ear-inner"></div></div>
                  <div class="head">
                    <div class="bow"></div>
                    <div class="eye-l closed"></div><div class="eye-r closed"></div>
                    <div class="blush blush-l"></div><div class="blush blush-r"></div>
                    <div class="muzzle"><div class="nose"></div></div>
                  </div>
                </div>
              </div>
              <div class="cozy-blanket"></div>
              <div class="cozy-zzz">💤 z Z</div>
            </div>
          </div>
          <div class="romance-caption-area">
            Dreaming of the cozy nights when we can cuddle up together... 🧸💖
          </div>
        </div>
      `,
      duration: 5000
    },
    {
      html: `
        <div class="romance-card">
          <div class="romance-scene-area r-scene-cook">
            <div class="kitchen-bg">
              <div class="shelf">🍽️🍶</div>
            </div>
            <div class="r-bear r-bear-male r-cook-male">
              <div class="ear-l"><div class="ear-inner"></div></div>
              <div class="ear-r"><div class="ear-inner"></div></div>
              <div class="chef-hat">🧑‍🍳</div>
              <div class="body"></div>
              <div class="head">
                <div class="eye-l"></div><div class="eye-r"></div>
                <div class="blush blush-l"></div><div class="blush blush-r"></div>
                <div class="muzzle"><div class="nose"></div></div>
              </div>
              <div class="stirring-spoon">🥄</div>
            </div>
            <div class="stove">
              <div class="pot"><div class="steam">💨</div></div>
            </div>
            <div class="kitchen-slab"></div>
            <div class="r-bear r-bear-female r-cook-female">
              <div class="ear-l"><div class="ear-inner"></div></div>
              <div class="ear-r"><div class="ear-inner"></div></div>
              <div class="body"></div>
              <div class="head">
                <div class="bow"></div>
                <div class="eye-l"></div><div class="eye-r"></div>
                <div class="blush blush-l"></div><div class="blush blush-r"></div>
                <div class="muzzle"><div class="nose"></div></div>
              </div>
              <div class="dangling-legs">
                <div class="leg leg-l"></div>
                <div class="leg leg-r"></div>
              </div>
            </div>
          </div>
          <div class="romance-caption-area">
            I will cook all your favorite meals while you just sit back and look pretty! 🍳👩‍🍳
          </div>
        </div>
      `,
      duration: 5000
    },
    {
      html: `
        <div class="romance-card">
          <div class="romance-scene-area r-scene-lap">
            <div class="garden-bg">
              <div class="tree-trunk"></div>
              <div class="tree-leaves">🌸🍁🌸</div>
            </div>
            <div class="lap-resting-bears">
              <div class="r-bear r-bear-male r-lap-male">
                <div class="ear-l"><div class="ear-inner"></div></div>
                <div class="ear-r"><div class="ear-inner"></div></div>
                <div class="body"></div>
                <div class="head">
                  <div class="eye-l"></div><div class="eye-r"></div>
                  <div class="blush blush-l"></div><div class="blush blush-r"></div>
                  <div class="muzzle"><div class="nose"></div></div>
                </div>
                <div class="petting-hand">🐾</div>
              </div>
              <div class="r-bear r-bear-female r-lap-female">
                <div class="ear-l"><div class="ear-inner"></div></div>
                <div class="ear-r"><div class="ear-inner"></div></div>
                <div class="body-lying"></div>
                <div class="head-lying">
                  <div class="bow"></div>
                  <div class="eye-l closed"></div><div class="eye-r closed"></div>
                  <div class="blush blush-l"></div><div class="blush blush-r"></div>
                  <div class="muzzle"><div class="nose"></div></div>
                </div>
              </div>
            </div>
          </div>
          <div class="romance-caption-area">
            You can always rest your head on my lap when you're tired... 🧸💤
          </div>
        </div>
      `,
      duration: 5000
    },
    {
      html: `
        <div class="romance-card">
          <div class="romance-scene-area r-scene-massage">
            <div class="spa-bg">
              <div class="candles">🕯️🌸🕯️</div>
            </div>
            <div class="massage-setup">
              <div class="massage-table"></div>
              <div class="r-bear r-bear-female r-massage-female">
                <div class="ear-l"><div class="ear-inner"></div></div>
                <div class="ear-r"><div class="ear-inner"></div></div>
                <div class="body-flat"></div>
                <div class="head-flat">
                  <div class="bow"></div>
                  <div class="eye-l closed"></div><div class="eye-r closed"></div>
                  <div class="blush blush-l"></div><div class="blush blush-r"></div>
                  <div class="muzzle"><div class="nose"></div></div>
                </div>
              </div>
              <div class="r-bear r-bear-male r-massage-male">
                <div class="ear-l"><div class="ear-inner"></div></div>
                <div class="ear-r"><div class="ear-inner"></div></div>
                <div class="body"></div>
                <div class="head">
                  <div class="eye-l"></div><div class="eye-r"></div>
                  <div class="blush blush-l"></div><div class="blush blush-r"></div>
                  <div class="muzzle"><div class="nose"></div></div>
                </div>
                <div class="massage-hands">
                  <div class="hand-l">🐾</div>
                  <div class="hand-r">🐾</div>
                </div>
              </div>
            </div>
          </div>
          <div class="romance-caption-area">
            And I promise to massage away all your stress and worries... 💆‍♀️✨
          </div>
        </div>
      `,
      duration: 5000
    }
  ];
  
  let currentSlide = 0;
  
  const showNextSlide = () => {
    if (currentScene !== 'romance') return;
    
    if (currentSlide < romanceScenes.length) {
      romanceContainer.innerHTML = romanceScenes[currentSlide].html;
      romanceContainer.style.opacity = '1';
      
      const duration = romanceScenes[currentSlide].duration;
      currentSlide++;
      sceneTimeout = setTimeout(showNextSlide, duration);
    } else {
      // Finished all slides! Hide slideshow, restore bear
      romanceContainer.style.opacity = '0';
      setTimeout(() => {
        romanceContainer.classList.remove('show');
        romanceContainer.innerHTML = '';
        
        // Show bear and ask for forgiveness!
        bearContainer.style.transition = 'opacity 0.6s ease-in-out, left 0.8s';
        bearContainer.style.opacity = '1';
        
        setBearState({
          eyes: 'puppy',
          mouth: 'nervous',
          blushing: true,
          pose: 'arms-holding',
          specialClass: 'show-front-board'
        });
        
        boardFrontTitle.innerText = "Please forgive me... 🥺👉👈";
        boardFrontButtons.innerHTML = `
          <button class="board-btn btn-yes" onclick="handleYesCheered()">Forgive Me? 🩷</button>
        `;
      }, 600);
    }
  };
  
  showNextSlide();
}


/* ==========================================
   EASTER EGGS & INTERACTION
   ========================================== */

function setupInteractiveBear() {
  bearContainer.style.cursor = 'pointer';
  bearContainer.onclick = (e) => {
    // Avoid double triggering if already grumpy or in transition
    if (isGrumpy || currentScene !== '4') return;
    
    clickCount++;
    createClickHeart(e.clientX, e.clientY);
    
    if (clickCount >= 5) {
      triggerGrumpyEasterEgg();
    }
  };
}

function createClickHeart(x, y) {
  const heart = document.createElement('div');
  heart.className = 'particle';
  heart.innerText = '🌸';
  heart.style.left = x - 10 + 'px';
  heart.style.top = y - 10 + 'px';
  heart.style.animation = 'riseAndFade 1.5s forwards ease-out';
  heart.style.setProperty('--drift', (Math.random() * 40 - 20) + 'px');
  heart.style.setProperty('--rot', (Math.random() * 60 - 30) + 'deg');
  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), 1500);
}

function triggerGrumpyEasterEgg() {
  isGrumpy = true;
  clickCount = 0;
  stopIdleTimer();
  
  // Save current bear state
  saveBearState();
  
  // Grumpy posture
  setBearState({
    eyes: 'grumpy',
    mouth: 'sad',
    blushing: false,
    pose: 'arms-behind'
  });
  
  // Hide front board briefly
  boardFront.classList.remove('show-front-board');
  
  // Trigger alert banner
  customAlert.classList.add('show');
  
  setTimeout(() => {
    customAlert.classList.remove('show');
    
    // Blushes, says sorry
    setBearState({
      eyes: 'puppy',
      mouth: 'nervous',
      blushing: true,
      pose: 'arms-behind'
    });
    
    showThought(thoughtRight, "Sorry... I'm apologizing here! 🥺👉👈", 2000);
    
    setTimeout(() => {
      // Restore previous state
      restoreBearState();
      boardFront.classList.add('show-front-board');
      isGrumpy = false;
      resetIdleTimer();
    }, 2000);
  }, 2200);
}

// 30s Idle Timer
function resetIdleTimer() {
  stopIdleTimer();
  if (currentScene !== '4') return;
  
  idleTimer = setTimeout(() => {
    runIdleSequence();
  }, 30000); // 30 seconds
}

function stopIdleTimer() {
  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }
}

function runIdleSequence() {
  if (currentScene !== '4' || isGrumpy) return;
  
  const idleMessages = [
    "Take your time... ⏳",
    "I'll wait. 🧸",
    "Still waiting... 🕰️",
    "I brought snacks while waiting! 🍪🥛"
  ];
  
  boardFrontTitle.innerText = idleMessages[idlePhase];
  
  if (idlePhase < idleMessages.length - 1) {
    idlePhase++;
    idleTimer = setTimeout(runIdleSequence, 5000);
  }
}


/* ==========================================
   UTILITIES
   ========================================== */

function clearTimeouts() {
  if (sceneTimeout) {
    clearTimeout(sceneTimeout);
    sceneTimeout = null;
  }
}

function resetStory() {
  stopConfetti();
  stopCryingEffect();
  stopRain();
  stopMusicNotes();
  clearTimeouts();
  stopIdleTimer();
  
  // Reset sizes
  htmlBoardFront.style.transform = 'scale(1) translateY(0)';
  htmlBoardFront.style.boxShadow = '';
  bearContainer.style.animation = '';
  bearContainer.style.opacity = '1';
  
  if (romanceContainer) {
    romanceContainer.style.opacity = '0';
    romanceContainer.classList.remove('show');
    romanceContainer.innerHTML = '';
  }
  
  clickCount = 0;
  idlePhase = 0;
  
  // Slide bear left offscreen and re-run
  bearContainer.style.transition = 'left 0.8s ease-in';
  bearContainer.style.left = '-400px';
  setBearState({
    eyes: 'normal',
    mouth: 'nervous',
    blushing: true,
    pose: 'arms-behind',
    specialClass: 'walk-anim'
  });
  
  setTimeout(() => {
    bearContainer.classList.remove('walk-anim');
    bearContainer.style.transition = 'left 0.8s ease-out, transform 0.5s ease-out';
    runScene1();
  }, 1000);
}
