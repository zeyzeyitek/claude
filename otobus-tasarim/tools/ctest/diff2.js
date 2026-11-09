const CC=require('./ccomp.js'),fs=require('fs'),cp=require('child_process');
const files={};for(const f of fs.readdirSync('src'))files[f]=fs.readFileSync('src/'+f,'utf8');
const meta=JSON.parse(fs.readFileSync('ref/meta.json')),paths=JSON.parse(fs.readFileSync('ref/paths.json'));
const r=CC.compile(files);const seed=+process.argv[2];
const out=cp.execSync(`./ref/h 300 ${seed}`,{maxBuffer:1e9}).toString().trim().split('\n');
const G={};r.mod.$init(G);G.Doors_DoorsRels_ConstB={time:3000,time_j:500,time_jj:1500,time_a:2000};G.Doors_DoorsRels_ConstP={pooled16:[0,1,0,0,1,1,0,0,1,0,1,1,0,0,0,0]};
Object.assign(G,{DR_StsLedOff_C:0,DR_ColrLedColrls_C:1,DR_StsLedOn_C:2,DR_ColrLedYlw_C:3});r.mod.F.$DR_reset();
const names=[...meta.P,...meta.I];let st=0;
for(const line of out){const a=line.split(' ');
  if(a[0]==='I'){names.forEach((n,i)=>G[n]=+a[i+1]);r.mod.F.$DR_100ms();st++;}
  if(a[0]==='S'){const bad=[];paths.forEach((p,i)=>{const o=G[p[0]]&&G[p[0]][p[1]];const v=p[2]?(o&&typeof o==='object'?o[p[2]]:undefined):o;const jv=v==null?0:v;const cv=+a[i+1];
      if(p[3]==='real_T'?Math.abs(jv-cv)>1e-6:((jv>>>0)!==cv))bad.push(p.slice(1).join('.')+` c=${cv} js=${jv}`);});
    if(bad.length){console.log('adım',st,bad.slice(0,6));break;}}}
