/* Consent-based GA4: analytics loads only after an explicit opt-in. */
(function(){
  'use strict';
  var ID='G-S1VGS6E8BX', KEY='coachunion_analytics_consent_v1';
  var consent;
  try{consent=localStorage.getItem(KEY);}catch(e){consent=null;}
  function start(){
    if(window.__coachunionGAStarted)return;
    window.__coachunionGAStarted=true;
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments);};
    window.gtag('js',new Date());
    window.gtag('config',ID,{send_page_view:true});
    var script=document.createElement('script');
    script.async=true;
    script.src='https://www.googletagmanager.com/gtag/js?id='+ID;
    document.head.appendChild(script);
    document.addEventListener('click',function(e){
      var link=e.target.closest('a[href*="wa.me/"],a[href*="api.whatsapp.com/"]');
      if(link)window.gtag('event','whatsapp_link_click',{course:document.body.dataset.course||'general'});
    },true);
    document.querySelectorAll('form[data-whatsapp-form]').forEach(function(form){
      var started=false;
      form.addEventListener('focusin',function(){
        if(started)return;started=true;
        window.gtag('event','enrollment_form_start',{course:form.getAttribute('data-whatsapp-form')||'general'});
      });
      form.addEventListener('submit',function(){
        if(form.checkValidity())window.gtag('event','whatsapp_form_open',{course:form.getAttribute('data-whatsapp-form')||'general'});
      },true);
    });
  }
  function choose(value){
    try{localStorage.setItem(KEY,value);}catch(e){}
    var bar=document.getElementById('icu-analytics-consent');
    if(bar)bar.remove();
    if(value==='accepted')start();
  }
  function show(){
    if(consent==='accepted'){start();return;}
    if(consent==='rejected')return;
    var bar=document.createElement('aside');
    bar.id='icu-analytics-consent';
    bar.setAttribute('aria-label','Настройки аналитики');
    bar.style.cssText='position:fixed;z-index:99999;bottom:12px;left:12px;right:12px;max-width:660px;margin:auto;padding:18px;background:#fff;color:#17243b;border:1px solid #d8dfe7;border-radius:14px;box-shadow:0 6px 32px #0003;font:15px/1.5 system-ui,sans-serif';
    bar.innerHTML='<strong>Аналитика сайта</strong><p style="margin:7px 0 12px">С вашего разрешения Google Analytics поможет нам понимать посещаемость и интерес к программам. Необязательная аналитика отключена, пока вы не согласитесь. <a href="/privacy.html">Подробнее</a>.</p><div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" data-icu-consent="accepted" style="padding:9px 14px;background:#1959a6;color:white;border:0;border-radius:7px;cursor:pointer">Разрешить аналитику</button><button type="button" data-icu-consent="rejected" style="padding:9px 14px;background:#edf1f5;color:#17243b;border:1px solid #cdd6e0;border-radius:7px;cursor:pointer">Отклонить</button></div>';
    bar.addEventListener('click',function(e){
      var button=e.target.closest('[data-icu-consent]');
      if(button)choose(button.getAttribute('data-icu-consent'));
    });
    document.body.appendChild(bar);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',show);
  else show();
})();
