# Otobüs Tasarım Stüdyosu (sürüm 1.1.1)

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

## Rev T
- claude.ai çerçevesi alert/confirm pencerelerini engellediği için tüm uyarılar sayfa içi bildirime, onaylar sayfa içi onay kutusuna taşındı.
- Zip dosya adına değil içeriğine (ilk baytlar) bakılarak tanınır; 7z/rar/gz arşivleri için açıklayıcı mesaj.
- Motor sesi yenilendi: 6 silindirli dizel (ateşleme frekansı = devir/60×3), yumuşak harmonikler, yanma gürültüsü, dizel tıkırtısı, devirle turbo ıslığı; parametreler kademeli değişir (cızırtı yok); içeride daha boğuk. Marş ve kapı motoru sesleri yumuşatıldı.

## Rev U
- Derleme arka plan işçisinde (Web Worker) yapılır; toplu derleme sırasında sayfa donmaz (60 ASW: 1,9 s, 50 ms üstü donma yok). İşçi açılamazsa ana iş parçacığında ASW ASW devam eder; 45 s aşan derleme atlanır.
- Ortak başlıklardaki extern tipleri bir kez taranır (her ASW için tekrar taranmaz).
- Depolama ASW başına ayrı kayıt: kod düzenlenince yalnızca o ASW yazılır (eskiden tüm B24). Eski kayıtlar otomatik taşınır.
- Grafik kaydı yalnızca grafikteki, testlerdeki ve yan paneldeki sinyalleri tutar (Tümünü çalıştır ile binlerce sinyal kaydedilip bellek doluyordu). Büyük sinyal tablosu 0,5 s aralıkla güncellenir.
- Ölçüm: 59 ASW birlikte çalışırken JS yükü %1,4-2, bellek 15-26 MB.

## Rev V
- **BSW/MCAL başlıkları**: derleyiciye özel yapılar (IFX_INLINE, FUNC/P2VAR gibi AUTOSAR makroları, `__asm`, `#pragma`, işlemci komutları) tanınıyor veya atlanıyor. Başlıklardaki çözülemeyen tanımlar uyarı olarak geçiliyor (ASW .c dosyalarındaki hatalar hâlâ hata). Yalnızca .c'deki fonksiyonlar ve onların çağırdıkları derleniyor; başlıklardaki kullanılmayan inline/asm fonksiyonlar atlanıyor. AUTOSAR Platform_Types tipleri (uint8, boolean…) yerleşik.
- **Araç modu**: Tümünü çalıştır'da G/Ç katmanı (PinManager, FAP_Manager, NetworkManager, BDC_Dummy) hariç tüm ASW'ler çalışır. Simülatör ham gateway girişlerini (GW_StClmp15, GW_SpdLess1, GW_StPrkgBrkEngd…) ve kapı kontrolcüsü CAN geri bildirimini (BD12_StDoor2_IC, kalibrasyon, ışık bariyeri, konum) verir. Doors_BBCAN'ın CAN komutları (BD12_ReqDoor2Opg_OC, …Clsng_OC) kapıları sürer; simülatörün kendi kapı kararları devre dışı kalır. DBSBR_StBstbrkReq durak frenini sürer.
- Nv/_P girilmezse fonksiyonlar koddaki gibi kapalı kalır (ör. DR_StsFctEna_P = 0 → Türfreigabe açılmaz).
- Araç modunda otomatik test sonucuna uyarı: karar simülatör akışına göre, kapı sinyallerini grafikte kontrol edin.

## Rev W
- **C dosyalarını seç**: birden çok ASW’nin .c/.h dosyaları tek seferde seçilir, dosya adından ASW’lere ayrılır (…_Local/_Output/_Input/_data/… ekleri), ASW’ye ait olmayan başlıklar ortak başlık olur. **Tüm kodu sil** ve **Bu ASW’yi sil** düğmeleri.
- Derleyici durmak yerine uyarıyla devam eder: tanımı olmayan fonksiyonlar (RTE/kütüphane) 0 döndürür, memset/memcpy desteklenir, metin sabitleri ve bilinmeyen tip adlı dönüşümler kabul edilir, adım fonksiyonu adından anlaşılamazsa parametresiz kök fonksiyonlar 100 ms adım sayılır.

## Rev X
- Önişlemci: birden çok satıra yayılan makro çağrıları açılıyor (ör. Gtm.h GTM_SFR_RUNTIME_USER_MODE_MODIFY32). Başlıklarda açılamayan makro derlemeyi durdurmaz, uyarı olur.
- Düzeltme: `#define X (0U)` gibi adı ile parantez arasında boşluk olan tanımlar yanlışlıkla fonksiyon makrosu sayılıyordu; bu sabitler 0 kalıyordu.

## Rev Y
- Simulink S-Function dosyaları (S_FUNCTION_NAME / simstruc.h / mdlInitializeSizes, ör. ButtonBlock.c) ECU koduna girmediği için otomatik atlanır; asıl mantık …_wrapper.c dosyasında derlenir.
- ASW’nin ana model dosyası dışındaki bir .c dosyası (ör. donanım okuyan KSWpinningReadPwmInput.c) derlenemezse ASW durmaz; dosya atlanır ve “derlemeye alınmadı” listesinde gösterilir. Ana model dosyasındaki hatalar yine hata olarak gösterilir.

## Rev Z
- İşaretçi desteği: `&değişken` (yerel, global, yapı alanı, dizi elemanı), `*p = …`, `p[i]`, `p->alan`, `(*p).alan`, işaretçi üzerinden ++. Örn. Dem_GetEventStatus(id, &status) ve S-Function wrapper çıkışları (y0[0] = …). gcc ile karşılaştırma: tools/ctest/ptr (1200 adım, 0 fark).
- Ana model dışındaki dosyada simülasyona çevrilemeyen fonksiyon ASW’yi durdurmaz; uyarı verir, çağrıldığında 0 döndürür.

## Rev AA
- Adsız parametreli fonksiyon tanımları (`void f(uint8 a, uint8)`) ve okunamayan parametre adları artık benzersiz adlandırılıyor (önceden “Duplicate parameter name” iç hatası).
- Her fonksiyonun üretilen kodu tek tek doğrulanıyor; ana model dışındaki dosyada çevrilemeyen fonksiyon 0 döndüren taslak olur, ana dosyada ise hata fonksiyon adı ve satırla gösterilir.

## Rev AB
- Başlıklardaki `static inline` fonksiyonlar (ör. Mcal_WdtCalcSeqPassword) birden çok .c dosyasına dahil edilince “iki kez tanımlanmış” hatası vermiyor. Farklı .c dosyalarında aynı adlı fonksiyon varsa ilki kullanılır ve uyarı verilir.

## Rev AC
- **Kapı tipleri**: her kapı IST (içe salınımlı), AST (dışa salınımlı) veya SST (sürgülü-salınımlı) olabilir; varsayılan K1 IST, K2 SST, K3 AST. Yan panel → Sinyal → Kapı tipleri’nden değiştirilir, tarayıcıda saklanır. SST kanatları önce dışarı çıkar sonra gövde boyunca kayar; yalnızca IST kanatları içeride geçişi engeller.
- Yalnızca bildirimi olan, gövdesi yüklenen dosyalarda bulunmayan fonksiyonlar (ör. KSWpinningWriteDigitalOutput) hata yerine uyarı verir ve 0 döndürür.

---
# Sürümler ve yama notları
Bundan sonra her güncelleme bir sürüm numarası alır: 1.1.0, 1.1.1 … 1.1.9, sonra 1.2.0. Yama notları uygulamada sol üstteki “Sürüm” bağlantısından da okunur.

## 1.1.1 · 10.11.2026
- **Kapı başına hava sistemi**: her kapının kendi tankı var. Hareket başına 0,45 bar yalnızca o kapının tankından düşer; 5,5 bar altında yalnızca o kapı POWERLESS olur. Kompresör (motor çalışırken) her tankı 0,35 bar/s doldurur. Yan panel → Sinyal → Kapı hava sistemleri: kapı başına “Hava ver” ve “Kaçak” (0,5 bar/s). Sinyaller: `DC1_PAirDoor1`, `DC2_PAirDoor2`, `DC3_PAirDoor3` (mbar); `GW_PAirCirc4` en düşük tankı gösterir.
- **Elektrikli rampa (kapı 2), gereksinime uygun**:
  - 2021.29298 / 2025.03165: rampa yalnızca kapı 2 kapalı, hız < 1 km/h, anahtar 1 ve kapıda arıza yokken hareket eder. Kapı açıkken istek reddedilir. Rampa hareket ederken kapı 2 açılmaz.
  - 2021.29299: RAMPA basılı tutulunca rampa çıkar; tam açılmadan bırakılırsa geri toplanır. Tam açıkken bir kez basılınca toplanır.
  - 2021.29301-03: rampa anahtarı 0 kapalı, 1 açık, 2 acil mod (motor sürülmez, göstergede RAMPA ACİL).
  - 2021.29315, 2025.03167/03168, 2023.03730: hareket ederken buzzer ve yanıp sönen LED, tam açıkken sürekli LED, rampa tam kapalı değilken kapı 2 uyarı lambası sinyali.
  - Basılı tutma: 3D butonda fareyi basılı tut, yan paneldeki “RAMPA · basılı tut” ya da klavyede R.
- **Manuel rampa (kapı 3)**: kapı açıkken rampa açıksa kapanma engeli (2021.29327, 2025.03111, 2021.19039); kapı kapalıyken rampa kapalı değilse açılma engeli (2025.02180, 2025.03112); rampa açıkken durak freni (2025.02179) ve göstergede engelli sembolü (2023.08582, 2021.29335). `MR_CfgDoorBlkgDisNv` ile engeller kapatılır (2021.29329). Rampaya tıklayınca açılır / kapanır.
- **Otomatik testler**: `eramp` (9 adım), `rampkey`, `mramp`. Eski `ramp29327` testi (elektrikli rampayla kapanma engeli) gereksinimler manuel rampa için olduğundan `mramp`’a taşındı.
- **Parametre listesi sayfası** (`#parametre`):
  - NV veritabanı: `data/nv_params.json`, reserved-parameters Excel’inden `python3 data/build_nv_params.py <excel.xlsx>` ile üretilir. Yeni Excel sayfadan da yüklenebilir (SheetJS, tarayıcıda saklanır).
  - Eşleşme: C kodundaki `…Nv` = Excel **ASW Name** → aynı satırın **Reserve Name**’i = `PARA_NAME` (BSW adı); LID = Address, ofset = Byte, bit, tip.
  - Filtreler: C kodundaki NV’ler (varsayılan), değeri ≠ 0, Excel’de Active = yes, tümü, araç listesinden içe aktarılanlar. ECU (SG) seçimi solda.
  - Araç parametre listesi içe aktarma: `PARA_NAME` Excel’de aranır, `BESCHREIBUNG` (yoksa `PARAWERT` / `PARAMASKE`) değer olarak NV’ye yazılır; C kodu bu değerle çalışır.
  - Liste üretme: seçili satırlardan `[AANN_PARA_n]` bölümleri (SG, SACHNR_PSW, PARA_NAME, LOCAL_ID, LOCAL_ID_OFFSET, KENNWERT_BIT_LAENGE, DATATYP, PARALAENGE, PARAMASKE, PARAWERT, BESCHREIBUNG), CRLF, `.txt` indirme ya da kopyalama.
  - VARSAYIM: örnekte yalnızca uint16 (ofset 0) vardı. bool için `PARAMASKE` = bit maskesi, `PARAWERT` = değer × maske; ofset onaltılık. İkisi de “Liste ayarları”ndan değiştirilebilir.

## 1.1.0 · 10.11.2026
- Sürüm numarası ve yama notları.
- AST kapı: kanatlar dışarı doğru yay çizerek açılır, kapı boşluğunun yanında gövdeye paralel durur.
- Elektrikli rampa: kapı 2 zemininin altından dışarı kayar, kaldırıma eğilir; kapı kapalıysa önce kapı açılır.
- Kapı havası: motor çalışmazken her kapı hareketi 0,45 bar harcar (başlangıç 8,5 bar). 5,5 bar altında kapılar POWERLESS + hata (CAN durum 5, BDxx_ErrDoorx_IC = 1), buzzer ve göstergede sürekli uyarı. Motor çalışınca kompresör 0,35 bar/s doldurur; HUD’daki “Hava” butonu devreye hava verir. 6,5 bar üstünde kapılar kendiliğinden toparlanır. Sinyaller: GW_PAirCirc4(On), GW_PAirSplyLo(On).
