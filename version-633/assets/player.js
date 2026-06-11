(function () {
  function attachPlayer(frame) {
    var video = frame.querySelector('video');
    var button = frame.querySelector('[data-play]');
    var stream = frame.getAttribute('data-stream');
    var hls = null;

    if (!video || !button || !stream) {
      return;
    }

    function ensureMedia() {
      if (video.getAttribute('src') || hls) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        return;
      }

      video.src = stream;
    }

    function start() {
      ensureMedia();
      frame.classList.add('is-playing');
      frame.classList.add('is-loading');
      video.setAttribute('controls', 'controls');

      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          frame.classList.remove('is-loading');
        });
      }
    }

    button.addEventListener('click', start);

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('playing', function () {
      frame.classList.remove('is-loading');
    });

    video.addEventListener('loadedmetadata', function () {
      frame.classList.remove('is-loading');
    });

    video.addEventListener('error', function () {
      frame.classList.remove('is-loading');
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.querySelectorAll('.player-frame').forEach(attachPlayer);
})();
