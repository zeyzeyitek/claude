import re,json,collections
raw=open('raw.txt').read()
raw=raw[raw.index('REQ: 2021.16224'):]
parts=re.split(r'(?:^|\n)(?=REQ: \d{4}\.\d{5} / )',raw)
out=[]
for p in parts:
    m=re.match(r'REQ: (\d{4}\.\d{5}) / ([^\t]*?)\t(.*)',p,re.S)
    if not m: continue
    rid,rev,txt=m.group(1),m.group(2).strip(),m.group(3).strip()
    if txt.startswith('"') and txt.endswith('"'): txt=txt[1:-1]
    txt=txt.replace('""','"').replace('\r','')
    txt=re.sub(r'[ \t]+\n','\n',txt).strip()
    out.append(dict(id=rid,rev=rev,text=txt))
# categories
for r in out:
    t=r['text'];tl=t.lower()
    if re.match(r'(cancel+ed|cancel:|canceled|deleted)',tl.strip()) : r['cat']='cancel'
    elif tl.startswith('name type min max'): r['cat']='param'
    elif tl.startswith('test case result'): r['cat']='test'
    elif tl.startswith('functional or nonfunctional'): r['cat']='meta'
    else: r['cat']='req'
RULES=[
 ('e2e',[r'\be2e\b',r'crc',r'sensor correlation']),
 ('kitchen',[r'kitchen',r'refrigerator',r'plug socket',r'transformer',r'hostess call']),
 ('toilet',[r'toilet',r'\bwc\b']),
 ('panic',[r'panic']),
 ('video',[r'video',r'monitor',r'camera',r'ibmo_',r'ibv_',r'splitbox']),
 ('pis',[r'destination display',r'passenger info',r'seatbelt display',r'temperature display',r'stop request display',r'ibis']),
 ('roof',[r'roof hatch',r'lifting roof']),
 ('fire',[r'fire (alarm|detect|extingu|protection)',r'fog-maker',r'\bfa_']),
 ('hammer',[r'emergency hammer',r'ehuw']),
 ('ignition',[r'ignition bypass',r'ignition taster',r'ignition schalter',r'engine start',r'engine stop',r'motor start',r'g_15_']),
 ('fair',[r'trade fair',r'fair trade']),
 ('waiting',[r'^.{0,3}waiting room',r'waiting room (mode (shall be|deactivation)|button|functionality)']),
 ('ramp',[r'\bramp\b',r'\blift\b',r'kneeling',r'lowering request',r'normal level request']),
 ('elderly',[r'old man']),
 ('special',[r'wheelchair',r'\bpram\b',r'special (stop )?button',r'special buttons']),
 ('extlight',[r'entrance illumination',r'entrance light',r'external light',r'\bedl\b',r'staircase',r'step ?edge',r'mirror light',r'door entrance']),
 ('light',[r'ambient',r'reading light',r'cleaning light',r'driver area',r'driver place light',r'driver.s lighting',r'payment',r'hostess (knee )?light',r'hostess lighting',r'night light',r'euro box',r'interior light',r'lighting']),
 ('lock',[r'central lock',r'luggage',r'\bflap',r'\bzv\b',r'driver door lock',r'unlock']),
 ('hvac',[r'heating',r'heater',r'air condition',r'hvac',r'compressor',r'circulation pump',r'aeration',r'roof ventilat',r'air flap',r'recirculat',r'ventilation',r'clima',r'temperature controller',r'eldi',r'hot water']),
 ('stop',[r'stop request',r'stop demand',r'stop button']),
 ('door',[r'\bdoor',r'bus stop brake',r'\bhsb\b',r'emergency valve',r'light barrier',r'buzzer above',r'warning lamp',r'wing']),
 ('remote',[r'radio remote']),
 ('horn',[r'air horn']),
 ('ewc',[r'\bewc\b']),
 ('sleep',[r'sleeping cabin',r'sleep cabin']),
 ('fap',[r'\bfap system',r'eio',r'function_eio']),
 ('floor',[r'floor hatch']),
]
def scores(t):
    tl=t.lower();sc={}
    for i,(g,pats) in enumerate(RULES):
        n=sum(len(re.findall(p,tl)) for p in pats)
        n*= {'door':0.5,'elderly':3,'extlight':2,'stop':1.5,'special':1.5,'light':1.2}.get(g,1)
        if n: sc[g]=n
    return sc
prev='other'
for r in out:
    sc=scores(r['text'])
    if r['cat']!='req' and r['cat']!='param': sc={}
    if prev in sc: sc[prev]+=1.5
    if sc:
        order=[g for g,_ in RULES]
        g=max(sc,key=lambda k:(sc[k],-order.index(k) if k in order else -99))
    else: g=prev
    r['group']=g;prev=g
# split remark
for r in out:
    t=r['text'];i=t.find('Remark')
    if r['cat']=='req' and i>20:
        r['en']=t[:i].strip();r['remark']=t[i:].strip()
    else: r['en']=t;r['remark']=''
    toks=sorted(set(re.findall(r'\b[A-Z][A-Za-z0-9]*_[A-Za-z0-9_]*[A-Za-z0-9]\b',t)))
    r['sig']=toks
json.dump(out,open('reqs.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(out),collections.Counter(r['cat'] for r in out))
print(collections.Counter(r['group'] for r in out if r['cat']=='req').most_common())
allt=collections.Counter(t for r in out for t in r['sig']);print(len(allt))
