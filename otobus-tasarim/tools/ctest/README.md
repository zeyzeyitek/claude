# C derleyicisi doğrulama (gcc ile karşılaştırma)

`ccomp.js`, index.html içindeki tarayıcı derleyicisinin aynısıdır (Node'da çalıştırmak için).

1. ASW dosyalarını `src/` klasörüne koyun (ör. `Doors_DoorsRels.c`, `_Local.c`, `_Output.c`, `_Input.h`). Kaynak kod depoya eklenmez.
2. `node gen_harness.js`: eksik başlıkları ve rastgele girişli bir test programını `ref/` altında üretir.
3. `cd ref && gcc -DMATLAB_MEX_FILE -O1 -w -I. -o h harness.c Doors_DoorsRels*.c`
4. `node diff.js 20000 1 2 3`: aynı giriş dizisini gcc programında ve tarayıcı derleyicisinde çalıştırıp tüm çıkışları adım adım karşılaştırır. `node diff2.js 1` iç durumu (B/DW/PrevZCX) da karşılaştırır.

Doors_DoorsRels için sonuç: 10 tohum × 20.000 adım, 0 fark.
