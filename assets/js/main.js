/* =====================================
   RADAR//01 — SYSTEM INITIALIZATION
===================================== */

const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
).matches;

const bootScreen = document.querySelector(".boot-screen");
const bootBar = document.querySelector(".boot-progress__bar");
const bootPercent = document.querySelector(".boot-percent");
const bootStatus = document.querySelector(".boot-status");

const radar = document.querySelector(".radar");
const targets = document.querySelectorAll(".target");
const targetRows = document.querySelectorAll(".target-row");
const targetLock = document.querySelector(".target-lock");

const clock = document.querySelector(".topbar__clock");

let activeTarget = 1;

const elements = [
    ".topbar",
    ".sidebar--left",
    ".radar-stage",
    ".sidebar--right",
    ".bottom-bar",
];

gsap.set(elements, {
    opacity: 0,
    y: 25,
});

gsap.set(".radar", {
    scale: 0.75,
    rotation: -30,
    opacity: 0,
});

gsap.set(".ring", {
    scale: 0.5,
    opacity: 0,
});

gsap.set(".target", {
    scale: 0,
    opacity: 0,
});

gsap.set(".radar__center", {
    scale: 0,
    opacity: 0,
});

/* =====================================
   DIGITAL CLOCK
===================================== */

function updateClock() {
    const now = new Date();

    clock.textContent = now.toLocaleTimeString("en-GB", {
        hour12: false,
    });
}

updateClock();

const clockInterval = setInterval(updateClock, 1000);

/* =====================================
   RADAR TARGET SELECTION
===================================== */

function selectTarget(id) {
    activeTarget = id;

    // Update the selected object in the list.
    targetRows.forEach((row) => {
        row.classList.toggle("active", Number(row.dataset.target) === id);
    });

    // Move the tracking frame to the selected radar target.
    const selected = document.querySelector(`.target--${id}`);

    if (!selected) return;

    const x = selected.offsetLeft + selected.offsetWidth / 2;
    const y = selected.offsetTop + selected.offsetHeight / 2;

    const radarRect = radar.getBoundingClientRect();

    gsap.to(targetLock, {
        left: `${(x / radar.clientWidth) * 100}%`,
        top: `${(y / radar.clientHeight) * 100}%`,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: "power3.out",
    });

    targetLock.classList.add("is-locked");

    // Briefly illuminate the selected target.
    gsap.fromTo(
        selected,
        {
            scale: 1,
        },
        {
            scale: 1.8,
            duration: 0.25,
            repeat: 1,
            yoyo: true,
            ease: "power2.inOut",
        },
    );
}

// Allow selection from the detection list.
targetRows.forEach((row) => {
    row.addEventListener("click", () => {
        selectTarget(Number(row.dataset.target));
    });
});

/* =====================================
   RADAR INTERACTION
===================================== */

// Clicking directly on a target selects it.
targets.forEach((target, index) => {
    target.style.cursor = "pointer";

    target.addEventListener("click", (event) => {
        event.stopPropagation();
        selectTarget(index + 1);
    });
});

/* =====================================
   SIGNAL ANIMATION
===================================== */

function animateSignal() {
    const bars = document.querySelectorAll(".signal-bars i");

    bars.forEach((bar) => {
        const randomHeight = gsap.utils.random(25, 100);

        gsap.to(bar, {
            scaleY: randomHeight / 100,
            transformOrigin: "bottom",
            duration: gsap.utils.random(0.2, 0.65),
            ease: "power2.out",
        });
    });
}

/* =====================================
   TARGET STATUS ANIMATION
===================================== */

function animateTargets() {
    targets.forEach((target, index) => {
        gsap.to(target, {
            x: gsap.utils.random(-5, 5),
            y: gsap.utils.random(-5, 5),
            duration: gsap.utils.random(1.5, 3),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: index * 0.2,
        });
    });
}

/* =====================================
   CINEMATIC BOOT SEQUENCE
===================================== */

function startSystem() {
    if (prefersReducedMotion) {
        gsap.set(bootScreen, {
            display: "none",
        });

        startDashboard();
        return;
    }

    const progress = {
        value: 0,
    };

    const bootTimeline = gsap.timeline({
        onComplete: () => {
            bootScreen.classList.add("boot-complete");

            gsap.to(bootScreen, {
                yPercent: -100,
                duration: 1,
                ease: "power4.inOut",
                onComplete: () => {
                    bootScreen.style.display = "none";
                    startDashboard();
                },
            });
        },
    });

    bootTimeline
        .to(progress, {
            value: 100,
            duration: 2.7,
            ease: "power2.inOut",

            onUpdate: () => {
                const value = Math.round(progress.value);

                bootPercent.textContent = `${String(value).padStart(3, "0")}%`;

                gsap.set(bootBar, {
                    width: `${value}%`,
                });

                if (value > 30) {
                    bootStatus.textContent = "CALIBRATING RADAR";
                }

                if (value > 65) {
                    bootStatus.textContent = "ESTABLISHING CONNECTION";
                }

                if (value > 90) {
                    bootStatus.textContent = "SYSTEM ONLINE";
                }
            },
        })
        .to(
            ".boot-logo",
            {
                scale: 1.08,
                duration: 0.4,
                yoyo: true,
                repeat: 1,
            },
            1.5,
        );
}

/* =====================================
   DASHBOARD INTRO
===================================== */

function startDashboard() {
    const intro = gsap.timeline({
        onComplete: () => {
            animateTargets();
            selectTarget(1);

            // Animate signal bars periodically.
            animateSignal();

            setInterval(animateSignal, 700);
        },
    });

    intro
        .to(".topbar", {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
        })
        .to(
            [".sidebar--left", ".sidebar--right"],
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: "power3.out",
            },
            "-=0.5",
        )
        .to(
            ".bottom-bar",
            {
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: "power3.out",
            },
            "-=0.4",
        )

        .to(
            ".radar-stage",
            {
                opacity: 1,
                duration: 0.5,
                ease: "power3.out",
            },
            "-=0.65",
        )

        .to(
            ".radar",
            {
                scale: 1,
                rotation: 0,
                opacity: 1,
                duration: 1.3,
                ease: "back.out(1.4)",
            },
            "-=0.7",
        )
        .to(
            ".ring",
            {
                scale: 1,
                opacity: 1,
                stagger: 0.12,
                duration: 0.8,
                ease: "power3.out",
            },
            "-=0.75",
        )
        .to(
            ".radar__center",
            {
                scale: 1,
                opacity: 1,
                duration: 0.5,
                ease: "back.out(2)",
            },
            "-=0.7",
        )
        .to(
            ".target",
            {
                scale: 1,
                opacity: 1,
                stagger: 0.15,
                duration: 0.6,
                ease: "back.out(2)",
            },
            "-=0.7",
        );
}

/* =====================================
   START
===================================== */

if (!prefersReducedMotion) {
    startSystem();
} else {
    startSystem();
}
