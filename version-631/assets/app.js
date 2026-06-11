(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function initNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener("click", function () {
      links.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dots button"));
    var next = root.querySelector(".hero-next");
    var prev = root.querySelector(".hero-prev");
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }

    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initFilters() {
    var search = document.querySelector("[data-movie-search]");
    var year = document.querySelector("[data-year-filter]");
    var category = document.querySelector("[data-category-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".js-card"));
    var empty = document.querySelector("[data-empty-state]");
    if (!cards.length) {
      return;
    }

    function text(card) {
      return [
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-category"),
        card.getAttribute("data-tags"),
        card.getAttribute("data-region"),
        card.textContent
      ].join(" ").toLowerCase();
    }

    function apply() {
      var query = search ? search.value.trim().toLowerCase() : "";
      var yearValue = year ? year.value : "";
      var categoryValue = category ? category.value : "";
      var shown = 0;

      cards.forEach(function (card) {
        var okQuery = !query || text(card).indexOf(query) !== -1;
        var okYear = !yearValue || card.getAttribute("data-year") === yearValue;
        var okCategory = !categoryValue || card.getAttribute("data-category") === categoryValue;
        var visible = okQuery && okYear && okCategory;
        card.style.display = visible ? "" : "none";
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", shown === 0);
      }
    }

    [search, year, category].forEach(function (node) {
      if (node) {
        node.addEventListener("input", apply);
        node.addEventListener("change", apply);
      }
    });
  }

  window.initMoviePlayer = function (mediaUrl) {
    var video = document.getElementById("movie-player");
    var cover = document.getElementById("play-cover");
    if (!video || !mediaUrl) {
      return;
    }
    var hls = null;
    var attached = false;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = mediaUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(mediaUrl);
        hls.attachMedia(video);
      } else {
        video.src = mediaUrl;
      }
    }

    function start() {
      attach();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
  });
})();
