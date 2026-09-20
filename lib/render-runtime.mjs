// Leave local defaults intact; Linux deployments provide their own Chromium.
export function browserOptions(){
 return process.env.ATLAS_BROWSER_EXECUTABLE?{browserExecutable:process.env.ATLAS_BROWSER_EXECUTABLE}:{};
}

export function renderConcurrency(){
 const value=Number(process.env.ATLAS_RENDER_CONCURRENCY||6);
 if(!Number.isInteger(value)||value<1||value>16)throw Error('ATLAS_RENDER_CONCURRENCY deve ser um inteiro entre 1 e 16.');
 return value;
}
