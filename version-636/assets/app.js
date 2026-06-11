(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        function startHero() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                startHero();
            });
        });

        showSlide(0);
        startHero();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
        var input = scope.querySelector('[data-filter-input]');
        var yearSelect = scope.querySelector('[data-year-filter]');
        var categorySelect = scope.querySelector('[data-category-filter]');
        var resetButton = scope.querySelector('[data-reset-filter]');
        var section = scope.parentElement || document;
        var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card]'));
        var emptyState = section.querySelector('[data-empty-state]');

        function filterCards() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';
            var category = categorySelect ? categorySelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-category'),
                    card.textContent
                ].join(' ').toLowerCase();
                var matchQuery = !query || haystack.indexOf(query) !== -1;
                var matchYear = !year || card.getAttribute('data-year') === year;
                var matchCategory = !category || card.getAttribute('data-category') === category;
                var matched = matchQuery && matchYear && matchCategory;

                card.style.display = matched ? '' : 'none';

                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', filterCards);
        }

        if (yearSelect) {
            yearSelect.addEventListener('change', filterCards);
        }

        if (categorySelect) {
            categorySelect.addEventListener('change', filterCards);
        }

        if (resetButton) {
            resetButton.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }

                if (yearSelect) {
                    yearSelect.value = '';
                }

                if (categorySelect) {
                    categorySelect.value = '';
                }

                filterCards();
            });
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        filterCards();
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
        var video = player.querySelector('video');
        var overlay = player.querySelector('.play-overlay');
        var stream = player.getAttribute('data-stream');
        var hlsInstance = null;

        function activatePlayer() {
            if (!video || !stream) {
                return;
            }

            if (video.getAttribute('data-ready') !== '1') {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = stream;
                }

                video.setAttribute('data-ready', '1');
            }

            if (overlay) {
                overlay.classList.add('is-hidden');
            }

            var playTask = video.play();

            if (playTask && typeof playTask.catch === 'function') {
                playTask.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', activatePlayer);
        }

        if (video) {
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });

            video.addEventListener('ended', function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                hlsInstance.destroy();
            }
        });
    });
})();
