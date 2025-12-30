// UX Analyzer - Don Norman prensipleri
class UxAnalyzer {
    constructor() {
        this.principles = {
            visibility: { name: 'Visibility', weight: 20 },
            feedback: { name: 'Feedback', weight: 20 },
            constraints: { name: 'Constraints', weight: 15 },
            consistency: { name: 'Consistency', weight: 15 },
            affordance: { name: 'Affordance', weight: 15 },
            mapping: { name: 'Mapping', weight: 15 }
        };
    }

    analyze(pageData) {
        const issues = [];
        let totalScore = 100;

        // Visibility analizi
        const visibilityScore = this.analyzeVisibility(pageData, issues);
        totalScore -= (100 - visibilityScore) * 0.2;

        // Feedback analizi
        const feedbackScore = this.analyzeFeedback(pageData, issues);
        totalScore -= (100 - feedbackScore) * 0.2;

        // Constraints analizi
        const constraintsScore = this.analyzeConstraints(pageData, issues);
        totalScore -= (100 - constraintsScore) * 0.15;

        // Consistency analizi
        const consistencyScore = this.analyzeConsistency(pageData, issues);
        totalScore -= (100 - consistencyScore) * 0.15;

        // Affordance analizi
        const affordanceScore = this.analyzeAffordance(pageData, issues);
        totalScore -= (100 - affordanceScore) * 0.15;

        // Mapping analizi
        const mappingScore = this.analyzeMapping(pageData, issues);
        totalScore -= (100 - mappingScore) * 0.15;

        return {
            score: Math.max(0, Math.round(totalScore)),
            issues,
            principles: {
                visibility: this.getStatusText(visibilityScore),
                feedback: this.getStatusText(feedbackScore),
                constraints: this.getStatusText(constraintsScore),
                consistency: this.getStatusText(consistencyScore),
                affordance: this.getStatusText(affordanceScore),
                mapping: this.getStatusText(mappingScore)
            }
        };
    }

    analyzeVisibility(data, issues) {
        let score = 100;

        // Label eksikliği
        if (data.accessibility.inputsWithoutLabel > 0) {
            const ratio = data.accessibility.inputsWithoutLabel / data.accessibility.totalInputs;
            if (ratio > 0.5) {
                issues.push({
                    principle: 'Visibility',
                    severity: 'critical',
                    description: `${data.accessibility.inputsWithoutLabel} input elemanında label eksik`,
                    suggestion: 'Tüm form elemanlarına açıklayıcı label ekleyin'
                });
                score -= 30;
            } else {
                issues.push({
                    principle: 'Visibility',
                    severity: 'warning',
                    description: 'Bazı input elemanlarında label eksik',
                    suggestion: 'Label kullanımını iyileştirin'
                });
                score -= 15;
            }
        }

        // Alt text eksikliği
        if (data.accessibility.imagesWithoutAlt > 0) {
            issues.push({
                principle: 'Visibility',
                severity: 'warning',
                description: `${data.accessibility.imagesWithoutAlt} görselde alt text yok`,
                suggestion: 'Tüm görsellere açıklayıcı alt text ekleyin'
            });
            score -= 15;
        }

        // ARIA attributes eksikliği
        if (!data.accessibility.hasAriaAttributes) {
            issues.push({
                principle: 'Visibility',
                severity: 'info',
                description: 'ARIA attributes kullanılmamış',
                suggestion: 'Erişilebilirlik için ARIA attributes ekleyin'
            });
            score -= 10;
        }

        return Math.max(0, score);
    }

    analyzeFeedback(data, issues) {
        let score = 100;

        // Form submit button kontrolü
        if (data.forms.totalForms > 0) {
            const formsWithoutSubmit = data.forms.forms.filter(f => !f.hasSubmit).length;
            if (formsWithoutSubmit > 0) {
                issues.push({
                    principle: 'Feedback',
                    severity: 'critical',
                    description: 'Bazı formlarda submit butonu yok',
                    suggestion: 'Her forma açık bir submit butonu ekleyin'
                });
                score -= 30;
            }
        }

        // Buton metinleri kontrolü
        if (data.accessibility.buttonsWithoutText > 0) {
            issues.push({
                principle: 'Feedback',
                severity: 'warning',
                description: 'Bazı butonlarda metin/label yok',
                suggestion: 'Tüm butonlara açıklayıcı metin ekleyin'
            });
            score -= 20;
        }

        return Math.max(0, score);
    }

    analyzeConstraints(data, issues) {
        let score = 100;

        // Form validasyon kontrolü
        if (data.forms.totalForms > 0) {
            const formsWithoutValidation = data.forms.forms.filter(f => !f.hasValidation).length;
            if (formsWithoutValidation > 0) {
                issues.push({
                    principle: 'Constraints',
                    severity: 'warning',
                    description: 'Form validasyonları eksik',
                    suggestion: 'Required, pattern, min/max gibi validasyonlar ekleyin'
                });
                score -= 25;
            }
        }

        return Math.max(0, score);
    }

    analyzeConsistency(data, issues) {
        let score = 100;

        // Heading hiyerarşisi kontrolü
        if (data.structure.headings.h1 === 0) {
            issues.push({
                principle: 'Consistency',
                severity: 'warning',
                description: 'Sayfada H1 başlığı yok',
                suggestion: 'Her sayfada bir adet H1 başlığı kullanın'
            });
            score -= 15;
        } else if (data.structure.headings.h1 > 1) {
            issues.push({
                principle: 'Consistency',
                severity: 'info',
                description: 'Birden fazla H1 başlığı var',
                suggestion: 'Sayfada tek bir H1 kullanın'
            });
            score -= 10;
        }

        return Math.max(0, score);
    }

    analyzeAffordance(data, issues) {
        let score = 100;

        // Tıklanabilir elementlerde cursor kontrolü
        if (data.interactive.withoutPointerCursor > 0) {
            const ratio = data.interactive.withoutPointerCursor / data.interactive.totalClickable;
            if (ratio > 0.3) {
                issues.push({
                    principle: 'Affordance',
                    severity: 'warning',
                    description: 'Tıklanabilir elemanlarda pointer cursor eksik',
                    suggestion: 'cursor: pointer CSS özelliğini ekleyin'
                });
                score -= 20;
            }
        }

        return Math.max(0, score);
    }

    analyzeMapping(data, issues) {
        let score = 100;

        // Semantic HTML kontrolü
        if (!data.structure.hasNav) {
            issues.push({
                principle: 'Mapping',
                severity: 'info',
                description: 'Semantic <nav> elementi kullanılmamış',
                suggestion: 'Navigasyon için <nav> elementi kullanın'
            });
            score -= 10;
        }

        if (!data.structure.hasMain) {
            issues.push({
                principle: 'Mapping',
                severity: 'info',
                description: 'Semantic <main> elementi kullanılmamış',
                suggestion: 'Ana içerik için <main> elementi kullanın'
            });
            score -= 10;
        }

        return Math.max(0, score);
    }

    getStatusText(score) {
        if (score >= 90) return '✓ Mükemmel';
        if (score >= 70) return '✓ İyi';
        if (score >= 50) return '⚠ İyileştirme gerekli';
        return '✗ Kritik sorun';
    }
}
