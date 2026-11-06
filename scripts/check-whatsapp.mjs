import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const src=readFileSync('whatsapp-forms.js','utf8');
const navigations=[];
function form(type,values){
  const listeners={};
  const status={textContent:'',attributes:{},setAttribute(k,v){this.attributes[k]=v}};
  return {
    values,type,status,listeners,
    getAttribute(k){return k==='data-whatsapp-form'?type:''},
    addEventListener(kind,fn){listeners[kind]=fn},
    reportValidity(){return true},
    querySelector(selector){
      if(selector==='[data-whatsapp-status]')return status;
      if(selector==='[name="interest"]')return {set value(v){values.interest=v}};
      return null;
    }
  };
}
const samples=[
 form('professional',{interest:'Новая профессия',name:'Анна',email:'anna@example.com',phone:'',question:'Когда следующий поток?',consent:'on'}),
 form('neuro',{name:'Елена',email:'',phone:'+371 20 000 000',rate:'Специалист ICU 170 EUR',question:'Нужен ли опыт?',consent:'on'}),
 form('business',{name:'Дмитрий',email:'',training:'Командообразование и лидерство',question:'Есть занятия в Риге?',consent:'on'})
];
const links=[{getAttribute(name){return name==='data-interest'?'Руководство и HR':null},addEventListener(kind,fn){this.click=fn}}];
const document={
 readyState:'complete',
 querySelectorAll(selector){return selector==='form[data-whatsapp-form]'?samples:selector==='[data-interest]'?links:[]},
 getElementById(id){return id==='contact-form'?samples[0]:null}
};
class FormDataFake{constructor(form){this.values=form.values}get(key){return this.values[key]}}
const window={location:{assign(url){navigations.push(url)}}};
vm.runInNewContext(src,{document,window,FormData:FormDataFake,encodeURIComponent},{timeout:2500});
assert.equal(samples.every(f=>typeof f.listeners.submit==='function'),true,'All three form handlers must bind');
links[0].click();
assert.equal(samples[0].values.interest,'Руководство и HR','Main CTA must select interest before composing');
samples.forEach(f=>{
 let prevented=false;
 f.listeners.submit({preventDefault(){prevented=true}});
 assert.equal(prevented,true,'Site-side form submission must always be cancelled');
 assert.match(f.status.textContent,/нажмите «Отправить»/);
});
assert.equal(navigations.length,3,'Each form must navigate to WhatsApp');
const texts=navigations.map(url=>{
 const target=new URL(url);
 assert.equal(target.host,'wa.me');
 assert.equal(target.pathname,'/37126037277');
 const text=target.searchParams.get('text');
 assert(text&&text.includes('Программа: '));
 assert(!text.includes('consent:')&&!text.includes('on\n'),'Consent status must not be included in chat');
 return text;
});
assert(texts[0].includes('Цель обучения: Руководство и HR'));
assert(texts[0].includes('Имя: Анна'));
assert(texts[0].includes('Вопрос: Когда следующий поток?'));
assert(texts[1].includes('Тариф: Специалист ICU 170 EUR'));
assert(texts[1].includes('Телефон: +371 20 000 000'));
assert(texts[2].includes('Интересующий тренинг: Командообразование и лидерство'));
assert(texts[2].includes('Имя: Дмитрий'));
console.log('WhatsApp routing tests passed for the main ICU, neurocoaching and business-training forms.');
