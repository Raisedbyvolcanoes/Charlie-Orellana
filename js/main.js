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
// Newsletter popup (contact page): appears a few
// seconds after the page loads, and remembers that it
// was shown so it doesn't nag the visitor again.
// ---------------------------------------------------

const newsletterPopup = document.getElementById("newsletter-popup");

if (newsletterPopup) {
  const POPUP_SEEN_KEY = "rbv-newsletter-popup-seen";
  const popupForm = document.getElementById("mc-popup-subscribe-form");

  const dismissPopup = () => {
    newsletterPopup.classList.remove("is-open");
    localStorage.setItem(POPUP_SEEN_KEY, "1");
  };

  if (!localStorage.getItem(POPUP_SEEN_KEY)) {
    setTimeout(() => {
      newsletterPopup.classList.add("is-open");
    }, 4000);
  }

  newsletterPopup.querySelectorAll("[data-popup-dismiss]").forEach((el) => {
    el.addEventListener("click", dismissPopup);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && newsletterPopup.classList.contains("is-open")) {
      dismissPopup();
    }
  });

  if (popupForm) {
    popupForm.addEventListener("submit", () => {
      if (!popupForm.checkValidity()) return;

      localStorage.setItem(POPUP_SEEN_KEY, "1");

      setTimeout(() => {
        newsletterPopup.classList.add("is-subscribed");
      }, 800);
    });
  }
}
