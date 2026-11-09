/* ===== Tarayıcı içi C derleyicisi (Simulink/ERT üretilmiş kod alt kümesi → JavaScript) ===== */
const CC=(()=>{
const KW=new Set(['if','else','switch','case','default','break','continue','return','for','while','do','goto','typedef','struct','union','enum','sizeof','static','extern','const','volatile','register','inline','auto','signed','unsigned','void','char','short','int','long','float','double','_Bool']);
const PUN=['>>=','<<=','...','->','++','--','&&','||','==','!=','<=','>=','<<','>>','+=','-=','*=','/=','%=','&=','|=','^=','##','{','}','(',')','[',']',';',',','.','?',':','=','<','>','+','-','*','/','%','&','|','^','!','~','#'];
const T=(k,bits,signed)=>({k,bits,signed});
const TY={bool:T('bool',8,false),u8:T('int',8,false),i8:T('int',8,true),u16:T('int',16,false),i16:T('int',16,true),u32:T('int',32,false),i32:T('int',32,true),f64:T('float',64),f32:T('float',32),void:T('void'),unk:T('unk')};
const BUILTIN_TYPEDEF={boolean_T:TY.bool,uint8_T:TY.u8,int8_T:TY.i8,uint16_T:TY.u16,int16_T:TY.i16,uint32_T:TY.u32,int32_T:TY.i32,real_T:TY.f64,real64_T:TY.f64,time_T:TY.f64,real32_T:TY.f32,int_T:TY.i32,uint_T:TY.u32,char_T:TY.i8,uchar_T:TY.u8,byte_T:TY.u8,ZCSigState:TY.u8,ZCEventType:TY.i32,ulong_T:TY.u32,long_T:TY.i32,bool:TY.bool};
const BUILTIN_DEF={true:'1',false:'0',TRUE:'1',FALSE:'0',NULL:'0',MAX_uint32_T:'4294967295U',MAX_uint16_T:'65535U',MAX_uint8_T:'255U',MAX_int32_T:'2147483647',MIN_int32_T:'(-2147483647-1)',MAX_int16_T:'32767',MIN_int16_T:'(-32768)',MAX_int8_T:'127',MIN_int8_T:'(-128)',
  POS_ZCSIG:'1U',ZERO_ZCSIG:'0U',NEG_ZCSIG:'2U',UNINITIALIZED_ZCSIG:'3U',FALLING_ZCEVENT:'(-1)',NO_ZCEVENT:'0',RISING_ZCEVENT:'1'};
const MATH={fabs:'Math.abs',floor:'Math.floor',ceil:'Math.ceil',sqrt:'Math.sqrt',pow:'Math.pow',sin:'Math.sin',cos:'Math.cos',tan:'Math.tan',exp:'Math.exp',log:'Math.log',log10:'Math.log10',atan2:'Math.atan2',atan:'Math.atan',fmod:'((a,b)=>a%b)',rt_roundd:'Math.round',fmax:'Math.max',fmin:'Math.min',abs:'Math.abs'};
class CErr extends Error{constructor(msg,tok){super(msg);this.file=tok&&tok.f;this.line=tok&&tok.l;}}

/* ---------- lexer ---------- */
function lex(src,file){
  const out=[];let i=0,l=1;const n=src.length;
  while(i<n){const c=src[i];
    if(c==='\n'){out.push({t:'nl',f:file,l});l++;i++;continue;}
    if(c===' '||c==='\t'||c==='\r'||c==='\f'||c==='\v'){i++;continue;}
    if(c==='\\'&&src[i+1]==='\n'){i+=2;l++;continue;}
    if(c==='\\'&&src[i+1]==='\r'&&src[i+2]==='\n'){i+=3;l++;continue;}
    if(c==='/'&&src[i+1]==='*'){const e=src.indexOf('*/',i+2);const end=e<0?n:e+2;for(let k=i;k<end;k++)if(src[k]==='\n')l++;i=end;continue;}
    if(c==='/'&&src[i+1]==='/'){while(i<n&&src[i]!=='\n')i++;continue;}
    if(/[A-Za-z_]/.test(c)){let j=i+1;while(j<n&&/[A-Za-z0-9_]/.test(src[j]))j++;out.push({t:'id',v:src.slice(i,j),f:file,l});i=j;continue;}
    if(/[0-9]/.test(c)||(c==='.'&&/[0-9]/.test(src[i+1]))){let j=i;
      if(c==='0'&&/[xX]/.test(src[i+1])){j=i+2;while(j<n&&/[0-9a-fA-F]/.test(src[j]))j++;}
      else{while(j<n&&/[0-9.]/.test(src[j]))j++;if(/[eE]/.test(src[j])){j++;if(/[+-]/.test(src[j]))j++;while(j<n&&/[0-9]/.test(src[j]))j++;}}
      let k=j;while(k<n&&/[uUlLfF]/.test(src[k]))k++;out.push({t:'num',v:src.slice(i,k),f:file,l});i=k;continue;}
    if(c==='"'||c==="'"){let j=i+1;while(j<n&&src[j]!==c){if(src[j]==='\\')j++;j++;}out.push({t:c==='"'?'str':'chr',v:src.slice(i,j+1),f:file,l});i=j+1;continue;}
    let p=PUN.find(p=>src.startsWith(p,i));if(!p)throw new CErr(`Tanınmayan karakter “${c}”`,{f:file,l});
    out.push({t:'p',v:p,f:file,l});i+=p.length;}
  out.push({t:'nl',f:file,l});return out;}

/* ---------- önişlemci ---------- */
function preprocess(files,mainName,ctx){
  const macros=new Map();
  Object.entries(BUILTIN_DEF).forEach(([k,v])=>macros.set(k,{body:lex(v,'<builtin>').filter(t=>t.t!=='nl')}));
  macros.set('CALIB',{params:['t','s'],body:lex('t','<builtin>').filter(t=>t.t!=='nl')});
  const out=[];const stackInc=[];
  function expand(toks,hide){const res=[];
    for(let i=0;i<toks.length;i++){const t=toks[i];
      if(t.t!=='id'||hide.has(t.v)||!macros.has(t.v)){res.push(t);continue;}
      const m=macros.get(t.v);
      if(!m.params){const h=new Set(hide);h.add(t.v);res.push(...expand(m.body.map(b=>({...b,f:t.f,l:t.l})),h));continue;}
      if(!(toks[i+1]&&toks[i+1].v==='(')){res.push(t);continue;}
      let d=0,j=i+1;const args=[[]];
      for(;j<toks.length;j++){const a=toks[j];if(a.v==='('){if(d++>0)args[args.length-1].push(a);continue;}
        if(a.v===')'){if(--d===0)break;args[args.length-1].push(a);continue;}
        if(a.v===','&&d===1){args.push([]);continue;}args[args.length-1].push(a);}
      if(j>=toks.length)throw new CErr(`Makro ${t.v} için kapanmayan parantez`,t);
      if(m.params.length===1&&args.length===1&&!args[0].length)args.length=0;
      const ea=args.map(a=>expand(a,hide));const body=[];const MB=m.body;
      for(let q=0;q<MB.length;q++){const b=MB[q];
        if(b.v==='#'&&MB[q+1]&&MB[q+1].t==='id'&&m.params.includes(MB[q+1].v)){const k=m.params.indexOf(MB[q+1].v);body.push({t:'str',v:JSON.stringify((args[k]||[]).map(x=>x.v).join(' ')),f:t.f,l:t.l});q++;continue;}
        const k=b.t==='id'?m.params.indexOf(b.v):-1;const pasteNear=(MB[q+1]&&MB[q+1].v==='##')||(MB[q-1]&&MB[q-1].v==='##');
        if(k>=0)body.push(...((pasteNear?args[k]:ea[k])||[]).map(x=>({...x})));else body.push({...b,f:t.f,l:t.l});}
      for(let q=1;q<body.length-1;q++){if(body[q].v==='##'&&body[q].t==='p'){const a=body[q-1],c=body[q+1];const nt=lex(String(a.v)+String(c.v),t.f).filter(x=>x.t!=='nl').map(x=>({...x,f:t.f,l:t.l}));body.splice(q-1,3,...nt);q--;}}
      const h=new Set(hide);h.add(t.v);res.push(...expand(body,h));i=j;}
    return res;}
  function evalCond(toks){const tt=[];
    for(let i=0;i<toks.length;i++){const t=toks[i];
      if(t.t==='id'&&t.v==='defined'){let nm;if(toks[i+1]&&toks[i+1].v==='('){nm=toks[i+2].v;i+=3;}else{nm=toks[i+1].v;i++;}tt.push({t:'num',v:macros.has(nm)?'1':'0'});continue;}tt.push(t);}
    const ex=expand(tt,new Set()).map(t=>t.t==='id'?{t:'num',v:'0'}:t);
    let s=ex.map(t=>t.t==='num'?String(parseInt(t.v.replace(/[uUlL]+$/,''))):t.v).join(' ');
    if(/[^0-9\s()+\-*/%<>=!&|~^?:]/.test(s))return false;
    try{return !!Function('return ('+s.replace(/&&/g,'&&').replace(/!(?!=)/g,'!')+')')();}catch(e){return false;}}
  function run(name){
    if(stackInc.includes(name)||stackInc.length>40)return;
    const src=files.get(name);if(src==null){ctx.missingInc.add(name);return;}
    stackInc.push(name);const toks=lex(src,name);const cond=[];let line=[];
    const active=()=>cond.every(c=>c.on);
    for(const t of toks){if(t.t!=='nl'){line.push(t);continue;}
      const L=line;line=[];if(!L.length)continue;
      if(L[0].v==='#'){const d=L[1]&&L[1].v,rest=L.slice(2);
        if(d==='ifdef'||d==='ifndef'){const on=macros.has(rest[0]&&rest[0].v);const v=d==='ifdef'?on:!on;cond.push({on:active()?v:false,taken:v,par:active()});continue;}
        if(d==='if'){const v=active()&&evalCond(rest);cond.push({on:v,taken:v,par:active()});continue;}
        if(d==='elif'){const c=cond[cond.length-1];if(!c)throw new CErr('#elif eşleşmiyor',L[0]);if(c.taken||!c.par){c.on=false;}else{const v=evalCond(rest);c.on=v;c.taken=v;}continue;}
        if(d==='else'){const c=cond[cond.length-1];if(!c)throw new CErr('#else eşleşmiyor',L[0]);c.on=c.par&&!c.taken;c.taken=true;continue;}
        if(d==='endif'){cond.pop();continue;}
        if(!active())continue;
        if(d==='include'){let nm=rest.map(x=>x.v).join('');nm=nm.replace(/^["<]|[">]$/g,'');run(nm.split('/').pop());continue;}
        if(d==='define'){const nm=rest[0]&&rest[0].v;if(!nm)continue;rest.forEach((x,i)=>{if(x.v==='#'&&rest[i+1]&&rest[i+1].v==='#'){x.v='##';rest.splice(i+1,1);}});
          if(rest[1]&&rest[1].v==='('&&rest[1].l===rest[0].l&&isAdj(rest[0],rest[1],src)){let j=2;const ps=[];while(j<rest.length&&rest[j].v!==')'){if(rest[j].t==='id')ps.push(rest[j].v);j++;}
            macros.set(nm,{params:ps,body:rest.slice(j+1)});}
          else{macros.set(nm,{body:rest.slice(1)});if(nm==='RUNNABLE_ID'&&rest[1])ctx.runnables.add(rest[1].v);}
          continue;}
        if(d==='undef'){if(rest[0])macros.delete(rest[0].v);continue;}
        continue;}
      if(!active())continue;
      out.push(...expand(L,new Set()));}
    stackInc.pop();}
  function isAdj(a,b,src){return true;}
  run(mainName);return out;}

/* ---------- ayrıştırıcı ---------- */
function parse(toks,ctx){
  let p=0;const peek=(o=0)=>toks[p+o]||{t:'eof',v:'<eof>'},next=()=>toks[p++]||{t:'eof',v:'<eof>'};
  for(let i=0;i<toks.length;i++){const t=toks[i];if(t.t==='id'&&(t.v==='__attribute__'||t.v==='__declspec'||t.v==='__asm__'||t.v==='asm')&&toks[i+1]&&toks[i+1].v==='('){let d=0,j=i+1;for(;j<toks.length;j++){if(toks[j].v==='(')d++;else if(toks[j].v===')'&&--d===0)break;}toks.splice(i,j-i+1);i--;continue;}
    if(t.t==='id'&&['__inline','__inline__','__restrict','__restrict__','restrict','__extension__','__volatile__','__const'].includes(t.v)){toks.splice(i,1);i--;}}
  const is=v=>peek().v===v&&peek().t!=='str';
  const expect=v=>{const t=next();if(t.v!==v)throw new CErr(`“${v}” bekleniyordu, “${t.v}” bulundu`,t);return t;};
  const typedefs=ctx.typedefs;
  const isTypeStart=(o=0)=>{const t=peek(o);if(t.t!=='id')return false;
    if(['static','extern','const','volatile','register','inline','auto','signed','unsigned','void','char','short','int','long','float','double','_Bool','struct','union','enum','typedef'].includes(t.v))return true;
    return typedefs.has(t.v);};
  const looksDecl=()=>{if(isTypeStart())return true;const a=peek(),b=peek(1),c=peek(2);
    if(a.t==='id'&&!KW.has(a.v)&&b.t==='id'&&!KW.has(b.v))return true;
    if(a.t==='id'&&!KW.has(a.v)&&b.v==='*'&&c.t==='id'&&(peek(3).v===';'||peek(3).v===','||peek(3).v==='='||peek(3).v===')'))return true;
    return false;};
  function parseBaseType(){let storage=null,signed=null,base=null,cnt={short:0,long:0};const tok=peek();
    for(;;){const t=peek();if(t.t!=='id')break;
      if(['static','extern','register','inline','auto','typedef'].includes(t.v)){storage=storage||t.v;next();continue;}
      if(['const','volatile'].includes(t.v)){next();continue;}
      if(t.v==='signed'||t.v==='unsigned'){signed=t.v==='signed';next();continue;}
      if(t.v==='short'||t.v==='long'){cnt[t.v]++;next();continue;}
      if(base)break;
      if(['void','char','int','float','double','_Bool'].includes(t.v)){base=t.v;next();continue;}
      if(t.v==='struct'||t.v==='union'){next();base=parseStruct();continue;}
      if(t.v==='enum'){next();base=parseEnum();continue;}
      if(signed===null&&!cnt.short&&!cnt.long&&!KW.has(t.v)){base={name:t.v};next();continue;}
      break;}
    let ty;
    if(base&&typeof base==='object'&&base.name){ty=typedefs.get(base.name)||{k:'struct',name:base.name,fields:null};}
    else if(base&&typeof base==='object'){ty=base;}
    else if(base==='void')ty=TY.void;else if(base==='float')ty=TY.f32;else if(base==='double')ty=TY.f64;else if(base==='_Bool')ty=TY.bool;
    else if(base==='char')ty=signed===false?TY.u8:TY.i8;
    else if(cnt.short)ty=signed===false?TY.u16:TY.i16;
    else if(base==='int'||cnt.long||signed!==null)ty=signed===false?TY.u32:TY.i32;
    else throw new CErr(`Tip bekleniyordu, “${tok.v}” bulundu`,tok);
    return {ty,storage};}
  function parseStruct(){let tag=null;if(peek().t==='id'&&!is('{'))tag=next().v;
    if(!is('{')){return {name:tag}; }
    next();const fields=[];
    while(!is('}')){const {ty}=parseBaseType();
      for(;;){const d=parseDeclarator(ty);if(is(':')){next();parseCond();}fields.push({name:d.name,ty:d.ty});if(is(',')){next();continue;}break;}
      expect(';');}
    expect('}');const st={k:'struct',name:tag,fields};if(tag)ctx.structTags.set(tag,st);return st;}
  function parseEnum(){let tag=null;if(peek().t==='id'&&!is('{'))tag=next().v;
    if(is('{')){next();let v=0;while(!is('}')){const nm=next().v;if(is('=')){next();const e=parseAssign();v=constEval(e);}ctx.enums.set(nm,v);v++;if(is(','))next();}expect('}');}
    return TY.i32;}
  function constEval(e){
    if(e.k==='num')return e.val;if(e.k==='un'&&e.op==='-')return -constEval(e.e);if(e.k==='un'&&e.op==='~')return ~constEval(e.e);
    if(e.k==='cast')return constEval(e.e);
    if(e.k==='id'&&ctx.enums.has(e.name))return ctx.enums.get(e.name);
    if(e.k==='bin'){const a=constEval(e.a),b=constEval(e.b);return Function('a','b','return a'+e.op+'b')(a,b);}
    throw new CErr('Sabit ifade bekleniyordu',e.tok);}
  function parseDeclarator(base){let ty=base;let ptr=0;while(is('*')){next();ptr++;while(is('const')||is('volatile'))next();}
    for(let i=0;i<ptr;i++)ty={k:'ptr',to:ty};
    let name=null,tok=peek(),params=null;
    if(is('(')&&peek(1).v==='*'){next();next();name=next().v;expect(')');ty={k:'ptr',to:ty};if(is('(')){skipParens();}return {name,ty,tok};}
    if(peek().t==='id'&&!KW.has(peek().v))name=next().v;
    if(is('(')){next();params=[];
      if(is('void')&&peek(1).v===')'){next();}
      while(!is(')')){if(is('...')){next();continue;}const {ty:pt}=parseBaseType();const d=parseDeclarator(pt);params.push({name:d.name,ty:d.ty});if(is(','))next();}
      expect(')');return {name,ty,params,tok};}
    while(is('[')){next();let len=null;if(!is(']'))len=constEval(parseExpr());expect(']');ty={k:'arr',of:ty,len};}
    return {name,ty,tok};}
  function skipParens(){let d=0;do{const t=next();if(t.v==='(')d++;else if(t.v===')')d--;}while(d>0);}
  function parseInit(){if(is('{')){const t=next();const items=[];while(!is('}')){if(is('.')){next();const f=next().v;expect('=');items.push({field:f,v:parseInit()});}else if(is('[')){next();const ix=constEval(parseExpr());expect(']');expect('=');items.push({index:ix,v:parseInit()});}else items.push({v:parseInit()});if(is(','))next();}expect('}');return {k:'list',items,tok:t};}
    return parseAssign();}
  /* ifadeler */
  const BIN=[['||'],['&&'],['|'],['^'],['&'],['==','!='],['<','>','<=','>='],['<<','>>'],['+','-'],['*','/','%']];
  function parseExpr(){let e=parseAssign();while(is(',')){const t=next();e={k:'comma',a:e,b:parseAssign(),tok:t};}return e;}
  function parseAssign(){const l=parseCond();const t=peek();
    if(t.t==='p'&&['=','+=','-=','*=','/=','%=','&=','|=','^=','<<=','>>='].includes(t.v)){next();return {k:'asg',op:t.v,l,r:parseAssign(),tok:t};}
    return l;}
  function parseCond(){const c=parseBin(0);if(is('?')){const t=next();const a=parseExpr();expect(':');const b=parseCond();return {k:'cond',c,a,b,tok:t};}return c;}
  function parseBin(lv){if(lv>=BIN.length)return parseCast();let a=parseBin(lv+1);
    while(peek().t==='p'&&BIN[lv].includes(peek().v)){const t=next();a={k:'bin',op:t.v,a,b:parseBin(lv+1),tok:t};}return a;}
  function isTypeName(o){const t=peek(o);if(t.t!=='id')return false;
    if(['const','volatile','signed','unsigned','void','char','short','int','long','float','double','_Bool','struct','union','enum'].includes(t.v))return true;return typedefs.has(t.v);}
  function parseCast(){
    if(is('(')&&isTypeName(1)){const t=next();const {ty}=parseBaseType();let ty2=ty;while(is('*')){next();ty2={k:'ptr',to:ty2};}expect(')');
      if(is('{'))throw new CErr('Bileşik sabitler desteklenmiyor',t);return {k:'cast',ty:ty2,e:parseCast(),tok:t};}
    return parseUnary();}
  function parseUnary(){const t=peek();
    if(t.t==='p'&&['!','~','-','+','&','*'].includes(t.v)){next();return {k:'un',op:t.v,e:parseCast(),tok:t};}
    if(t.t==='p'&&(t.v==='++'||t.v==='--')){next();return {k:'pre',op:t.v,e:parseUnary(),tok:t};}
    if(t.v==='sizeof'){next();if(is('(')&&isTypeName(1)){next();const {ty}=parseBaseType();while(is('*'))next();expect(')');return {k:'num',val:sizeOf(ty),ty:TY.u32,tok:t};}
      const e=parseUnary();return {k:'sizeofE',e,tok:t};}
    return parsePostfix(parsePrimary());}
  function sizeOf(ty){return ty.k==='float'?ty.bits/8:ty.k==='int'||ty.k==='bool'?ty.bits/8:4;}
  function parsePrimary(){const t=next();
    if(t.t==='num'){const s=t.v;let ty=TY.i32,val;
      if(/[.eE]/.test(s)&&!/^0[xX]/.test(s)){ty=/[fF]$/.test(s)?TY.f32:TY.f64;val=parseFloat(s);}
      else{val=Number(s.replace(/[uUlL]+$/,''));if(/^0[0-7]+/.test(s.replace(/[uUlL]+$/,''))&&!/^0[xX]/.test(s))val=parseInt(s,8);if(/[uU]/.test(s)||val>2147483647)ty=TY.u32;}
      return {k:'num',val,ty,tok:t};}
    if(t.t==='id'){if(KW.has(t.v))throw new CErr(`Beklenmeyen anahtar kelime “${t.v}”`,t);return {k:'id',name:t.v,tok:t};}
    if(t.v==='('){const e=parseExpr();expect(')');return e;}
    if(t.t==='str'||t.t==='chr'){if(t.t==='chr')return {k:'num',val:(t.v.length===3?t.v.charCodeAt(1):0),ty:TY.i32,tok:t};throw new CErr('Metin sabitleri desteklenmiyor',t);}
    throw new CErr(`Beklenmeyen “${t.v}”`,t);}
  function parsePostfix(e){
    for(;;){const t=peek();
      if(t.v==='('){next();const args=[];while(!is(')')){args.push(parseAssign());if(is(','))next();}expect(')');e={k:'call',f:e,args,tok:t};continue;}
      if(t.v==='['){next();const ix=parseExpr();expect(']');e={k:'idx',a:e,i:ix,tok:t};continue;}
      if(t.v==='.'||t.v==='->'){next();const f=next();e={k:'mem',e,f:f.v,arrow:t.v==='->',tok:f};continue;}
      if(t.v==='++'||t.v==='--'){next();e={k:'post',op:t.v,e,tok:t};continue;}
      return e;}}
  /* deyimler */
  function parseStmt(){const t=peek();
    if(is('{'))return parseBlock();
    if(is(';')){next();return {k:'empty'};}
    if(t.v==='if'){next();expect('(');const c=parseExpr();expect(')');const a=parseStmt();let b=null;if(is('else')){next();b=parseStmt();}return {k:'if',c,a,b,tok:t};}
    if(t.v==='while'){next();expect('(');const c=parseExpr();expect(')');return {k:'while',c,s:parseStmt(),tok:t};}
    if(t.v==='do'){next();const s=parseStmt();expect('while');expect('(');const c=parseExpr();expect(')');expect(';');return {k:'do',c,s,tok:t};}
    if(t.v==='for'){next();expect('(');let init=null;if(!is(';')){init=looksDecl()?parseDecl():{k:'expr',e:parseExpr()};if(init.k==='expr')expect(';');}else next();
      const c=is(';')?null:parseExpr();expect(';');const st=is(')')?null:parseExpr();expect(')');return {k:'for',init,c,st,s:parseStmt(),tok:t};}
    if(t.v==='switch'){next();expect('(');const c=parseExpr();expect(')');return {k:'switch',c,s:parseStmt(),tok:t};}
    if(t.v==='case'){next();const e=parseCond();expect(':');return {k:'case',e,tok:t};}
    if(t.v==='default'){next();expect(':');return {k:'default',tok:t};}
    if(t.v==='break'){next();expect(';');return {k:'break'};}
    if(t.v==='continue'){next();expect(';');return {k:'continue'};}
    if(t.v==='return'){next();const e=is(';')?null:parseExpr();expect(';');return {k:'return',e,tok:t};}
    if(t.v==='goto')throw new CErr('goto desteklenmiyor',t);
    if(looksDecl())return parseDecl();
    const e=parseExpr();expect(';');return {k:'expr',e,tok:t};}
  function parseBlock(){expect('{');const body=[];while(!is('}')){if(peek().t==='eof')throw new CErr('Kapanmayan blok “{”',peek());body.push(parseStmt());}expect('}');return {k:'block',body};}
  function parseDecl(){const {ty,storage}=parseBaseType();const ds=[];
    if(is(';')){next();return {k:'decl',ds,storage};}
    for(;;){const d=parseDeclarator(ty);if(is('=')){next();d.init=parseInit();}ds.push(d);if(is(',')){next();continue;}break;}
    expect(';');return {k:'decl',ds,storage};}
  /* üst düzey */
  const items=[];
  while(peek().t!=='eof'){
    if(is(';')){next();continue;}
    const st=p;const {ty,storage}=parseBaseType();
    if(is(';')){next();continue;}
    for(;;){const d=parseDeclarator(ty);
      if(storage==='typedef'){typedefs.set(d.name,d.ty.k==='struct'&&!d.ty.name?Object.assign(d.ty,{name:d.name}):resolveTD(d.ty));}
      else if(d.params&&is('{')){const body=parseBlock();items.push({k:'func',name:d.name,ret:d.ty,params:d.params,body,tok:d.tok});break;}
      else if(d.params){items.push({k:'proto',name:d.name,ret:d.ty,params:d.params,tok:d.tok});}
      else{if(is('=')){next();d.init=parseInit();}items.push({k:'gvar',name:d.name,ty:d.ty,init:d.init,storage,tok:d.tok});}
      if(is(',')){next();continue;}expect(';');break;}}
  function resolveTD(ty){if(ty.k==='struct'&&ty.name&&!ty.fields&&ctx.structTags.has(ty.name))return ctx.structTags.get(ty.name);return ty;}
  return items;}

/* ---------- kod üretimi (C → JS) ---------- */
function compile(fileMap,opts){
  opts=opts||{};const files=new Map(Object.entries(fileMap));
  const ctx={missingInc:new Set(),runnables:new Set(),typedefs:new Map(Object.entries(BUILTIN_TYPEDEF)),structTags:new Map(),enums:new Map(),warnings:[]};
  const cfiles=[...files.keys()].filter(n=>/\.c$/i.test(n));
  if(!cfiles.length)throw new CErr('Derlenecek .c dosyası yok',null);
  /* extern ipuçları: önişlemci dallarından bağımsız tüm dosyalardan */
  const externTy=new Map();
  for(const [n,src] of files){const re=/extern\s+(?:const\s+)?([A-Za-z_]\w*)\s+([A-Za-z_]\w*)\s*;/g;let m;while((m=re.exec(src))){const t=BUILTIN_TYPEDEF[m[1]];if(t)externTy.set(m[2],t);}}
  /* sırayla: önce .h tipleri için tüm .c dosyaları aynı bağlamda */
  let items=[];
  for(const cf of cfiles){const toks=preprocess(files,cf,ctx);items=items.concat(parse(toks,ctx));}
  const G=new Map();const F=new Map();const protos=new Map();
  items.forEach(it=>{if(it.k==='gvar'){const old=G.get(it.name);if(!old||it.storage!=='extern'||old.storage==='extern')G.set(it.name,Object.assign({},old||{},it,{init:it.init||(old&&old.init)}));if(it.storage==='extern'&&old&&old.storage!=='extern')G.set(it.name,old);}
    else if(it.k==='func'){if(F.has(it.name))throw new CErr(`${it.name} iki kez tanımlanmış`,it.tok);F.set(it.name,it);}else if(it.k==='proto')protos.set(it.name,it);});
  const typeOfGlobal=n=>{const g=G.get(n);if(g)return g.ty;if(externTy.has(n))return externTy.get(n);if(opts.typeHint){const h=opts.typeHint(n);if(h&&BUILTIN_TYPEDEF[h])return BUILTIN_TYPEDEF[h];}return null;};
  const io={inputs:new Set(),outputs:new Set(),params:new Set(),funcsCalled:new Set()};
  const runnables=[...ctx.runnables].sort((a,b)=>b.length-a.length);
  function resolveGetSet(name){const m=/^(Get|Set)_(.+)$/.exec(name);if(!m)return null;let rest=m[2];
    for(const r of runnables){if(rest.startsWith(r+'_')){return {set:m[1]==='Set',sig:rest.slice(r.length+1)};}}
    const parts=rest.split('_');for(let i=1;i<parts.length;i++){const cand=parts.slice(i).join('_');if(typeOfGlobal(cand)||(opts.known&&opts.known(cand)))return {set:m[1]==='Set',sig:cand};}
    return null;}
  const isUnsigned32=t=>t&&t.k==='int'&&t.bits===32&&!t.signed;
  const arith=(a,b)=>{if(a.k==='float'||b.k==='float')return TY.f64;if(isUnsigned32(a)||isUnsigned32(b))return TY.u32;return TY.i32;};
  const promote=t=>t.k==='float'?TY.f64:isUnsigned32(t)?TY.u32:(t.k==='int'||t.k==='bool')?TY.i32:TY.unk;
  function conv(ty,js,from){if(!ty)return js;
    const fl=from&&from.k==='float';const tr=fl?`Math.trunc(${js})`:js;
    switch(ty.k){case 'bool':return `((${js})?1:0)`;
      case 'int':if(ty.bits===32)return ty.signed?`((${tr})|0)`:`((${tr})>>>0)`;
        if(ty.bits===16)return ty.signed?`((${tr})<<16>>16)`:`((${tr})&65535)`;
        return ty.signed?`((${tr})<<24>>24)`:`((${tr})&255)`;
      case 'float':return ty.bits===32?`Math.fround(${js})`:(from&&from.k!=='float'&&from.k!=='unk'?js:`(+(${js}))`);
      default:return js;}}
  const id=n=>'$'+n;
  let fnCtx=null;
  function lookup(name,tok){if(fnCtx){for(let i=fnCtx.scopes.length-1;i>=0;i--){const s=fnCtx.scopes[i];if(s.has(name))return {kind:'local',ty:s.get(name),js:id(name)};}}
    if(ctx.enums.has(name))return {kind:'const',ty:TY.i32,js:String(ctx.enums.get(name))};
    const gt=typeOfGlobal(name);if(G.has(name)||gt){return {kind:'global',ty:gt||TY.unk,js:`G[${JSON.stringify(name)}]`};}
    if(opts.known&&opts.known(name)){return {kind:'global',ty:TY.unk,js:`G[${JSON.stringify(name)}]`};}
    ctx.warnings.push({msg:`Tanımsız değişken ${name} → 0 kabul edildi`,file:tok&&tok.f,line:tok&&tok.l});
    return {kind:'global',ty:TY.unk,js:`G[${JSON.stringify(name)}]`};}
  /* bir ifadeyi "nesne/dizi tabanı" olarak üret (struct/dizi) */
  function genBase(e){
    if(e.k==='id'){const r=lookup(e.name,e.tok);if(r.kind==='local')return {js:r.js,ty:r.ty};return {js:`$o(G,${JSON.stringify(e.name)})`,ty:r.ty};}
    if(e.k==='mem'){const b=genBase(e.e);const st=structOf(b.ty);const fty=fieldTy(st,e.f);return {js:`$o(${b.js},${JSON.stringify(e.f)})`,ty:fty};}
    if(e.k==='idx'){const b=genBase(e.a);const i=gen(e.i);const et=b.ty&&b.ty.k==='arr'?b.ty.of:TY.unk;return {js:`$o(${b.js},${i.js})`,ty:et};}
    if(e.k==='un'&&e.op==='*'){return genBase(e.e);}
    throw new CErr('Bu ifade nesne olarak kullanılamaz',e.tok);}
  function structOf(ty){if(!ty)return null;if(ty.k==='ptr')ty=ty.to;if(ty.k==='struct'){if(!ty.fields&&ty.name){const td=ctx.typedefs.get(ty.name)||ctx.structTags.get(ty.name);if(td&&td.fields)return td;}return ty;}return null;}
  function fieldTy(st,f){if(st&&st.fields){const fd=st.fields.find(x=>x.name===f);if(fd)return fd.ty;}return TY.unk;}
  function lval(e){
    if(e.k==='id'){const r=lookup(e.name,e.tok);if(r.kind==='const')throw new CErr(`${e.name} sabittir, atanamaz`,e.tok);if(r.kind==='global')io.writes&&io.writes.add(e.name);return {js:r.js,ty:r.ty};}
    if(e.k==='mem'){const b=genBase(e.e);const st=structOf(b.ty);return {js:`${b.js}[${JSON.stringify(e.f)}]`,ty:fieldTy(st,e.f)};}
    if(e.k==='idx'){const b=genBase(e.a);const i=gen(e.i);return {js:`${b.js}[${i.js}]`,ty:b.ty&&b.ty.k==='arr'?b.ty.of:TY.unk};}
    if(e.k==='un'&&e.op==='*')throw new CErr('İşaretçi üzerinden atama desteklenmiyor',e.tok);
    throw new CErr('Atanamayan ifade',e.tok);}
  function binop(op,a,b){const at=promote(a.ty),bt=promote(b.ty);
    if(['==','!=','<','>','<=','>='].includes(op)){const jop=op==='=='?'===':op==='!='?'!==':op;return {js:`((${a.js})${jop}(${b.js})?1:0)`,ty:TY.i32};}
    if(op==='&&'||op==='||')return {js:`((${a.js})${op}(${b.js})?1:0)`,ty:TY.i32};
    const rt=(op==='<<'||op==='>>')?at:arith(at,bt);
    if(rt.k==='float'||rt.k==='unk'){if(op==='%')return {js:`((${a.js})%(${b.js}))`,ty:rt};return {js:`((${a.js})${op}(${b.js}))`,ty:rt.k==='unk'?TY.f64:rt};}
    const u=!rt.signed;let js;
    switch(op){case '+':case '-':js=`((${a.js})${op}(${b.js}))`;break;
      case '*':js=`Math.imul(${a.js},${b.js})`;break;
      case '/':js=`Math.trunc((${a.js})/(${b.js}))`;break;case '%':js=`((${a.js})%(${b.js}))`;break;
      case '<<':js=`((${a.js})<<(${b.js}))`;break;case '>>':js=u?`((${a.js})>>>(${b.js}))`:`((${a.js})>>(${b.js}))`;break;
      case '&':case '|':case '^':js=`((${a.js})${op}(${b.js}))`;break;default:throw new CErr('Bilinmeyen işleç '+op);}
    return {js:u?`((${js})>>>0)`:`((${js})|0)`,ty:rt};}
  function gen(e){switch(e.k){
    case 'num':return {js:String(e.val),ty:e.ty};
    case 'id':{const r=lookup(e.name,e.tok);if(r.kind==='global')io.reads&&io.reads.add(e.name);
      if(r.kind==='global'&&r.ty&&(r.ty.k==='struct'||r.ty.k==='arr'))return {js:`$o(G,${JSON.stringify(e.name)})`,ty:r.ty};
      if(r.kind==='global')return {js:`(${r.js}??0)`,ty:r.ty};return {js:r.js,ty:r.ty};}
    case 'mem':{const b=genBase(e.e);const st=structOf(b.ty);const ft=fieldTy(st,e.f);if(ft.k==='struct'||ft.k==='arr')return {js:`$o(${b.js},${JSON.stringify(e.f)})`,ty:ft};return {js:`(${b.js}[${JSON.stringify(e.f)}]??0)`,ty:ft};}
    case 'idx':{const b=genBase(e.a);const i=gen(e.i);const et=b.ty&&b.ty.k==='arr'?b.ty.of:TY.unk;return {js:`(${b.js}[${i.js}]??0)`,ty:et};}
    case 'un':{if(e.op==='&'){const b=genBase(e.e);return {js:b.js,ty:{k:'ptr',to:b.ty}};}
      if(e.op==='*'){const b=genBase(e.e);return {js:b.js,ty:b.ty&&b.ty.k==='ptr'?b.ty.to:TY.unk};}
      const x=gen(e.e);const t=promote(x.ty);
      if(e.op==='!')return {js:`((${x.js})?0:1)`,ty:TY.i32};
      if(e.op==='+')return {js:x.js,ty:t};
      if(e.op==='-'){if(t.k==='float'||t.k==='unk')return {js:`(-(${x.js}))`,ty:t.k==='unk'?TY.f64:t};return {js:t.signed?`((-(${x.js}))|0)`:`((-(${x.js}))>>>0)`,ty:t};}
      if(e.op==='~')return {js:t.signed===false?`((~(${x.js}))>>>0)`:`(~(${x.js}))`,ty:t};
      throw new CErr('Bilinmeyen tekli işleç',e.tok);}
    case 'bin':return binop(e.op,gen(e.a),gen(e.b));
    case 'cond':{const c=gen(e.c),a=gen(e.a),b=gen(e.b);return {js:`((${c.js})?(${a.js}):(${b.js}))`,ty:(a.ty.k==='float'||b.ty.k==='float')?TY.f64:arith(promote(a.ty),promote(b.ty))};}
    case 'cast':{const x=gen(e.e);if(e.ty.k==='ptr'||e.ty.k==='struct'||e.ty.k==='void')return {js:x.js,ty:e.ty};return {js:conv(e.ty,x.js,x.ty),ty:e.ty};}
    case 'comma':{const a=gen(e.a),b=gen(e.b);return {js:`((${a.js}),(${b.js}))`,ty:b.ty};}
    case 'asg':{const l=lval(e.l);const r=gen(e.r);
      if(e.op==='=')return {js:`(${l.js}=${conv(l.ty.k==='unk'?null:l.ty,r.js,r.ty)})`,ty:l.ty};
      const cur={js:`(${l.js}??0)`,ty:l.ty};const v=binop(e.op.slice(0,-1),cur,r);return {js:`(${l.js}=${conv(l.ty.k==='unk'?null:l.ty,v.js,v.ty)})`,ty:l.ty};}
    case 'pre':case 'post':{const l=lval(e.e);const one={js:'1',ty:TY.i32};const v=binop(e.op==='++'?'+':'-',{js:`(${l.js}??0)`,ty:l.ty},one);const nv=conv(l.ty.k==='unk'?null:l.ty,v.js,v.ty);
      if(e.k==='pre')return {js:`(${l.js}=${nv})`,ty:l.ty};return {js:`(($t=(${l.js}??0)),(${l.js}=${nv}),$t)`,ty:l.ty};}
    case 'call':{if(e.f.k!=='id')throw new CErr('Fonksiyon işaretçileri desteklenmiyor',e.tok);const name=e.f.name;
      if(F.has(name)||protos.has(name)){const fd=F.get(name)||protos.get(name);if(!F.has(name))throw new CErr(`${name} fonksiyonunun gövdesi yok (yalnızca bildirim)`,e.tok);
        io.funcsCalled.add(name);const args=e.args.map((a,i)=>{const x=gen(a);const pt=fd.params[i]&&fd.params[i].ty;return pt&&pt.k!=='ptr'&&pt.k!=='struct'&&pt.k!=='arr'?conv(pt,x.js,x.ty):x.js;});
        return {js:`F.${id(name)}(${args.join(',')})`,ty:fd.ret};}
      const gs=resolveGetSet(name);
      if(gs){if(gs.set){if(e.args.length!==1)throw new CErr(`${name} tek argüman almalı`,e.tok);const x=gen(e.args[0]);const ty=typeOfGlobal(gs.sig)||TY.unk;io.outputs.add(gs.sig);
          return {js:`(G[${JSON.stringify(gs.sig)}]=${conv(ty.k==='unk'?null:ty,x.js,x.ty)})`,ty};}
        const ty=typeOfGlobal(gs.sig)||TY.unk;if(/(_P|Nv)$/.test(gs.sig))io.params.add(gs.sig);else io.inputs.add(gs.sig);return {js:`(G[${JSON.stringify(gs.sig)}]??0)`,ty};}
      if(MATH[name]){const args=e.args.map(a=>gen(a).js);return {js:`${MATH[name]}(${args.join(',')})`,ty:TY.f64};}
      throw new CErr(`Tanımsız fonksiyon: ${name}`,e.tok);}
    case 'sizeofE':return {js:'4',ty:TY.u32};
    default:throw new CErr('Desteklenmeyen ifade',e.tok);}}
  function genStmt(s,ind){const I='  '.repeat(ind);
    switch(s.k){case 'block':{fnCtx.scopes.push(new Map());const r=s.body.map(x=>genStmt(x,ind+1)).join('\n');fnCtx.scopes.pop();return `${I}{\n${r}\n${I}}`;}
      case 'empty':return I+';';
      case 'decl':return s.ds.map(d=>{fnCtx.scopes[fnCtx.scopes.length-1].set(d.name,d.ty);
        if(d.ty.k==='struct'||d.ty.k==='arr'){return `${I}let ${id(d.name)}=${d.init?initJS(d.ty,d.init):(d.ty.k==='arr'?'[]':'{}')};`;}
        let v='0';if(d.init){const x=gen(d.init);v=conv(d.ty,x.js,x.ty);}return `${I}let ${id(d.name)}=${v};`;}).join('\n');
      case 'expr':return `${I}${gen(s.e).js};`;
      case 'if':return `${I}if(${gen(s.c).js}){\n${genStmt(s.a,ind+1)}\n${I}}`+(s.b?`else{\n${genStmt(s.b,ind+1)}\n${I}}`:'');
      case 'while':return `${I}while(${gen(s.c).js}){if(++$it>5e6)throw new Error('Sonsuz döngü?');\n${genStmt(s.s,ind+1)}\n${I}}`;
      case 'do':return `${I}do{if(++$it>5e6)throw new Error('Sonsuz döngü?');\n${genStmt(s.s,ind+1)}\n${I}}while(${gen(s.c).js});`;
      case 'for':{fnCtx.scopes.push(new Map());const init=s.init?(s.init.k==='decl'?genStmt(s.init,0).trim():gen(s.init.e).js+';'):';';
        const r=`${I}{${init}for(;${s.c?gen(s.c).js:'true'};${s.st?gen(s.st).js:''}){if(++$it>5e6)throw new Error('Sonsuz döngü?');\n${genStmt(s.s,ind+1)}\n${I}}}`;fnCtx.scopes.pop();return r;}
      case 'switch':{let inner;if(s.s.k==='block'){fnCtx.scopes.push(new Map());inner=s.s.body.map(x=>genStmt(x,ind+1)).join('\n');fnCtx.scopes.pop();}else inner=genStmt(s.s,ind+1);return `${I}switch(${gen(s.c).js}){\n${inner}\n${I}}`;}
      case 'case':return `${I}case ${gen(s.e).js}:`;case 'default':return `${I}default:`;
      case 'break':return I+'break;';case 'continue':return I+'continue;';
      case 'return':{if(!s.e)return I+'return;';const x=gen(s.e);return `${I}return ${fnCtx.ret.k==='void'?x.js:conv(fnCtx.ret,x.js,x.ty)};`;}
      default:throw new CErr('Desteklenmeyen deyim',s.tok);}}
  function initJS(ty,init){
    if(init.k!=='list'){if(ty&&(ty.k==='int'||ty.k==='bool'||ty.k==='float')){const x=gen(init);return conv(ty,x.js,x.ty);}return gen(init).js;}
    if(ty&&ty.k==='arr'){const a=[];let k=0;init.items.forEach(it=>{if(it.index!=null)k=it.index;a[k++]=initJS(ty.of,it.v);});return '['+a.map(x=>x==null?'0':x).join(',')+']';}
    const st=structOf(ty);
    if(st&&st.fields){const o=[];let k=0;init.items.forEach(it=>{let fi=it.field!=null?st.fields.findIndex(f=>f.name===it.field):k;if(fi<0)throw new CErr(`Alan bulunamadı: ${it.field}`,init.tok);const f=st.fields[fi];o.push(`${JSON.stringify(f.name)}:${initJS(f.ty,it.v)}`);k=fi+1;});return '{'+o.join(',')+'}';}
    ctx.warnings.push({msg:`Yapı tanımı bilinmeyen ${ty&&ty.name||'?'} için başlangıç değeri sırayla saklandı (struct tanımı içeren .h dosyasını ekleyin)`,file:init.tok&&init.tok.f,line:init.tok&&init.tok.l});
    return '{__pos:['+init.items.map(it=>initJS(null,it.v)).join(',')+']}';}
  /* fonksiyonlar */
  const fnJS=[];
  for(const [name,f] of F){fnCtx={scopes:[new Map(f.params.map(p=>[p.name,p.ty]))],ret:f.ret};
    const body=genStmt(f.body,1);fnJS.push(`F.${id(name)}=function(${f.params.map(p=>id(p.name)).join(',')}){let $t;\n${body}\n};`);fnCtx=null;}
  /* global başlangıç */
  const gInit=[];
  for(const [name,g] of G){if(g.storage==='extern'&&!g.init)continue;const ty=g.ty;
    if(g.init)gInit.push(`G[${JSON.stringify(name)}]=${initJS(ty,g.init)};`);
    else if(ty.k==='struct')gInit.push(`G[${JSON.stringify(name)}]={};`);else if(ty.k==='arr')gInit.push(`G[${JSON.stringify(name)}]=[];`);
    else gInit.push(`G[${JSON.stringify(name)}]=0;`);}
  const js=`"use strict";const $o=(o,k)=>{let v=o[k];if(v==null||typeof v!=='object'){v=o[k]={};}return v;};let $it=0;const F={};let G={};\n${fnJS.join('\n')}\nfunction $init(g){G=g;${gInit.join('\n')}}\nreturn {F,$init,resetIt(){$it=0;}};`;
  /* adım / init / reset fonksiyonları */
  const called=io.funcsCalled;const roots=[...F.values()].filter(f=>!called.has(f.name)&&f.params.length===0);
  const steps=roots.filter(f=>/(\d+)ms$/i.test(f.name)||/step/i.test(f.name)).map(f=>({name:f.name,period:+(/(\d+)ms$/i.exec(f.name)||[0,10])[1]}));
  const init=roots.filter(f=>/init(ialize)?$/i.test(f.name)).map(f=>f.name),reset=roots.filter(f=>/reset$/i.test(f.name)).map(f=>f.name);
  const assume=roots.filter(f=>/^SIM_/i.test(f.name)).map(f=>f.name);
  /* çıktılar: Output.c içinde tanımlanan globaller de çıkıştır */
  for(const [name,g] of G){if(g.tok&&/_Output\.c$/i.test(g.tok.f))io.outputs.add(name);if(g.tok&&/_Local\.c$/i.test(g.tok.f)&&/(_P|Nv)$/.test(name))io.params.add(name);}
  io.inputs.forEach(n=>{if(io.outputs.has(n))io.inputs.delete(n);});
  const globals={};for(const [n,g] of G)globals[n]={ty:g.ty,file:g.tok&&g.tok.f,line:g.tok&&g.tok.l,calib:!!(g.tok&&/_Local\.c$/i.test(g.tok.f)&&/_P$/.test(n))};
  let mod;try{mod=Function(js)();}catch(e){throw new CErr('İç hata (üretilen JS): '+e.message,null);}
  return {mod,js,steps,init,reset,assume,inputs:[...io.inputs].sort(),outputs:[...io.outputs].sort(),params:[...io.params].sort(),missingInc:[...ctx.missingInc].sort(),warnings:dedupe(ctx.warnings),globals,typeOf:n=>typeOfGlobal(n)};}
function dedupe(w){const s=new Set();return w.filter(x=>{const k=x.msg;if(s.has(k))return false;s.add(k);return true;});}
const tyName=t=>!t?'?':t.k==='bool'?'boolean':t.k==='int'?(t.signed?'int':'uint')+t.bits:t.k==='float'?'real'+(t.bits===32?'32':''):t.k;
return {compile,CErr,tyName};
})();
if(typeof module!=='undefined')module.exports=CC;
