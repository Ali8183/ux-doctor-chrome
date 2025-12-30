// Popup.js - Ana kontrol paneli
document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const saveSettings = document.getElementById('saveSettings');
    const settingsPanel = document.getElementById('settingsPanel');
    const webhookUrlInput = document.getElementById('webhookUrl');
    const statusElement = document.getElementById('status');
    const resultsElement = document.getElementById('results');
    const detailsBtn = document.getElementById('detailsBtn');

    // Ayarları yükle
    loadSettings();

    // Analiz butonu
    analyzeBtn.addEventListener('click', async () => {
        setStatus('loading', 'Analiz yapılıyor...', 'Sayfa verileri toplanıyor');
        analyzeBtn.disabled = true;

        try {
            // Aktif tab'ı al
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // Content script'in yüklü olup olmadığını kontrol et ve gerekirse yükle
            try {
                await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
            } catch (error) {
                setStatus('loading', 'Hazırlanıyor...', 'Script yükleniyor');
                // Content script yüklü değil, şimdi yükle
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                });
                // Script'in yüklenmesi için kısa bir bekleme
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            setStatus('loading', 'Analiz ediliyor...', 'Don Norman ilkeleri kontrol ediliyor');
            
            // Content script'e mesaj gönder
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'analyzePage' });

            if (response.success) {
                // Lokal analiz yap
                const analyzer = new UxAnalyzer();
                const localAnalysis = analyzer.analyze(response.data);

                // Webhook ile detaylı analiz
                try {
                    setStatus('loading', 'Detaylı analiz...', 'AI değerlendirmesi yapılıyor');
                    const webhookResult = await sendToWebhook(response.data);
                    displayResults(mergeAnalysis(localAnalysis, webhookResult));
                } catch (webhookError) {
                    console.log('Webhook hatası, lokal analiz gösteriliyor:', webhookError);
                    displayResults(localAnalysis);
                }

                setStatus('success', 'Analiz tamamlandı!', 'Sonuçlar hazır');
            }
        } catch (error) {
            console.error('Analiz hatası:', error);
            setStatus('error', 'Analiz başarısız', error.message);
        } finally {
            analyzeBtn.disabled = false;
        }
    });

    // Ayarlar butonu
    settingsBtn.addEventListener('click', () => {
        settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
    });

    // Ayarları kaydet
    saveSettings.addEventListener('click', async () => {
        const webhookUrl = webhookUrlInput.value.trim();
        await chrome.storage.sync.set({ webhookUrl });
        alert('Ayarlar kaydedildi!');
        settingsPanel.style.display = 'none';
    });

    // Detaylı rapor butonu
    detailsBtn.addEventListener('click', () => {
        // Yeni tab'da detaylı rapor aç
        chrome.tabs.create({ url: chrome.runtime.getURL('report.html') });
    });

    async function loadSettings() {
        const settings = await chrome.storage.sync.get(['webhookUrl']);
        if (settings.webhookUrl) {
            webhookUrlInput.value = settings.webhookUrl;
        }
    }

    async function sendToWebhook(pageData) {
        const settings = await chrome.storage.sync.get(['webhookUrl']);
        const webhookUrl = settings.webhookUrl || 'https://alinursin.app.n8n.cloud/webhook/uxdoctor';

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: pageData.url,
                title: pageData.title,
                html: pageData.html,
                accessibility: pageData.accessibility,
                structure: pageData.structure,
                forms: pageData.forms,
                interactive: pageData.interactive,
                elementsCount: pageData.elementsCount,
                timestamp: new Date().toISOString()
            })
        });

        if (!response.ok) {
            throw new Error(`Webhook hatası: ${response.status}`);
        }

        return await response.json();
    }

    function mergeAnalysis(local, webhook) {
        if (!webhook) {
            return local;
        }

        // Webhook yanıtındaki ux_report JSON string'ini parse et
        let uxReport = webhook;
        if (webhook.ux_report) {
            try {
                uxReport = JSON.parse(webhook.ux_report);
            } catch (e) {
                console.error('UX report parse hatası:', e);
                return local;
            }
        }

        if (!uxReport.meta) {
            return local;
        }

        // Webhook'tan gelen formatı işle
        const aiIssues = (uxReport.issues || []).map(issue => ({
            principle: issue.principle,
            severity: issue.impactScore > 70 ? 'critical' : issue.impactScore > 40 ? 'warning' : 'info',
            description: issue.oneSentenceInsight,
            suggestion: issue.fixCode || 'Detaylı inceleme gerekli',
            impactScore: issue.impactScore,
            elementSelector: issue.elementSelector
        }));

        // Webhook'tan gelen heuristic skorları kullan
        const webhookScores = uxReport.heuristicScores || {};

        return {
            score: uxReport.meta.overallScore || local.score,
            issues: [...aiIssues, ...local.issues],
            principles: {
                visibility: `${webhookScores.visibility || 70}/100`,
                feedback: `${webhookScores.feedback || 60}/100`,
                affordance: `${webhookScores.affordance || 65}/100`,
                mapping: `${webhookScores.mapping || 75}/100`,
                constraints: `${webhookScores.constraints || 55}/100`,
                consistency: `${webhookScores.consistency || 80}/100`
            },
            heuristicScores: webhookScores,
            aiSummary: uxReport.meta.summary
        };
    }

    function displayResults(analysis) {
        // Skoru göster
        const scoreElement = document.getElementById('score');
        const scoreSubtitle = document.getElementById('scoreSubtitle');
        scoreElement.textContent = analysis.score;
        scoreElement.style.color = getScoreColor(analysis.score);
        
        // Skor halkasını animate et
        const scoreRing = document.getElementById('scoreRing');
        if (scoreRing) {
            const circumference = 339; // 2 * PI * 54
            const offset = circumference - (analysis.score / 100) * circumference;
            scoreRing.style.strokeDashoffset = offset;
            scoreRing.style.stroke = getScoreColor(analysis.score);
        }

        // Skor açıklaması
        if (scoreSubtitle) {
            const scoreText = analysis.score >= 80 ? 'Mükemmel!' : 
                            analysis.score >= 60 ? 'İyi' : 
                            analysis.score >= 40 ? 'Orta' : 'İyileştirme gerekli';
            scoreSubtitle.innerHTML = `<strong>${scoreText}</strong> • 100 üzerinden`;
        }

        // AI özeti varsa göster
        if (analysis.aiSummary) {
            const summaryEl = document.getElementById('aiSummary');
            if (summaryEl) {
                summaryEl.innerHTML = `
                    <div style="display: flex; align-items: start; gap: 10px;">
                        <span style="font-size: 20px;">🤖</span>
                        <div style="flex: 1;">
                            <strong style="display: block; margin-bottom: 6px; color: #495057;">AI Değerlendirmesi</strong>
                            ${analysis.aiSummary}
                        </div>
                    </div>
                `;
                summaryEl.style.display = 'block';
            }
        }

        // Prensipleri göster - webhook'tan gelen skorları kullan
        const principleScores = analysis.heuristicScores || calculatePrincipleScores(analysis.issues);
        updatePrincipleStatus('visibility', analysis.principles.visibility, principleScores.visibility || principleScores.Visibility);
        updatePrincipleStatus('feedback', analysis.principles.feedback, principleScores.feedback || principleScores.Feedback);
        updatePrincipleStatus('constraints', analysis.principles.constraints, principleScores.constraints || principleScores.Constraints);
        updatePrincipleStatus('consistency', analysis.principles.consistency, principleScores.consistency || principleScores.Consistency);
        updatePrincipleStatus('affordance', analysis.principles.affordance, principleScores.affordance || principleScores.Affordance);
        updatePrincipleStatus('mapping', analysis.principles.mapping, principleScores.mapping || principleScores.Mapping);

        // Sorunları göster (impactScore'a göre sıralı)
        const issuesElement = document.getElementById('issues');
        if (analysis.issues.length > 0) {
            const sortedIssues = [...analysis.issues].sort((a, b) => (b.impactScore || 0) - (a.impactScore || 0));
            issuesElement.innerHTML = '<h3 style="font-size: 16px; margin-bottom: 16px; color: #495057; font-weight: 600; display: flex; align-items: center; gap: 8px;"><span>⚠️</span> Tespit Edilen Sorunlar</h3>' + 
                sortedIssues.slice(0, 5).map(issue => `
                    <div class="issue ${issue.severity}">
                        <div class="issue-title">
                            <span>${issue.principle} • ${getSeverityText(issue.severity)}</span>
                            ${issue.impactScore ? `<span class="impact-badge">Etki: ${issue.impactScore}</span>` : ''}
                        </div>
                        <div class="issue-description">${issue.description}</div>
                        <div class="issue-suggestion">💡 <strong>Öneri:</strong> ${issue.suggestion}</div>
                    </div>
                `).join('');
            
            if (analysis.issues.length > 5) {
                issuesElement.innerHTML += `<p style="text-align: center; color: #6c757d; font-size: 12px; margin-top: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px;">📋 <strong>+${analysis.issues.length - 5}</strong> sorun daha bulundu. Detaylı rapor için butona tıklayın.</p>`;
            }
        } else {
            issuesElement.innerHTML = '<div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); border-radius: 12px; color: #155724;"><div style="font-size: 48px; margin-bottom: 10px;">✓</div><p style="font-size: 16px; font-weight: 600;">Harika!</p><p style="font-size: 13px; margin-top: 5px;">Ciddi sorun bulunamadı</p></div>';
        }

        // Sonuçları göster
        resultsElement.style.display = 'block';

        // Analiz verisini kaydet (detaylı rapor için)
        chrome.storage.local.set({ lastAnalysis: analysis });
    }

    function calculatePrincipleScores(issues) {
        const scores = {
            Visibility: 100,
            Feedback: 100,
            Affordance: 100,
            Mapping: 100,
            Constraints: 100,
            Consistency: 100
        };

        issues.forEach(issue => {
            if (issue.impactScore && scores[issue.principle] !== undefined) {
                scores[issue.principle] -= issue.impactScore / 2; // Her sorun max 50 puan düşürür
            }
        });

        Object.keys(scores).forEach(key => {
            scores[key] = Math.max(0, Math.round(scores[key]));
        });

        return scores;
    }

    function updatePrincipleStatus(principle, status, score) {
        const icon = document.getElementById(`icon-${principle}`);
        const item = document.querySelector(`[data-principle="${principle}"]`);
        const nameEl = item?.querySelector('.principle-name');
        
        if (score !== undefined && typeof score === 'number') {
            // Skor bazlı gösterim
            if (score >= 80) {
                icon.textContent = '✓';
                icon.style.color = '#28a745';
                item?.classList.add('active');
            } else if (score >= 60) {
                icon.textContent = '⚠';
                icon.style.color = '#ffc107';
            } else {
                icon.textContent = '✗';
                icon.style.color = '#dc3545';
            }
            if (nameEl) {
                nameEl.setAttribute('data-score', score);
                nameEl.title = `Skor: ${score}/100`;
            }
        } else {
            // Eski metin bazlı gösterim
            if (status.includes('Mükemmel') || status.includes('İyi')) {
                icon.textContent = '✓';
                icon.style.color = '#28a745';
                item?.classList.add('active');
            } else if (status.includes('İyileştirme')) {
                icon.textContent = '⚠';
                icon.style.color = '#ffc107';
            } else {
                icon.textContent = '✗';
                icon.style.color = '#dc3545';
            }
        }
    }

    function getScoreColor(score) {
        if (score >= 80) return '#28a745';
        if (score >= 60) return '#ffc107';
        return '#dc3545';
    }

    function getSeverityText(severity) {
        const texts = {
            critical: 'Kritik',
            warning: 'Uyarı',
            info: 'Bilgi'
        };
        return texts[severity] || severity;
    }

    function setStatus(type, message, subtext = '') {
        const icon = type === 'loading' ? '🔄' : type === 'success' ? '✅' : type === 'error' ? '❌' : '✨';
        const pulse = type === 'loading' ? 'pulse' : '';
        statusElement.innerHTML = `
            <div class="status-indicator">
                <span class="status-icon ${pulse}">${icon}</span>
                <div class="status-content">
                    <span class="status-text">${message}</span>
                    ${subtext ? `<span class="status-subtext">${subtext}</span>` : ''}
                </div>
            </div>
        `;
    }
});
