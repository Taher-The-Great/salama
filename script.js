// ==========================================
// CUSTOM CURSOR TRAIL (DISABLED ON MOBILE)
// ==========================================
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');

if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    if (cursor) cursor.style.display = 'none';
    if (follower) follower.style.display = 'none';
    document.body.style.cursor = 'default';
} else {
    document.addEventListener('mousemove', (e) => {
        gsap.to(cursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.1,
            ease: "power2.out"
        });
        gsap.to(follower, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.25,
            ease: "power2.out"
        });
    });

    document.querySelectorAll('button, .glow-btn, .flower-item, .polaroid, .envelope-container, .glass-jar').forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (cursor) {
                cursor.style.width = '35px';
                cursor.style.height = '35px';
                cursor.style.background = 'radial-gradient(circle, var(--accent-love) 0%, rgba(255, 215, 0, 0.4) 80%)';
            }
        });
        el.addEventListener('mouseleave', () => {
            if (cursor) {
                cursor.style.width = '20px';
                cursor.style.height = '20px';
                cursor.style.background = 'radial-gradient(circle, var(--accent-love) 0%, rgba(255, 20, 147, 0) 70%)';
            }
        });
    });
}

// ==========================================
// PROCEDURAL AUDIO (WEB AUDIO API CHIMES)
// ==========================================
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

function playChimeSound() {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();
        const now = ctx.currentTime;

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, now);
        osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.12);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1320, now);

        gainNode.gain.setValueAtTime(0.12, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.0);
        osc2.stop(now + 1.0);
    } catch (e) {
        console.warn("Web Audio chime failed", e);
    }
}

function playSpecialChime() {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();
        const now = ctx.currentTime;
        const scale = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6

        scale.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);

            gainNode.gain.setValueAtTime(0.08, now + idx * 0.08);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.7);

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.7);
        });
    } catch (e) {
        console.warn("Web Audio special chime failed", e);
    }
}

// ==========================================
// BACKGROUND MUSIC CONTROLLER
// ==========================================
const playlist = [
    { name: "Sweet Piano Theme", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { name: "Dreamy Whispers", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
    { name: "Starry Nocturne", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" }
];
let currentTrackIdx = 0;
const bgMusic = new Audio(playlist[currentTrackIdx].url);
bgMusic.loop = true;
bgMusic.volume = 0.35;

const celebrateMusic = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3");
celebrateMusic.loop = true;
celebrateMusic.volume = 0.45;

let isPlaying = false;
const musicWave = document.getElementById('musicWave');
const musicInfo = document.getElementById('musicInfo');
const musicToggleBtn = document.getElementById('musicToggleBtn');

function updateTrackInfo() {
    musicInfo.textContent = playlist[currentTrackIdx].name;
}

function playTrack() {
    bgMusic.src = playlist[currentTrackIdx].url;
    updateTrackInfo();
    if (isPlaying) {
        bgMusic.play().catch(e => console.log("Play failed: ", e));
    }
}

musicToggleBtn.addEventListener('click', () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') ctx.resume();

    if (isPlaying) {
        bgMusic.pause();
        musicWave.classList.add('paused');
        musicToggleBtn.textContent = "▶";
        isPlaying = false;
    } else {
        bgMusic.play().then(() => {
            musicWave.classList.remove('paused');
            musicToggleBtn.textContent = "❚❚";
            isPlaying = true;
        }).catch(e => console.log("Blocked by user interaction policy"));
    }
});

// Auto-play on first user click anywhere
document.body.addEventListener('click', () => {
    if (!isPlaying) {
        bgMusic.play().then(() => {
            isPlaying = true;
            musicWave.classList.remove('paused');
            musicToggleBtn.textContent = "❚❚";
        }).catch(e => console.log("Autoplay blocked, waiting for direct widget interaction"));
    }
}, { once: true });

updateTrackInfo();

// ==========================================
// THREE.JS GALAXY STARFIELD BACKGROUND
// ==========================================
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg-canvas'), alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Starfield particles
const starCount = 1800;
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(starCount * 3);

for (let i = 0; i < starCount * 3; i += 3) {
    starPositions[i] = (Math.random() - 0.5) * 1500;
    starPositions[i + 1] = (Math.random() - 0.5) * 1000;
    starPositions[i + 2] = (Math.random() - 0.5) * 600 - 100;
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.7,
    transparent: true,
    opacity: 0.8
});
const starField = new THREE.Points(starGeometry, starMaterial);
scene.add(starField);

// Nebula particles (pink/purple dust)
const nebulaCount = 500;
const nebulaGeometry = new THREE.BufferGeometry();
const nebulaPositions = new Float32Array(nebulaCount * 3);

for (let i = 0; i < nebulaCount * 3; i += 3) {
    nebulaPositions[i] = (Math.random() - 0.5) * 1200;
    nebulaPositions[i + 1] = (Math.random() - 0.5) * 800;
    nebulaPositions[i + 2] = (Math.random() - 0.5) * 400 - 50;
}

nebulaGeometry.setAttribute('position', new THREE.BufferAttribute(nebulaPositions, 3));
const nebulaMaterial = new THREE.PointsMaterial({
    color: 0xff69b4,
    size: 1.5,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending
});
const nebulaField = new THREE.Points(nebulaGeometry, nebulaMaterial);
scene.add(nebulaField);

camera.position.z = 350;

function animateStarfield() {
    requestAnimationFrame(animateStarfield);
    starField.rotation.y += 0.0004;
    starField.rotation.x += 0.0002;
    nebulaField.rotation.y -= 0.00015;
    renderer.render(scene, camera);
}
animateStarfield();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ==========================================
// FLOATING HEARTS GENERATOR
// ==========================================
function spawnHeart() {
    const heartSymbols = ['❤️', '💖', '✨', '🌸', '💫', '💕'];
    const heart = document.createElement('div');
    heart.classList.add('floating-heart');
    heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.fontSize = Math.random() * 1.5 + 0.8 + 'rem';
    heart.style.animationDuration = Math.random() * 3 + 5 + 's';
    document.body.appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 8000);
}

setInterval(spawnHeart, 1000);

// ==========================================
// PAGE TRANSITIONS MANAGER (GSAP)
// ==========================================
function showPage(pageId) {
    const activePage = document.querySelector('.page.active');
    const targetPage = document.getElementById(pageId);

    if (activePage === targetPage) return;

    playChimeSound();

    gsap.timeline()
        .to(activePage, {
            opacity: 0,
            y: -25,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => {
                activePage.classList.remove('active');
                activePage.style.display = 'none';

                targetPage.style.display = 'flex';
                targetPage.classList.add('active');

                if (pageId === 'cake-page') {
                    setTimeout(initCakeCanvas, 100);
                }

                setTimeout(() => {
                    AOS.refresh();
                }, 50);
            }
        })
        .fromTo(targetPage,
            { opacity: 0, y: 25 },
            { opacity: 1, y: 0, duration: 0.75, ease: "power2.out" }
        );
}

// Initialize AOS Animations
AOS.init({
    duration: 1000,
    once: true
});

// ==========================================
// PAGE 1: INTRO LANDING PAGE
// ==========================================
new Typed('#typewriter', {
    strings: [
        'A magical surprise crafted just for you... ✨',
        'To bring a sweet smile on your special day. 🌸',
        'Happy Birthday, Salama! 💖'
    ],
    typeSpeed: 60,
    backSpeed: 30,
    loop: true,
    showCursor: true,
    cursorChar: '✨'
});

document.getElementById('beginJourneyBtn').addEventListener('click', () => {
    showPage('letter-page');
});

// ==========================================
// PAGE 2: ENVELOPE OPENING
// ==========================================
const envelopeContainer = document.getElementById('envelopeContainer');
const toJarBtn = document.getElementById('toJarBtn');

envelopeContainer.addEventListener('click', () => {
    if (!envelopeContainer.classList.contains('open')) {
        envelopeContainer.classList.add('open');
        playChimeSound();

        // Reveal transition button after reading delay
        gsap.to(toJarBtn, {
            display: 'block',
            opacity: 1,
            y: 0,
            delay: 2.8,
            duration: 0.8,
            ease: "back.out(1.2)"
        });
    }
});

toJarBtn.addEventListener('click', () => {
    showPage('jar-page');
});

// ==========================================
// PAGE 3: JAR OF SMILES COMPLIMENTS
// ==========================================
const compliments = [
    "Your smile has the power to light up even the darkest of rooms. Never lose that spark! ✨",
    "You carry a beautiful strength within you, Salama. You are capable of amazing things! 🌟",
    "The world is a much warmer and sweeter place just because you are in it. 💖",
    "Your kindness and grace shine through everything you do. You deserve the absolute best. 🌸",
    "Even in quiet moments, remember that you are appreciated, valued, and deeply cared for. 💫"
];
let openedComplimentCount = 0;
const jarContainer = document.getElementById('jarContainer');
const complimentOverlay = document.getElementById('complimentOverlay');
const complimentText = document.getElementById('complimentText');
const closeComplimentBtn = document.getElementById('closeComplimentBtn');
const toBouquetBtn = document.getElementById('toBouquetBtn');

jarContainer.addEventListener('click', () => {
    if (openedComplimentCount < compliments.length) {
        complimentText.textContent = compliments[openedComplimentCount];
        complimentOverlay.classList.add('active');
        playChimeSound();
        openedComplimentCount++;
    }
});

const skipJarBtn = document.getElementById('skipJarBtn');
if (skipJarBtn) {
    skipJarBtn.addEventListener('click', () => {
        showPage('bouquet-page');
    });
}

closeComplimentBtn.addEventListener('click', () => {
    complimentOverlay.classList.remove('active');

    // Check if all compliments are read
    if (openedComplimentCount >= compliments.length) {
        if (skipJarBtn) {
            gsap.to(skipJarBtn, {
                opacity: 0,
                duration: 0.4,
                onComplete: () => {
                    skipJarBtn.style.display = 'none';
                }
            });
        }
        gsap.to(toBouquetBtn, {
            display: 'block',
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "back.out(1.2)"
        });
    }
});

toBouquetBtn.addEventListener('click', () => {
    showPage('bouquet-page');
});

// ==========================================
// PAGE 4: FLOWER BOUQUET BUILDER
// ==========================================
const bouquetFlowers = [];
const flowerFeedback = document.getElementById('flowerFeedback');
const flowerBouquetArea = document.getElementById('flowerBouquetArea');
const toGalleryBtn = document.getElementById('toGalleryBtn');

document.querySelectorAll('.flower-item').forEach(item => {
    item.addEventListener('click', () => {
        const emoji = item.getAttribute('data-emoji');
        const feedbackMsg = item.getAttribute('data-msg');
        const type = item.getAttribute('data-flower');

        playChimeSound();
        flowerFeedback.textContent = feedbackMsg;

        // Animate flower flying to vase
        const itemRect = item.getBoundingClientRect();
        const bouquetRect = flowerBouquetArea.getBoundingClientRect();

        const flyer = document.createElement('div');
        flyer.textContent = emoji;
        flyer.style.position = 'fixed';
        flyer.style.left = itemRect.left + itemRect.width / 2 + 'px';
        flyer.style.top = itemRect.top + itemRect.height / 2 + 'px';
        flyer.style.fontSize = '2.5rem';
        flyer.style.pointerEvents = 'none';
        flyer.style.zIndex = 100;
        document.body.appendChild(flyer);

        const destX = bouquetRect.left + bouquetRect.width / 2 + (Math.random() - 0.5) * 100;
        const destY = bouquetRect.top + bouquetRect.height / 2 + (Math.random() - 0.5) * 80 - 30;

        gsap.to(flyer, {
            left: destX,
            top: destY,
            scale: 1.1,
            rotation: (Math.random() - 0.5) * 50,
            duration: 1.0,
            ease: "power2.out",
            onComplete: () => {
                flyer.remove();

                // Create static flower inside vase
                const staticFlower = document.createElement('div');
                staticFlower.classList.add('bouquet-flower');
                staticFlower.textContent = emoji;

                // Relative positioning in the container
                staticFlower.style.left = destX - bouquetRect.left + 'px';
                staticFlower.style.top = destY - bouquetRect.top + 'px';
                staticFlower.style.transform = `rotate(${(Math.random() - 0.5) * 30}deg)`;
                staticFlower.style.animationDelay = Math.random() * 1.5 + 's';

                flowerBouquetArea.appendChild(staticFlower);
                bouquetFlowers.push(type);

                // Reveal next button if 3 or more flowers are in the vase
                if (bouquetFlowers.length >= 3) {
                    gsap.to(toGalleryBtn, {
                        display: 'block',
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: "back.out(1.2)"
                    });
                }
            }
        });
    });
});

toGalleryBtn.addEventListener('click', () => {
    showPage('gallery-page');
});

// ==========================================
// PAGE 5: POLAROID GALLERY
// ==========================================
document.getElementById('toWishBtn').addEventListener('click', () => {
    showPage('wish-page');
});

// ==========================================
// PAGE 6: STARRY WISH PORTAL
// ==========================================
const wishText = document.getElementById('wishText');
const sendWishBtn = document.getElementById('sendWishBtn');
const toCakeBtn = document.getElementById('toCakeBtn');

sendWishBtn.addEventListener('click', () => {
    const value = wishText.value.trim();
    if (!value) return;

    wishText.disabled = true;
    sendWishBtn.disabled = true;
    playChimeSound();

    // Send to Web3Forms using access key
    const formData = new FormData();
    formData.append("access_key", "e7271cae-5e38-4c1a-a6f4-a24302e555af");
    formData.append("subject", "Salama's Birthday Wish! ✨");
    formData.append("name", "Salama");
    formData.append("message", value);

    fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
    })
        .then(res => res.json())
        .then(data => console.log("Web3Forms success:", data))
        .catch(err => console.error("Web3Forms error:", err));

    const textRect = wishText.getBoundingClientRect();

    gsap.to([wishText, sendWishBtn], {
        opacity: 0,
        y: -15,
        duration: 0.6,
        ease: "power2.in",
        onComplete: () => {
            wishText.style.display = 'none';
            sendWishBtn.style.display = 'none';

            // Create temporary shooting star starting from input center
            const star = document.createElement('div');
            star.classList.add('shooting-star-temp');
            star.style.left = textRect.left + textRect.width / 2 + 'px';
            star.style.top = textRect.top + textRect.height / 2 + 'px';
            document.body.appendChild(star);

            gsap.to(star, {
                top: '-40px',
                left: `+=${(Math.random() - 0.5) * 180}px`,
                scale: 0.05,
                duration: 1.6,
                ease: "power2.in",
                onComplete: () => {
                    star.remove();

                    // Trigger golden particle explosion
                    confetti({
                        particleCount: 100,
                        spread: 140,
                        origin: { x: 0.5, y: 0.15 },
                        colors: ['#ffd700', '#ffffff', '#ff69b4'],
                        scalar: 1.3
                    });
                    playSpecialChime();

                    // Reveal success text
                    const successMsg = document.getElementById('wishSuccessMsg');
                    if (successMsg) {
                        successMsg.style.display = 'block';
                        gsap.to(successMsg, {
                            opacity: 1,
                            duration: 0.6
                        });
                    }

                    // Automatically transition to Cake page after a short delay
                    setTimeout(() => {
                        showPage('cake-page');
                    }, 2200);
                }
            });
        }
    });
});

toCakeBtn.addEventListener('click', () => {
    showPage('cake-page');
});

// ==========================================
// PAGE 7: THREE.JS CAKE CEREMONY & BLOW
// ==========================================
let cakeScene, cakeCamera, cakeRenderer, cakeGroup;
let candleLight, candleFlameMesh, flameMaterial;
let isCandleLit = true;

function initCakeCanvas() {
    const container = document.getElementById('cakeCanvas');
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 350;

    if (cakeScene) {
        cakeRenderer.dispose();
        cakeScene = null;
    }

    cakeScene = new THREE.Scene();
    cakeCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cakeCamera.position.set(0, 2.3, 5.5);
    cakeCamera.lookAt(0, 0.8, 0);

    cakeRenderer = new THREE.WebGLRenderer({ canvas: container, alpha: true, antialias: true });
    cakeRenderer.setSize(width, height);
    cakeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0x505070);
    cakeScene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffedd5, 1.2);
    mainLight.position.set(4, 8, 5);
    cakeScene.add(mainLight);

    const pinkFill = new THREE.PointLight(0xff69b4, 0.6, 10);
    pinkFill.position.set(-3, 2, 3);
    cakeScene.add(pinkFill);

    cakeGroup = new THREE.Group();

    // 3 Tiers of the cake
    const bottomTierGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.55, 32);
    const bottomTierMat = new THREE.MeshStandardMaterial({ color: 0xff85b2, roughness: 0.35, emissive: 0x22050f });
    const bottomTier = new THREE.Mesh(bottomTierGeo, bottomTierMat);
    bottomTier.position.y = 0.275;
    cakeGroup.add(bottomTier);

    const middleTierGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.5, 32);
    const middleTierMat = new THREE.MeshStandardMaterial({ color: 0xffa3c4, roughness: 0.35, emissive: 0x2b0813 });
    const middleTier = new THREE.Mesh(middleTierGeo, middleTierMat);
    middleTier.position.y = 0.8;
    cakeGroup.add(middleTier);

    const topTierGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.45, 32);
    const topTierMat = new THREE.MeshStandardMaterial({ color: 0xffb8d2, roughness: 0.35, emissive: 0x330917 });
    const topTier = new THREE.Mesh(topTierGeo, topTierMat);
    topTier.position.y = 1.275;
    cakeGroup.add(topTier);

    // Frosting Cream Ropes (Torus rings around edges)
    const creamMat = new THREE.MeshStandardMaterial({ color: 0xfffcf5, roughness: 0.5 });

    const ringBottomGeo = new THREE.TorusGeometry(1.5, 0.05, 12, 48);
    const ringBottom = new THREE.Mesh(ringBottomGeo, creamMat);
    ringBottom.rotation.x = Math.PI / 2;
    ringBottom.position.y = 0.55;
    cakeGroup.add(ringBottom);

    const ringMiddleGeo = new THREE.TorusGeometry(1.15, 0.05, 12, 48);
    const ringMiddle = new THREE.Mesh(ringMiddleGeo, creamMat);
    ringMiddle.rotation.x = Math.PI / 2;
    ringMiddle.position.y = 1.05;
    cakeGroup.add(ringMiddle);

    const ringTopGeo = new THREE.TorusGeometry(0.8, 0.05, 12, 48);
    const ringTop = new THREE.Mesh(ringTopGeo, creamMat);
    ringTop.rotation.x = Math.PI / 2;
    ringTop.position.y = 1.5;
    cakeGroup.add(ringTop);

    // Sprinkles on top tier
    const sprinklesColors = [0xffd700, 0xff69b4, 0x00ffff, 0x7fff00, 0xffa500, 0xffffff];
    for (let i = 0; i < 22; i++) {
        const sprinkleGeo = new THREE.SphereGeometry(0.025, 8, 8);
        const sprinkleMat = new THREE.MeshStandardMaterial({
            color: sprinklesColors[Math.floor(Math.random() * sprinklesColors.length)],
            roughness: 0.4
        });
        const sprinkle = new THREE.Mesh(sprinkleGeo, sprinkleMat);
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.7;
        sprinkle.position.set(Math.cos(angle) * radius, 1.51, Math.sin(angle) * radius);
        cakeGroup.add(sprinkle);
    }

    // Sprinkles on middle tier ledge
    for (let i = 0; i < 30; i++) {
        const sprinkleGeo = new THREE.SphereGeometry(0.025, 8, 8);
        const sprinkleMat = new THREE.MeshStandardMaterial({
            color: sprinklesColors[Math.floor(Math.random() * sprinklesColors.length)],
            roughness: 0.4
        });
        const sprinkle = new THREE.Mesh(sprinkleGeo, sprinkleMat);
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.85 + Math.random() * 0.25;
        sprinkle.position.set(Math.cos(angle) * radius, 1.06, Math.sin(angle) * radius);
        cakeGroup.add(sprinkle);
    }

    // Candle
    const candleGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 16);
    const candleMat = new THREE.MeshStandardMaterial({ color: 0xfff0aa, roughness: 0.6 });
    const candle = new THREE.Mesh(candleGeo, candleMat);
    candle.position.set(0, 1.75, 0);
    cakeGroup.add(candle);

    // Glowing candle flame
    const flameGeo = new THREE.ConeGeometry(0.07, 0.18, 16);
    flameMaterial = new THREE.MeshStandardMaterial({
        color: 0xff5500,
        emissive: 0xff6600,
        emissiveIntensity: 0.8,
        roughness: 0.1
    });
    candleFlameMesh = new THREE.Mesh(flameGeo, flameMaterial);
    candleFlameMesh.position.set(0, 2.05, 0);
    cakeGroup.add(candleFlameMesh);

    // Candle Light Glow source
    candleLight = new THREE.PointLight(0xff7700, 1.0, 6);
    candleLight.position.set(0, 2.05, 0);
    cakeGroup.add(candleLight);

    cakeScene.add(cakeGroup);

    // Render loop
    function animateCake() {
        if (!cakeScene) return;
        requestAnimationFrame(animateCake);

        if (cakeGroup) {
            cakeGroup.rotation.y += 0.005;
        }

        if (isCandleLit && candleFlameMesh) {
            // Candle flickering simulation
            const flickerVal = Math.random() * 0.25;
            candleLight.intensity = 0.95 + flickerVal;
            flameMaterial.emissiveIntensity = 0.8 + flickerVal;
            candleFlameMesh.scale.set(1 + flickerVal * 0.15, 1 + Math.sin(Date.now() * 0.05) * 0.1, 1);
        }

        cakeRenderer.render(cakeScene, cakeCamera);
    }
    animateCake();
}

function extinguishCandle() {
    if (!isCandleLit) return;
    isCandleLit = false;

    if (candleFlameMesh) candleFlameMesh.visible = false;
    if (candleLight) candleLight.intensity = 0;

    playSpecialChime();

    // Massive confetti burst
    confetti({ particleCount: 300, spread: 130, origin: { y: 0.6 }, colors: ['#ff69b4', '#ffd700', '#ffffff', '#00ffff'] });
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.5, x: 0.25 }, startVelocity: 25 });
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.5, x: 0.75 }, startVelocity: 25 });

    // Multi-fireworks sequence
    for (let i = 0; i < 7; i++) {
        setTimeout(() => {
            confetti({
                particleCount: 120,
                spread: 90,
                origin: { y: Math.random() * 0.4 + 0.25, x: Math.random() },
                startVelocity: 30,
                decay: 0.9
            });
        }, i * 220);
    }

    // Spawn hearts
    for (let i = 0; i < 35; i++) {
        setTimeout(spawnHeart, i * 80);
    }

    // Switch music playlist track to the upbeat SoundHelix celebrate song
    bgMusic.pause();
    celebrateMusic.play().then(() => {
        musicWave.classList.remove('paused');
        musicToggleBtn.textContent = "❚❚";
        isPlaying = true;
        musicInfo.textContent = "Celebration Party! 🎂";
    }).catch(e => console.log("Celebration audio blocked"));

    // Animate Reveal final romantic banner
    const finalMessage = document.getElementById('finalMessage');
    finalMessage.style.display = 'block';
    gsap.fromTo(finalMessage, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 1.5, ease: "power2.out" });

    // Update Stage Headings
    document.getElementById('cakeTitle').innerHTML = "🎉 Happy Birthday Salama! 🎉";
    document.getElementById('cakeSubtitle').innerHTML = "You deserve all the happiness in the universe. ✨";
}

document.getElementById('blowCandleBtn').addEventListener('click', () => {
    if (isCandleLit) extinguishCandle();
});

// Microphone Blow Detection
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            const ctx = getAudioContext();
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            source.connect(analyser);

            const detectBlow = () => {
                if (!isCandleLit) return;
                analyser.getByteFrequencyData(dataArray);
                let avgVolume = 0;
                for (let i = 0; i < bufferLength; i++) {
                    avgVolume += dataArray[i];
                }
                avgVolume /= bufferLength;

                if (avgVolume > 115) { // Blowing trigger threshold
                    extinguishCandle();
                } else {
                    requestAnimationFrame(detectBlow);
                }
            };

            // Start detection listener on direct clicks
            document.body.addEventListener('click', () => {
                if (ctx.state === 'suspended') ctx.resume();
                detectBlow();
            }, { once: true });

            document.getElementById('micStatus').innerHTML = "Microphone ready! Blow physically to blow candle! 🎤";
        }).catch(err => {
            console.log("Mic access not granted", err);
            document.getElementById('micStatus').innerHTML = "Microphone denied. Click button below to blow out! 💨";
        });
} else {
    document.getElementById('micStatus').innerHTML = "Use the button below to blow out the candle 🎂";
}
