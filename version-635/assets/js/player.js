function initMoviePlayer(source) {
  var shell = document.querySelector('.player-shell');
  var video = document.querySelector('.movie-video');
  var cover = document.querySelector('.player-cover');
  var hlsInstance = null;
  var loaded = false;

  if (!shell || !video || !cover || !source) {
    return;
  }

  function load() {
    if (loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function play() {
    load();
    shell.classList.add('playing');
    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        shell.classList.remove('playing');
      });
    }
  }

  cover.addEventListener('click', play);

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('play', function () {
    shell.classList.add('playing');
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
