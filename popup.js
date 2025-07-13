async function checkRulesetStatus() {
    const result = await chrome.declarativeNetRequest.getEnabledRulesets();
    document.getElementById('urlRewriteEnabled').checked = result.includes('ruleset_1');
}
checkRulesetStatus();
console.log(`chrome://extensions/?id=${chrome.runtime.id}`);
// document.getElementById('disableTxt').textContent = `chrome://extensions/?id=${chrome.runtime.id}`;

document.getElementById('copyLink').addEventListener('click', () => {
    navigator.clipboard.writeText(`chrome://extensions/?id=${chrome.runtime.id}`).then(() => {
        showToast('Link copied! Paste this URL in the address bar to disable this extension.');
    }).catch(err => {
        console.error('Kopiëren mislukt: ', err);
    });
});

// document.getElementById('copyLink').addEventListener('click', () => {
//     navigator.clipboard.writeText(`chrome://extensions/?id=${chrome.runtime.id}`).then(() => {
//         showToast('Link gekopieerd! Plak dit in je adresbalk.');
//     }).catch(err => {
//         console.error('Kopiëren mislukt: ', err);
//     });
// });

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

document.getElementById('urlRewriteEnabled').addEventListener('change', async function () {
    const urlRewriteEnabled = document.getElementById('urlRewriteEnabled').checked;
    try {
        await chrome.declarativeNetRequest.updateEnabledRulesets({
            enableRulesetIds: urlRewriteEnabled ? ['ruleset_1'] : [],
            disableRulesetIds: urlRewriteEnabled ? [] : ['ruleset_1']
        });
        console.log(`ruleset_1 is now ${urlRewriteEnabled ? 'ENABLED' : 'DISABLED'}`);
        // await clearAliExpressCookies();
        await clearAliExpressData();
        // chrome.runtime.reload()
        reloadAliExpressTabs();
    } catch (err) {
        console.error('Failed to toggle ruleset_1:', err);
    }
});

async function clearAliExpressData() {
    const aliExpressOrigins = [
        "https://www.aliexpress.com",
        "https://nl.aliexpress.com",
        "https://pt.aliexpress.com",
        "https://es.aliexpress.com",
        "https://fr.aliexpress.com",
        "https://it.aliexpress.com",
        "https://de.aliexpress.com",
        "https://pl.aliexpress.com"
    ];

    if (chrome.browsingData && chrome.browsingData.remove) {
        chrome.browsingData.remove({
            origins: aliExpressOrigins
        }, {
            cookies: true,
            cache: true,
            localStorage: true
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('Error clearing browsing data:', chrome.runtime.lastError);
            } else {
                console.log('AliExpress data cleared.');
            }
        });
    } else {
        console.error('chrome.browsingData API is not available in this context.');
    }
}

async function clearAliExpressCookies() {
    const domains = ['aliexpress.com', '.aliexpress.com'];

    for (const domain of domains) {
        chrome.cookies.getAll({ domain }, function (cookies) {
            for (let cookie of cookies) {
                const url = `http${cookie.secure ? 's' : ''}://${cookie.domain.startsWith('.') ? cookie.domain.substring(1) : cookie.domain}${cookie.path}`;

                chrome.cookies.remove({
                    url: url,
                    name: cookie.name
                }, function (details) {
                    if (details) {
                        console.log(`Removed cookie: ${cookie.name} from ${url}`);
                    }
                });
            }
        });
    }
}
function reloadAliExpressTabs() {
    chrome.tabs.query({}, function (tabs) {
        tabs.forEach(tab => {
            if (tab.url && tab.url.includes('aliexpress.com')) {
                chrome.tabs.reload(tab.id);
                console.log(`Reloaded: ${tab.url}`);
            }
        });
    });
}

// document.addEventListener('DOMContentLoaded', () => {
//     const toggle = document.getElementById('toggle-url');

//     chrome.storage.local.get('urlRewriteEnabled', (data) => {
//         toggle.checked = data.urlRewriteEnabled;
//     });

//     toggle.addEventListener('change', () => {
//         chrome.storage.local.set({ urlRewriteEnabled: toggle.checked });
//     });
// });
