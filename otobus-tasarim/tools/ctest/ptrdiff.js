const CC=require('./ccomp.js'),fs=require('fs'),cp=require('child_process');
const r=CC.compile({'p.c':fs.readFileSync('ptr/p.c','utf8')});let bad=0,n=0,first=null;
for(const seed of [1,2,3]){const out=cp.execSync(`./ptr/ph ${seed} 400`).toString().trim().split('\n');const G={};r.mod.$init(G);
  for(const l of out){const a=l.split(' ');if(a[0]==='I'){G.IN1=+a[1];G.IN2=+a[2];r.mod.F.$M_10ms();}else{n++;const got=[G.ST,G.OUT_A,G.OUT_B,G.OUT_C,G.OUT_D].map(x=>(x??0)>>>0).join(' ');const exp=a.slice(1).join(' ');if(got!==exp){bad++;if(!first)first={seed,step:n,exp,got};}}}}
console.log('adım',n,'farklı',bad,first?JSON.stringify(first):'');
