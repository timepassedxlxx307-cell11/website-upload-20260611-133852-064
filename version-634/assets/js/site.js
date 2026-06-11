(function () {
    function selectAll(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function initMobileMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function initHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', root);
        var dots = selectAll('[data-hero-dot]', root);
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilter() {
        var input = document.querySelector('[data-page-filter]');
        var list = document.querySelector('[data-filter-list]');
        if (!input || !list) {
            return;
        }
        var items = selectAll('[data-search]', list);
        input.addEventListener('input', function () {
            var query = input.value.trim().toLowerCase();
            items.forEach(function (item) {
                var haystack = item.getAttribute('data-search') || '';
                item.classList.toggle('is-hidden', query && haystack.indexOf(query) === -1);
            });
        });
    }

    function initSearchPage() {
        var searchInput = document.querySelector('[data-search-input]');
        var list = document.querySelector('[data-filter-list]');
        var status = document.querySelector('[data-search-status]');
        if (!searchInput || !list) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        searchInput.value = initial;
        var cards = selectAll('[data-search]', list);

        function apply() {
            var query = searchInput.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = card.getAttribute('data-search') || '';
                var matched = !query || haystack.indexOf(query) !== -1;
                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (status) {
                status.textContent = query ? '已筛选匹配内容' : '全部影片';
            }
        }

        searchInput.addEventListener('input', apply);
        apply();
    }

    function initPlayer() {
        var video = document.querySelector('[data-player]');
        var button = document.querySelector('[data-player-start]');
        if (!video) {
            return;
        }
        var src = video.getAttribute('data-hls-src');
        var shell = video.closest('.player-shell');
        var attached = false;

        function attach() {
            if (attached || !src) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                video._hlsInstance = hls;
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else {
                video.src = src;
            }
            attached = true;
        }

        function play() {
            attach();
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }

        video.addEventListener('play', function () {
            if (shell) {
                shell.classList.add('is-playing');
            }
        });

        video.addEventListener('pause', function () {
            if (shell) {
                shell.classList.remove('is-playing');
            }
        });

        video.addEventListener('click', function () {
            attach();
        });

        attach();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHero();
        initFilter();
        initSearchPage();
        initPlayer();
    });
})();
