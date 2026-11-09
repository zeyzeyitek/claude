// gcc ile referans derleme için eksik başlıkları ve test koşumunu üretir
const CC=require('./ccomp.js'),fs=require('fs');
const files={};for(const f of fs.readdirSync('src'))files[f]=fs.readFileSync('src/'+f,'utf8');
const r=CC.compile(files);const main=files['Doors_DoorsRels.c'];
fs.mkdirSync('ref',{recursive:true});
// alan yolları
const roots=['Doors_DoorsRels_B','Doors_DoorsRels_DW','Doors_DoorsRels_PrevZCX','Doors_DoorsRels_ConstB'];
const tree={};roots.forEach(R=>tree[R]={});
const re=/(Doors_DoorsRels_(?:B|DW|PrevZCX|ConstB))\.([A-Za-z0-9_]+)(?:\.([A-Za-z0-9_]+))?/g;let m;
while((m=re.exec(main))){const t=tree[m[1]];if(m[3]){t[m[2]]=t[m[2]]&&typeof t[m[2]]==='object'?t[m[2]]:{};t[m[2]][m[3]]=1;}else if(!t[m[2]])t[m[2]]=1;}
// &X.f geçen alt yapıların tipleri: fonksiyon çağrılarından parametre tipine
const subT={};const callRe=/(\w+)\(([^;]*?)\);/gs;
const fsig={};const fre=/^void (\w+)\(([^)]*)\)\s*\{/gms;while((m=fre.exec(main))){fsig[m[1]]=m[2].split(',').map(x=>x.trim().replace(/\s+/g,' '));}
while((m=callRe.exec(main))){const fn=m[1];if(!fsig[fn])continue;const args=[];let d=0,cur='';for(const ch of m[2]){if(ch==='('){d++;}if(ch===')'){d--;}if(ch===','&&d===0){args.push(cur.trim());cur='';continue;}cur+=ch;}args.push(cur.trim());
  args.forEach((a,i)=>{const mm=/^&(Doors_DoorsRels_(?:B|DW))\.(\w+)$/.exec(a);if(mm&&fsig[fn][i]){const ty=fsig[fn][i].split(' ')[0];subT[mm[1]+'.'+mm[2]]=ty;}});}
// alt tiplerin alanları: fonksiyon gövdesinde localB->x / localDW->x
const subFields={};const bodyRe=/^void (\w+)\(([^)]*)\)\s*\{([\s\S]*?)^\}/gm;
while((m=bodyRe.exec(main))){const params=m[2].split(',').map(x=>x.trim().replace(/\s+/g,' '));params.forEach(p=>{const mm=/^(\w+) \*(\w+)$/.exec(p);if(!mm)return;const ty=mm[1],nm=mm[2];subFields[ty]=subFields[ty]||new Set();const r2=new RegExp(nm+'->(\\w+)','g');let k;while((k=r2.exec(m[3])))subFields[ty].add(k[1]);});}
// tüm alt tiplerin alanlarını birleştir (gövdelerde ve doğrudan erişimde)
Object.entries(tree).forEach(([R,t])=>Object.entries(t).forEach(([f,v])=>{if(typeof v==='object'){const ty=subT[R+'.'+f];if(ty){subFields[ty]=subFields[ty]||new Set();Object.keys(v).forEach(k=>subFields[ty].add(k));}}}));
Object.entries(tree).forEach(([R,t])=>Object.keys(t).forEach(f=>{if(subT[R+'.'+f]&&typeof t[f]!=='object')t[f]={};}));
const fty=(ty,f)=>ty==='DW_start_Doors_DoorsRels'&&f==='UnitDelay_DSTATE'?'real_T':'uint32_T';
let h='#include "rtwtypes.h"\n#include "zero_crossing_types.h"\n#define CALIB(t,s) t\n';
Object.entries(subFields).forEach(([ty,fs])=>{h+=`typedef struct {\n${[...fs].map(f=>`  ${fty(ty,f)} ${f};`).join('\n')}\n} ${ty};\n`;});
const tn={Doors_DoorsRels_B:'B_Doors_DoorsRels',Doors_DoorsRels_DW:'DW_Doors_DoorsRels',Doors_DoorsRels_PrevZCX:'PrevZCX_Doors_DoorsRels',Doors_DoorsRels_ConstB:'ConstB_Doors_DoorsRels'};
Object.entries(tree).forEach(([R,t])=>{h+=`typedef struct {\n${Object.entries(t).map(([f,v])=>typeof v==='object'?`  ${subT[R+'.'+f]} ${f};`:`  uint32_T ${f};`).join('\n')}\n} ${tn[R]};\n`;});
h+='typedef struct { boolean_T pooled16[16]; } ConstP_Doors_DoorsRels;\n';
h+=Object.entries(tn).map(([R,T])=>`extern ${R==='Doors_DoorsRels_ConstB'?'const ':''}${T} ${R};`).join('\n')+'\nextern const ConstP_Doors_DoorsRels Doors_DoorsRels_ConstP;\n';
h+='extern uint8_T DR_StsLedOff_C,DR_ColrLedColrls_C,DR_StsLedOn_C,DR_ColrLedYlw_C;\nvoid DR_100ms(void);void DR_reset(void);void DR_init(void);\n';
fs.writeFileSync('ref/Doors_DoorsRels.h',h);
fs.writeFileSync('ref/rtwtypes.h','#ifndef RTW\n#define RTW\ntypedef unsigned char boolean_T;typedef unsigned char uint8_T;typedef signed char int8_T;typedef unsigned short uint16_T;typedef short int16_T;typedef unsigned int uint32_T;typedef int int32_T;typedef double real_T;typedef float real32_T;\n#define true 1U\n#define false 0U\n#define MAX_uint32_T ((uint32_T)(0xFFFFFFFFU))\n#endif\n');
fs.writeFileSync('ref/zero_crossing_types.h','#ifndef ZC\n#define ZC\ntypedef uint8_T ZCSigState;\n#define POS_ZCSIG 0x01U\n#define ZERO_ZCSIG 0x00U\n#endif\n');
['Doors_DoorsRels_MemMap.h','Doors_DoorsRels_types.h','Doors_DoorsRels_private.h','Doors_DoorsRels_System_Input.h'].forEach(f=>fs.writeFileSync('ref/'+f,f==='Doors_DoorsRels_types.h'?'#define CALIB(t,s) t\n':''));
// Interface: Get/Set makroları
const all=[...r.inputs,...r.params,...r.outputs];
fs.writeFileSync('ref/Doors_DoorsRels_Interface.h',all.map(n=>`#define Get_DR_100ms_${n}() (${n})\n#define Set_DR_100ms_${n}(v) (${n}=(v))`).join('\n')+'\n');
// giriş tipleri Input.h'den
const inTy={};const ire=/extern\s+(\w+)\s+(\w+);/g;while((m=ire.exec(files['Doors_DoorsRels_Input.h'])))inTy[m[2]]=m[1];
const missingIn=r.inputs.filter(n=>!inTy[n]);
// koşum
let c='#include <stdio.h>\n#include <stdlib.h>\n#include "Doors_DoorsRels.h"\n';
const defRe=/^(?:CALIB\((\w+),\w+\)|(\w+_T))\s+(\w+)/gm;for(const f of ['Doors_DoorsRels_Local.c','Doors_DoorsRels_Output.c']){let k;while((k=defRe.exec(files[f])))c+=`extern ${k[1]||k[2]} ${k[3]};\n`;}
r.inputs.forEach(n=>c+=`${inTy[n]||'uint8_T'} ${n};\n`);
c+='B_Doors_DoorsRels Doors_DoorsRels_B;DW_Doors_DoorsRels Doors_DoorsRels_DW;PrevZCX_Doors_DoorsRels Doors_DoorsRels_PrevZCX;\n'.replace(/.*/,'');
c+='const ConstB_Doors_DoorsRels Doors_DoorsRels_ConstB={'+Object.keys(tree.Doors_DoorsRels_ConstB).map((k,i)=>[3000,500,1500,2000][i]).join(',')+'};\n';
c+='const ConstP_Doors_DoorsRels Doors_DoorsRels_ConstP={{0,1,0,0,1,1,0,0,1,0,1,1,0,0,0,0}};\n';
c+='uint8_T DR_StsLedOff_C=0,DR_ColrLedColrls_C=1,DR_StsLedOn_C=2,DR_ColrLedYlw_C=3;\n';
const P=r.params,I=r.inputs,O=r.outputs;
c+=`int main(int argc,char**argv){int steps=atoi(argv[1]);unsigned seed=atoi(argv[2]);srand(seed);DR_reset();DR_init();\n`;
c+=`for(int s=0;s<steps;s++){\n`;
c+=`if(s%50==0){${P.map(n=>`${n}=(rand()%8==0)?(rand()%4):${/Nv$/.test(n)?0:(n==='DR_StsFctEna_P'?1:0)};`).join('')}}\n`;
c+=I.map(n=>{const t=inTy[n]||'uint8_T';return t==='uint16_T'?`if(rand()%10==0)${n}=rand()%300;`:t==='boolean_T'?`if(rand()%6==0)${n}=!${n};`:`if(rand()%6==0)${n}=(rand()%5==0)?(rand()%4):(rand()%2);`;}).join('')+'\n';
c+=`printf("I");${[...P,...I].map(n=>`printf(" %u",(unsigned)${n});`).join('')}printf("\\n");\nDR_100ms();printf("O %d",s);${O.map(n=>`printf(" %u",(unsigned)${n});`).join('')}printf("\\n");}\nreturn 0;}\n`;
{const paths=[];Object.entries(tree).forEach(([R,t])=>{if(R==='Doors_DoorsRels_ConstB')return;Object.entries(t).forEach(([f,v])=>{if(typeof v==='object'){const ty=subT[R+'.'+f];[...(subFields[ty]||[])].forEach(k=>paths.push([R,f,k,fty(ty,k)]));}else paths.push([R,f,null,'uint32_T']);});});
 c=c.replace('printf("\\n");}\nreturn 0;}','printf("\\n");printf("S");'+paths.map(p=>p[3]==='real_T'?`printf(" %.6f",${p[0]}.${p[1]}${p[2]?'.'+p[2]:''});`:`printf(" %u",(unsigned)${p[0]}.${p[1]}${p[2]?'.'+p[2]:''});`).join('')+'printf("\\n");}\nreturn 0;}');
 fs.writeFileSync('ref/paths.json',JSON.stringify(paths));}
fs.writeFileSync('ref/harness.c',c);{let e='';const defRe2=/^(?:CALIB\((\w+),\w+\)|(\w+_T))\s+(\w+)/gm;for(const f of ['Doors_DoorsRels_Local.c','Doors_DoorsRels_Output.c']){let k;while((k=defRe2.exec(files[f])))e+=`extern ${k[1]||k[2]} ${k[3]};\n`;}fs.writeFileSync('ref/Doors_DoorsRels_Local.h','#include "rtwtypes.h"\n'+e);}
fs.writeFileSync('ref/meta.json',JSON.stringify({I,P,O,inTy,consts:Object.keys(tree.Doors_DoorsRels_ConstB)}));
console.log('missing input types',missingIn,'consts',Object.keys(tree.Doors_DoorsRels_ConstB),'subtypes',Object.keys(subFields).length);
