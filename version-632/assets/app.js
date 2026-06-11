(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var menu = document.getElementById("navMenu");
  if (menuButton && menu) {
    menuButton.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === current);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(parseInt(dot.getAttribute("data-hero-dot"), 10));
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  document.querySelectorAll("[data-filter-root]").forEach(function (panel) {
    var scope = panel.parentElement || document;
    var textInput = panel.querySelector("[data-filter-text]");
    var regionSelect = panel.querySelector("[data-filter-region]");
    var yearSelect = panel.querySelector("[data-filter-year]");
    var categorySelect = panel.querySelector("[data-filter-category]");
    var clearButton = panel.querySelector("[data-clear-filters]");
    var empty = panel.querySelector("[data-empty-state]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card[data-search]"));

    function fillSelect(select, attribute) {
      if (!select) {
        return;
      }
      var values = [];
      cards.forEach(function (card) {
        var value = card.getAttribute(attribute);
        if (value && values.indexOf(value) === -1) {
          values.push(value);
        }
      });
      values.sort(function (a, b) {
        return String(b).localeCompare(String(a), "zh-Hans-CN");
      });
      values.forEach(function (value) {
        var option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    function update() {
      var text = textInput ? textInput.value.trim().toLowerCase() : "";
      var region = regionSelect ? regionSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      var category = categorySelect ? categorySelect.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var search = (card.getAttribute("data-search") || "").toLowerCase();
        var matched = true;
        if (text && search.indexOf(text) === -1) {
          matched = false;
        }
        if (region && card.getAttribute("data-region") !== region) {
          matched = false;
        }
        if (year && card.getAttribute("data-year") !== year) {
          matched = false;
        }
        if (category && card.getAttribute("data-category") !== category) {
          matched = false;
        }
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    fillSelect(regionSelect, "data-region");
    fillSelect(yearSelect, "data-year");

    [textInput, regionSelect, yearSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", update);
        control.addEventListener("change", update);
      }
    });

    if (clearButton) {
      clearButton.addEventListener("click", function () {
        if (textInput) {
          textInput.value = "";
        }
        if (regionSelect) {
          regionSelect.value = "";
        }
        if (yearSelect) {
          yearSelect.value = "";
        }
        if (categorySelect) {
          categorySelect.value = "";
        }
        update();
      });
    }
  });
})();

function initPlayer(streamUrl) {
  var video = document.getElementById("movieVideo");
  var button = document.getElementById("moviePlayButton");
  if (!video || !button || !streamUrl) {
    return;
  }

  var loaded = false;
  var player = null;

  function attach() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      player = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      player.loadSource(streamUrl);
      player.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function start() {
    attach();
    button.classList.add("is-hidden");
    var playResult = video.play();
    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(function () {
        button.classList.remove("is-hidden");
      });
    }
  }

  button.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (!loaded || video.paused) {
      start();
    }
  });
  video.addEventListener("play", function () {
    button.classList.add("is-hidden");
  });
  video.addEventListener("pause", function () {
    if (video.currentTime === 0 || video.ended) {
      button.classList.remove("is-hidden");
    }
  });
  window.addEventListener("beforeunload", function () {
    if (player) {
      player.destroy();
    }
  });
}
