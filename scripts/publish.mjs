import { cp, mkdir, readdir, stat, writeFile } from 'node:fs/promises';
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
for(const needed of ['index.html','tailwind.min.css','app.js','img/web_img/icu-logo-transparent.webp']){
  if(!(await stat(path.join(dist,needed)).catch(()=>null)))throw Error('Missing publish asset: '+needed);
}
// Keep a public on-site copy of the detailed eight-page programme when its
// existing ICU source is reachable. The visitor-facing page also keeps a
// source link as a fallback. No unverified file is ever written as a PDF.
try {
  const source='https://coachunionlv.com/assets/img/coachprogram.pdf';
  const response=await fetch(source,{redirect:'follow',signal:AbortSignal.timeout(14000)});
  if(!response.ok)throw Error('HTTP '+response.status);
  const pdf=Buffer.from(await response.arrayBuffer());
  if(pdf.length<10000||pdf.length>15000000||pdf.subarray(0,5).toString()!=='%PDF-'){
    throw Error('Source did not return a valid reasonably sized PDF');
  }
  await writeFile(path.join(dist,'coachprogram-detailed-icu.pdf'),pdf);
  console.log('Copied verified detailed ICU PDF ('+pdf.length+' bytes) into dist/');
} catch(error) {
  console.warn('The detailed ICU PDF could not be mirrored; external source link remains available: '+error.message);
}

console.log('Created Netlify dist/ with compiled CSS, optimized images and static pages.');
