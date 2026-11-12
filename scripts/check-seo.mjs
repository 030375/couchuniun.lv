import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root=process.cwd();
const domain='https://coachunion.lv';
const pages=[
  'index.html',
  'raspisanie.html',
  'otziw.html',
  'business-coach.html',
  'bisness_kouch.html',
  'library.html',
  'neurocoach.html'
];
const errors=[];
const read=(path)=>readFileSync(resolve(root,path),'utf8');
const assert=(condition,message)=>{if(!condition)errors.push(message)};
const get=(source,pattern)=>source.match(pattern)?.[1];

for(const file of pages){
  const html=read(file);
  const canonical=domain+(file==='index.html'?'/':'/'+file);
  assert(/<html\s[^>]*lang="ru"/i.test(html),file+': Russian content must use lang=ru');
  assert((html.match(/<h1\b/gi)||[]).length===1,file+': expected exactly one h1');
  assert(!!get(html,/<title>([\s\S]*?)<\/title>/i),file+': missing title');
  assert(!!get(html,/<meta\s+name="description"\s+content="([^"]+)"/i),file+': missing meta description');
  assert(html.includes('rel="canonical" href="'+canonical+'"'),file+': canonical mismatch');
  assert(html.includes('property="og:title"'),file+': missing og:title');
  assert(html.includes('property="og:description"'),file+': missing og:description');
  assert(html.includes('property="og:image"'),file+': missing og:image');
  assert(html.includes('name="twitter:card"'),file+': missing Twitter card');

  const data=[...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  assert(data.length>0,file+': no JSON-LD');
  for(const [idx,match] of data.entries()){
    try{
      const doc=JSON.parse(match[1]);
      assert(doc['@context']==='https://schema.org',file+': invalid schema context in #'+idx);
      assert(doc['@graph']||doc['@type'],file+': empty schema #'+idx);
    }catch(error){errors.push(file+': malformed JSON-LD #'+idx+': '+error.message)}
  }
}

const home=read('index.html');
const graph=JSON.parse(get(home,/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/));
const course=graph['@graph'].find(x=>x['@type']==='Course');
assert(!!course,'index.html: Course structured data not found');
assert(!course?.hasCourseInstance?.endDate,'index.html: course end date must remain unset until the new module schedule is confirmed');
assert(course?.hasCourseInstance?.startDate==='2027-03-15','index.html: wrong course start date');
assert(course?.hasCourseInstance?.instructor?.length===4,'index.html: expected four announced instructors');
const prices=(course?.hasCourseInstance?.offers||[]).map(x=>Number(x.price)).sort((a,b)=>a-b);
assert(JSON.stringify(prices)===JSON.stringify([1224,1440]),'index.html: published full-course price mismatch');
assert(!home.includes('Более 200 отзывов от наших студентов'),'index.html: unverified 200+ claim returned');

const neuro=read('neurocoach.html');
const neuroJson=JSON.parse(get(neuro,/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/));
const neuroCourse=neuroJson['@graph'].find(x=>x['@type']==='Course');
assert(!!neuroCourse,'neurocoach.html: Course schema not found');
assert(neuroCourse?.hasCourseInstance?.startDate==='2026-12-12','neurocoach.html: course start date mismatch');
assert(neuroCourse?.hasCourseInstance?.endDate==='2026-12-13','neurocoach.html: course end date mismatch');
assert(neuroCourse?.hasCourseInstance?.instructor?.length===2,'neurocoach.html: two instructors expected');
const neuroPrices=(neuroCourse?.hasCourseInstance?.offers||[]).map(x=>Number(x.price)).sort((a,b)=>a-b);
assert(JSON.stringify(neuroPrices)===JSON.stringify([170,185]),'neurocoach.html: prices do not match the published course');
assert(!neuro.includes('декабря 2024')&&!neuro.includes('+375 29 750 14 11'),'neurocoach.html: stale contact or year');
// Every published enrollment form must open a WhatsApp draft, never POST to Netlify.
const whatsAppForms=[
  {file:'index.html',course:'professional'},
  {file:'neurocoach.html',course:'neuro'},
  {file:'bisness_kouch.html',course:'business'}
];
const waScript=read('whatsapp-forms.js');
for(const entry of whatsAppForms){
  const page=read(entry.file);
  assert(page.includes('data-whatsapp-form="'+entry.course+'"'),entry.file+': missing WhatsApp form');
  assert(page.includes('whatsapp-forms.js'),entry.file+': shared WhatsApp handler not linked');
  assert(page.includes('data-whatsapp-status'),entry.file+': no confirmation message near WhatsApp form');
  assert(!page.includes('data-netlify="true"'),entry.file+': old Netlify submission still active');
  assert(!/<form[^>]*method="POST"/i.test(page),entry.file+': must not submit POST');
  assert(page.includes('onsubmit="return false"'),entry.file+': unsafe form fallback without JS');
}
assert(waScript.includes("WHATSAPP_NUMBER='37126037277'"),'WhatsApp script: Riga number mismatch');
assert(waScript.includes('encodeURIComponent(lines.join'), 'WhatsApp script: missing message URL encoding');
assert(waScript.includes("window.location.assign(prepare(form))"),'WhatsApp script: form no longer opens chat');
assert(!read('app.js').includes("fetch('/',{"),'Main page still posts contacts to server');
assert(!read('business-coach.html').includes('wa.me/375'),'Business coaching signup points to obsolete WhatsApp number');
assert(!read('bisness_kouch.html').includes('wa.me/375'),'Business trainings link points to obsolete WhatsApp number');
assert(read('privacy.html').includes('не отправляется автоматически'),'Privacy page omits manual-send requirement');
assert(existsSync(resolve(root,'img/neurocoaching/jose-enrique-jimenez-soler.jpg')),'neurocoach.html: trainer portrait not in repository');
assert(read('llms.txt').includes(domain+'/neurocoach.html'),'llms.txt: neurocoaching course link missing');

const reviews=read('otziw.html');
const imgUrls=[...reviews.matchAll(/(?:image|fullImage):\s*"(\/img\/reviews\/[^"]+)"/g)].map(x=>x[1]);
assert(imgUrls.length===50,'otziw.html: expected 50 archived local image references');
for(const image of imgUrls)assert(existsSync(resolve(root,image.slice(1))),'otziw.html: missing image '+image);
assert((reviews.match(/"@type": "ListItem"/g)||[]).length>=25,'otziw.html: no 25-item static archive metadata');

const sitemap=read('sitemap.xml');
for(const path of ['/',...pages.filter(f=>f!=='index.html').map(f=>'/'+f),
                    '/coachprogram.pdf','/coachprogram-detailed-icu.pdf']){
  assert(sitemap.includes('<loc>'+domain+path+'</loc>'),'sitemap.xml: missing '+path);
}
assert(!sitemap.includes('/thank-you.html'),'sitemap.xml: noindex thank-you page must be excluded');
assert(!sitemap.includes('/privacy.html'),'sitemap.xml: noindex privacy page must be excluded');
assert(read('robots.txt').includes('Sitemap: '+domain+'/sitemap.xml'),'robots.txt: sitemap declaration missing');
assert(read('llms.txt').includes(domain+'/coachprogram-detailed-icu.pdf'),'llms.txt: source programme document not linked');
assert(existsSync(resolve(root,'coachprogram-detailed-icu.pdf')),'Detailed PDF missing');

if(errors.length){
  console.error('SEO / AI-readability check failed:\n'+errors.map(x=>'  - '+x).join('\n'));
  process.exit(1);
}
console.log('SEO / AI checks passed: '+pages.length+' pages, structured data, sitemap, '+imgUrls.length+' review images, course terms and source PDFs.');
