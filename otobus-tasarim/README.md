# Otobüs Tasarım Stüdyosu (konsept, Rev I)

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

## Rev F
- Üç sayfa: Simülatör · Gereksinimler · Sinyaller (adres: `#gereksinimler`, `#sinyaller`).
- Gereksinimler teknik kılavuz olarak: fonksiyon gruplarına ayrılmış (Durak butonları, Engelli/bebek, Yaşlı yolcu, Kapı açma/Türfreigabe, Bölgeleme, İç aydınlatma, Eklenenler). Her gereksinim önce İngilizce, altında Türkçe, ardından açıklama (doğrulama adımı), bağlı sinyaller ve kanıt. Arama, tümünü aç/kapat, "Simülatörde dene".
- Sinyal kataloğu: tüm sinyaller TR/EN açıklama, tip, canlı değer, son değişim; arama, grup ve filtre (aktif, son 10 s değişen, bağlı değil). Satır detayında değişim geçmişi ve bağlı gereksinimler.
- REQ-010: STOP butonu bölge isteği.

## Gereksinim gönderme şablonu
```
ID: REQ-0xx
Grup: Kapı Açma ve Türfreigabe
EN: The system shall ...
TR: Sistem ... yapmalıdır.
Açıklama: nasıl doğrulanır
Sinyaller: DoorRelease, DoorState_K2
```

## Rev G
- Gereksinimler yalnızca ayrı sayfada (sağ panelden kaldırıldı).
- Gereksinim listesinden 3 kapı gereksinimi orijinal ID ve revizyonuyla eklendi, EN + TR + açıklama, otomatik test:
  - 2021.19178 (BASE; 1): Türfreigabe yokken açma butonu isteği saklar (StopReq_Kx), varken doğrudan açar.
  - 2021.18647 (BASE; 4): Açık kalma süresi 3 s; ışık bariyeri algılarsa süre yeniden başlar.
  - 2025.03465 (BASE; 2): Engelli, bebek arabası veya yaşlı butonuyla açılan kapı otomatik kapanmaz.
- Parametre DoorHoldOpenTime_P (3 / 5 / 10 s, varsayılan 3 s) kılavuzun kapı bölümünde.
- Yeni sinyaller: LightBarrier_K1..3, DoorHoldOpenTime_P.

## Rev H
- Kokpit 3D olarak yeniden: cluster kaputu (krom çerçeve, cam), sürücüye dönük eğimli sağ/sol paneller, ikonlu açık gri tuşlar ve LED şeritleri, kapı ikonlu kırmızı yuvarlak K1–K3 butonları, yuvarlak havalandırmalar, takograf ve klima ekranı, ışık döner anahtarı, uydu kumandalı direksiyon.
- Cluster çizimi: krom kadran çerçeveleri, değer yayı, cam parlaması.
- Gereksinim listesinin tamamı (911 madde: 776 gereksinim, 74 iptal, 43 parametre, 17 test senaryosu, 1 not) 29 fonksiyon bölümünde. Orijinal EN metin, "Remark" kısmı açıklamaya ayrılmış. TR çeviriler bölüm bölüm eklenecek.
- Bölümler açılınca yüklenir; arama tüm listede. Elle durum işaretleme ve bölüm taşıma tarayıcıda saklanır.
- Gereksinimlerde geçen 185 sinyal/parametre adı sinyal kataloğuna "bağlı değil" olarak eklendi.
- `data/requirements.json`: ayrıştırılmış liste; `data/parse_requirements.py`: ayrıştırma ve otomatik gruplama betiği.

## Rev I
- Seçim kutusu (sarı çerçeve) kaldırıldı. Tuşlar basınca içeri gömülür; aç/kapa tuşların LED'i yeşil yanar, anlık tuşların LED'i kısa süre parlar.
- Gösterge tuşları siyah, ikonlar beyaz.
- Durak istekleri kapı açılmaya başladığı anda bölge bazında silinir (2021.19182). Kapı kapalı değilken gelen istek saklanmaz (2021.19171).
- Kabin kapısı: mıknatıslı kilit, B07 KABİN butonu (5 s bırakma), el freni kolu. Park freni inikken kilit açılmaz (2022.05043); kapı açıkken el freni inerse sürücü buzzer'ı çalar (2023.05022). İkisi de otomatik test.
- Dış görünüm: yuvarlatılmış köşeler, krom bar ve kurgusal "Şahin" amblemi, LED far grupları, sis farları, silecekler, yan işaret lambaları, motor ızgarası.
- Çevre: durak sığınağı ve hat panosu, binalar, ağaçlar. Yürürken hafif kafa sallanması.
