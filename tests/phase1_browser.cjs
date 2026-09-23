/* Optional browser smoke test, using Playwright installed outside the site root.
 * NODE_PATH=/path/to/test-deps/node_modules node tests/phase1_browser.cjs
 * CHROMIUM_EXECUTABLE can select an existing Chromium binary. */
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const {chromium} = require('playwright');
const root = path.resolve(__dirname,'..');
const server = http.createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://test.local').pathname);
    const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(!file.startsWith(root+path.sep)) {res.writeHead(403).end();return;}
    const data=await fs.readFile(file);
    res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');
    res.end(data);
  } catch {res.writeHead(404).end();}
});
const tools=['cable-size-calculator.html','voltage-drop-calculator.html','battery-inverter-calculator.html','gpa-cgpa-calculator.html'];
const pages=[...tools,'knowledge-base.html','guides/solar-system-sizing-nigerian-home.html','guides/generator-changeover-backup-power-nigeria.html','guides/cbt-term-before-checklist-nigeria.html','guides/phishing-whatsapp-verification-habit-nigeria.html','academy.html','tools.html','news.html'];
(async()=>{
 let browser;
 try {
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}/`;
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox']});
  for(const width of [360,1280]) {
    const context=await browser.newContext({viewport:{width,height:900}});
    // Keep the tests deterministic and verify the pages remain usable without remote fonts.
    await context.route('https://**',route=>route.abort());
    const page=await context.newPage();
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    for(const url of pages){
      const response=await page.goto(base+url);assert.equal(response.status(),200);
      assert.equal(await page.locator('h1').count(),1,url+' h1');
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),url+' horizontal overflow at '+width);
      if(tools.includes(url)){
        await page.getByRole('button',{name:'Calculate estimate',exact:true}).click();
        assert.ok(await page.locator('#result').isVisible(),url+' result');
        assert.ok((await page.locator('#result').innerText()).includes({'cable-size-calculator.html':'4 mm²','voltage-drop-calculator.html':'7.11 V','battery-inverter-calculator.html':'49.86 Ah','gpa-cgpa-calculator.html':'3.83 / 5.00'}[url]));
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),url+' result overflow');
        // Edited or invalid inputs must not leave the previous estimate visible.
        const input=page.locator('form input[type=number]').first();
        await input.fill('');assert.equal(await page.locator('#result').isVisible(),false);
        await page.getByRole('button',{name:'Calculate estimate',exact:true}).click();
        assert.equal(await page.locator('#result').isVisible(),false);
        await page.getByRole('button',{name:'Reset example',exact:true}).click();
        await page.waitForFunction(()=>[...document.querySelectorAll('form input[type=number]')].every(x=>x.value!==''));
        await page.getByRole('button',{name:'Calculate estimate',exact:true}).click();assert.ok(await page.locator('#result').isVisible());
      }
    }
    // Dynamic rows, limits, error messages and reset behaviour.
    for(const [url,count] of [['battery-inverter-calculator.html',4],['gpa-cgpa-calculator.html',3]]){
      await page.goto(base+url);
      await page.locator('#add-row').click();assert.equal(await page.locator('#rows fieldset').count(),count+1);
      await page.locator('#rows fieldset').last().getByRole('button',{name:'Remove row'}).click();assert.equal(await page.locator('#rows fieldset').count(),count);
      for(let n=count;n>1;n--)await page.locator('#rows fieldset').last().getByRole('button',{name:'Remove row'}).click();
      await page.locator('#rows fieldset button').click();assert.equal(await page.locator('#rows fieldset').count(),1);assert.match(await page.locator('#error').innerText(),/at least one/);
      await page.getByRole('button',{name:'Reset example'}).click();await page.waitForFunction(expected=>document.querySelectorAll('#rows fieldset').length===expected,count);
      const ids=await page.locator('input').evaluateAll(inputs=>inputs.map(i=>i.id));assert.equal(new Set(ids).size,ids.length,'unique dynamic input IDs');
    }
    await page.goto(base+'cable-size-calculator.html');await page.locator('#watts').fill('50000');await page.getByRole('button',{name:'Calculate estimate'}).click();assert.match(await page.locator('#result').innerText(),/No candidate/);
    await page.goto(base+'gpa-cgpa-calculator.html');await page.locator('#previousPoints').fill('1');await page.getByRole('button',{name:'Calculate estimate'}).click();assert.match(await page.locator('#error').innerText(),/cannot exceed/);assert.equal(await page.locator('#result').isVisible(),false);
    // Every rendered form control has an accessible label (buttons carry text).
    for(const url of tools){await page.goto(base+url);assert.ok(await page.locator('input,select').evaluateAll(xs=>xs.every(x=>x.labels?.length>0)),url+' labels');}
    assert.deepEqual(errors,[]);await context.close();console.log(`PASS: ${pages.length} pages and calculator interactions at ${width}px`);
  }
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:360,height:800}});
  const page=await context.newPage();await page.goto(base+tools[0]);assert.ok(await page.locator('noscript p').isVisible());assert.ok(await page.getByRole('heading',{name:'Method, scope and source table'}).isVisible());await context.close();
  console.log('PASS: no-JavaScript methodology fallback');
 } finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
