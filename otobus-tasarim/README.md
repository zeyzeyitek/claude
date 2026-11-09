# Otobüs Tasarım Stüdyosu (konsept, Rev S)

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

## Rev J
- Tüm gereksinimler Türkçeye çevrildi (833 madde + 74 iptal; simülatöre bağlı 4 madde zaten çevrili). EN metnin altında TR; "Remark" kısmı "Not:" olarak açıklamaya ayrılır. `data/requirements_tr.json`.
- İç aydınlatma 3 devreye bölündü: Kreis 1 ön bölge (iki taraf), Kreis 2 yolcu bölgesi sol, Kreis 3 yolcu bölgesi sağ. Her devre ayrı % ile çalışır (Sinyal sekmesindeki kaydırıcılar); IŞIK ½ yarıya indirir. Şeride tıklayınca / bakınca o anki % görünür. Sinyaller: IntLight_Kreis1..3_Pct.
- Diz çöktürme animasyonu: gövde sağa ~70 mm yatar ve alçalır (tekerlekler yerinde kalır); içerideyken kamera da birlikte iner. Sinyal: KneelLevel.
- Silecekler (SİLECEK) çalışır, kapatınca park konumuna döner. Sis farları (SİS) yanar. Sinyaller: Wiper, FogLights.
- Kabin kapısı dışarıya (giriş alanına) doğru açılır; menteşe ön uçta.

## Rev K
- Sürüş: HUD'daki "Sür" ya da `G`. W gaz, S/boşluk fren, A/D direksiyon. Hareket için motor açık, el freni inik, kapılar kapalı ve Türfreigabe kapalı olmalı (durak freni). Hız, devir, vites (D/N) cluster'da; tekerlekler döner, motor sesi. "Durağa dön" aracı başlangıç noktasına alır. 3 km/h üstünde kapılar açılmaz (2023.03864), araç hareketliyken Türfreigabe verilemez (2021.18715).
- Otomatik test: simülatöre bağlı her gereksinimin kartında "▶ Otomatik test". Simülasyonu sıfırlar, adımları kendisi yapar (ekranda adım açıklaması), sonunda kılavuza dönüp sonucu gösterir. "Durdur" ile kesilebilir.
- Vorspeicherung (REQ-011): Türfreigabe aktifken ve araç duruyorken STOP butonları kapıyı açmaz, istek saklanır; Türfreigabe verildiğinde (yükselen kenar) saklanan bölgeler açılır. Kapı üstü AÇ (Öffnung) butonları Türfreigabe aktif olduğu sürece her zaman açar. Türfreigabe aktifken durak freni devrededir (2025.13674).

## Rev L
- Gereksinim listesinden 15 madde daha simülatöre bağlandı (otomatik doğrulama + animasyonlu senaryo): 2021.19182, 2021.19171, 2021.18644, 2023.03864, 2021.18715, 2025.13674, 2021.18762, 2021.19560, 2023.03870, 2021.19027, 2021.19032, 2021.29327, 2023.04582, 2021.18637, 2021.18646. Toplam 29 otomatik test.
- Kılavuzda "▶ Tüm otomatik testleri çalıştır": 29 senaryoyu sırayla çalıştırır, sonra özet ile kılavuza döner.
- Her gereksinim kartında "Test senaryosu": otomatik testlerde adımlar, diğerlerinde metinden üretilmiş taslak (başlangıç, koşullar, beklenen sonuç, negatif test, Not kontrolü; parametre ve test senaryosu tipleri için ayrı şablon).
- Sürücü kapı butonu ve otomatik açma 1 km/h üstünde engellenir (2021.19027).

## Rev M
- Otomatik test sırasında sağda **adım paneli**: tüm adımlar listelenir (bekliyor / çalışıyor / bitti + süre), altta canlı sinyaller ve sonuç.
- Eksik testler: ~24 liste gereksinimi mevcut otomatik testlere bağlandı (aynı fonksiyonu test eden gereksinimler sonucu paylaşır) → 51 gereksinim otomatik test kapsamında.
- **Sinyal grafiği** (Sinyaller sekmesi): 50 ms örnekleme, seçilebilir zaman penceresi, bool/enum/sayısal izler, her sinyal için pencere içindeki aktif süre (s) ve yükselen kenar sayısı.
- Buton basma darbe sinyalleri: DrvBtn_K1–3, OeffBtn_K1–3, StopBtn_K1–3, SpecBtn_K1–3, DashBtn_*.
- Her otomatik test kaydedilir; gereksinim kartındaki "Sinyal grafiği" o testin zaman aralığını gösterir.

## Rev N
- **B24 ASW sinyal envanteri** (`data/asw_signals.json`, kaynak xlsx'ten `data/build_asw_inventory.py` ile üretilir): 6.082 sinyal, 119 ASW, 18 fonksiyon bölümü.
- Sinyaller sayfasında üç görünüm: **Canlı simülatör**, **ASW envanteri**, **Fonksiyon zincirleri**.
- Envanter: her ASW için çıkışlar, girişler, parametreler (_P / Nv) ve yerel değişkenler. Sinyal detayında üreten ASW, kullanan ASW'ler, bağlı gereksinimler ve canlı değer gösterilir. 6.082 sinyalin tamamında arama yapılabilir.
- 9 fonksiyon zinciri (TF → kapı 2 açılır, Vorspeicherung, engelli, bebek arabası, yaşlı, otomatik kapanma, sürücü butonu, TF ile kneeling, TF ile durak freni). Her bağlantı envanterde kontrol edilir (✓ okuyor / ↻ aynı ASW / ↯ CAN üzerinden).
- Yol bulucu: iki sinyal arasında ASW giriş/çıkış bağlantısıyla olası en kısa akış.
- 59 gerçek ASW sinyali (DR_StDoorRelsActv, D2A_StDoorOpngRqst, BBC_StDoor2 …) simülatöre eşlendi; grafikte ve testlerde canlı izlenebilir.

## Rev O
- Simülatörün kendi sinyal adları (DoorRelease, DoorState_K2, StopReq_K2 …) kaldırıldı; tüm sinyaller B24 ASW envanterindeki gerçek adlarla (88 sinyal, hepsi envanterde doğrulandı).
- Gereksinim testleri, otomatik test paneli, grafik, yan panel, olay kaydı ve buton açıklamaları yeni adları kullanıyor.
- Envanterde karşılığı olmayan simülatör sinyalleri (silecek, sis farı, iç aydınlatma Kreis, direksiyon, motor devri, kapı açıklık %, otomatik kapanma sayacı) katalogdan çıkarıldı; fonksiyonlar çalışmaya devam ediyor.

## Rev P
- **C Kod** sekmesi: ASW'nin üretilmiş C dosyaları (.c/.h) sürükle-bırak ile yüklenir, tarayıcıda derlenir (C → JavaScript), step fonksiyonu (ör. `DR_100ms`) simülatörde periyodunda çalışır.
- Girişler (Get_) her adımda simülatörden okunur; elle sabitlenebilir veya darbe verilebilir. Çıkışlar (Set_) sinyal kataloğuna ve grafiğe yansır; `DR_StDoorRelsActv` otobüsün Türfreigabe'sini sürer. TF tuşu C modunda koda `DR_StDoorRelsBtnPosn1_I` / `DR_StDoorRelsDisadBtnPosn1_I` darbesi gönderir.
- Parametreler (_P / Nv) ekrandan değiştirilir; iç durum (B/DW/PrevZCX) izlenir; değişiklikler, orijinale dönüş ve zip indirme var.
- Eksik sabitler için `SIM_varsayimlar.c` otomatik oluşur (S-R flip-flop tablosu, süre sabitleri; VARSAYIM). `…_data.c` eklenince silinmeli.
- Kaynak kod yalnızca kullanıcının tarayıcısında saklanır, yayınlanan sayfaya eklenmez.
- Derleyici gcc ile karşılaştırıldı (`tools/ctest`): Doors_DoorsRels, 200.000 adım, 0 fark.
- Düzeltme: Gereksinimler/Sinyaller sayfasından simülatöre dönünce örtü gizlenmiyordu (`[hidden]` kuralı).

## Rev Q
- **Performans:** 3D sahne artık yalnızca bir şey değiştiğinde çiziliyor (kamera, kapı, sürüş, animasyon); boştayken saniyede 2–4 kare. Gölgeler yalnızca hareket olunca yeniden hesaplanıyor, kapı tabelaları yalnızca metin değişince çiziliyor, gösterge ve tabelalar diğer sayfalardayken çizilmiyor. HUD'da **Performans** düğmesi: Yüksek / Dengeli / Tasarruf (Tasarruf'ta gölge kapalı, piksel oranı 1, en fazla 30 kare/s).
- **B24 entegrasyon zip'i:** C Kod sayfasına zip bırakılır; `…/ASW/<ASW>/src/*.c|h` yapısından ASW'ler ayrılır, `mdl_test` kopyaları atlanır, Cmn*/BSW başlıkları ortak başlık olarak paylaşılır. Dosyalar tarayıcının IndexedDB'sinde saklanır.
- **Çoklu ASW:** Seçilen ASW'ler tek sinyal alanında birlikte çalışır; bir ASW'nin çıkışı diğerinin girişine doğrudan gider (kaynak “C: <ASW>”), kalan girişler simülatörden okunur. Üretici → tüketici sırasına göre, her görev kendi periyodunda (10/20/100 ms) çağrılır.
- Yeni zip yüklenince değişiklikler isteğe göre korunur; **Değişenleri indir** yalnızca değişen dosyaları orijinal yollarıyla zip'ler.

## Rev R
- Zip yüklenince tüm ASW'ler otomatik derlenip kontrol edilir ("59/60 ASW derlendi · 1 hata: …"); hatalı ASW'ler dosya ve satırla listelenir. Derleme sonuçları önbelleğe alınır, düzenlenmeyen ASW tekrar derlenmez.
- **Tümünü çalıştır**: derlenen tüm ASW'leri birlikte simülasyona alır. **Tümünü kontrol et**: elle yeniden kontrol.
- Sol listede durum: dolu yeşil çalışıyor, boş yeşil derlendi, turuncu derlenemedi.

## Rev S
- Dosya seçme penceresindeki tür filtresi kaldırıldı (bazı sistemlerde zip görünmüyordu).
- **Klasör seç**: açılmış B24 klasörü doğrudan seçilebilir; klasör sürükle-bırak da desteklenir.
