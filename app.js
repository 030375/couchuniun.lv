/* ICU Coaching — app.js */
(function(){'use strict';
window.tailwind=window.tailwind||{};window.tailwind.config=window.tailwind.config||{theme:{extend:{colors:{primary:'#0056b3',secondary:'#00a8e8',accent:'#ff6b35',light:'#f8f9fa',dark:'#212529'}}}};
var COURSE_START_DATE=new Date(2026,10,14);
function ready(fn){document.readyState!=='loading'?fn():document.addEventListener('DOMContentLoaded',fn)}
function qs(s,r){return(r||document).querySelector(s)}function qsa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function updateHeaderHeight(){var h=qs('header.site-header,header.fixed');if(h)document.documentElement.style.setProperty('--site-header-height',Math.ceil(h.getBoundingClientRect().height)+'px')}
function initProgress(){var p=qs('.icu-progress');if(!p){p=document.createElement('div');p.className='icu-progress';p.setAttribute('aria-hidden','true');document.body.prepend(p)}function set(){var h=document.documentElement,m=h.scrollHeight-h.clientHeight;p.style.width=(m>0?h.scrollTop/m*100:0)+'%'}window.addEventListener('scroll',set,{passive:true});window.addEventListener('resize',set);set()}
function initMenu(){var b=qs('#mobile-menu-button'),m=qs('#mobile-menu');if(!b||!m)return;b.setAttribute('aria-expanded','false');b.addEventListener('click',function(){m.classList.toggle('hidden');b.setAttribute('aria-expanded',String(!m.classList.contains('hidden')))});qsa('a',m).forEach(function(a){a.addEventListener('click',function(){m.classList.add('hidden');b.setAttribute('aria-expanded','false')})})}
function initCountdown(){var t=qs('#countdown-timer'),d=qs('#countdown-days'),h=qs('#countdown-hours'),mi=qs('#countdown-minutes'),s=qs('#countdown-seconds');if(!t||!d||!h||!mi||!s)return;function u(){var diff=COURSE_START_DATE.getTime()-Date.now();if(diff<=0){t.innerHTML='<p class="col-span-4 text-center py-4 text-primary font-semibold">Группа 14 ноября 2026 года уже начала обучение. Уточните возможность присоединиться или дату следующего набора.</p>';return}d.textContent=String(Math.floor(diff/86400000)).padStart(2,'0');h.textContent=String(Math.floor(diff%86400000/3600000)).padStart(2,'0');mi.textContent=String(Math.floor(diff%3600000/60000)).padStart(2,'0');s.textContent=String(Math.floor(diff%60000/1000)).padStart(2,'0')}u();setInterval(u,1000)}
function initFaq(){qsa('.faq-item').forEach(function(item){var b=qs('.accordion-btn',item),c=qs('.accordion-content',item),i=qs('.fa-chevron-down',item);if(!b||!c)return;b.setAttribute('aria-expanded','false');b.addEventListener('click',function(){var open=item.classList.contains('active');item.classList.toggle('active',!open);c.classList.toggle('active',!open);if(i)i.classList.toggle('rotate-180',!open);b.setAttribute('aria-expanded',String(!open))})})}
function initCompetencies(){var sec=qs('#coach-competencies');if(!sec)return;function close(item){var c=qs('.competency-content',item),i=qs('.competency-arrow .fa-chevron-down',item),h=qs('.competency-header',item);if(!c)return;c.style.maxHeight=c.scrollHeight+'px';requestAnimationFrame(function(){item.classList.remove('active');c.classList.remove('active');c.style.maxHeight='0px';if(i)i.classList.remove('rotate-180');if(h)h.setAttribute('aria-expanded','false')})}function open(item){var c=qs('.competency-content',item),i=qs('.competency-arrow .fa-chevron-down',item),h=qs('.competency-header',item);if(!c)return;item.classList.add('active');c.classList.add('active');if(i)i.classList.add('rotate-180');if(h)h.setAttribute('aria-expanded','true');c.style.maxHeight=c.scrollHeight+'px';setTimeout(function(){if(item.classList.contains('active'))c.style.maxHeight='none'},480)}qsa('.competency-item',sec).forEach(function(item){var h=qs('.competency-header',item),c=qs('.competency-content',item);if(h){h.setAttribute('role','button');h.setAttribute('tabindex','0');h.setAttribute('aria-expanded','false')}if(c)c.style.maxHeight='0px'});sec.addEventListener('click',function(e){var h=e.target.closest('.competency-header');if(!h||!sec.contains(h))return;e.preventDefault();var item=h.closest('.competency-item');if(item)(item.classList.contains('active')?close:open)(item)});sec.addEventListener('keydown',function(e){var h=e.target.closest('.competency-header');if(!h||!sec.contains(h))return;if(e.key==='Enter'||e.key===' '){e.preventDefault();h.click()}})}
function ensureLightbox(){var lb=qs('#site-lightbox');if(!lb){lb=document.createElement('div');lb.id='site-lightbox';lb.className='hidden';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');lb.setAttribute('aria-label','Полноэкранный просмотр документа');lb.innerHTML='<button type="button" class="site-lightbox-close" aria-label="Закрыть">&times;</button><img alt="Полноэкранный просмотр документа">';document.body.appendChild(lb)}return lb}
function openLightbox(src){var lb=ensureLightbox(),img=qs('img',lb);if(img)img.src=src;lb.classList.remove('hidden');document.documentElement.classList.add('site-lightbox-open');document.body.classList.add('site-lightbox-open')}
function closeLightbox(){var lb=qs('#site-lightbox');if(lb){lb.classList.add('hidden');var img=qs('img',lb);if(img)img.removeAttribute('src')}document.documentElement.classList.remove('site-lightbox-open');document.body.classList.remove('site-lightbox-open')}
function initLightbox(){ensureLightbox();document.addEventListener('click',function(e){var trg=e.target.closest('[data-full]');if(!trg)return;e.preventDefault();e.stopPropagation();openLightbox(trg.getAttribute('data-full'))},true);document.addEventListener('click',function(e){var lb=qs('#site-lightbox');if(!lb||lb.classList.contains('hidden'))return;if(e.target===lb||e.target.closest('.site-lightbox-close')){e.preventDefault();closeLightbox()}});document.addEventListener('keydown',function(e){if(e.key==='Escape')closeLightbox()})}
function initForm(){
  var f=qs('#contact-form'); if(!f)return;
  var status=qs('#contact-status',f);
  var submit=qs('button[type="submit"]',f);
  qsa('[data-interest]').forEach(function(link){
    link.addEventListener('click',function(){
      var value=link.getAttribute('data-interest');
      var select=qs('#interest',f);
      if(select)select.value=value;
    });
  });
  f.addEventListener('submit',function(e){
    if(!f.checkValidity()){ e.preventDefault(); f.reportValidity(); return; }
    // Native HTML submission remains available if fetch() isn't supported.
    if(typeof window.fetch!=='function')return;
    e.preventDefault();
    var data=new FormData(f);
    data.set('form-name','coach-consultation');
    if(submit){ submit.disabled=true;submit.setAttribute('aria-busy','true'); }
    if(status){ status.textContent='Отправляем заявку…';status.removeAttribute('data-state'); }
    fetch('/',{
      method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body:new URLSearchParams(data).toString()
    }).then(function(response){
      if(!response.ok)throw new Error('HTTP '+response.status);
      if(status){ status.textContent='Спасибо! Заявка отправлена. Координатор свяжется с вами по указанным контактам.';status.setAttribute('data-state','success');}
      f.reset();
    }).catch(function(){
      if(status){
        status.textContent='Не удалось отправить форму. Попробуйте ещё раз или напишите нам в WhatsApp: +371 260 37277.';
        status.setAttribute('data-state','error');
      }
    }).finally(function(){
      if(submit){submit.disabled=false;submit.removeAttribute('aria-busy');}
    });
  });
}
function initReveal(){/* Keep content visible by default, including on small screens and when scrolling slowly. */qsa('.icu-reveal').forEach(function(el){el.classList.add('is-visible')})}
function initGlass(){if(!qs('.iphone-aurora')){var a=document.createElement('div');a.className='iphone-aurora';a.setAttribute('aria-hidden','true');a.innerHTML='<span></span><span></span><span></span>';document.body.prepend(a)}var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches,fine=window.matchMedia&&window.matchMedia('(pointer:fine)').matches,cards=qsa('section .bg-white.rounded-xl, section .bg-light.rounded-xl, .teacher-card, .testimonial-card, .faq-item');cards.forEach(function(c){c.classList.add('icu-tilt')});if(reduce||!fine)return;cards.forEach(function(c){c.addEventListener('mousemove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform='perspective(900px) rotateX('+(-y*3.5).toFixed(2)+'deg) rotateY('+(x*4.5).toFixed(2)+'deg) translateY(-7px) scale(1.01)'});c.addEventListener('mouseleave',function(){c.style.transform=''})})}
ready(function(){updateHeaderHeight();initProgress();initMenu();initCountdown();initFaq();initCompetencies();initLightbox();initForm();initReveal();initGlass();window.addEventListener('resize',updateHeaderHeight);window.addEventListener('load',updateHeaderHeight);if(document.fonts&&document.fonts.ready){document.fonts.ready.then(updateHeaderHeight)}})
})();
