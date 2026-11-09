const CC=require('./ccomp.js'),fs=require('fs'),cp=require('child_process');
const files={};for(const f of fs.readdirSync('src'))files[f]=fs.readFileSync('src/'+f,'utf8');
const meta=JSON.parse(fs.readFileSync('ref/meta.json'));
const r=CC.compile(files);
let fails=0,total=0;
for(const seed of process.argv.slice(3).map(Number)){
  const out=cp.execSync(`./ref/h ${process.argv[2]} ${seed}`,{maxBuffer:1e9}).toString().trim().split('\n');
  const G={};r.mod.$init(G);
  G.Doors_DoorsRels_ConstB={time:3000,time_j:500,time_jj:1500,time_a:2000};
  G.Doors_DoorsRels_ConstP={pooled16:[0,1,0,0,1,1,0,0,1,0,1,1,0,0,0,0]};
  Object.assign(G,{DR_StsLedOff_C:0,DR_ColrLedColrls_C:1,DR_StsLedOn_C:2,DR_ColrLedYlw_C:3});
  // gcc tarafında struct ve global'ler sıfırla başlar: aynı
  r.mod.F['$DR_reset']();r.mod.F['$DR_init']();
  const names=[...meta.P,...meta.I];let step=0,firstFail=null;
  for(const line of out){const a=line.split(' ');
    if(a[0]==='I'){names.forEach((n,i)=>G[n]=+a[i+1]);r.mod.F['$DR_100ms']();step++;}
    else if(a[0]==='O'){total++;const exp=a.slice(2).map(Number);const got=meta.O.map(n=>(G[n]??0)>>>0);
      const bad=meta.O.filter((n,i)=>exp[i]!==got[i]);if(bad.length){fails++;if(!firstFail)firstFail={seed,step:a[1],bad:bad.map(n=>`${n} c=${exp[meta.O.indexOf(n)]} js=${got[meta.O.indexOf(n)]}`)};}}}
  if(firstFail)console.log('İLK FARK',JSON.stringify(firstFail));
  // ilgi: kaç adımda DR_StDoorRelsActv=1 oldu
}
console.log('adım',total,'farklı adım',fails);
