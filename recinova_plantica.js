/* ReciNova — complemento independiente de racha ecológica.
   No reemplaza el HTML, no altera las clasificaciones ni utiliza Supabase. */
(() => {
  'use strict';
  const KEY = 'recinova_racha_plantica_v1';
  const CSS = `
    #recinovaPlantMascot{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;margin:14px auto 0;padding:0;border:0;background:transparent;box-shadow:none;max-width:210px;text-align:center;animation:rnPlantArrive .35s ease both}
    #recinovaPlantMascot .rn-figure{display:block;width:135px;height:145px;overflow:visible}
    #recinovaPlantMascot .rn-leaves{transform-origin:90px 111px;animation:rnPlantGrow 1.1s .5s cubic-bezier(.2,.8,.25,1) both}
    #recinovaPlantMascot .rn-water{opacity:0;animation:rnPlantWater 1.3s .12s ease-in forwards}
    #recinovaPlantMascot .rn-title{margin:1px 0 0;font-size:14px;font-weight:750;color:#146b52}
    #recinovaPlantMascot .rn-detail{margin:0;font-size:12px;color:#66796c}
    #recinovaPlantMascot .rn-restart{border:0;border-radius:20px;padding:7px 12px;background:#146b52;color:white;font:inherit;font-size:12px;cursor:pointer;margin-top:5px}
    @keyframes rnPlantArrive{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:translateY(0)}}
    @keyframes rnPlantGrow{0%{transform:scale(.62)}75%{transform:scale(1.08)}100%{transform:scale(1)}}
    @keyframes rnPlantWater{0%{opacity:0;transform:translateY(-22px)}20%{opacity:1}80%{opacity:1}100%{opacity:0;transform:translateY(48px)}}
    @media(prefers-reduced-motion:reduce){#recinovaPlantMascot,#recinovaPlantMascot .rn-water,#recinovaPlantMascot .rn-leaves{animation:none}}
  `;
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);
  const date = () => {const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  const dayNum = str => {const [y,m,d]=str.split('-').map(Number);return Date.UTC(y,m-1,d)/86400000};
  const read = () => {try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}};
  const save = r => {try{localStorage.setItem(KEY,JSON.stringify(r))}catch{}};
  const today = date();
  let lastShownFor = null;
  function makePlant(water,dead,streak){
    const el=document.createElement('div');el.id='recinovaPlantMascot';el.setAttribute('role','status');
    const green=dead?'#ac9c72':'#4ab46b',edge=dead?'#83724a':'#237e4c';
    const lush=streak>=7 ? '<ellipse cx="90" cy="44" rx="36" ry="25" fill="'+green+'" opacity=".8"/>' : '';
    el.innerHTML=`<svg class="rn-figure" viewBox="0 0 180 185" role="img" aria-label="Plantica ecológica en maceta">
      <ellipse cx="90" cy="177" rx="52" ry="6" fill="#9dab9d" opacity=".16"/>
      <g class="rn-leaves"><path d="M90 111 Q${dead?65:89} 76 90 41" stroke="${edge}" stroke-width="6" stroke-linecap="round" fill="none"/>
      ${lush}<path d="M91 79 Q55 43 54 66 Q62 86 91 79 Z" fill="${green}" stroke="${edge}" stroke-width="2"/>
      <path d="M90 72 Q128 35 138 59 Q129 84 90 72 Z" fill="${green}" stroke="${edge}" stroke-width="2"/>
      ${streak>=3?'<path d="M90 56 Q66 16 64 40 Q69 62 90 56 Z" fill="'+green+'"/>':''}</g>
      <path d="M49 109 L131 109 L120 165 Q90 177 61 165 Z" fill="#E79A67" stroke="#A96847" stroke-width="3"/>
      <path d="M48 109 Q90 117 132 109" fill="none" stroke="#BB704A" stroke-width="11" stroke-linecap="round"/>
      <path d="M69 141 q7 -11 14 0 M99 141 q7 -11 14 0" fill="none" stroke="#573D30" stroke-width="3" stroke-linecap="round"/>
      <path d="M84 151 q8 9 16 0" fill="none" stroke="#573D30" stroke-width="3" stroke-linecap="round"/>
      <circle cx="65" cy="150" r="4" fill="#E88689"/><circle cx="115" cy="150" r="4" fill="#E88689"/>
      ${water?'<g class="rn-water" fill="#5AB9E9"><path d="M145 15 Q130 33 145 38 Q160 33 145 15"/><path d="M159 36 Q147 52 159 56 Q171 52 159 36"/></g>':''}</svg>
      <p class="rn-title">${dead?'🥀 Tu plantica se marchitó':water?'💧 ¡Regaste tu plantica!':'🌱 Ya la regaste hoy'}</p>
      <p class="rn-detail">${dead?'Se perdió la racha.':streak+' '+(streak===1?'día':'días')+' de racha ecológica'}</p>`;
    if(dead){const btn=document.createElement('button');btn.className='rn-restart';btn.type='button';btn.textContent='🌱 Sembrar otra semilla';btn.addEventListener('click',()=>{save({last:today,count:1});el.replaceWith(makePlant(true,false,1));});el.appendChild(btn)}
    return el;
  }
  function show(){
    const result=document.getElementById('result');
    if(!result||result.classList.contains('hidden')||!result.querySelector('.bin'))return;
    // Un resultado solo cuenta una vez; se muestra al completar la orientación.
    const bin = result.querySelector('.bin');
    if(!bin||bin.textContent.includes('Recolección especial'))return;
    const currentSignature=bin;
    if(lastShownFor===currentSignature)return;
    lastShownFor=currentSignature;
    document.getElementById('recinovaPlantMascot')?.remove();
    const prev=read(), gap=prev?.last?dayNum(today)-dayNum(prev.last):null;
    let dead=false,water=false,streak=1;
    if(gap===0){streak=Math.max(1,Number(prev.count)||1)}
    else if(gap===1){streak=Math.max(1,Number(prev.count)||1)+1;water=true;save({last:today,count:streak})}
    else if(gap>1){dead=true;streak=Math.max(1,Number(prev.count)||1)}
    else{water=true;save({last:today,count:1})}
    const another=result.querySelector('.classify-another');
    const plant=makePlant(water,dead,streak);
    if(another)another.before(plant);else result.appendChild(plant);
  }
  function init(){
    const result=document.getElementById('result');if(!result)return;
    const observer=new MutationObserver(mutations=>{
      if(mutations.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('.bin')||n.querySelector?.('.bin')))))show();
    });
    observer.observe(result,{childList:true,subtree:true});
    show();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
