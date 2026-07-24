gsap.registerPlugin(ScrollTrigger);

Shery.mouseFollower();
Shery.makeMagnet(".magnet");
Shery.hoverWithMediaCircle(".hvr", {
    videos: ["./0.mp4", "./2.mp4", "./3.mp4"],
});
gsap.to(".fleftlm", {
    scrollTrigger: {
        trigger: "#fimages",
        pin: true,
        start: "top top",
        end: "bottom bottom",
        endTrigger: ".last",
        scrub: 1,
    },
    y: "-300%",
    ease: Power1,
});
// ...rest stays the same

let sections = document.querySelectorAll(".fleftlm");
Shery.imageEffect(".images", {
    style: 4,
    config: { onMouse: { value: 1 } },
    slideStyle: (setScroll) => {
        sections.forEach(function (section, index) {
            ScrollTrigger.create({
                trigger: section,
                start: "top top",
                scrub: 1,
                onUpdate: function (prog) {
                    setScroll(prog.progress + index);
                },
            });
        });
    },
});

(function initHomeBlurBlobs() {
    const blobs = document.querySelectorAll(".blob");
    if (!blobs.length) return;

    blobs.forEach((blob) => {
        function drift() {
            gsap.to(blob, {
                x: gsap.utils.random(-60, 60),
                y: gsap.utils.random(-60, 60),
                scale: gsap.utils.random(0.9, 1.15),
                duration: gsap.utils.random(10, 18),
                ease: "sine.inOut",
                onComplete: drift, // picks a new random target each time it finishes
            });
        }
        drift();
    });
})();



// PASTE THIS at the end of your existing script.js
// (after your current Shery/GSAP/ScrollTrigger code)

/* ================= SKILLS: staggered scroll reveal ================= */
gsap.to(".skill-card", {
    scrollTrigger: {
        trigger: "#skills",
        start: "top 75%",
    },
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: "power3.out",
});

/* ================= STATS: animated counters ================= */
document.querySelectorAll(".stat-number").forEach((el) => {
    const target = +el.dataset.target;
    ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => {
            const counter = { val: 0 };
            gsap.to(counter, {
                val: target,
                duration: 2,
                ease: "power1.out",
                onUpdate: () => {
                    el.innerText = Math.floor(counter.val);
                },
            });
        },
    });
});


// PASTE THIS at the end of script.js

/* ================= MANIFESTO: scroll-scrubbed word highlight ================= */
(function initManifestoText() {
    const spans = document.querySelectorAll(".manifesto-text span");
    if (!spans.length) return;

    ScrollTrigger.create({
        trigger: "#manifesto",
        start: "top top",
        end: "+=150%",
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
            const activeCount = Math.floor(self.progress * spans.length);
            spans.forEach((span, i) => {
                span.style.color = i < activeCount ? "#ffffff" : "rgba(255,255,255,0.15)";
            });
        },
    });
})();


/* ================= MANIFESTO: continuous looping word highlight ================= */
(function initManifestoText() {
    const spans = document.querySelectorAll(".manifesto-text span");
    if (!spans.length) return;

    // Starts once the section scrolls into view, then loops forever —
    // no longer tied to scroll position, so it always plays through
    // the full sentence and keeps repeating.
    ScrollTrigger.create({
        trigger: "#manifesto",
        start: "top 80%",
        once: true,
        onEnter: () => {
            gsap.to(spans, {
                color: "#ffffff",
                duration: 0.6,
                ease: "power1.inOut",
                stagger: {
                    each: 0.15,
                    yoyo: true,
                    repeat: -1,
                },
            });
        },
    });
})();

/* ================= MANIFESTO: live shader aurora background ================= */
(function initManifestoShader() {
    const canvas = document.getElementById("manifesto-canvas");
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uResolution: { value: new THREE.Vector2() },
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uTime;
            uniform vec2 uResolution;
            varying vec2 vUv;

            void main() {
                vec2 uv = vUv;
                vec2 p = uv - 0.5;
                p.x *= uResolution.x / uResolution.y;

                vec3 color = vec3(0.02, 0.02, 0.05);

                for (int i = 0; i < 5; i++) {
                    float fi = float(i);
                    vec2 center = vec2(
                        sin(uTime * 0.3 + fi * 1.5) * 0.4,
                        cos(uTime * 0.25 + fi * 2.0) * 0.3
                    );
                    float d = length(p - center);
                    vec3 col = vec3(
                        0.25 + 0.2 * sin(fi * 2.0),
                        0.25 + 0.2 * sin(fi * 2.0 + 2.0),
                        0.25 + 0.2 * sin(fi * 2.0 + 4.0)
                    );
                    color += col * smoothstep(0.35, 0.0, d) * 0.28;
                }

                gl_FragColor = vec4(color, 1.0);
            }
        `,
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    function resize() {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        renderer.setSize(w, h, false);
        material.uniforms.uResolution.value.set(w, h);
    }
    resize();
    window.addEventListener("resize", resize);

    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        material.uniforms.uTime.value = clock.getElapsedTime();
        renderer.render(scene, camera);
    }
    animate();
})();

/* ================= CONTACT: Three.js particle background ================= */
(function initParticles() {
    const canvas = document.getElementById("particle-canvas");
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        60,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000
    );
    camera.position.z = 50;

    function resize() {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    // Generate random floating particles
    const particleCount = 400;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.4 });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Mouse-reactive camera drift
    let mouseX = 0, mouseY = 0;
    canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) / rect.width - 0.5;
        mouseY = (e.clientY - rect.top) / rect.height - 0.5;
    });

    function animate() {
        requestAnimationFrame(animate);
        points.rotation.y += 0.0008;
        points.rotation.x += 0.0003;
        camera.position.x += (mouseX * 10 - camera.position.x) * 0.02;
        camera.position.y += (-mouseY * 10 - camera.position.y) * 0.02;
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
    }
    animate();
})();



/* ================= HOME: drifting icons + click-to-throw physics ================= */
(function initFloatingIcons() {
    const homeEl = document.getElementById("home");
    const icons = document.querySelectorAll(".floating-icon");
    if (!homeEl || !icons.length) return;

    // ---------- Part 1: gentle autonomous drifting (until clicked) ----------
    icons.forEach((icon) => {
        const startX = gsap.utils.random(5, 88);
        const startY = gsap.utils.random(8, 82);
        gsap.set(icon, { left: `${startX}%`, top: `${startY}%` });

        function drift() {
            if (icon.classList.contains("thrown")) return; // stop drifting once thrown
            gsap.to(icon, {
                x: gsap.utils.random(-100, 100),
                y: gsap.utils.random(-70, 70),
                rotation: gsap.utils.random(-20, 20),
                duration: gsap.utils.random(7, 14),
                ease: "sine.inOut",
                onComplete: drift,
            });
        }
        drift();
    });

    // ---------- Part 2: click-to-throw physics (Matter.js) ----------
    if (typeof Matter === "undefined") return; // Matter.js not loaded, skip physics

    const { Engine, World, Bodies, Body } = Matter;

    let engine, world, loopStarted = false;
    const bodies = new Map(); // icon element -> matter body

    function initPhysicsWorld() {
        if (engine) return;
        engine = Engine.create();
        world = engine.world;
        world.gravity.y = 1;

        const rect = homeEl.getBoundingClientRect();
        const t = 100; // wall thickness

        World.add(world, [
            Bodies.rectangle(rect.width / 2, rect.height + t / 2, rect.width * 2, t, { isStatic: true }), // floor
            Bodies.rectangle(-t / 2, rect.height / 2, t, rect.height * 2, { isStatic: true }), // left wall
            Bodies.rectangle(rect.width + t / 2, rect.height / 2, t, rect.height * 2, { isStatic: true }), // right wall
        ]);
    }

    function startLoop() {
        if (loopStarted) return;
        loopStarted = true;
        (function tick() {
            Engine.update(engine, 1000 / 60);
            bodies.forEach((body, el) => {
                el.style.left = `${body.position.x}px`;
                el.style.top = `${body.position.y}px`;
                el.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`;
            });
            requestAnimationFrame(tick);
        })();
    }

    function throwIcon(icon) {
        initPhysicsWorld();
        startLoop();

        const iconRect = icon.getBoundingClientRect();
        const homeRect = homeEl.getBoundingClientRect();
        const x = iconRect.left - homeRect.left + iconRect.width / 2;
        const y = iconRect.top - homeRect.top + iconRect.height / 2;

        if (bodies.has(icon)) {
            // Already thrown once -- hitting it again gives it a fresh kick
            const body = bodies.get(icon);
            Body.setVelocity(body, {
                x: gsap.utils.random(-18, 18),
                y: gsap.utils.random(-28, -14),
            });
            Body.setAngularVelocity(body, gsap.utils.random(-0.3, 0.3));
            return;
        }

        gsap.killTweensOf(icon); // stop the drifting tween permanently

        const radius = iconRect.width / 2;
        const body = Bodies.circle(x, y, radius, {
            restitution: 0.55, // bounciness
            friction: 0.05,
            frictionAir: 0.005,
        });

        Body.setVelocity(body, {
            x: gsap.utils.random(-18, 18),
            y: gsap.utils.random(-28, -14),
        });
        Body.setAngularVelocity(body, gsap.utils.random(-0.3, 0.3));

        World.add(world, body);
        bodies.set(icon, body);

        icon.classList.add("thrown");
        icon.style.left = `${x}px`;
        icon.style.top = `${y}px`;
        icon.style.transform = "translate(-50%, -50%)";
    }

    icons.forEach((icon) => {
        icon.addEventListener("click", () => throwIcon(icon));
    });
})();



// REPLACE your entire "initProjectsOverlay" function in script.js with this.
// No more ScrollTrigger/Lenis pinning needed -- just open/close plus
// arrow-button-driven horizontal scrolling.

/* ================= PROJECTS OVERLAY: horizontal scroll with arrows ================= */
(function initProjectsOverlay() {
    const overlay = document.getElementById("projects-overlay");
    const openBtn = document.getElementById("view-all-btn");
    const closeBtn = document.getElementById("close-overlay");
    const track = document.querySelector(".proj-section-container");
    const leftArrow = document.querySelector(".proj-arrow-left");
    const rightArrow = document.querySelector(".proj-arrow-right");
    if (!overlay || !openBtn || !closeBtn || !track) return;

    function openOverlay() {
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeOverlay() {
        overlay.classList.remove("active");
        document.body.style.overflow = "";
    }

    function scrollByCard(direction) {
        const card = track.querySelector(".proj-card-section");
        const cardWidth = card ? card.offsetWidth + 40 : 400; // 40 = approx gap
        const target = track.scrollLeft + direction * cardWidth;

        gsap.to(track, {
            scrollLeft: target,
            duration: 0.7,
            ease: "power3.out", // fast start, gentle glide into place
        });
    }


    openBtn.addEventListener("click", openOverlay);
    closeBtn.addEventListener("click", closeOverlay);
    leftArrow?.addEventListener("click", () => scrollByCard(-1));
    rightArrow?.addEventListener("click", () => scrollByCard(1));

    document.addEventListener("keydown", (e) => {
        if (!overlay.classList.contains("active")) return;
        if (e.key === "Escape") closeOverlay();
        if (e.key === "ArrowRight") scrollByCard(1);
        if (e.key === "ArrowLeft") scrollByCard(-1);
    });
})();