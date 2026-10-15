const fs=require('fs'),path=require('path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const S=require(path.resolve('viewer/sim-core.js'));
const hits=r=>r.events.filter(e=>e.a==='ego'||e.b==='ego');
(async()=>{
 const data=JSON.parse(fs.readFileSync('evidence/viewer.json','utf8'));
 const items=[];
 for(const label of ['bus_bypass','crosswalk_block']){
  const run=data.runs.find(r=>r.label===label);if(!run)continue;
  const r=S.rollout({ego:'planner',others:run.others,params:run.params,policy:run.policy});
  items.push({id:run.id,file:label+'.png',time:hits(r)[0].t,events:hits(r),policy:run.policy});
 }
 let comparison=null;
 for(const run of data.runs.filter(r=>r.others!=='replay')){
  const base=S.rollout({ego:'planner',others:'reactive',params:run.params,policy:run.policy});
  const fixed=S.rollout({ego:'planner',others:'reactive',params:run.params,policy:Object.assign({},S.POLICY,data.policy)});
  if(hits(base).length&&!hits(fixed).length){comparison={...run,id:'FIX-01',policy:null};data.runs.push(comparison);
    items.push({id:'FIX-01',file:'policy_fix_ghost.png',time:hits(base)[0].t,events:[],baseline_events:hits(base),policy:data.policy});break;}
 }
 if(!comparison)throw Error('No saved scenario demonstrates chosen policy avoiding baseline failure');
 fs.mkdirSync('evidence/shots',{recursive:true});
 fs.writeFileSync('evidence/shots/viewer_capture.json',JSON.stringify(data));
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1680,height:1050},colorScheme:'light'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file:///'+path.resolve('viewer/index.html').replace(/\\/g,'/')+'#lab');
 await page.waitForSelector('#labFile');
 await page.locator('#labFile').setInputFiles('evidence/shots/viewer_capture.json');
 await page.waitForFunction(()=>document.querySelector('#labSrc').textContent.includes('viewer_capture.json'));
 for(const item of items){
  await page.locator('#labRuns button').filter({hasText:item.id+' ·'}).click();
  if(await page.locator('#play').getAttribute('aria-label')==='Dừng')await page.locator('#play').click();
  await page.locator('#tLabG').check();
  await page.locator('#time').evaluate((el,t)=>{el.value=String(t);el.dispatchEvent(new Event('input',{bubbles:true}));},item.time+0.05);
  await page.waitForTimeout(1800);
  item.readout=await page.locator('#labRead').innerText();
  await page.locator('#labRead').scrollIntoViewIfNeeded();
  await page.screenshot({path:'evidence/shots/'+item.file});
  console.log(item.id,item.file,item.readout);
 }
 fs.writeFileSync('evidence/shots/capture_metadata.json',JSON.stringify({items,errors,source:'evidence/viewer.json',comparison_note:'FIX-01 replays the same baseline failure scenario with chosen policy as main and baseline as ghost; no world parameters changed.'},null,2));
 await browser.close();
})();
