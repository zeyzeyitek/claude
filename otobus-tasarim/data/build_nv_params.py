"""Reserved-parameters Excel export -> data/nv_params.json

Kullanım: python3 data/build_nv_params.py <reserved-parameters.xlsx> [çıkış.json]
Her ECU sayfasındaki satırlar (Reserve Name = BSW PARA_NAME, ASW Name = C kodundaki Nv)
tek bir tabloya toplanır. Sayfa biçimi: 'eIO-Bxx vN', başlık satırı 1.
"""
import json, sys, re, datetime
import openpyxl

COLS = ['ecu', 'reserve', 'asw', 'alt', 'addr', 'byte', 'bit', 'type', 'isRes', 'active', 'nvm', 'src', 'plant']

def main(src, out):
    wb = openpyxl.load_workbook(src, read_only=True, data_only=True)
    rows, ecus = [], {}
    for ws in wb.worksheets:
        m = re.match(r'^(eIO-B\d+)\s+v(\d+)$', ws.title)
        if not m:
            continue
        ecu, ver = m.group(1), int(m.group(2))
        it = ws.iter_rows(values_only=True)
        head = [str(h or '').strip() for h in next(it)]
        ix = {h: i for i, h in enumerate(head)}
        def g(r, k):
            i = ix.get(k)
            v = r[i] if i is not None and i < len(r) else None
            return v.strip() if isinstance(v, str) else v
        n = 0
        for r in it:
            if not g(r, 'Reserve Name'):
                continue
            yn = lambda k: 1 if str(g(r, k) or '').lower() == 'yes' else 0
            rows.append([ecu, g(r, 'Reserve Name'), g(r, 'ASW Name') or '', g(r, 'Alt ASW Name') or '',
                         str(g(r, 'Address') or ''), int(g(r, 'Byte') or 0), int(g(r, 'Bit') or 0),
                         g(r, 'Type') or '', yn('IsReserved'), yn('Active'), yn('NVM'),
                         g(r, 'SRC') or '', g(r, 'Plant') or ''])
            n += 1
        ecus[ecu] = {'ver': ver, 'rows': n}
    data = {'source': src.split('/')[-1], 'built': datetime.datetime.now().strftime('%Y-%m-%d %H:%M'),
            'ecus': ecus, 'cols': COLS, 'rows': rows}
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
    print(f'{len(rows)} satır, {len([e for e in ecus.values() if e["rows"]])} ECU dolu → {out}')

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else 'data/nv_params.json')
