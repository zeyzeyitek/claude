# Otobüs Tasarım Stüdyosu (konsept, Rev E)

12 m, körüksüz, 3 kapılı şehir içi otobüs. İçinde birinci şahıs gezilebilen 3D tasarım aracı (Three.js r128, tek dosya).

- **İçeride gez:** WASD / oklar, Shift ile hızlı, sürükleyerek bak. Dokunmatik ekranda joystick.
- **Dış görünüm:** Sürükleyerek döndür, tekerlekle yakınlaş. "Kesit" tavanı kaldırır.
- **İncele:** Bir öğeye tıkla. Kodu, yüksekliği, ön uçtan mesafesi ve tarafı gösterilir. Koltuklarda "Bu koltuğa otur" var.
- **Plan:** Üstten yerleşim planı. Plana tıklayınca oraya ışınlanırsın.

Çalışan fonksiyonlar: sürücü panelindeki kırmızı K1·K2·K3 butonları (kapı aç/kapa, sıkışma algılama), durak isteği butonları (cluster lambası, yolcu ekranı, kapı açılınca sıfırlanma), durak freni. Sol altta cluster, sağda sinyal tablosu ve olay günlüğü.

Not: `index.html`, yayın sırasında HTML iskeletiyle sarılan bir artifact gövdesi olarak yazıldı. Yerelde açmak için bir web sunucusundan servis et.

## Rev C
- Ses (WebAudio, 3D konumlu): kapı havası, kapanma uyarı bipi, durak zili, özel istek melodisi, sıkışma buzzer'ı, röle.
- Yakınlaştırma: fare tekerleği, iki parmak, `+` / `-` / `0` ve araç çubuğundaki −/+ butonları.
- Gerçekçilik: gölgeler, flanşlı direkler, tavan barı bağlantıları, gece görünümü.
- Arka bölüm özel istek panelleri (bebek arabası, engelli, yaşlı yolcu): kapı 3 direği, kapı 3 karşısı ve arka platform önü.
- İç aydınlatma: göstergedeki buton, sürücü sol paneli veya `L` tuşu.
- Gereksinim sekmesi: REQ-001..004 otomatik doğrulanır; elle gereksinim eklenebilir (tarayıcıda saklanır).

## Rev D
- Koltuklar: kavisli kabuk (extrude profil), ~16° sırt eğimi, ayrı oturak/sırt minderi, tutamak ve taşıyıcı. Mavi kumaş.
- Gövde yanları mavi, iç duvar kaplaması ayrı.
- Göstergede 30 buton (sağ panel 21, sol panel 9). "Butonlar" sekmesinde her birinin kartı var. Tanımsız butonlar basınca sadece günlüğe yazar.
- Türfreigabe (B01): DoorMode=AUTO. Durak isteği → K2+K3 açılır, 5 s sonra kendiliğinden kapanır. Bebek arabası/engelli isteği → kapı açık kalır, sürücü kapatır. Yeşil kapı isteği butonları da otomatik modda çalışır.
- Ek fonksiyonlar: rampa (K2 açıkken, açıkken K2 kapanmaz), kapı kilidi, motor, dörtlü flaşör, far, korna, anons, park freni, manuel durak freni, %50 ışık, diz çöktürme.
- REQ-005..007: Türfreigabe, özel istekte açık kalma, 5 s otomatik kapanma.

## Rev E
- Bölgeleme: K1 (x > 2.9 m), K2 (−1.8…2.9 m), K3 (< −1.8 m). Her buton kendi bölgesine istek yazar; Türfreigabe açıkken yalnızca o bölgenin kapısı açılır, o kapı açılınca yalnızca o bölge sıfırlanır. Zeminde renkli bölge gösterimi ("Bölgeler").
- STOP butonları: üzerinde STOP yazan kırmızı buton, krom halka, direk kelepçesi; istek varken hepsi parlar.
- Kapı kanatlarında iç ve dış Öffnung (AÇ) butonu. Türfreigabe yoksa istek kaydedilir (buton yanıp söner), verilince kapı açılır.
- Engelli + bebek arabası paneli kapı 2 karşısında (K2) ve kapı 3 direğinde (K3). Yaşlı yolcu butonu kapı 1–2 arasında (K2).
- Kapı üstü durum tabelaları (DURACAK, KAPI SERBEST, KAPANIYOR 3, AÇIK · BEKLE) ve kapı LED'i. Cluster'da bölge sütunu.
- REQ-008 bölgeleme, REQ-009 Öffnung.
