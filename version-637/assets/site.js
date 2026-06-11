(function () {
    'use strict';

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
            return;
        }
        callback();
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-mobile-menu-button]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupHeroSlider() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function show(index) {
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
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var next = parseInt(dot.getAttribute('data-hero-dot'), 10) || 0;
                show(next);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupCardFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var root = panel.closest('.section') || document;
            var input = panel.querySelector('[data-card-filter]');
            var selects = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-select]'));
            var count = panel.querySelector('[data-result-count]');
            var emptyState = root.querySelector('[data-empty-state]');
            var cards = Array.prototype.slice.call(root.querySelectorAll('[data-movie-card]'));

            if (!cards.length) {
                return;
            }

            function apply() {
                var query = normalize(input ? input.value : '');
                var activeFilters = {};
                selects.forEach(function (select) {
                    activeFilters[select.getAttribute('data-filter-select')] = normalize(select.value);
                });

                var visible = 0;
                cards.forEach(function (card) {
                    var searchText = normalize(card.getAttribute('data-search'));
                    var matchesQuery = !query || searchText.indexOf(query) !== -1;
                    var matchesSelects = Object.keys(activeFilters).every(function (key) {
                        var value = activeFilters[key];
                        if (!value) {
                            return true;
                        }
                        return normalize(card.getAttribute('data-' + key)) === value;
                    });
                    var shouldShow = matchesQuery && matchesSelects;
                    card.classList.toggle('is-hidden', !shouldShow);
                    if (shouldShow) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = visible + ' 部作品';
                }
                if (emptyState) {
                    emptyState.hidden = visible !== 0;
                }
            }

            if (input) {
                input.addEventListener('input', apply);
                var params = new URLSearchParams(window.location.search);
                var initialQuery = params.get('q');
                if (initialQuery) {
                    input.value = initialQuery;
                }
            }
            selects.forEach(function (select) {
                select.addEventListener('change', apply);
            });
            apply();
        });
    }

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var existing = document.querySelector('script[data-hls-loader]');
        if (existing) {
            existing.addEventListener('load', callback, { once: true });
            return;
        }
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
        script.async = true;
        script.setAttribute('data-hls-loader', 'true');
        script.addEventListener('load', callback, { once: true });
        document.head.appendChild(script);
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.static-player'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('[data-play-button]');
            var message = player.querySelector('[data-player-message]');
            var source = player.getAttribute('data-video-url');
            var hlsInstance = null;

            if (!video || !button || !source) {
                return;
            }

            function setMessage(text) {
                if (message) {
                    message.textContent = text || '';
                }
            }

            function play() {
                setMessage('正在加载播放源...');

                loadHls(function () {
                    if (window.Hls && window.Hls.isSupported()) {
                        if (hlsInstance) {
                            hlsInstance.destroy();
                        }
                        hlsInstance = new window.Hls({ enableWorker: true });
                        hlsInstance.loadSource(source);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            player.classList.add('is-playing');
                            video.play().catch(function () {
                                setMessage('浏览器阻止自动播放，请再次点击播放器。');
                            });
                        });
                        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
                            if (data && data.fatal) {
                                setMessage('播放源加载失败，请稍后重试。');
                            }
                        });
                        return;
                    }

                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = source;
                        player.classList.add('is-playing');
                        video.play().catch(function () {
                            setMessage('浏览器阻止自动播放，请再次点击播放器。');
                        });
                        return;
                    }

                    setMessage('当前浏览器不支持 HLS 播放。');
                });
            }

            button.addEventListener('click', play);
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
                setMessage('');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    player.classList.remove('is-playing');
                }
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHeroSlider();
        setupCardFilters();
        setupPlayers();
    });
})();
