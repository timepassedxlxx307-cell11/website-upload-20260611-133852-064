(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var nextButton = slider.querySelector("[data-hero-next]");
    var prevButton = slider.querySelector("[data-hero-prev]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function restartTimer() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (!slides.length) {
      return;
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        restartTimer();
      });
    });

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        showSlide(current + 1);
        restartTimer();
      });
    }

    if (prevButton) {
      prevButton.addEventListener("click", function () {
        showSlide(current - 1);
        restartTimer();
      });
    }

    showSlide(0);
    restartTimer();
  }

  function setupCardFilters() {
    var filterBlocks = Array.prototype.slice.call(document.querySelectorAll("[data-card-filter]"));

    filterBlocks.forEach(function (filterBlock) {
      var keywordInput = filterBlock.querySelector("[data-filter-keyword]");
      var yearSelect = filterBlock.querySelector("[data-filter-year]");
      var typeSelect = filterBlock.querySelector("[data-filter-type]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

      function applyFilter() {
        var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
        var year = yearSelect ? yearSelect.value : "";
        var type = typeSelect ? typeSelect.value : "";

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre")
          ].join(" ").toLowerCase();

          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesYear = !year || card.getAttribute("data-year") === year;
          var matchesType = !type || card.getAttribute("data-type") === type;

          card.classList.toggle("is-hidden", !(matchesKeyword && matchesYear && matchesType));
        });
      }

      [keywordInput, yearSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });
    });
  }

  function setupPlayer() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var startButton = player.querySelector("[data-player-start]");
      var message = player.querySelector("[data-player-message]");
      var hlsInstance = null;

      function setMessage(text) {
        if (message) {
          message.textContent = text || "";
        }
      }

      function playVideo() {
        if (!video) {
          return;
        }

        var source = video.getAttribute("data-src");

        if (!source) {
          setMessage("当前影片未配置播放源。 ");
          return;
        }

        player.classList.add("is-playing");
        setMessage("正在连接播放源...");

        if (window.Hls && window.Hls.isSupported()) {
          if (hlsInstance) {
            hlsInstance.destroy();
          }

          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);

          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setMessage("");
            video.play().catch(function () {
              setMessage("播放源已就绪，请再次点击视频播放。 ");
            });
          });

          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage("播放源加载失败，请稍后重试或检查网络。 ");
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", function () {
            setMessage("");
            video.play().catch(function () {
              setMessage("播放源已就绪，请再次点击视频播放。 ");
            });
          }, { once: true });
        } else {
          setMessage("当前浏览器需要支持 HLS.js 才能播放该视频源。 ");
        }
      }

      if (startButton) {
        startButton.addEventListener("click", playVideo);
      }
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function createSearchCard(movie) {
    var article = document.createElement("article");
    var title = escapeHtml(movie.title);
    var region = escapeHtml(movie.region);
    var type = escapeHtml(movie.type);
    var genre = escapeHtml(movie.genre);
    var year = escapeHtml(movie.year);
    var oneLine = escapeHtml(movie.oneLine);
    var url = encodeURI(movie.url);
    var cover = encodeURI(movie.cover);

    article.className = "movie-card";
    article.innerHTML = [
      '<a class="movie-poster" href="' + url + '">',
      '  <img src="' + cover + '" alt="' + title + '" loading="lazy">',
      '  <span class="poster-badge">' + year + '</span>',
      '  <span class="poster-play">▶</span>',
      '</a>',
      '<div class="movie-card-body">',
      '  <a class="movie-title" href="' + url + '">' + title + '</a>',
      '  <p class="movie-meta">' + region + ' · ' + type + ' · ' + genre + '</p>',
      '  <p class="movie-desc">' + oneLine + '</p>',
      '</div>'
    ].join("");
    return article;
  }

  function setupSearchPage() {
    var input = document.querySelector("[data-search-input]");
    var button = document.querySelector("[data-search-button]");
    var results = document.querySelector("[data-search-results]");
    var status = document.querySelector("[data-search-status]");

    if (!input || !results) {
      return;
    }

    var movies = [];

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function render(query) {
      var keyword = (query || "").trim().toLowerCase();
      results.innerHTML = "";

      if (!keyword) {
        setStatus("请输入关键词开始搜索。 ");
        return;
      }

      var matched = movies.filter(function (movie) {
        return movie.searchText.indexOf(keyword) !== -1;
      }).slice(0, 80);

      if (!matched.length) {
        setStatus("没有找到匹配影片，请换一个关键词。 ");
        return;
      }

      setStatus("找到 " + matched.length + " 条相关影片，最多显示前 80 条。 ");
      matched.forEach(function (movie) {
        results.appendChild(createSearchCard(movie));
      });
    }

    function applyFromInput() {
      render(input.value);
    }

    fetch("data/movies.json")
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        movies = data;
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";

        if (q) {
          input.value = q;
          render(q);
        }
      })
      .catch(function () {
        setStatus("搜索数据加载失败，请直接通过分类页浏览影片。 ");
      });

    input.addEventListener("input", applyFromInput);

    if (button) {
      button.addEventListener("click", applyFromInput);
    }
  }

  ready(function () {
    setupMobileMenu();
    setupHeroSlider();
    setupCardFilters();
    setupPlayer();
    setupSearchPage();
  });
}());
