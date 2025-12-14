// Open game in-page on mobile using a full-screen overlay iframe (no new tab)
(function () {
    try {
        var playBtn = document.getElementById('play-game-tile');
        if (!playBtn) return;

        var defaultSrc = 'https://23azostore.github.io/s/basketball-legends/';

        function createOverlay(src) {
            // If overlay already exists, don't recreate
            if (document.getElementById('mobile-game-overlay')) return;

            var overlay = document.createElement('div');
            overlay.id = 'mobile-game-overlay';
            overlay.style.position = 'fixed';
            overlay.style.left = '0';
            overlay.style.top = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.background = '#000';
            overlay.style.zIndex = '2147483646';
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';

            // Close button
            var closeBtn = document.createElement('button');
            closeBtn.setAttribute('aria-label', 'Close game');
            closeBtn.innerHTML = '&#x2190;'; // simple back arrow
            closeBtn.style.position = 'absolute';
            closeBtn.style.left = '10px';
            closeBtn.style.top = '10px';
            closeBtn.style.zIndex = '2147483647';
            closeBtn.style.width = '44px';
            closeBtn.style.height = '44px';
            closeBtn.style.border = 'none';
            closeBtn.style.borderRadius = '22px';
            closeBtn.style.background = 'rgba(255,255,255,0.9)';
            closeBtn.style.color = '#002b50';
            closeBtn.style.fontSize = '20px';
            closeBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';

            // rotate hint (shown if orientation lock isn't available)
            var rotateHint = document.createElement('div');
            rotateHint.id = 'mobile-rotate-hint';
            rotateHint.textContent = 'Please rotate your device to landscape to play the game';
            rotateHint.style.position = 'absolute';
            rotateHint.style.left = '50%';
            rotateHint.style.top = '50%';
            rotateHint.style.transform = 'translate(-50%, -50%)';
            rotateHint.style.zIndex = '2147483647';
            rotateHint.style.color = '#fff';
            rotateHint.style.background = 'rgba(0,0,0,0.6)';
            rotateHint.style.padding = '12px 16px';
            rotateHint.style.borderRadius = '8px';
            rotateHint.style.fontSize = '16px';
            rotateHint.style.display = 'none';

            // Iframe container (to allow margins/padding if needed)
            var frameWrap = document.createElement('div');
            frameWrap.style.position = 'absolute';
            frameWrap.style.left = '0';
            frameWrap.style.top = '0';
            frameWrap.style.width = '100%';
            frameWrap.style.height = '100%';
            frameWrap.style.display = 'flex';
            frameWrap.style.alignItems = 'center';
            frameWrap.style.justifyContent = 'center';

            var iframe = document.createElement('iframe');
            iframe.id = 'mobile-game-iframe';
            iframe.src = src;
            iframe.title = 'Game';
            iframe.allow = 'autoplay; fullscreen; camera; microphone; gamepad; gyroscope; accelerometer; clipboard-write; web-share';
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.background = 'transparent';
            iframe.style.maxWidth = '100%';
            iframe.style.maxHeight = '100%';
            iframe.setAttribute('allowfullscreen', '');

            frameWrap.appendChild(iframe);
            overlay.appendChild(frameWrap);
            overlay.appendChild(closeBtn);
            overlay.appendChild(rotateHint);

            // Ensure spinner CSS is present (only once)
            if (!document.getElementById('mobile-game-spinner-style')) {
                var ss = document.createElement('style');
                ss.id = 'mobile-game-spinner-style';
                ss.type = 'text/css';
                ss.appendChild(document.createTextNode('\n                    .mobile-spinner{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;z-index:2147483647;pointer-events:none;}\n                    .mobile-spinner .dot{width:12px;height:12px;border-radius:50%;background:#fff;margin:6px;opacity:.2;transform:translateY(0);animation:mobile-dot 900ms infinite ease-in-out;}\n                    .mobile-spinner .dot:nth-child(2){animation-delay:120ms;}\n                    .mobile-spinner .dot:nth-child(3){animation-delay:240ms;}\n                    @keyframes mobile-dot{0%{opacity:.2;transform:translateY(0);}50%{opacity:1;transform:translateY(-8px);}100%{opacity:.2;transform:translateY(0);}}\n                '));
                document.head.appendChild(ss);
            }

            // Loading spinner (three dots)
            var spinner = document.createElement('div');
            spinner.className = 'mobile-spinner';
            spinner.id = 'mobile-game-spinner';
            spinner.style.display = 'flex';
            var d1 = document.createElement('span'); d1.className = 'dot';
            var d2 = document.createElement('span'); d2.className = 'dot';
            var d3 = document.createElement('span'); d3.className = 'dot';
            spinner.appendChild(d1); spinner.appendChild(d2); spinner.appendChild(d3);
            overlay.appendChild(spinner);

            // Show spinner until iframe 'load' fires
            var spinnerTimeout = null;
            var hideSpinner = function () {
                try { spinner.style.display = 'none'; } catch (e) {}
                try { rotateHint.style.display = 'none'; } catch (e) {}
                if (spinnerTimeout) { clearTimeout(spinnerTimeout); spinnerTimeout = null; }
            };

            iframe.addEventListener('load', function () {
                // Delay slightly to allow rendering
                setTimeout(hideSpinner, 150);
            }, { passive: true });

            // Fallback: if nothing loads after 30s, hide spinner and show hint
            spinnerTimeout = setTimeout(function () {
                try {
                    rotateHint.textContent = 'Having trouble loading? Try again or check your connection.';
                    rotateHint.style.display = 'block';
                } catch (e) {}
                try { spinner.style.display = 'none'; } catch (e) {}
            }, 30000);

            // Append and lock scrolling
            document.body.appendChild(overlay);
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';

            // Helper: try to enter fullscreen and lock orientation
            async function enterFullscreenAndLock() {
                var elem = overlay;
                var fsRequest = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.msRequestFullscreen;
                var exitedFS = false;
                try {
                    if (fsRequest) {
                        await fsRequest.call(elem);
                    }

                    var orientation = (screen && (screen.orientation || screen.mozOrientation || screen.msOrientation));
                    if (orientation && typeof orientation.lock === 'function') {
                        try {
                            await orientation.lock('landscape');
                        } catch (err) {
                            // Lock failed
                            rotateHint.style.display = 'block';
                        }
                    } else if (typeof screen.lockOrientation === 'function' || typeof screen.mozLockOrientation === 'function' || typeof screen.msLockOrientation === 'function') {
                        try {
                            var lockFn = screen.lockOrientation || screen.mozLockOrientation || screen.msLockOrientation;
                            lockFn('landscape');
                        } catch (err) {
                            rotateHint.style.display = 'block';
                        }
                    } else {
                        // Orientation lock not supported
                        rotateHint.style.display = 'block';
                    }
                } catch (err) {
                    // Fullscreen or orientation API not available/denied
                    rotateHint.style.display = 'block';
                }

                // If after a short delay still portrait, show the hint
                setTimeout(function () {
                    try {
                        if (window.innerHeight > window.innerWidth) rotateHint.style.display = 'block';
                    } catch (e) {}
                }, 700);
            }

            // Close handler
            function close() {
                try {
                    // remove iframe src to stop running content
                    var f = document.getElementById('mobile-game-iframe');
                    if (f) f.src = 'about:blank';
                } catch (e) {}
                try {
                    // exit fullscreen if we are in it
                    var exitFS = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
                    if (exitFS) exitFS.call(document);
                } catch (e) {}
                // clear spinner timeout
                try { if (spinnerTimeout) { clearTimeout(spinnerTimeout); spinnerTimeout = null; } } catch (e) {}
                // remove injected style if present
                try { var ss = document.getElementById('mobile-game-spinner-style'); if (ss && ss.parentNode) ss.parentNode.removeChild(ss); } catch (e) {}
                if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
                document.documentElement.style.overflow = '';
                document.body.style.overflow = '';
            }

            closeBtn.addEventListener('click', function () {
                // unlock orientation if possible
                try { if (screen && screen.orientation && typeof screen.orientation.unlock === 'function') screen.orientation.unlock(); } catch (e) {}
                close();
            }, { passive: true });

            // Also close on hardware back (Android) using popstate trick
            var prevHash = location.hash;
            try {
                history.pushState({ pizzaedition1_game: 1 }, '');
                var onPop = function () {
                    try { if (screen && screen.orientation && typeof screen.orientation.unlock === 'function') screen.orientation.unlock(); } catch (e) {}
                    close();
                    window.removeEventListener('popstate', onPop);
                    try { history.replaceState(null, ''); } catch (e) {}
                };
                window.addEventListener('popstate', onPop, { passive: true });
            } catch (e) {
                // ignore history failures
            }

            // Prevent accidental touches from closing overlay by stopping propagation
            overlay.addEventListener('touchmove', function (ev) { ev.stopPropagation(); }, { passive: false });

            // Try to enter fullscreen and lock orientation after appending
            setTimeout(function () { enterFullscreenAndLock(); }, 50);
        }

        playBtn.addEventListener('click', function (e) {
            var desktopIframe = document.getElementById('game-element');
            var src = (desktopIframe && desktopIframe.getAttribute('src')) ? desktopIframe.getAttribute('src') : defaultSrc;

            var isMobile = (window.matchMedia && window.matchMedia('(max-width: 880px)').matches) || document.body.classList.contains('mobileVersion');

            if (isMobile) {
                // Open in-page overlay iframe on mobile (same tab, no new window)
                createOverlay(src);
                return;
            }

            // Desktop behavior: focus desktop iframe
            if (desktopIframe) {
                if (!desktopIframe.getAttribute('src')) desktopIframe.setAttribute('src', src);
                try { desktopIframe.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
                try { desktopIframe.focus(); } catch (e) {}
                return;
            }

            // Fallback: open in current tab
            window.location.href = src;
        }, false);
    } catch (err) {
        console.error('mobile play handler error', err);
    }
})();

// Share button handler: use Web Share API when available, otherwise open social links
(function () {
    try {
        var shareBtn = document.getElementById('share-game');
        if (!shareBtn) return;

        // Create fallback popup (hidden by default)
        var popupId = 'share-popup';
        function createPopup() {
            if (document.getElementById(popupId)) return document.getElementById(popupId);
            var popup = document.createElement('div');
            popup.id = popupId;
            popup.style.position = 'absolute';
            popup.style.background = '#fff';
            popup.style.border = '1px solid #ddd';
            popup.style.padding = '8px';
            popup.style.borderRadius = '8px';
            popup.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
            popup.style.zIndex = '2147483647';
            popup.style.display = 'none';

            var url = encodeURIComponent(window.location.href);
            var title = encodeURIComponent(document.title || '');

            var links = [
                { name: 'Twitter', href: 'https://twitter.com/intent/tweet?url=' + url + '&text=' + title },
                { name: 'Facebook', href: 'https://www.facebook.com/sharer/sharer.php?u=' + url },
                { name: 'WhatsApp', href: 'https://api.whatsapp.com/send?text=' + title + '%20' + url }
            ];

            links.forEach(function (l) {
                var a = document.createElement('a');
                a.href = l.href;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.textContent = l.name;
                a.style.display = 'inline-block';
                a.style.margin = '4px 6px';
                a.style.color = '#0066cc';
                a.style.textDecoration = 'none';
                popup.appendChild(a);
            });

            // Close area
            var close = document.createElement('div');
            close.textContent = 'Close';
            close.style.marginTop = '8px';
            close.style.fontSize = '12px';
            close.style.color = '#666';
            close.style.cursor = 'pointer';
            close.addEventListener('click', function () { popup.style.display = 'none'; }, { passive: true });
            popup.appendChild(close);

            document.body.appendChild(popup);
            return popup;
        }

        function showPopupNear(el) {
            var popup = createPopup();
            // Position popup under button
            var rect = el.getBoundingClientRect();
            popup.style.left = (rect.left + window.scrollX) + 'px';
            popup.style.top = (rect.bottom + window.scrollY + 8) + 'px';
            popup.style.display = 'block';
        }

        shareBtn.addEventListener('click', function (e) {
            var shareData = {
                title: document.title || 'Play game',
                text: document.title || '',
                url: window.location.href
            };

            if (navigator.share && typeof navigator.share === 'function') {
                navigator.share(shareData).catch(function (err) {
                    // If user cancels or share fails, fallback to popup
                    showPopupNear(shareBtn);
                });
                return;
            }

            // Fallback: open small popup with social links near the button
            showPopupNear(shareBtn);
        }, false);

        // Close fallback if user clicks elsewhere
        document.addEventListener('click', function (ev) {
            var popup = document.getElementById(popupId);
            if (!popup) return;
            var target = ev.target;
            if (target === shareBtn || shareBtn.contains(target) || popup.contains(target)) return;
            popup.style.display = 'none';
        }, false);
    } catch (e) {
        // silent
    }
})();
 (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i+"?ref=bwt";
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "ul0oxi77fb");