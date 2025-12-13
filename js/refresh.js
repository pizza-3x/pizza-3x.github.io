(function () {
    var fsBtn = document.getElementById('enter-fullscreen');
    var exitBtn = document.getElementById('fullscreen-exit');
    var gamePlayer = document.getElementById('game-player');
    var gameIframe = document.getElementById('game-element');

    if (!fsBtn || !gamePlayer) return;

    function isFull() {
        return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
    }

    function updateButton() {
        if (isFull()) {
            fsBtn.title = 'Exit fullscreen (Esc)';
            fsBtn.setAttribute('aria-label', 'Exit fullscreen');
            // change icon to close if desired
            fsBtn.querySelector('use').setAttribute('xlink:href', '#closeFullscreenIcon');
        } else {
            fsBtn.title = 'Enter fullscreen (F)';
            fsBtn.setAttribute('aria-label', 'Enter fullscreen');
            fsBtn.querySelector('use').setAttribute('xlink:href', '#enterFullscreenIcon');
        }
    }

    function requestFS() {
        var el = gamePlayer;
        if (el.requestFullscreen) return el.requestFullscreen();
        if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
        if (el.mozRequestFullScreen) return el.mozRequestFullScreen();
        if (el.msRequestFullscreen) return el.msRequestFullscreen();
    }

    function exitFS() {
        if (document.exitFullscreen) return document.exitFullscreen();
        if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
        if (document.mozCancelFullScreen) return document.mozCancelFullScreen();
        if (document.msExitFullscreen) return document.msExitFullscreen();
    }

    fsBtn.addEventListener('click', function (e) {
        if (isFull()) exitFS(); else requestFS();
    });

    exitBtn && exitBtn.addEventListener('click', function () { exitFS(); });

    document.addEventListener('keydown', function (e) {
        // key 'f' or 'F' to toggle fullscreen, Escape to exit
        if (e.key === 'f' || e.key === 'F') {
            // avoid triggering when typing in inputs
            var tag = document.activeElement && document.activeElement.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement && document.activeElement.isContentEditable) return;
            e.preventDefault();
            if (isFull()) exitFS(); else requestFS();
        }
        if (e.key === 'Escape') {
            if (isFull()) exitFS();
        }
    });

    // Listen for fullscreen change to update UI
    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(function (evt) {
        document.addEventListener(evt, function () { updateButton(); });
    });

    // --- Refresh and Jump-to-Controls handlers ---
    var refreshBtn = document.getElementById('refresh-game');
    var jumpBtn = document.getElementById('jump-to-controls');

    if (refreshBtn && gameIframe) {
        refreshBtn.addEventListener('click', function () {
            try {
                refreshBtn.disabled = true;
                var src = gameIframe.getAttribute('src');
                // Force reload by resetting src (preserve scroll position)
                gameIframe.setAttribute('src', '');
                // small timeout to allow blanking then restore
                setTimeout(function () { gameIframe.setAttribute('src', src); refreshBtn.disabled = false; }, 50);
            } catch (err) {
                console.error('Refresh failed', err);
                refreshBtn.disabled = false;
            }
        });
    }

    if (jumpBtn) {
        jumpBtn.addEventListener('click', function () {
            var target = document.getElementById('controls');
            if (!target) return;
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    // Keyboard shortcut: 'r' to refresh iframe (when not typing)
    document.addEventListener('keydown', function (e) {
        var tag = document.activeElement && document.activeElement.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement && document.activeElement.isContentEditable) return;
        if (e.key === 'r' || e.key === 'R') {
            if (refreshBtn) {
                e.preventDefault();
                refreshBtn.click();
            }
        }
    });

    // Initial state
    updateButton();
})();