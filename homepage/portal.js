(() => {
  'use strict';
  const config = window.PORTAL_CONFIG || {};
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const bird = document.querySelector('.bird');
  const portfolio = document.querySelector('.portfolio');
  const trail = document.querySelector('.flight-trail path');
  const notice = document.querySelector('.notice');
  const birdHome = bird.parentElement;
  const entranceAnimations = [];
  const entranceSessionKey = 'xinqian-homepage-entrance-complete';
  let landed = true, hopAnimation, noticeTimer, clickTimer, flightFrame;
  const entranceWasCompleted = () => {
    try { return sessionStorage.getItem(entranceSessionKey) === '1'; }
    catch { return false; }
  };
  const rememberEntrance = () => {
    try { sessionStorage.setItem(entranceSessionKey, '1'); }
    catch {}
  };
  const animate = (el, frames, options) => {
    const animation = el.animate(frames, { fill: 'backwards', ...options });
    entranceAnimations.push(animation);
    return animation;
  };
  function showNotice(text) {
    clearTimeout(noticeTimer);
    notice.textContent = text;
    notice.classList.add('visible');
    noticeTimer = setTimeout(() => notice.classList.remove('visible'), 3600);
  }
  function destination(key) {
    const raw = key === 'email' ? config.email : config[`${key}Url`];
    if (!raw || typeof raw !== 'string') return null;
    if (key === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw) ? `mailto:${raw}` : null;
    try {
      const url = new URL(raw, location.href);
      return ['http:', 'https:', 'file:'].includes(url.protocol) ? url.href : null;
    } catch { return null; }
  }
  function stopEntrance() {
    cancelAnimationFrame(flightFrame);
    entranceAnimations.forEach(animation => animation.cancel());
    returnBirdHome();
    bird.dataset.state = 'idle';
    landed = true;
  }
  function returnBirdHome() {
    birdHome.appendChild(bird);
    bird.style.removeProperty('left');
    bird.style.removeProperty('top');
    bird.style.removeProperty('transform');
    bird.style.removeProperty('--facing');
    bird.style.removeProperty('--wing-angle');
    bird.style.removeProperty('--wing-scale');
    bird.style.removeProperty('visibility');
    trail.style.opacity = '0';
    trail.removeAttribute('d');
  }
  function enter() {
    if (reducedMotion.matches || !Element.prototype.animate) return;
    landed = false;
    bird.dataset.state = 'fly';
    const box = bird.getBoundingClientRect();
    // 飞鸟独立于文件夹的入场透明度，落地后再归还组件。
    document.body.appendChild(bird);
    bird.style.left = `${box.left + scrollX}px`;
    bird.style.top = `${box.top + scrollY}px`;
    const mobile = innerWidth < 768;
    const introBox = document.querySelector('.intro').getBoundingClientRect();
    // Use glyph bounds, not the full-width paragraph boxes, to reserve a clear lane.
    const textBoxes = [...document.querySelectorAll('.intro h1,.description,.english p')].map(element=>{
      const range=document.createRange();
      range.selectNodeContents(element);
      return range.getBoundingClientRect();
    });
    const textLeft=Math.min(...textBoxes.map(rect=>rect.left))+scrollX;
    const textBottom=Math.max(...textBoxes.map(rect=>rect.bottom))+scrollY;
    // One position sampler drives both bird and tail: the line cannot lead the bird.
    // Coordinates describe the bird's center, relative to its final perch.
    const origin = {x:box.left+scrollX+box.width/2,y:box.top+scrollY+box.height/2};
    // The approach stays above, then OUTSIDE the left
    // text edge, and only turns toward the perch after clearing the last line.
    const clearanceX=box.width*1.25*.5+20;
    const clearanceY=box.height*1.25*.5+16;
    const laneX=textLeft-clearanceX-origin.x;
    const skyY=introBox.top+scrollY-origin.y-clearanceY-12;
    const floorY=Math.max(textBottom+clearanceY-origin.y,-18);
    const overheadX=mobile?introBox.left+scrollX+Math.min(introBox.width*.38,150)-origin.x:laneX-10;
    const p = (x,y) => ({x,y});
    const curves = [
      [p(-origin.x-80,skyY+5),p(overheadX-180,skyY-27),p(overheadX-58,skyY-10),p(overheadX,skyY)],
      [p(overheadX,skyY),p(overheadX+(mobile?-35:8),skyY),p(laneX,skyY),p(laneX,skyY+8)],
      [p(laneX,skyY+8),p(laneX,skyY+84),p(laneX,floorY-45),p(laneX,floorY)],
      [p(laneX,floorY),p(laneX+18,floorY+3),p(-25,floorY+3),p(-18,floorY)],
      [p(-18,floorY),p(-10,floorY),p(0,-5),p(0,0)]
    ];
    const bezier = (points,t) => {
      const a=1-t;
      return p(a*a*a*points[0].x+3*a*a*t*points[1].x+3*a*t*t*points[2].x+t*t*t*points[3].x,
        a*a*a*points[0].y+3*a*a*t*points[1].y+3*a*t*t*points[2].y+t*t*t*points[3].y);
    };
    let startTime, previous, history=[];
    bird.style.visibility='hidden';
    bird.style.setProperty('--facing','1');
    function fly(now) {
      startTime ??= now;
      const elapsed=now-startTime;
      if(elapsed<350){flightFrame=requestAnimationFrame(fly);return;}
      bird.style.visibility='visible';
      const boundaries=[350,1180,1600,2300,2700,3150];
      const activePhase=boundaries.slice(1).findIndex(end=>elapsed<end);
      const phase=activePhase===-1?4:activePhase;
      const raw=Math.min(1,(elapsed-boundaries[phase])/(boundaries[phase+1]-boundaries[phase]));
      // Ease only the final approach, keeping the first two flight arcs continuous.
      const t=phase===4?1-Math.pow(1-raw,1.6):raw;
      const point=bezier(curves[phase],t);
      const scale=phase<3?1.25:phase===3?1.25-.12*raw:1.13-.13*t;
      // Three restrained wing beats, then a glide. No infinite flapping loop.
      const beatProgress=Math.max(0,Math.min(1,(elapsed-350)/2050));
      const beat=Math.sin(beatProgress*Math.PI*6);
      bird.style.setProperty('--wing-angle',`${-3+beat*11}deg`);
      bird.style.setProperty('--wing-scale',String(.88+beat*.16));
      let angle=0;
      if(previous){
        const dx=point.x-previous.x,dy=point.y-previous.y;
        angle=Math.max(-13,Math.min(13,Math.atan2(dy,Math.abs(dx)+.01)*180/Math.PI*.18));
        if(Math.abs(dx)>.1)bird.style.setProperty('--facing',dx>0?'1':'-1');
      }
      angle+=beat*3;
      if(elapsed>=2500){bird.dataset.state='land';angle*=Math.max(0,(3150-elapsed)/650);bird.style.setProperty('--facing','-1');}
      bird.style.transform=`translate(${point.x}px,${point.y}px) rotate(${angle}deg) scale(${scale})`;
      history.push({x:origin.x+point.x,y:origin.y+point.y+8,time:elapsed});
      history=history.filter(sample=>elapsed-sample.time<240);
      const tail=history.filter(sample=>elapsed-sample.time>85);
      // A maximum 85px of recent flight, ending behind the body, never a full-page path.
      let length=0,first=tail.length-1;
      while(first>0){
        const a=tail[first],b=tail[first-1];
        length+=Math.hypot(a.x-b.x,a.y-b.y);
        if(length>85)break;
        first--;
      }
      const visible=tail.slice(Math.max(0,first));
      trail.setAttribute('d',visible.map((sample,index)=>`${index?'L':'M'}${sample.x.toFixed(1)} ${sample.y.toFixed(1)}`).join(' '));
      trail.style.opacity=String(elapsed<650?0:.17*Math.max(0,Math.min(1,(elapsed-650)/250,(2900-elapsed)/450)));
      previous=point;
      if(elapsed>=3150){returnBirdHome();landed=true;bird.dataset.state='idle';return;}
      flightFrame=requestAnimationFrame(fly);
    }
    flightFrame=requestAnimationFrame(fly);
    const travel=mobile?145:270;
    document.querySelectorAll('.soft-shape').forEach((shape,index)=>{
      const side=index?1:-1;
      animate(shape,[
        {transform:`translate(0,0) rotate(${side*3}deg)`,opacity:0},
        {transform:`translate(${side*travel*.06}px,${index?3:-2}px) rotate(${side*2}deg)`,opacity:1,offset:.18},
        {transform:`translate(${side*travel*.5}px,${index?12:-9}px) rotate(${side*5}deg)`,opacity:.95,offset:.6},
        {transform:`translate(${side*travel}px,${index?20:-15}px) rotate(${side*8}deg)`,opacity:0}
      ],{duration:700,delay:780,easing:'cubic-bezier(.3,.05,.3,1)'});
    });
    [['.intro h1',1400,450],['.description',1740,400],['.english',1900,350]].forEach(([selector,delay,duration])=>animate(document.querySelector(selector),[
      {opacity:0,translate:'0 10px'},{opacity:1,translate:'0 0'}
    ],{duration,delay,easing:'cubic-bezier(.2,.7,.3,1)'}));
    [['.resume',2000],['.portfolio',2080],['.field-notes-entry',2320]].forEach(([selector,delay])=>animate(document.querySelector(selector),[
      {opacity:0,translate:'0 12px'},
      {opacity:1,translate:'0 4px',offset:.38},
      {opacity:1,translate:'0 0'}
    ],{duration:570,delay,easing:'ease-out'}));
  }
  function hop(out) {
    if (!landed || reducedMotion.matches || !Element.prototype.animate) return;
    hopAnimation?.cancel();
    bird.dataset.state='hop';
    const from=out?0:18, to=out?18:0;
    hopAnimation=bird.animate([{transform:`translate(${from}px,0)`},{transform:'translate(9px,-13px) rotate(-5deg)',offset:.45},{transform:`translate(${to}px,0)`}],{duration:280,easing:'ease-out',fill:'forwards'});
    hopAnimation.finished.then(()=>bird.dataset.state=out?'look':'idle').catch(()=>{});
  }
  portfolio.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')hop(true)});
  portfolio.addEventListener('pointerleave',()=>hop(false));
  portfolio.addEventListener('focus',()=>hop(true));
  portfolio.addEventListener('blur',()=>hop(false));
  document.addEventListener('pointermove',event=>{
    if(!landed || reducedMotion.matches || event.pointerType!=='mouse' || bird.dataset.state==='hop')return;
    const b=bird.getBoundingClientRect(),dx=event.clientX-b.left-b.width/2,dy=event.clientY-b.top-b.height/2;
    const near=Math.hypot(dx,dy)<180;
    bird.dataset.state=near?'look':'idle';
    bird.style.setProperty('--look-x',`${near?-Math.max(-2,Math.min(2,dx/50)):0}px`);
    bird.style.setProperty('--look-y',`${near?Math.max(-1,Math.min(1,dy/70)):0}px`);
  },{passive:true});
  document.querySelectorAll('[data-destination]').forEach(link=>{
    const key=link.dataset.destination,url=destination(key);
    if(url)link.href=url;
    link.addEventListener('click',event=>{
      if(url && (event.metaKey||event.ctrlKey||event.shiftKey||event.altKey))return;
      event.preventDefault();
      if(clickTimer)return;
      stopEntrance();
      const go=()=>{
        clickTimer=null;
        if(url){rememberEntrance();location.assign(url);}
        else showNotice({portfolio:'作品集链接待补充。',resume:'简历链接待补充。',fieldNotes:'沿途记录链接待补充。',email:'联系邮箱待补充。'}[key]);
      };
      if(key==='email'||reducedMotion.matches||!Element.prototype.animate){go();return;}
      if(key==='fieldNotes'){
        link.classList.add('is-departing');
        link.querySelector('.field-notes-art').animate([
          {transform:'translateY(-4px) scale(1)'},
          {transform:'translateY(-5px) scale(1.015)',offset:.65},
          {transform:'translateY(-3px) scale(1.01)'}
        ],{duration:400,easing:'cubic-bezier(.2,.75,.25,1)'});
        clickTimer=setTimeout(go,400);
        return;
      }
      const art=link.querySelector('.folder-art');
      art.animate([{transform:'scale(1)'},{transform:'scale(.98)',offset:.2},{transform:'scale(1.02)',offset:.65},{transform:'scale(1)'}],{duration:420,easing:'ease-out'});
      link.querySelector('.papers').animate([{transform:'translateY(0)',opacity:1},{transform:'translateY(-48px)',opacity:1,offset:.7},{transform:'translateY(-52px)',opacity:url?0:1}],{duration:420,easing:'ease-out'});
      clickTimer=setTimeout(go,430);
    });
  });
  reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches){stopEntrance();hopAnimation?.cancel();}});
  window.addEventListener('resize',()=>{if(!landed)stopEntrance();},{passive:true});
  window.addEventListener('pagehide',()=>clearTimeout(clickTimer));
  if (entranceWasCompleted()) stopEntrance();
  else requestAnimationFrame(enter);
})();

