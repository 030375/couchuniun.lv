/* Learning-path navigator: no course-completion data is stored or inferred. */
(function(){
  'use strict';
  function init(){
    var area=document.getElementById('program');
    if(!area)return;
    var buttons=Array.from(area.querySelectorAll('[data-course-jump]'));
    var steps=Array.from(area.querySelectorAll('details[data-icu-step]'));
    var status=document.getElementById('icu-course-map-status');
    if(buttons.length!==8||steps.length!==8)return;
    var active=0;
    function sync(n){
      active=n;
      buttons.forEach(function(button){
        var x=Number(button.getAttribute('data-course-jump'));
        var chosen=x===n;
        button.classList.toggle('is-active',chosen);
        button.classList.toggle('is-before',n>0&&x<n);
        button.setAttribute('aria-pressed',chosen?'true':'false');
      });
      if(status)status.textContent=n?'Просматривается модуль '+n+' из 8':'Выберите модуль, чтобы увидеть подробности';
    }
    function openStep(n,scroll){
      var chosen=area.querySelector('details[data-icu-step="'+n+'"]');
      if(!chosen)return;
      steps.forEach(function(step){if(step!==chosen)step.open=false});
      Array.from(area.querySelectorAll('.icu-program-expand')).forEach(function(group){
        if(group!==chosen.closest('.icu-program-expand'))group.open=false;
      });
      var parent=chosen.closest('.icu-program-expand');
      if(parent)parent.open=true;
      chosen.open=true;
      sync(n);
      if(scroll&&typeof chosen.scrollIntoView==='function'){
        var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.requestAnimationFrame(function(){
          chosen.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
        });
      }
    }
    buttons.forEach(function(button){
      button.addEventListener('click',function(){
        openStep(Number(button.getAttribute('data-course-jump')),true);
      });
    });
    steps.forEach(function(step){
      step.addEventListener('toggle',function(){
        if(!step.open){
          if(Number(step.getAttribute('data-icu-step'))===active){
            var opened=steps.find(function(x){return x.open});
            sync(opened?Number(opened.getAttribute('data-icu-step')):0);
          }
          return;
        }
        steps.forEach(function(other){if(other!==step)other.open=false});
        sync(Number(step.getAttribute('data-icu-step')));
      });
    });
    Array.from(area.querySelectorAll('.icu-program-expand')).forEach(function(parent){
      parent.addEventListener('toggle',function(){
        if(!parent.open){
          parent.querySelectorAll('.icu-step-detail[open]').forEach(function(step){step.open=false});
          var opened=steps.find(function(x){return x.open});
          sync(opened?Number(opened.getAttribute('data-icu-step')):0);
        }
      });
    });
    var hash=window.location.hash.match(/^#icu-step-(\d)$/);
    if(hash){var n=Number(hash[1]);if(n>=1&&n<=8)openStep(n,false)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
