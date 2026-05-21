document.documentElement.classList.add("js");

const header = document.querySelector("#siteHeader");
const menuToggle = document.querySelector(".menu-toggle");
const primaryMenu = document.querySelector("#primaryMenu");
const navLinks = document.querySelectorAll('a[href^="#"]');
const revealSections = document.querySelectorAll(".section-reveal:not(.search-hero-section)");
const scenicRevealSections = document.querySelectorAll(".search-hero-section.section-reveal");
const searchForm = document.querySelector(".search-panel");
const searchResponse = document.querySelector("#searchResponse");
const saveButtons = document.querySelectorAll(".save-button:not(:disabled)");
const hero = document.querySelector(".hero");
const heroVideo = document.querySelector(".hero-video");
const audio = document.querySelector("#ecoSoundscape");
const soundscapeToggle = document.querySelector("#soundscapeToggle");
const chapterLinks = document.querySelectorAll(".chapter-link");
const chapterCurrentNumber = document.querySelector(".chapter-current-number");
const chapterCurrentLabel = document.querySelector(".chapter-current-label");
const categoryChips = document.querySelectorAll(".category-chip");
const loginForm = document.querySelector(".login-form");
const searchControls = document.querySelector(".search-page .listing-search-section");

let isSoundscapePlaying = false;
let fadeTimer;
let chapterTicking = false;

function updateHeaderState() {
  if (!header) {
    return;
  }

  const isScrolled = window.scrollY > 28;
  header.classList.toggle("scrolled", isScrolled);
}

function closeMobileMenu() {
  if (!header || !primaryMenu || !menuToggle) {
    return;
  }

  document.body.classList.remove("menu-open");
  header.classList.remove("menu-active");
  primaryMenu.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
}

function replayHeroReveal() {
  if (!hero) {
    return;
  }

  hero.classList.remove("reveal-active");
  void hero.offsetWidth;
  hero.classList.add("reveal-active");
}

function resetHeroReveal() {
  if (!hero) {
    return;
  }

  hero.classList.remove("reveal-active");
}

function fadeAudio(targetVolume, callback) {
  if (!audio) {
    return;
  }

  clearInterval(fadeTimer);

  fadeTimer = setInterval(() => {
    const difference = targetVolume - audio.volume;
    const step = 0.02;

    if (Math.abs(difference) <= step) {
      audio.volume = targetVolume;
      clearInterval(fadeTimer);

      if (callback) {
        callback();
      }

      return;
    }

    audio.volume = Math.max(0, Math.min(1, audio.volume + (difference > 0 ? step : -step)));
  }, 40);
}

function updateChapterRail() {
  if (!chapterLinks.length) {
    return;
  }

  const chapters = Array.from(chapterLinks)
    .map((link, index) => {
      const target = document.querySelector(link.getAttribute("href"));

      return {
        index,
        link,
        target
      };
    })
    .filter((chapter) => chapter.target);

  if (!chapters.length) {
    return;
  }

  const readingLine = window.innerHeight * 0.46;
  let activeIndex = chapters[0].index;

  chapters.forEach((chapter) => {
    const rect = chapter.target.getBoundingClientRect();

    if (rect.top <= readingLine && rect.bottom >= readingLine) {
      activeIndex = chapter.index;
    } else if (rect.top < readingLine) {
      activeIndex = chapter.index;
    }
  });

  chapterLinks.forEach((link, index) => {
    const isActive = index === activeIndex;
    const isPast = index < activeIndex;

    link.classList.toggle("active", isActive);
    link.classList.toggle("past", isPast);

    if (isActive) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  const activeLink = chapterLinks[activeIndex];

  if (activeLink && chapterCurrentNumber && chapterCurrentLabel) {
    const number = activeLink.querySelector(".chapter-number");

    chapterCurrentNumber.textContent = number ? number.textContent : String(activeIndex + 1).padStart(2, "0");
    chapterCurrentLabel.textContent = activeLink.dataset.label || activeLink.textContent.trim();
  }
}

function scheduleChapterUpdate() {
  if (chapterTicking) {
    return;
  }

  chapterTicking = true;

  window.requestAnimationFrame(() => {
    updateChapterRail();
    chapterTicking = false;
  });
}

function revealHashTarget() {
  if (!window.location.hash) {
    return;
  }

  const target = document.querySelector(window.location.hash);

  if (target && target.classList.contains("search-hero-section")) {
    target.classList.add("is-visible");
  }
}

function revealInitiallyVisibleSections() {
  const sections = [...revealSections, ...scenicRevealSections];

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const isInOpeningViewport = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;

    if (isInOpeningViewport) {
      section.classList.add("is-visible");
    }
  });
}

if (menuToggle && primaryMenu && header) {
  menuToggle.addEventListener("click", () => {
    const isOpen = primaryMenu.classList.toggle("open");
    document.body.classList.toggle("menu-open", isOpen);
    header.classList.toggle("menu-active", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  });

  primaryMenu.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      closeMobileMenu();
    }
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");

    if (!targetId || targetId === "#") {
      return;
    }

    const target = document.querySelector(targetId);

    if (!target) {
      return;
    }

    event.preventDefault();
    closeMobileMenu();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const hasMeaningfullyEntered = entry.boundingClientRect.top < window.innerHeight * 0.82
        && entry.boundingClientRect.bottom > window.innerHeight * 0.12;

      if (entry.isIntersecting && (entry.intersectionRatio > 0.16 || hasMeaningfullyEntered)) {
        entry.target.classList.add("is-visible");
      } else {
        entry.target.classList.remove("is-visible");
      }
    });
  },
  {
    threshold: [0, 0.16, 0.32, 0.6],
    rootMargin: "0px 0px -6% 0px"
  }
);

revealSections.forEach((section) => {
  sectionObserver.observe(section);
});

const scenicSectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const threshold = Number.parseFloat(entry.target.dataset.revealThreshold || "0.44");

      if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
        entry.target.classList.add("is-visible");
      } else {
        entry.target.classList.remove("is-visible");
      }
    });
  },
  {
    threshold: [0, 0.18, 0.32, 0.44, 0.56, 0.72, 1],
    rootMargin: "0px 0px -4% 0px"
  }
);

scenicRevealSections.forEach((section) => {
  scenicSectionObserver.observe(section);
});

if (hero) {
  const heroObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.35) {
          if (heroVideo) {
            heroVideo.play().catch(() => {});
          }

          replayHeroReveal();
        } else {
          if (heroVideo) {
            heroVideo.pause();
          }

          resetHeroReveal();
        }
      });
    },
    {
      threshold: [0, 0.15, 0.35, 0.6, 1]
    }
  );

  heroObserver.observe(hero);
}

saveButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const isActive = button.classList.toggle("active");
    button.setAttribute("aria-pressed", String(isActive));
    button.textContent = String.fromCharCode(isActive ? 9829 : 9825);
  });
});

categoryChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    categoryChips.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-pressed", "false");
    });

    chip.classList.add("active");
    chip.setAttribute("aria-pressed", "true");
  });
});

if (searchControls && soundscapeToggle) {
  const mobileSearchControls = window.matchMedia("(max-width: 768px)");

  const searchControlsObserver = new IntersectionObserver(
    (entries) => {
      const controlsVisible = entries.some((entry) => entry.isIntersecting);
      soundscapeToggle.classList.toggle("is-hidden-on-search", mobileSearchControls.matches && controlsVisible);
    },
    {
      threshold: [0, 0.08, 0.2],
      rootMargin: "0px 0px -12% 0px"
    }
  );

  searchControlsObserver.observe(searchControls);

  mobileSearchControls.addEventListener("change", () => {
    if (!mobileSearchControls.matches) {
      soundscapeToggle.classList.remove("is-hidden-on-search");
    }
  });
}

if (heroVideo) {
  heroVideo.addEventListener(
    "loadedmetadata",
    () => {
      if (Number.isFinite(heroVideo.duration) && heroVideo.duration > 6 && heroVideo.currentTime < 1) {
        heroVideo.currentTime = 3;
      }
    },
    { once: true }
  );
}

if (searchForm) {
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(searchForm);
    const redirectTarget = searchForm.dataset.redirect;

    if (redirectTarget) {
      const params = new URLSearchParams();

      ["destination", "activity", "date", "rating"].forEach((key) => {
        const value = formData.get(key);

        if (value) {
          params.set(key, String(value).toLowerCase().replaceAll(" ", "-").replaceAll(",", ""));
        }
      });

      window.location.href = `${redirectTarget}${params.toString() ? `?${params.toString()}` : ""}`;
      return;
    }

    const destination = formData.get("destination");

    if (searchResponse) {
      searchResponse.textContent = `Eco-Explorer Search is showing verified low-impact experiences near ${destination}.`;
    }

    const featuredSection = document.querySelector("#discover");

    if (featuredSection) {
      featuredSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

if (audio && soundscapeToggle) {
  audio.volume = 0;

  soundscapeToggle.addEventListener("click", async () => {
    if (!isSoundscapePlaying) {
      try {
        audio.volume = 0;
        await audio.play();
        fadeAudio(0.25);
        isSoundscapePlaying = true;
        soundscapeToggle.classList.add("is-playing");
        soundscapeToggle.setAttribute("aria-label", "Pause Eco Soundscape");
      } catch (error) {
        console.warn("Audio play failed or was blocked.", error);
      }
    } else {
      fadeAudio(0, () => {
        audio.pause();
      });
      isSoundscapePlaying = false;
      soundscapeToggle.classList.remove("is-playing");
      soundscapeToggle.setAttribute("aria-label", "Play Eco Soundscape");
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    window.location.href = "index.html#journeys";
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && primaryMenu && primaryMenu.classList.contains("open")) {
    closeMobileMenu();
  }
});

document.addEventListener("click", (event) => {
  if (!primaryMenu || !menuToggle || !primaryMenu.classList.contains("open")) {
    return;
  }

  const clickedMenu = primaryMenu.contains(event.target);
  const clickedToggle = menuToggle.contains(event.target);

  if (!clickedMenu && !clickedToggle) {
    closeMobileMenu();
  }
});

window.addEventListener(
  "scroll",
  () => {
    updateHeaderState();
    scheduleChapterUpdate();
  },
  { passive: true }
);

window.addEventListener(
  "resize",
  () => {
    if (window.innerWidth > 860) {
      closeMobileMenu();
    }

    scheduleChapterUpdate();
  },
  { passive: true }
);

window.addEventListener("load", () => {
  updateHeaderState();
  updateChapterRail();
  revealInitiallyVisibleSections();
  revealHashTarget();

  if (hero && hero.getBoundingClientRect().top < window.innerHeight) {
    replayHeroReveal();
  }
});

updateHeaderState();
updateChapterRail();
revealInitiallyVisibleSections();

if (hero) {
  replayHeroReveal();
}
