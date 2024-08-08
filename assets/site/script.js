document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const results = document.getElementById('results');
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const aboutPopup = document.getElementById('about-popup');
    const closeAbout = document.querySelector('.close');
    const mainContent = document.getElementById('main-content');
    const preferencesContent = document.getElementById('preferences-content');
    const preferencesLink = document.getElementById('preferences-link');
    const header = document.querySelector('header');
    const resultPopup = document.getElementById('result-popup');
    const closeResultPopup = resultPopup.querySelector('.close-popup');
    const resetPreferencesButton = document.getElementById('reset-preferences');
    const confirmationPopup = document.getElementById('confirmation-popup');
    const cancelButton = document.getElementById('cancel-button');
    const resetButton = document.getElementById('reset-button');

    const appVersion = "v0.3.0 (dev)";

    document.querySelector('.version').textContent = appVersion;

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
        aboutPopup.classList.add('hidden');
        setTimeout(() => {
            aboutPopup.style.display = 'none';
            aboutPopup.classList.remove('hidden');
            closeMenu();
        }, 300);
    });

    closeResultPopup.addEventListener('click', () => {
        resultPopup.classList.add('hidden');
        setTimeout(() => {
            resultPopup.style.display = 'none';
            resultPopup.classList.remove('hidden');
            closeMenu();
        }, 300);
    });

    document.getElementById('home-link').addEventListener('click', () => {
        showMainContent();
        closeMenu();
    });

    preferencesLink.addEventListener('click', () => {
        showPreferencesContent();
        closeMenu();
    });

    document.getElementById('about-link').addEventListener('click', () => {
        aboutPopup.style.display = 'block';
        closeMenu(true);
    });

    function closeMenu(keepOverlay = false) {
        hamburgerMenu.style.left = '-300px';
        if (!keepOverlay) {
            menuOverlay.classList.toggle('invisible');
            menuOverlay.style.opacity = '0';
            menuOverlay.style.visibility = 'hidden';
        }
    }

    function showMainContent() {
        mainContent.style.display = 'block';
        preferencesContent.style.display = 'none';
        searchInput.style.display = 'inline';
    }

    function showPreferencesContent() {
        mainContent.style.display = 'none';
        preferencesContent.style.display = 'block';
        searchInput.style.display = 'none';
    }

    fetch('assets/data/default_enUS.csv')
        .then(response => response.text())
        .then(data => {
            const produceData = parseCSV(data);
            console.log(`\n%cPlup Core ${appVersion} 🟢`, 'color:#007bff; background:#202020; font-size:1.5rem; padding:0.15rem 0.25rem; margin: .5rem auto; font-family: Arial; border: 2px solid #007bff; border-radius: 4px;font-weight: bold; text-shadow: 1px 1px 1px #00af87bf;');
            console.log("[Plup Core] Produce CSV Data Parsing Success")
            console.log(produceData);
                const query = searchInput.value.toLowerCase();
                const filteredData = produceData.filter(item => {
                    return (item.searchName && item.searchName.toLowerCase().includes(query)) ||
                           (item.plu && item.plu.includes(query)) ||
                           (item.keywords && item.keywords.toLowerCase().includes(query));
                });
                displayResults(filteredData);

            searchInput.addEventListener('input', () => {
                const query = searchInput.value.toLowerCase();
                const filteredData = produceData.filter(item => {
                    return (item.searchName && item.searchName.toLowerCase().includes(query)) ||
                           (item.plu && item.plu.includes(query)) ||
                           (item.keywords && item.keywords.toLowerCase().includes(query));
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
                    <div class="image-container">
                        <img src="${imgPath}" onerror="this.onerror=null; this.src='assets/img/produce/none.jpg'" alt="${item.dispName}">
                    </div>
                    <p><strong>${item.dispName}</strong></p>
                    <p class="plu">PLU ${item.plu} &nbsp;·&nbsp; ${item.class} &nbsp;·&nbsp; ${item.method.replace('/', '')}</p>
                    <p class="description">${item.dispDesc}</p>
                `;
                div.addEventListener('click', () => showResultPopup(item));
                document.getElementById('results').appendChild(div);
            });
        }
    }

    function showResultPopup(item) {
        resultPopup.querySelector('.popup-produce-image').src = `assets/img/produce/${item.plu}.jpg`;
        resultPopup.querySelector('.popup-produce-image').onerror = function() { this.onerror=null; this.src='images/notfound.jpg'; };
        resultPopup.querySelector('.popup-produce-name').textContent = item.dispName;
        resultPopup.querySelector('.popup-produce-plu').textContent = `PLU ${item.plu}`;
        resultPopup.querySelector('.popup-produce-class').textContent = `${item.class} (Per ${item.method.replace('/', '')})`;
        resultPopup.querySelector('.popup-produce-description').textContent = item.dispDesc;
        JsBarcode(".popup-barcode-image", `${item.plu}`, {
            format: "code128",
            lineColor: "#000000",
            width:6.25,
            height:225,
            marginLeft:75,
            marginRight:75,
            displayValue: false
        });

        menuOverlay.style.opacity = '1';
        menuOverlay.style.visibility = 'visible';
        resultPopup.style.display = 'block';
    }
});

// installables //
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('plup-cache').then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/assets/site/styles.css',
                '/assets/site/script.js',
                '/manifest.json',
                '/data/default_enUS.csv'
            ]);
        })
    );

    resetPreferencesButton.addEventListener('click', () => {
        confirmationPopup.style.display = 'block';
        menuOverlay.classList.add('visible');
        menuOverlay.style.opacity = '1';
        menuOverlay.style.visibility = 'visible';
    });
});

function showConfirmationPopup() {
    const confirmationPopup = document.getElementById('confirmation-popup');
    confirmationPopup.style.display = 'block';
}

function closePopup() {
    const confirmationPopup = document.getElementById('confirmation-popup');
    confirmationPopup.style.display = 'none';
}

function resetAppData() {
    // Clear cookies
    document.cookie.split(";").forEach(cookie => {
        document.cookie = cookie.trim().split("=")[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
    });

    // Clear cache
    caches.keys().then(names => {
        for (let name of names) {
            caches.delete(name);
        }
    });

    // Clear localStorage
    localStorage.clear();

    // Clear sessionStorage
    sessionStorage.clear();

    // Reload the page
    location.reload();
}