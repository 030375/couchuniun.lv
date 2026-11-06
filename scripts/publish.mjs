import { cp, mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

// Publish only visitor-facing assets. Avoid shipping source files, node_modules,
// back-up copies and original uncompressed photos to the Netlify CDN.
const root=process.cwd();
const dist=path.join(root,'dist');
const skipTop=new Set(['.git','.netlify','.github','dist','node_modules','scripts','package.json',
  'package-lock.json','netlify.toml','tailwind.config.cjs','tailwind-input.css',
  'poln versija favikon','coachprogram .doc','kouch03_06.7z','htaccess.txt']);
const skipImages=new Set(['ориг','tinified.zip']);

await mkdir(dist,{recursive:true});
for(const entry of await readdir(root,{withFileTypes:true})){
  if(skipTop.has(entry.name)||entry.name.startsWith('.'))continue;
  if(entry.name==='img'){
    const out=path.join(dist,'img');
    await mkdir(out,{recursive:true});
    for(const image of await readdir('img',{withFileTypes:true})){
      if(skipImages.has(image.name))continue;
      await cp(path.join(root,'img',image.name),path.join(out,image.name),{recursive:true});
    }
    continue;
  }
  if(!entry.isDirectory()&&!/\.(html|css|js|txt|xml|pdf|json|ico|webmanifest)$/i.test(entry.name))continue;
  await cp(path.join(root,entry.name),path.join(dist,entry.name),{recursive:true});
}
for(const needed of ['index.html','tailwind.min.css','app.js','img/web_img/icu-logo-transparent.webp','coachprogram-detailed-icu.pdf']){
  if(!(await stat(path.join(dist,needed)).catch(()=>null)))throw Error('Missing publish asset: '+needed);
}
console.log('Created Netlify dist/ with compiled CSS, optimized images and static pages.');
