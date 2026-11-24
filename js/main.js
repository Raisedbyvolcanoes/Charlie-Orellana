// ---------------------------------------------------
// Contact page: match hero image height to the form
// ---------------------------------------------------

const contactPageImage = document.querySelector(".contact-page .contact-image");
const contactPageFormWrap = document.querySelector(".contact-page .contact-form-wrap");

if (contactPageImage && contactPageFormWrap) {
  const desktopLayoutQuery = window.matchMedia("(min-width: 861px)");

  const matchContactImageHeight = () => {
    contactPageImage.style.height = desktopLayoutQuery.matches
      ? `${contactPageFormWrap.offsetHeight}px`
      : "";
  };

  matchContactImageHeight();
  window.addEventListener("load", matchContactImageHeight);
  window.addEventListener("resize", matchContactImageHeight);
}

// ---------------------------------------------------
// Nav: solid background on scroll + mobile toggle
// ---------------------------------------------------

const nav = document.querySelector(".nav");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

function updateNavState() {
  if (!nav) return;
  nav.classList.toggle("is-scrolled", window.scrollY > 40);
}

if (nav) {
  updateNavState();
  window.addEventListener("scroll", updateNavState, { passive: true });
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("is-open");
    navToggle.classList.toggle("is-open");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      navToggle.classList.remove("is-open");
    });
  });
}

// ---------------------------------------------------
// Hero video: fade in once it has enough data to play
// ---------------------------------------------------

const heroVideo = document.querySelector(".hero-video video");
if (heroVideo) {
  if (heroVideo.readyState >= 2) {
    heroVideo.classList.add("is-ready");
  } else {
    heroVideo.addEventListener("loadeddata", () => {
      heroVideo.classList.add("is-ready");
    });
  }
}

// ---------------------------------------------------
// Photography masonry: additive-only column layout
//
// The 3 columns and their photos are hardcoded in the HTML,
// so existing photos never move. This only handles brand-new
// <div class="photo-grid-item"> elements placed as direct
// children of .photo-grid (i.e. not yet inside a .photo-col) —
// each one is dropped into whichever existing column is
// currently shortest, without touching anything already placed.
// ---------------------------------------------------

const photoGrid = document.querySelector(".photo-grid");

if (photoGrid) {
  const columns = Array.from(photoGrid.querySelectorAll(".photo-col"));
  const newItems = Array.from(photoGrid.children).filter(
    (child) =>
      !child.classList.contains("photo-col") &&
      !child.classList.contains("photo-grid-item--extra")
  );

  if (columns.length && newItems.length) {
    const columnHeight = (col) => {
      let total = 0;
      col.querySelectorAll("img").forEach((img) => {
        total += img.naturalWidth ? img.naturalHeight / img.naturalWidth : 1;
      });
      return total;
    };

    const placeItem = (item) => {
      let shortest = columns[0];
      let shortestHeight = columnHeight(shortest);
      columns.forEach((col) => {
        const h = columnHeight(col);
        if (h < shortestHeight) {
          shortest = col;
          shortestHeight = h;
        }
      });
      shortest.appendChild(item);
    };

    newItems.forEach((item) => {
      const img = item.querySelector("img");
      if (img && !img.complete) {
        img.addEventListener("load", () => placeItem(item), { once: true });
      } else {
        placeItem(item);
      }
    });
  }

  // -------------------------------------------------
  // Mobile: reflow the same 3 columns into 2, balanced
  // by actual image height (via each img's width/height
  // attributes, so this works before images load) rather
  // than a plain alternating split — a plain split can
  // stack more/taller images in one column and leave a
  // gap under the other.
  // -------------------------------------------------

  if (columns.length >= 2) {
    const originalOrder = columns.map((col) => Array.from(col.children));
    const extraPhoto = photoGrid.querySelector(".photo-grid-item--extra");
    const mobileLayoutQuery = window.matchMedia("(max-width: 860px)");
    const mobileTargets = columns.slice(0, 2);

    const applyPhotoGridLayout = () => {
      if (mobileLayoutQuery.matches) {
        const items = originalOrder.flat();
        if (extraPhoto) items.push(extraPhoto);
        const heights = [0, 0];

        items.forEach((item) => {
          const img = item.querySelector("img");
          const ratio = img && img.width ? img.height / img.width : 1;
          const target = heights[0] <= heights[1] ? 0 : 1;
          mobileTargets[target].appendChild(item);
          heights[target] += ratio;
        });

        if (extraPhoto) extraPhoto.style.display = "block";
        columns.forEach((col, i) => col.classList.toggle("is-empty", i >= 2));
      } else {
        columns.forEach((col, i) => {
          originalOrder[i].forEach((item) => col.appendChild(item));
          col.classList.remove("is-empty");
        });
        if (extraPhoto) {
          extraPhoto.style.display = "";
          photoGrid.appendChild(extraPhoto);
        }
      }
    };

    applyPhotoGridLayout();
    mobileLayoutQuery.addEventListener("change", applyPhotoGridLayout);
  }
}

// ---------------------------------------------------
// Photography: click-to-expand lightbox with next/prev
// ---------------------------------------------------

const photoLightbox = document.getElementById("photo-lightbox");
const photoLightboxImg = document.getElementById("photo-lightbox-img");

if (photoGrid && photoLightbox && photoLightboxImg) {
  const photoImgs = Array.from(photoGrid.querySelectorAll(".photo-grid-item img"));
  let currentPhotoIndex = 0;

  const showPhoto = (index) => {
    currentPhotoIndex = (index + photoImgs.length) % photoImgs.length;
    const img = photoImgs[currentPhotoIndex];
    photoLightboxImg.src = img.currentSrc || img.src;
    photoLightboxImg.alt = img.alt;
  };

  const openPhotoLightbox = (index) => {
    showPhoto(index);
    photoLightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
  };

  const closePhotoLightbox = () => {
    photoLightbox.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  photoImgs.forEach((img, index) => {
    img.addEventListener("click", () => openPhotoLightbox(index));
  });

  photoLightbox
    .querySelector(".photo-lightbox-close")
    .addEventListener("click", closePhotoLightbox);
  photoLightbox
    .querySelector(".photo-lightbox-prev")
    .addEventListener("click", () => showPhoto(currentPhotoIndex - 1));
  photoLightbox
    .querySelector(".photo-lightbox-next")
    .addEventListener("click", () => showPhoto(currentPhotoIndex + 1));

  photoLightbox.addEventListener("click", (e) => {
    if (e.target === photoLightbox) closePhotoLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!photoLightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closePhotoLightbox();
    if (e.key === "ArrowRight") showPhoto(currentPhotoIndex + 1);
    if (e.key === "ArrowLeft") showPhoto(currentPhotoIndex - 1);
  });
}

// ---------------------------------------------------
// Portfolio videography: click-to-play lightbox
// ---------------------------------------------------

const videoTiles = document.querySelectorAll(
  ".video-tile[data-id], .video-feature-expand[data-id]"
);
const lightbox = document.getElementById("video-lightbox");

if (videoTiles.length && lightbox) {
  const lightboxIframe = document.getElementById("video-lightbox-iframe");
  const lightboxTitle = document.getElementById("video-lightbox-title");
  const lightboxClose = lightbox.querySelector(".video-lightbox-close");

  const buildSrc = (type, id) => {
    if (type === "youtube") {
      return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&cc_load_policy=0`;
    }
    return `https://player.vimeo.com/video/${id}?autoplay=1`;
  };

  const openLightbox = (type, id, title) => {
    lightboxIframe.src = buildSrc(type, id);
    if (lightboxTitle) lightboxTitle.textContent = title || "";
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightboxIframe.src = "";
    if (lightboxTitle) lightboxTitle.textContent = "";
    document.body.style.overflow = "";
  };

  videoTiles.forEach((tile) => {
    tile.addEventListener("click", () => {
      openLightbox(tile.dataset.type, tile.dataset.id, tile.dataset.title);
    });
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
}

// ---------------------------------------------------
// Sound toggle for embedded videos (YouTube + Vimeo)
// ---------------------------------------------------

const soundButtons = document.querySelectorAll(".sound-toggle");

if (soundButtons.length) {
  const ytPlayers = {};
  const vimeoPlayers = {};
  let ytApiReady = false;
  let ytQueue = [];

  window.onYouTubeIframeAPIReady = () => {
    ytApiReady = true;
    ytQueue.forEach((fn) => fn());
    ytQueue = [];
  };

  const initYouTube = (id) => {
    const create = () => {
      ytPlayers[id] = new YT.Player(id, {});
    };
    if (ytApiReady) create();
    else ytQueue.push(create);
  };

  const initVimeo = (id) => {
    const el = document.getElementById(id);
    if (!el || !window.Vimeo) return;
    vimeoPlayers[id] = new Vimeo.Player(el);
  };

  soundButtons.forEach((btn) => {
    const targetId = btn.dataset.target;
    const type = btn.dataset.type;

    if (type === "youtube") initYouTube(targetId);
    if (type === "vimeo") initVimeo(targetId);

    btn.addEventListener("click", () => {
      const nextMuted = btn.getAttribute("data-muted") !== "true";
      btn.setAttribute("data-muted", String(nextMuted));
      btn.setAttribute("aria-label", nextMuted ? "Unmute video" : "Mute video");

      if (type === "youtube") {
        const player = ytPlayers[targetId];
        if (!player) return;
        if (nextMuted) {
          player.mute();
        } else {
          player.unMute();
          player.setVolume(100);
        }
      } else if (type === "vimeo") {
        const player = vimeoPlayers[targetId];
        if (!player) return;
        player.setMuted(nextMuted);
      }
    });
  });
}

// ---------------------------------------------------
// Gallery scroll-progress indicator
// ---------------------------------------------------

const galleryScroll = document.querySelector(".gallery-scroll");
const galleryProgress = document.querySelector(".gallery-progress");
const galleryProgressBar = document.querySelector(".gallery-progress-bar");

if (galleryScroll && galleryProgress && galleryProgressBar) {
  const updateGalleryProgress = () => {
    const maxScroll = galleryScroll.scrollWidth - galleryScroll.clientWidth;
    const ratio = maxScroll > 0 ? galleryScroll.scrollLeft / maxScroll : 0;
    const thumbRatio = Math.min(1, galleryScroll.clientWidth / galleryScroll.scrollWidth);

    galleryProgressBar.style.width = `${thumbRatio * 100}%`;
    galleryProgressBar.style.transform = `translateX(${ratio * (1 / thumbRatio - 1) * 100}%)`;
  };

  updateGalleryProgress();
  galleryScroll.addEventListener("scroll", updateGalleryProgress, { passive: true });
  window.addEventListener("resize", updateGalleryProgress);

  // Click-to-seek / drag-to-scroll on the progress track, for mouse users
  // who don't intuitively try the arrow keys or a touch swipe.
  const seekToPointer = (clientX) => {
    const rect = galleryProgress.getBoundingClientRect();
    const ratio = rect.width > 0 ? (clientX - rect.left) / rect.width : 0;
    const clampedRatio = Math.min(1, Math.max(0, ratio));
    const maxScroll = galleryScroll.scrollWidth - galleryScroll.clientWidth;
    galleryScroll.scrollLeft = clampedRatio * maxScroll;
  };

  galleryProgress.addEventListener("pointerdown", (e) => {
    galleryProgress.setPointerCapture(e.pointerId);
    galleryProgress.classList.add("is-dragging");
    seekToPointer(e.clientX);
  });

  galleryProgress.addEventListener("pointermove", (e) => {
    if (!galleryProgress.hasPointerCapture(e.pointerId)) return;
    seekToPointer(e.clientX);
  });

  const endGalleryDrag = (e) => {
    if (galleryProgress.hasPointerCapture(e.pointerId)) {
      galleryProgress.releasePointerCapture(e.pointerId);
    }
    galleryProgress.classList.remove("is-dragging");
  };

  galleryProgress.addEventListener("pointerup", endGalleryDrag);
  galleryProgress.addEventListener("pointercancel", endGalleryDrag);
}

// Click-and-drag the photo strip itself with a mouse (touch already swipes)
if (galleryScroll) {
  let dragging = false;
  let moved = false;
  let startX = 0;
  let startScroll = 0;
  let lastX = 0;
  let lastT = 0;
  let velocity = 0;
  let glide;

  galleryScroll.classList.add("is-draggable");

  galleryScroll.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    cancelAnimationFrame(glide);
    dragging = true;
    moved = false;
    startX = lastX = e.clientX;
    lastT = performance.now();
    velocity = 0;
    startScroll = galleryScroll.scrollLeft;
    galleryScroll.setPointerCapture(e.pointerId);
    galleryScroll.classList.add("is-grabbing");
  });

  galleryScroll.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) moved = true;
    galleryScroll.scrollLeft = startScroll - dx;
    const now = performance.now();
    const dt = now - lastT;
    if (dt > 0) velocity = (e.clientX - lastX) / dt;
    lastX = e.clientX;
    lastT = now;
  });

  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    if (galleryScroll.hasPointerCapture(e.pointerId)) {
      galleryScroll.releasePointerCapture(e.pointerId);
    }
    // A little momentum so the strip glides after letting go
    let v = velocity * 16;
    const step = () => {
      if (Math.abs(v) < 0.5) {
        galleryScroll.classList.remove("is-grabbing");
        return;
      }
      galleryScroll.scrollLeft -= v;
      v *= 0.92;
      glide = requestAnimationFrame(step);
    };
    step();
  };

  galleryScroll.addEventListener("pointerup", endDrag);
  galleryScroll.addEventListener("pointercancel", endDrag);

  // Don't treat the end of a drag as a click on a photo
  galleryScroll.addEventListener(
    "click",
    (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    },
    true
  );
}

// ---------------------------------------------------
// Scroll reveal
// ---------------------------------------------------

const revealEls = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && revealEls.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: "0px 0px -10% 0px" }
  );

  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("is-visible"));
}

// ---------------------------------------------------
// Newsletter: submit posts to Mailchimp in a hidden
// iframe (so the page never navigates away), then show
// a thank-you message. Mailchimp's response can't be
// read cross-origin, so this is an optimistic success
// state shown after a short delay.
// ---------------------------------------------------

const newsletterForm = document.getElementById("mc-embedded-subscribe-form");

if (newsletterForm) {
  const newsletterSection = newsletterForm.closest(".newsletter");

  newsletterForm.addEventListener("submit", () => {
    if (!newsletterForm.checkValidity()) return;

    setTimeout(() => {
      newsletterSection.classList.add("is-subscribed");
    }, 800);
  });
}

// ---------------------------------------------------
// Subscribe card: one design used two ways.
// - As a popup for first-time visitors (not on the contact
//   page), shown after they scroll halfway or spend 30s;
//   closing it or subscribing hides it for good.
// - Inline on /subscribe, a page that can be shared as a
//   direct signup link.
// ---------------------------------------------------

const SUBSCRIBE_SEEN_KEY = "rbv-newsletter-popup-seen";
const MC_ACTION =
  "https://raisedbyvolcanoes.us4.list-manage.com/subscribe/post?u=b26f34a80b093fe6d3d959c5a&id=67153aa003&f_id=0040a7e2f0";

const storage = {
  get(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  },
};

function buildSubscribeCard({ closable, headingId }) {
  const card = document.createElement("div");
  card.className = "subscribe-card";
  card.innerHTML = `
    ${closable ? `<button type="button" class="subscribe-close" aria-label="Close">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>` : ""}
    <div class="subscribe-photo">
      <img src="about.jpg" alt="Charlie Orellana with his camera" width="1440" height="1800" />
    </div>
    <svg class="subscribe-curve" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path d="M5,0 C2,25 10,40 40,55 C70,68 85,80 93,100 L100,100 L100,0 Z" fill="#000" />
    </svg>
    <div class="subscribe-content">
      <img class="subscribe-logo" src="Raised%20By%20Volcanoes%20logo_white%20-%20Copy.png" alt="Raised by Volcanoes" width="1530" height="510" />
      <h2 class="subscribe-heading" id="${headingId}">Stay Connected</h2>
      <p class="subscribe-sub">New films, photography and fine art prints, straight to your inbox.</p>
      <form class="subscribe-form" action="${MC_ACTION}" method="post" target="${headingId}-frame">
        <label class="sr-only" for="${headingId}-email">Email address</label>
        <input type="email" name="EMAIL" id="${headingId}-email" placeholder="Your email address" required autocomplete="email" />
        <div class="newsletter-honeypot" aria-hidden="true">
          <input type="text" name="b_b26f34a80b093fe6d3d959c5a_67153aa003" tabindex="-1" value="" />
        </div>
        <button type="submit" class="subscribe-submit">Subscribe</button>
        <p class="subscribe-note">No spam. Unsubscribe anytime.</p>
      </form>
      <p class="subscribe-success" role="status">Thank you, you're on the list.</p>
      <iframe name="${headingId}-frame" class="newsletter-frame" title="Newsletter signup response"></iframe>
    </div>`;

  const form = card.querySelector(".subscribe-form");
  form.addEventListener("submit", () => {
    if (!form.checkValidity()) return;
    storage.set(SUBSCRIBE_SEEN_KEY, "1");
    setTimeout(() => card.classList.add("is-subscribed"), 800);
  });

  return card;
}

// Inline version on the shareable /subscribe page
const subscribePage = document.getElementById("subscribe-page");
if (subscribePage) {
  subscribePage.appendChild(
    buildSubscribeCard({ closable: false, headingId: "subscribe-page-heading" })
  );
}

// Subscribing through the regular footer form also counts
if (newsletterForm) {
  newsletterForm.addEventListener("submit", () => {
    if (newsletterForm.checkValidity()) storage.set(SUBSCRIBE_SEEN_KEY, "1");
  });
}

// ---------------------------------------------------
// Welcome popup, once per visitor (never on the contact page).
//
// POPUP_MODE picks what the popup shows:
//   "prints"     -> The Print Collection (current)
//   "newsletter" -> the newsletter signup card
// Change the word below to switch back at any time.
// ---------------------------------------------------

const POPUP_MODE = "prints";

const SHOP_URL = "https://www.raisedbyvolcanoes.shop";
const PRINTS_SEEN_KEY = "rbv-prints-popup-seen";

function buildPrintsCard({ headingId }) {
  const card = document.createElement("div");
  card.className = "subscribe-card subscribe-card--prints";
  card.innerHTML = `
    <button type="button" class="subscribe-close" aria-label="Close">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>
    <a class="subscribe-photo" href="${SHOP_URL}" aria-label="Explore The Print Collection">
      <img src="print-ancestry-framed.jpg" alt="Ancestry, framed fine art print by Charlie Orellana" width="1400" height="1811" />
    </a>
    <div class="subscribe-content">
      <img class="subscribe-logo" src="Raised%20By%20Volcanoes%20logo_white%20-%20Copy.png" alt="Raised by Volcanoes" width="1530" height="510" />
      <span class="prints-label">Now available</span>
      <h2 class="subscribe-heading" id="${headingId}">The Print Collection</h2>
      <p class="prints-collection">&ldquo;Raised by Volcanoes&rdquo;</p>
      <p class="subscribe-sub">This collection represents the connection to the natural world and the Indigenous practices of the people of Guatemala.</p>
      <a class="subscribe-submit prints-popup-cta" href="${SHOP_URL}">Explore the collection</a>
    </div>`;
  return card;
}

const isContactPage =
  /^\/contact(\.html)?\/?$/.test(location.pathname) ||
  !!document.querySelector(".contact-page");

const popupSeenKey = POPUP_MODE === "prints" ? PRINTS_SEEN_KEY : SUBSCRIBE_SEEN_KEY;

if (!subscribePage && !isContactPage && !storage.get(popupSeenKey)) {
  const popup = document.createElement("div");
  popup.className = "subscribe-popup";
  popup.setAttribute("role", "dialog");
  popup.setAttribute("aria-modal", "true");
  popup.setAttribute("aria-labelledby", "site-popup-heading");

  const backdrop = document.createElement("div");
  backdrop.className = "subscribe-backdrop";
  popup.appendChild(backdrop);

  const card =
    POPUP_MODE === "prints"
      ? buildPrintsCard({ headingId: "site-popup-heading" })
      : buildSubscribeCard({ closable: true, headingId: "site-popup-heading" });
  popup.appendChild(card);
  document.body.appendChild(popup);

  const closePopup = () => {
    popup.classList.remove("is-open");
    document.documentElement.classList.remove("subscribe-lock");
    storage.set(popupSeenKey, "1");
    setTimeout(() => popup.remove(), 400);
  };

  backdrop.addEventListener("click", closePopup);
  card.querySelector(".subscribe-close").addEventListener("click", closePopup);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && popup.classList.contains("is-open")) closePopup();
  });
  // Visiting the shop from the popup counts as "seen"
  card.querySelectorAll(`a[href="${SHOP_URL}"]`).forEach((link) => {
    link.addEventListener("click", () => storage.set(popupSeenKey, "1"));
  });

  // Open only once the visitor has engaged with the work:
  // scrolled about halfway down the page, or spent 30 seconds on it.
  let opened = false;
  let timer;
  const openPopup = () => {
    if (opened) return;
    opened = true;
    clearTimeout(timer);
    window.removeEventListener("scroll", onScroll);
    popup.classList.add("is-open");
    document.documentElement.classList.add("subscribe-lock");
  };
  const onScroll = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable > 0 && window.scrollY / scrollable >= 0.5) openPopup();
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  timer = setTimeout(openPopup, 30000);
}

// ---------------------------------------------------
// Contact forms: submit via Web3Forms (AJAX, no reload)
// ---------------------------------------------------

document.querySelectorAll(".contact-form").forEach((form) => {
  const statusEl = form.querySelector(".form-status");
  const submitBtn = form.querySelector(".contact-submit");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    if (statusEl) {
      statusEl.textContent = "";
      statusEl.className = "form-status";
    }

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Submission failed");
      }

      form.reset();
      if (statusEl) {
        statusEl.textContent =
          "Thanks — your message has been sent. I'll get back to you soon.";
        statusEl.className = "form-status form-status-success";
      }
    } catch (err) {
      if (statusEl) {
        statusEl.textContent =
          "Something went wrong sending your message. Please try again or email directly.";
        statusEl.className = "form-status form-status-error";
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send Inquiry";
    }
  });
});

// ---------------------------------------------------
// Discourage right-click-save / drag-save on photos
// (gallery, portfolio grid, and the photo lightbox)
// ---------------------------------------------------

const protectedImageSelector =
  ".gallery-item img, .photo-grid-item img, .photo-lightbox-img";

document.addEventListener("contextmenu", (e) => {
  if (e.target.closest(protectedImageSelector)) {
    e.preventDefault();
  }
});

document.addEventListener("dragstart", (e) => {
  if (e.target.closest(protectedImageSelector)) {
    e.preventDefault();
  }
});

// Portfolio: filter films by category
const filterButtons = document.querySelectorAll(".video-filter");
const filterableItems = document.querySelectorAll(".video-item[data-category]");

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const filter = btn.dataset.filter;
    filterButtons.forEach((b) => {
      const active = b === btn;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", active ? "true" : "false");
    });
    filterableItems.forEach((item) => {
      const show = filter === "all" || item.dataset.category === filter;
      item.classList.toggle("is-hidden", !show);
    });
  });
});

// Portfolio: open a category straight from a link like /portfolio#music
(function () {
  const target = location.hash.replace("#", "");
  if (!target) return;
  const btn = document.querySelector(`.video-filter[data-filter="${target}"]`);
  if (!btn) return;
  btn.click();
  const section = document.querySelector(".videography");
  if (section) {
    setTimeout(() => {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  }
})();
