// A checked five-Short production runs each Short in order, preserving each saved result.
export async function runRequestedShorts(produceOne,{all=false,persist=()=>{}}={}){
 let result;
 do{
  result=await produceOne();
  persist();
  if(!result||typeof result.finished!=='boolean')throw Error('Resultado do Short inválido.');
 }while(all&&!result.finished);
 return result;
}
