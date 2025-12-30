# UX Doktor - Chrome Extension 🔍

Don Norman'ın UX prensipleri ile web sayfalarını analiz eden Chrome eklentisi.

## ✨ Özellikler

### Don Norman'ın 6 Temel İlkesi
1. **Visibility** (Görünürlük) - Form labels, alt text, ARIA attributes
2. **Feedback** (Geri Bildirim) - Submit buttons, button labels
3. **Constraints** (Kısıtlamalar) - Form validasyonları
4. **Consistency** (Tutarlılık) - Heading hiyerarşisi, semantic HTML
5. **Affordance** - Cursor stilleri, tıklanabilirlik
6. **Mapping** - Semantic HTML elementleri

### Analiz Yetenekleri
- ✅ Erişilebilirlik kontrolü
- ✅ Form analizi
- ✅ İnteraktif element kontrolü
- ✅ Semantic HTML yapısı
- ✅ n8n webhook entegrasyonu
- ✅ Gerçek zamanlı skorlama

## 🚀 Kurulum

### 1. Chrome'a Yükle

1. Chrome'da `chrome://extensions/` adresine git
2. Sağ üstte **Developer mode**'u aç
3. **Load unpacked** butonuna tıkla
4. `ux-doktor-chrome` klasörünü seç

### 2. Webhook Ayarla (Opsiyonel)

Eklenti varsayılan olarak şu webhook'u kullanır:
```
https://demir1200.app.n8n.cloud/webhook/uxdoctor
```

Değiştirmek için:
1. Eklenti ikonuna tıkla
2. **Ayarlar** butonuna bas
3. Yeni webhook URL'ini gir
4. **Kaydet**

## 📖 Kullanım

1. Analiz etmek istediğin web sayfasına git
2. Eklenti ikonuna tıkla
3. **Sayfayı Analiz Et** butonuna bas
4. Sonuçları incele!

## 📊 Analiz Kriterleri

### Visibility (Görünürlük)
- Form input'larında label kontrolü
- Görsellerde alt text kontrolü
- ARIA attributes varlığı

### Feedback (Geri Bildirim)
- Form submit butonları
- Button text'leri
- Kullanıcı etkileşimi geri bildirimleri

### Constraints (Kısıtlamalar)
- Form validasyonları (required, pattern, min/max)
- Input kısıtlamaları

### Consistency (Tutarlılık)
- H1 başlık kontrolü
- Heading hiyerarşisi
- Tutarlı yapı

### Affordance
- Cursor pointer stilleri
- Tıklanabilir elementlerin belirginliği

### Mapping
- Semantic HTML (nav, main, header, footer)
- Mantıksal sayfa yapısı

## 🎯 Skorlama

- **80-100**: Mükemmel ✓
- **60-79**: İyi ✓
- **50-59**: İyileştirme gerekli ⚠
- **0-49**: Kritik sorunlar ✗

## 🔗 n8n Webhook & AI Entegrasyonu

Bu eklenti, daha derinlemesine analiz için Google Gemini AI destekli bir n8n workflow'u ile entegre çalışır.

### Kurulum:

1. Proje dosyasındaki `n8n-workflow.json` dosyasını n8n panelinize import edin.
2. Workflow içerisindeki **Generate Content** (Gemini) node'unda kendi Google Gemini API anahtarınızı (veya n8n credentials) yapılandırın.
3. **Webhook** node'unu aktifleştirin ve Test/Production URL'ini kopyalayın.
4. Chrome eklentisi ayarlarında bu URL'i `Webhook URL` alanına yapıştırın.

### Çalışma Mantığı:

1. Eklenti, sayfanın DOM yapısını ve içeriğini JSON olarak n8n webhook'una gönderir.
2. n8n workflow, bu veriyi alıp Google Gemini 2.0 Flash modeline iletir.
3. AI, Don Norman'ın 6 prensibine göre (Görünürlük, Geribildirim, Sağlarlık, Eşleştirme, Kısıtlar, Tutarlılık) sayfayı puanlar ve Türkçe içgörüler üretir.
4. Sonuçlar eklentiye geri döner ve kullanıcıya görsel bir rapor sunulur.

### Beklenen Response Formatı (AI):
Workflow, eklentiye şu formatta bir yanıt döndürür:

```json
{
  "meta": {
    "analyzedUrl": "...",
    "overallScore": 85,
    "summary": "Sayfa hakkında Türkçe özet..."
  },
  "heuristicScores": {
    "visibility": 90,
    "feedback": 80,
    "affordance": 75,
    "mapping": 85,
    "constraints": 60,
    "consistency": 95
  },
  "issues": [
    {
      "principle": "Affordance",
      "impactScore": 80,
      "oneSentenceInsight": "Butonlar tıklanabilir durmuyor.",
      "elementSelector": ".btn-primary",
      "fixCode": "cursor: pointer;"
    }
  ]
}
```

## 📁 Dosya Yapısı

```
ux-doktor-chrome/
├── manifest.json          # Chrome extension manifest
├── popup.html            # Ana popup arayüzü
├── popup.css             # Popup stilleri
├── popup.js              # Popup kontrol scripti
├── content.js            # Sayfa analiz scripti
├── background.js         # Service worker
├── analyzer.js           # UX analiz motoru
├── icons/                # Eklenti ikonları
└── README.md            # Dokümantasyon
```

## 🛠️ Geliştirme

Kod değişikliği yaptıktan sonra:
1. `chrome://extensions/` sayfasına git
2. Eklentinin yanındaki **Reload** butonuna tıkla

## 💡 İpuçları

- Eklenti tüm web sayfalarında çalışır
- Lokal HTML dosyalarını analiz edebilir
- Webhook olmadan da çalışır (lokal analiz)
- Detaylı raporlar için webhook kullanın

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun
3. Commit edin
4. Pull request açın

## 📄 Lisans

MIT License

## 👨‍💻 Geliştirici

UX Doktor - Don Norman prensipleriyle daha iyi web deneyimleri ✨

---

**Not**: Bu eklenti web sayfalarının DOM yapısını analiz eder. Dinamik içerik için sayfa tam yüklendiğinde analiz yapın.
