// Background service worker
console.log('UX Doktor background service worker başlatıldı');

// Extension yüklendiğinde
chrome.runtime.onInstalled.addListener(() => {
    console.log('UX Doktor eklentisi kuruldu');
    
    // Varsayılan ayarları kaydet
    chrome.storage.sync.set({
        webhookUrl: 'https://alinursin.app.n8n.cloud/webhook/uxdoctor'
    });
});


// Mesajları dinle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'analyzeWithWebhook') {
        analyzeWithWebhook(request.data)
            .then(result => sendResponse({ success: true, result }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Async response için
    }
});

// Webhook ile analiz
async function analyzeWithWebhook(pageData) {
    try {
        // Webhook URL'ini al
        const settings = await chrome.storage.sync.get(['webhookUrl']);
        const webhookUrl = settings.webhookUrl || 'https://alinursin.app.n8n.cloud/webhook/uxdoctor';

        // n8n'e gönder
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: pageData.url,
                title: pageData.title,
                analysis: pageData,
                timestamp: new Date().toISOString(),
                principles: [
                    'Visibility',
                    'Feedback',
                    'Constraints',
                    'Consistency',
                    'Affordance',
                    'Mapping'
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`Webhook hatası: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Webhook hatası:', error);
        throw error;
    }
}
