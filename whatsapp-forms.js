/* ICU registration through WhatsApp: no site-side storage or Netlify submission. */
(function(){
  'use strict';
  var WHATSAPP_NUMBER='37126037277';
  var courses={
    professional:'Professional Coach ICU — программа из 8 модулей в Риге',
    neuro:'Нейрокоучинг ICU — 12–13 декабря 2026 года, онлайн',
    business:'Бизнес-тренинги с коучинговой методологией ICU'
  };

  function val(data,key){
    return String(data.get(key)||'').trim();
  }
  function add(lines,label,value){
    if(value)lines.push(label+': '+value);
  }
  function prepare(form){
    var type=form.getAttribute('data-whatsapp-form');
    var data=new FormData(form);
    var lines=['Здравствуйте! Хочу получить информацию и записаться на обучение ICU.'];
    lines.push('Программа: '+(courses[type]||'Обучение ICU'));
    if(type==='professional')add(lines,'Цель обучения',val(data,'interest'));
    if(type==='neuro')add(lines,'Тариф',val(data,'rate'));
    if(type==='business')add(lines,'Интересующий тренинг',val(data,'training'));
    add(lines,'Имя',val(data,'name'));
    add(lines,'Email',val(data,'email'));
    add(lines,'Телефон',val(data,'phone'));
    add(lines,'Вопрос',val(data,'question'));
    return 'https://wa.me/'+WHATSAPP_NUMBER+'?text='+encodeURIComponent(lines.join('\n'));
  }

  function init(){
    document.querySelectorAll('form[data-whatsapp-form]').forEach(function(form){
      form.addEventListener('submit',function(event){
        event.preventDefault();
        if(!form.reportValidity())return;
        var status=form.querySelector('[data-whatsapp-status]');
        if(status){
          status.textContent='Открываем WhatsApp с готовым сообщением. Проверьте текст и нажмите «Отправить».';
          // This is an invitation to confirm sending, not a sent-message success state.
        }
        // The message is NOT sent automatically: the visitor confirms it in WhatsApp.
        window.location.assign(prepare(form));
      });
    });

    var main=document.getElementById('contact-form');
    if(main){
      document.querySelectorAll('[data-interest]').forEach(function(link){
        link.addEventListener('click',function(){
          var select=main.querySelector('[name="interest"]');
          var interest=link.getAttribute('data-interest');
          if(select&&interest)select.value=interest;
        });
      });
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
