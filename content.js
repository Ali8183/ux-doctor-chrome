// Content script - Sayfa içeriğini analiz eder
console.log('UX Doktor content script yüklendi');

// Sayfa DOM'unu analiz et
function analyzePage() {
    const analysis = {
        url: window.location.href,
        title: document.title,
        html: document.documentElement.outerHTML.substring(0, 50000), // İlk 50KB
        elementsCount: {
            inputs: document.querySelectorAll('input').length,
            buttons: document.querySelectorAll('button').length,
            forms: document.querySelectorAll('form').length,
            links: document.querySelectorAll('a').length,
            images: document.querySelectorAll('img').length,
            labels: document.querySelectorAll('label').length
        },
        accessibility: analyzeAccessibility(),
        structure: analyzeStructure(),
        forms: analyzeForms(),
        interactive: analyzeInteractiveElements()
    };

    return analysis;
}

// Erişilebilirlik analizi
function analyzeAccessibility() {
    const images = document.querySelectorAll('img');
    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
    
    const inputs = document.querySelectorAll('input');
    const inputsWithoutLabel = Array.from(inputs).filter(input => {
        const id = input.id;
        return !id || !document.querySelector(`label[for="${id}"]`);
    });

    const buttons = document.querySelectorAll('button');
    const buttonsWithoutText = Array.from(buttons).filter(btn => 
        !btn.textContent.trim() && !btn.getAttribute('aria-label')
    );

    const ariaElements = document.querySelectorAll('[aria-label], [aria-labelledby], [role]');

    return {
        totalImages: images.length,
        imagesWithoutAlt: imagesWithoutAlt.length,
        totalInputs: inputs.length,
        inputsWithoutLabel: inputsWithoutLabel.length,
        totalButtons: buttons.length,
        buttonsWithoutText: buttonsWithoutText.length,
        hasAriaAttributes: ariaElements.length > 0,
        ariaElementsCount: ariaElements.length
    };
}

// Yapı analizi
function analyzeStructure() {
    return {
        hasNav: document.querySelector('nav') !== null,
        hasHeader: document.querySelector('header') !== null,
        hasFooter: document.querySelector('footer') !== null,
        hasMain: document.querySelector('main') !== null,
        headings: {
            h1: document.querySelectorAll('h1').length,
            h2: document.querySelectorAll('h2').length,
            h3: document.querySelectorAll('h3').length
        }
    };
}

// Form analizi
function analyzeForms() {
    const forms = document.querySelectorAll('form');
    const formsData = [];

    forms.forEach(form => {
        const inputs = form.querySelectorAll('input');
        const hasSubmit = form.querySelector('button[type="submit"], input[type="submit"]') !== null;
        const hasValidation = Array.from(inputs).some(input => 
            input.hasAttribute('required') || 
            input.hasAttribute('pattern') ||
            input.hasAttribute('min') ||
            input.hasAttribute('max')
        );

        formsData.push({
            hasSubmit,
            hasValidation,
            inputCount: inputs.length
        });
    });

    return {
        totalForms: forms.length,
        forms: formsData
    };
}

// İnteraktif elemanlar analizi
function analyzeInteractiveElements() {
    const clickableElements = document.querySelectorAll('a, button, [onclick], [role="button"]');
    const clickableWithoutFeedback = Array.from(clickableElements).filter(el => {
        const styles = window.getComputedStyle(el);
        return styles.cursor !== 'pointer';
    });

    return {
        totalClickable: clickableElements.length,
        withoutPointerCursor: clickableWithoutFeedback.length
    };
}

// Mesaj dinleyici
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'ping') {
        sendResponse({ success: true });
    } else if (request.action === 'analyzePage') {
        const pageAnalysis = analyzePage();
        sendResponse({ success: true, data: pageAnalysis });
    }
    return true;
});
