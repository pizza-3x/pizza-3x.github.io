  (function(){
            // Lightweight search overlay script — scoped to this page
            const overlay = document.getElementById('site-search-overlay');
            const backdrop = document.getElementById('search-backdrop');
            const input = document.getElementById('site-search-input');
            const results = document.getElementById('site-search-results');
            const closeBtn = document.getElementById('site-search-close');

            // Find all buttons with the given classes (desktop + mobile use same classes)
            const searchButtons = Array.from(document.getElementsByClassName('buttonReset'))
                .filter(btn => btn.classList.contains('Ms6HEJ826qeso4NBVCoW') && btn.classList.contains('pMuUqYFsIC6GCbPomoSK'));

            // Collect game items from the page (.summaryTile)
            function collectGames() {
                const tiles = Array.from(document.querySelectorAll('.summaryTile'));
                return tiles.map(t => {
                    const a = t.closest('a') || t;
                    const href = a.getAttribute('href') || a.dataset.href || '#';
                    const img = a.querySelector('img') ? a.querySelector('img').src : '';
                    const title = (a.querySelector('.global-cq-title') && a.querySelector('.global-cq-title').textContent) || (a.getAttribute('title') || a.getAttribute('aria-label') || a.textContent);
                    return { title: (title||'').trim(), href, img };
                });
            }

            let games = [];
            function ensureGames() {
                // Always refresh the games list when opening to avoid stale/empty arrays
                games = collectGames().map(g => ({ title: (g.title||'').trim(), href: g.href, img: g.img }));
            }

            function openOverlay() {
                ensureGames();
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

            // Re-collect games if DOM changes (in case games are loaded later)
            const observer = new MutationObserver(() => { games = collectGames(); });
            observer.observe(document.body, { childList:true, subtree:true });

        })();