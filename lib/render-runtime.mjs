export function browserOptions(){
 const opts={
  delayRenderTimeoutInMilliseconds:300000,
  timeoutInMilliseconds:300000,
  offthreadVideoCacheSizeInBytes:2147483648,
  chromiumOptions:{
   enableMultiProcessOnLinux:true,
   disableWebSecurity:true,
   gl:'swangle',
   headless:true,
   args:[
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--num-raster-threads=4',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-breakpad',
    '--disable-component-update',
    '--disable-domain-reliability',
    '--disable-sync',
    '--no-first-run',
    '--no-default-browser-check',
    '--no-zygote'
   ]
  }
 };
 return process.env.ATLAS_BROWSER_EXECUTABLE?{...opts,browserExecutable:process.env.ATLAS_BROWSER_EXECUTABLE}:opts;
}

export function renderConcurrency(){
 const value=Number(process.env.ATLAS_RENDER_CONCURRENCY||4);
 if(!Number.isInteger(value)||value<1||value>16)throw Error('ATLAS_RENDER_CONCURRENCY deve ser um inteiro entre 1 e 16.');
 return value;
}
