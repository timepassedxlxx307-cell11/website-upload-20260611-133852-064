(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var opened = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      timer = setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function reset() {
      if (timer) {
        clearInterval(timer);
      }
      start();
    }

    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        reset();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        reset();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        reset();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  var input = document.querySelector('[data-filter-input]');
  var categorySelect = document.querySelector('[data-category-select]');
  var yearSelect = document.querySelector('[data-year-select]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-list .movie-card'));
  var empty = document.querySelector('.empty-result');

  if (cards.length) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    if (yearSelect) {
      var years = [];
      cards.forEach(function (card) {
        var year = card.getAttribute('data-year') || '';
        if (year && years.indexOf(year) === -1) {
          years.push(year);
        }
      });
      years.sort().reverse().forEach(function (year) {
        var option = document.createElement('option');
        option.value = year;
        option.textContent = year + '年';
        yearSelect.appendChild(option);
      });
    }

    function filterCards() {
      var text = input ? input.value.trim().toLowerCase() : '';
      var category = categorySelect ? categorySelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var content = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-category') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-genre') || ''
        ].join(' ').toLowerCase();
        var matchText = !text || content.indexOf(text) !== -1;
        var matchCategory = !category || card.getAttribute('data-category') === category;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var show = matchText && matchCategory && matchYear;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', filterCards);
    }

    if (categorySelect) {
      categorySelect.addEventListener('change', filterCards);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', filterCards);
    }

    filterCards();
  }
})();
