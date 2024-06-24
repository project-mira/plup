document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const results = document.getElementById('results');
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const aboutPopup = document.getElementById('about-popup');
    const closeAbout = document.querySelector('.close');

    hamburgerIcon.addEventListener('click', () => {
        hamburgerMenu.style.left = '0';
        menuOverlay.style.opacity = '1';
        menuOverlay.style.visibility = 'visible';
        hamburgerIcon.classList.toggle('open');
        hamburgerMenu.classList.toggle('open');
        menuOverlay.classList.toggle('visible');
    });

    menuOverlay.addEventListener('click', () => {
        closeMenu();
    });

    closeAbout.addEventListener('click', () => {
        aboutPopup.style.display = 'none';
        closeMenu();
    });

    document.getElementById('home-link').addEventListener('click', () => {
        closeMenu();
    });

    document.getElementById('preferences-link').addEventListener('click', () => {
        alert('Not implemented');
    });

    document.getElementById('licenses-link').addEventListener('click', () => {
        alert('Not implemented\n\nConsult docs for more information');
    });

    document.getElementById('about-link').addEventListener('click', () => {
        aboutPopup.style.display = 'block';
        closeMenu(true);
    });

    function closeMenu(keepOverlay = false) {
        hamburgerMenu.style.left = '-250px';
        if (!keepOverlay) {
            menuOverlay.style.opacity = '0';
            menuOverlay.style.visibility = 'hidden';
        }
    }

    fetch('assets/data/en_US.csv')
        .then(response => response.text())
        .then(data => {
            const produceData = parseCSV(data);
            console.log(produceData); // Check parsed data in the console

            searchInput.addEventListener('input', () => {
                const query = searchInput.value.toLowerCase();
                const filteredData = produceData.filter(item => {
                    return (item.searchName && item.searchName.toLowerCase().includes(query)) ||
                           (item.plu && item.plu.includes(query));
                });
                displayResults(filteredData);
            });
        })
        .catch(error => console.error('Error loading data:', error));

    function parseCSV(data) {
        const lines = data.split('\n');
        const headers = lines[0].split(',').map(header => header.trim());
        return lines.slice(1).map(line => {
            const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g).map(value => value.replace(/(^"|"$)/g, '').trim());
            const item = {};
            headers.forEach((header, index) => {
                item[header] = values[index];
            });
            return item;
        });
    }

    function displayResults(items) {
        results.innerHTML = '';
        if (items.length === 0) {
            results.innerHTML = '<p>No results found.</p>';
        } else {
            items.forEach(item => {
                const div = document.createElement('div');
                div.classList.add('result-item');
                const imgPath = `assets/img/produce/${item.plu}.jpg`;
                div.innerHTML = `
                    <img src="${imgPath}" onerror="this.onerror=null; this.src='images/notfound.jpg'" alt="${item.dispName}">
                    <p><strong>${item.dispName}</strong> - PLU: ${item.plu}</p>
                    <p class="description">${item.dispDesc}</p>
                `;
                results.appendChild(div);
            });
        }
    }
});


// pwa stuff //
// do not interfere //
// ugh //
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('plup-cache').then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/assets/site/styles.css',
                '/assets/site/script.js',
                '/assets/data/en_US.csv',
                // Add other assets that should be cached
            ]);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        }, err => {
            console.log('Service Worker registration failed:', err);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Your existing DOMContentLoaded code here...
});