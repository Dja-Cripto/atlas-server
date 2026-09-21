export function browserOptions(){
 const opts={
  delayRenderTimeoutInMilliseconds:300000,
  timeoutInMilliseconds:300000,
  chromiumOptions:{
   enableMultiProcessOnLinux:true,
   disableWebSecurity:true,
   gl:'swangle',
   headless:true
  }
 };
 return process.env.ATLAS_BROWSER_EXECUTABLE?{...opts,browserExecutable:process.env.ATLAS_BROWSER_EXECUTABLE}:opts;
}

export function renderConcurrency(){
 const value=Number(process.env.ATLAS_RENDER_CONCURRENCY||6);
 if(!Number.isInteger(value)||value<1||value>16)throw Error('ATLAS_RENDER_CONCURRENCY deve ser um inteiro entre 1 e 16.');
 return value;
}
