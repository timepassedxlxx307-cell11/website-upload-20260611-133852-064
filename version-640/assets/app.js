(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var grid = panel.parentElement.querySelector("[data-filter-grid]");
      if (!grid) {
        return;
      }
      var input = panel.querySelector("[data-filter-input]");
      var type = panel.querySelector("[data-type-filter]");
      var year = panel.querySelector("[data-year-filter]");
      var empty = panel.parentElement.querySelector("[data-empty-state]");
      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var typeValue = type ? type.value : "";
        var yearValue = year ? year.value : "";
        var shown = 0;
        cards.forEach(function (card) {
          var text = card.getAttribute("data-search") || "";
          var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchedType = !typeValue || card.getAttribute("data-type") === typeValue;
          var matchedYear = !yearValue || card.getAttribute("data-year") === yearValue;
          var visible = matchedKeyword && matchedType && matchedYear;
          card.style.display = visible ? "" : "none";
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", shown === 0);
        }
      }

      [input, type, year].forEach(function (node) {
        if (node) {
          node.addEventListener("input", apply);
          node.addEventListener("change", apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      if (input && params.get("q")) {
        input.value = params.get("q");
        apply();
      }
    });
  }

  window.startMoviePlayer = function (source) {
    var video = document.getElementById("movie-player");
    var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-play-trigger]"));
    var cover = document.querySelector(".player-cover");
    var hls = null;
    var loaded = false;

    if (!video || !source) {
      return;
    }

    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      attach();
      video.controls = true;
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", play);
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
