  (function(){
            // Lightweight search overlay script — scoped to this page
            const overlay = document.getElementById('site-search-overlay');
            const backdrop = document.getElementById('search-backdrop');
            const input = document.getElementById('site-search-input');
            const results = document.getElementById('site-search-results');
            const closeBtn = document.getElementById('site-search-close');

            // Find all buttons with the given classes (desktop + mobile use same classes)
            const searchButtons = Array.from(document.getElementsByClassName('buttonReset'))
                .filter(btn => btn.classList.contains('nav-search-btn') && btn.classList.contains('nav-search-field'));

            // Collect game items from the page (.summaryTile)
            function collectGames() {
                const tiles = Array.from(document.querySelectorAll('.summaryTile'));
                return tiles.map(t => {
                    const a = t.closest('a') || t;
                    const href = a.getAttribute('href') || a.dataset.href || '#';
                    const img = a.querySelector('img') ? a.querySelector('img').src : '';
                    const title = (a.querySelector('.game-title-global') && a.querySelector('.game-title-global').textContent) || (a.getAttribute('title') || a.getAttribute('aria-label') || a.textContent);
                    return { title: (title||'').trim(), href, img };
                });
            }

            // Primary games array used by the search. This will come from external JSON if available,
            // otherwise we fall back to scanning `.summaryTile` elements in the page.
            let games = [];
            let externalTried = false;
            let externalLoaded = false;

            // Try to fetch external games list from /data/games.json
            async function fetchExternalGames() {
                if (externalTried) return false;
                externalTried = true;
                try {
                    const res = await fetch('/data/games.json', { cache: 'no-cache' });
                    if (!res.ok) return false;
                    const data = await res.json();
                    if (!Array.isArray(data)) return false;
                    games = data.map(g => ({ title: (g.title||'').trim(), href: g.href || '#', img: g.img || '' }));
                    externalLoaded = true;
                    return true;
                } catch (err) {
                    return false;
                }
            }

            async function ensureGames() {
                // Always try external source first to support site-wide search.
                games = [];
                const ok = await fetchExternalGames();
                if (!ok) {
                    // fallback to DOM-collected games
                    games = collectGames().map(g => ({ title: (g.title||'').trim(), href: g.href, img: g.img }));
                }
            }

            async function openOverlay() {
                await ensureGames();
                overlay.style.display = '';
                overlay.setAttribute('aria-hidden', 'false');
                input.value = '';
                input.focus();
                renderResults(games);
                document.documentElement.style.overflow = 'hidden';
            }

            function closeOverlay() {
                overlay.style.display = 'none';
                overlay.setAttribute('aria-hidden', 'true');
                document.documentElement.style.overflow = '';
                // return focus to first search button
                if (searchButtons[0]) searchButtons[0].focus();
            }

            function renderResults(list) {
                results.innerHTML = '';
                if (!list.length) { results.innerHTML = '<div style="padding:16px;color:#6b7785">No games found</div>'; return; }
                const frag = document.createDocumentFragment();
                list.forEach(g => {
                    const a = document.createElement('a');
                    a.className = 'result-tile';
                    a.href = g.href;
                    a.setAttribute('role','link');
                    a.innerHTML = `
                        <img loading="lazy" decoding="async" class="result-thumb" src="${g.img||''}" alt="${escapeHtml(g.title)}">
                        <div class="result-title">${escapeHtml(g.title)}</div>
                    `;
                    frag.appendChild(a);
                });
                results.appendChild(frag);
            }

            function onSearchInput(e) {
                const q = (e.target.value || '').trim().toLowerCase();
                const filtered = q ? games.filter(g => (g.title||'').toLowerCase().includes(q)) : games;
                renderResults(filtered);
            }

            function escapeHtml(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]; }); }

            // Attach events
            searchButtons.forEach(btn => btn.addEventListener('click', function(e){ e.preventDefault(); openOverlay(); }));
            backdrop.addEventListener('click', closeOverlay);
            closeBtn.addEventListener('click', closeOverlay);
            // Listen to multiple events to support various browsers and the native clear button
            input.addEventListener('input', onSearchInput);
            input.addEventListener('keyup', onSearchInput);
            input.addEventListener('search', onSearchInput);
            // keyboard + escape
            document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && overlay.style.display !== 'none') closeOverlay(); });

            // Re-collect games if DOM changes (in case games are loaded later).
            // If external data successfully loaded, we avoid overwriting it.
            const observer = new MutationObserver(() => { if (!externalLoaded) games = collectGames(); });
            observer.observe(document.body, { childList:true, subtree:true });

        })();