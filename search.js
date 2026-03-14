
let allGames = [];
function getGameSlug(url) {
  // Extracts the filename without extension from the URL
  let parts = url.split('/');
  let file = parts[parts.length - 1];
  return file.replace('/', '');
}
async function fetchGames() {
  try {
    const res = await fetch('/games.json');
    const data = await res.json();
    allGames = data.map(g => {
      const url = g.url.startsWith('/') ? g.url : ('/' + g.url);
      const slug = getGameSlug(url);
      return {
        title: g.title || g.name,
        url: url,
        img: `/img/${slug}.webp`
      };
    });
  } catch (e) { allGames = []; }
}
function renderSearchResults(filter) {
  const results = document.getElementById('searchResults');
  results.innerHTML = '';
  const filtered = allGames.filter(g => g.title && g.title.toLowerCase().includes(filter.toLowerCase()));
  if(filtered.length === 0) {
    results.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:#888;font-size:1.2em;">No games found.</div>';
    return;
  }
  filtered.forEach(g => {
    const el = document.createElement('a');
    el.href = g.url;
    el.style = 'display:flex;align-items:center;gap:16px;padding:14px 12px;border-radius:12px;text-decoration:none;background:#f8f8f8;color:#222;transition:background 0.2s;box-shadow:0 1px 4px rgba(0,0,0,0.04)';
    el.onmouseover = () => el.style.background = '#e6f7fa';
    el.onmouseout = () => el.style.background = '#f8f8f8';
    el.innerHTML = `<img src="${g.img}" alt="${g.title}" style="width:54px;height:54px;border-radius:10px;object-fit:cover;box-shadow:0 1px 4px rgba(0,0,0,0.08)"> <div><div style="font-weight:600;font-size:1.1em;">${g.title}</div><div style="font-size:0.98em;color:#888;">${g.url.replace('/g/','').replace('/','').replace(/-/g,' ').replace('/','')}</div></div>`;
    results.appendChild(el);
  });
}
document.getElementById('searchIcon').onclick = async function() {
  document.getElementById('searchModal').style.display = 'flex';
  document.getElementById('searchInput').focus();
  if(allGames.length === 0) await fetchGames();
  renderSearchResults('');
};
document.getElementById('closeSearchModal').onclick = function() {
  document.getElementById('searchModal').style.display = 'none';
};
document.getElementById('searchInput').oninput = function(e) {
  renderSearchResults(e.target.value);
};
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape') document.getElementById('searchModal').style.display = 'none';
});


// Improved toggler: only closes if open, lets Bootstrap handle open
            document.addEventListener('DOMContentLoaded', function () {
                var navCollapse = document.getElementById('nav-menu');
                var toggler = document.querySelector('.navbar-toggler');
                if (toggler && navCollapse) {
                    toggler.addEventListener('click', function(e) {
                        setTimeout(function() {
                            // If menu is open after Bootstrap's toggle, close it (so toggler always closes if open)
                            if (window.innerWidth < 992 && navCollapse.classList.contains('show')) {
                                var collapse = bootstrap.Collapse.getInstance(navCollapse);
                                if (collapse) collapse.hide();
                            }
                        }, 200); // Wait for Bootstrap's toggle
                    });
                }
                // Click outside: close menu
                document.addEventListener('click', function(e) {
                    if (window.innerWidth < 992 && navCollapse && navCollapse.classList.contains('show')) {
                        var isClickInside = navCollapse.contains(e.target) || (toggler && toggler.contains(e.target));
                        if (!isClickInside) {
                            var collapse = bootstrap.Collapse.getInstance(navCollapse);
                            if (collapse) collapse.hide();
                        }
                    }
                });
            });