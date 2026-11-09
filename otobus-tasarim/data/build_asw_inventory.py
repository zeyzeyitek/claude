"""B24 ASW sinyal envanteri (xlsx) -> data/asw_signals.json (simülatörün Sinyaller sayfası için).
Kullanım: python3 data/build_asw_inventory.py <B24_ASW_Sinyal_Envanteri.xlsx> data/asw_signals.json"""
import sys, json, re, collections, openpyxl

FN = [  # (id, başlık, açıklama, ASW eşleşme regex)
 ('rels','Türfreigabe (kapı serbest bırakma)','Sürücünün kapıları serbest bırakması; serbest bırakma kapı bölgelerine, durak frenine ve kneeling talebine dağıtılır.',r'^Doors_DoorsRels'),
 ('auto','Otomatik kapı modu (kapı 1–4)','Serbest bırakma aktifken yolcu butonlarıyla açılma, süre sonunda otomatik kapanma ve açılma/kapanma uyarıları.',r'^(Doors_AutoD\d|D_AutoD\d_KSW)$'),
 ('strq','Durak isteği (STOP) ve Vorspeicherung','STOP butonları, durak isteğinin kaydedilmesi (Vorspeicherung), gösterge ve LED’ler.',r'^(Doors_Strq_|Doors_StopRequest_Display|Doors_StstrqRstBtnFAP_KSW)'),
 ('spec','Bebek arabası / engelli butonları','Bebek arabası (Pram/Kinderwagen) ve tekerlekli sandalye (Rolli) istekleri, sürücü butonu, gösterge ve buzzer.',r'^(Doors_PrmBtn_|Doors_WhlchrBtn_|Doors_Pram|Doors_WheelchairRequest_Display|Doors_SpecialButtons_KSW|Doors_SpclBtnBuz)'),
 ('old','Yaşlı yolcu butonu','Yaşlı yolcu (Old man) butonu ile kapı açık tutma ve ilgili LED’ler.',r'^(Doors_OldManButton|D_OldManBtn_KSW)'),
 ('man','Manuel kapı ve sürücü butonları','Sürücünün kapı butonları (K1–K4), dış sürücü butonu ve manuel açma/kapama.',r'^(Doors_Manual_D\d|Doors_DrvrBttn_KSW|Doors_ExtrDoorBtnForDrvr|Doors_ExtrDrvrBtn_KSW|D_ExtBtnForDrvr_KSW)'),
 ('basic','Temel kapı fonksiyonu','Tüm açma/kapama isteklerini birleştiren ana blok: kapı durumu, açılma isteği, blokaj, istek nedeni.',r'^(Doors_BasicFct|DoorKSWFunctions)$'),
 ('blk','Kapı blokajı ve emniyet','Kapı blokajı, elektrikli emniyet kenarı izleme ve zorla kapama.',r'^(Doors_Door\dBlk|Doors_ElecSftyEdgeMoniBlk|Doors_ForcedClsng_KSW)'),
 ('emcy','Acil açma valfleri','Kapı acil valfleri (iç/dış) ve reset.',r'^Doors_EmcyVlv_'),
 ('warn','Buzzer ve uyarı lambaları','Kapı üstü buzzer, sürücü buzzer’ı, kapı uyarı lambaları, açılma/kapanma sinyalleri ve uyarı sistemi.',r'^(Doors_Door\dBuz|Doors_DoorBuzKSW|Doors_DriverBuz|General_DriverBuz_KSW|Doors_Door\dWarnLi|D_WarnLiD\d_KSW|D_ExtWarnLiD\d_KSW|D_OpgClsngSigD\d_KSW|Warnsystem_KSW)'),
 ('led','Buton LED’leri ve karartma','Kapı butonlarının LED/arka aydınlatması ve yuvarlak buton karartma.',r'^(Doors_BtnsLedD\d_KSW|CircleButtonDimming)$'),
 ('drv','Şoför kabin kapısı','Sürücü kabin kapısı.',r'^Doors_DrvrDoor'),
 ('ramp','Rampa ve lift','Elektrikli ve manuel rampa, rampa pinleri, lift.',r'^(ElectricRamp|ManualRamp|CmnRampPin|LiftFunction)'),
 ('bsb','Durak freni','Durak freni (Haltestellenbremse) isteği ve bırakma koşulları.',r'^Doors_BusStopBrk$'),
 ('mode','Özel modlar ve ek butonlar','Gece modu, bekleme, mola (Pausenschaltung), stadyum (tüm kapılar), uzaktan kumanda, atölye ve ek fonksiyon alanları.',r'^(Doors_NightMode|Doors_Waiting|Doors_Pausenschaltung_KSW|Doors_StadiumButton|D_StadiumBtn_KSW|Doors_RdoRemCtrl|Doors_DoorWrkShpBtnKSW|Doors_AddRndBttn_KSW|Doors_AlarmBtns_KSW|D_AddFcnAreaD\d_KSW)'),
 ('bell','Yolcu zili','Yolcu zili.',r'^Doors_PassBell'),
 ('pwr','Kapı güç beslemesi','Kapı sisteminin besleme durumu.',r'^Doors_Pwr$'),
 ('com','Haberleşme ve altyapı','Gövde CAN’ı (BBCAN), gateway (kontak, hız…), FAP yöneticisi, pin yöneticisi, ağ yöneticisi ve KSW arayüzleri.',r'^(Doors_BBCAN|GatewayManagerGeneric|FAP_ManagerS2_B24|PinManagerB24|NetworkManagerB24|Doors_IntfcKSW|GenB24_IntfcKSW|BDC_DummyDDT)$'),
]

def main(src, dst):
    wb = openpyxl.load_workbook(src, data_only=True, read_only=True)
    rows = [r for r in wb['Sinyal_Listesi'].iter_rows(min_row=2, values_only=True) if r[0]]
    det = [r for r in wb['Detay'].iter_rows(min_row=2, values_only=True) if r[0]]
    notes = {r[0]: r[1] for r in wb['Notlar'].iter_rows(values_only=True) if r[0]}
    rows.sort(key=lambda r: r[0].lower())
    idx = {r[0]: i for i, r in enumerate(rows)}
    asw_names = sorted({d[0] for d in det})
    ai = {a: i for i, a in enumerate(asw_names)}
    fn_of = {}
    for a in asw_names:
        for k, (fid, *_rest, rx) in enumerate(FN):
            if re.search(rx, a): fn_of[a] = k; break
        else: raise SystemExit('fonksiyonu atanmamış ASW: ' + a)
    roles = collections.defaultdict(lambda: {'i': set(), 'o': set(), 'l': set()})
    prod = {}
    for a, f, t, s, dt, k in det:
        if s not in idx: continue
        key = {'Input': 'i', 'Output': 'o', 'Local': 'l'}[t]
        roles[a][key].add(idx[s])
        if key == 'o': prod.setdefault(s, ai[a])
    vals, vi = [], {}
    def V(x):
        if not x: return -1
        if x not in vi: vi[x] = len(vals); vals.append(x)
        return vi[x]
    S = []
    for r in rows:
        n, tr, desc, val, mn, mx, unit, dt, kind = r[:9]
        S.append([n, tr or '', desc or '', V(val), '' if mn is None else str(mn), '' if mx is None else str(mx),
                  unit or '', dt or '', 1 if kind == 'CALIB' else 0, prod.get(n, -1)])
    out = {
        'meta': {'kaynak': notes.get('Kaynak arşiv', ''), 'sinyal': len(S), 'asw': len(asw_names),
                 'not_tr': notes.get('Türkçe Yorum', ''), 'not_desc': notes.get('Açıklama (proje kaynağı)', '')},
        'fn': [{'id': f[0], 't': f[1], 'd': f[2]} for f in FN],
        'asw': [{'n': a, 'f': fn_of[a], 'i': sorted(roles[a]['i']), 'o': sorted(roles[a]['o']), 'l': sorted(roles[a]['l'])} for a in asw_names],
        'v': vals, 's': S,
    }
    json.dump(out, open(dst, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
