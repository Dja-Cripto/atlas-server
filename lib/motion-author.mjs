import {mkdir,readFile,writeFile,access,readdir} from 'node:fs/promises';
import path from 'node:path';
import ts from '../renderer/node_modules/typescript/lib/typescript.js';
import {generateJSON} from './providers.mjs';

const remotionExports=new Set(['AbsoluteFill','Sequence','Series','Img','OffthreadVideo','Video','Freeze','interpolate','interpolateColors','spring','Easing','useCurrentFrame','useVideoConfig','staticFile','random']);
const banned=new Set(['eval','Function','require','process','global','globalThis','window','document','navigator','fetch','XMLHttpRequest','WebSocket','Worker','importScripts','localStorage','sessionStorage','indexedDB','setTimeout','setInterval','requestAnimationFrame','Date','constructor','__proto__','prototype','dangerouslySetInnerHTML','useEffect','useLayoutEffect']);
const easingMembers=new Set(['step0','step1','linear','ease','quad','cubic','poly','sin','circle','exp','elastic','back','spring','bounce','bezier','in','out','inOut']);
const zeroArgumentEasingFunctions=['linear','ease','quad','cubic','sin','circle','exp'];

export function normalizeMotionCode(code,scene=null){
 if(typeof code!=='string')return code;
 let normalized=code
  .replace(/^[ \t]*[a-zA-Z0-9_$]+:\s*(?:any|string|number|boolean|null|undefined)\s*=\s*[^;\n]+;?[ \t]*\r?\n?/gm,'')
  .replace(/\b(const|let|var|function|return|typeof|throw|new|case|default|import|export|switch|while|for)([A-Z_][A-Za-z0-9_]*)\b/g,'$1 $2')
  .replace(/\bconst([a-z][A-Za-z0-9_$]*)\b/g,(m,id)=>{
   if(/^(?:ant|ructor|ruct|rain|titute|able)/.test(id))return m;
   return `const ${id}`;
  })
  .replace(/[\u4e00-\u9fa5]/g,(char)=>char==='嘿'?'Hey':'')
  .replace(/\blet\s+terSpacing\b/g,'letterSpacing')
  .replace(/\breturn(<[A-Za-z])/g,'return $1')
  .replace(/\bdefaultfunction\b/g,'default function')
  .replace(/export\s+default\s+(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=/g,'const $1 =')
  .replace(/export\s+default\s+([A-Za-z0-9_$]+)\s*=\s*/g,'export default ')
  .replace(/Easing\.(?:quart|quartic)\b/g,'Easing.poly(4)')
  .replace(/Easing\.(Out|In|InOut|Quad|Cubic|Sin|Circle|Exp|Elastic|Back|Bounce|Linear|Ease|Bezier)\b/g,(m,name)=>`Easing.${name.charAt(0).toLowerCase()+name.slice(1)}`)
  .replace(/Easing\.(quad|cubic|poly|sin|circle|exp|elastic|back|bounce)\s*\(\s*Easing\.(out|in|inOut)\s*\)/g,(m,curve,dir)=>`Easing.${dir}(Easing.${curve})`)
  .replace(new RegExp(`Easing\\.(${zeroArgumentEasingFunctions.join('|')})\\s*\\(\\s*\\)`,'g'),'Easing.$1')
  .replace(/Easing\.(back|elastic|spring)\b(?!\s*\()/g,'Easing.$1()')
  .replace(/\bspring\s*\(\s*\{([^}]*)\}\s*\)/g,(match,inner)=>{
   if(/\bframe\s*[:,\s}]/.test(inner))return match;
   return `spring({ frame, ${inner.trim()} })`;
  })
  .replace(/([a-zA-Z0-9_$]+)\s*\(\s*\1Safe\(\s*\)\s*\)/g,'$1')
  .replace(/src=["']staticFile\((.*?)\)["']/g,'src={staticFile("$1")}')
  .replace(/src=\{\s*["']staticFile\((.*?)\)["']\s*\}/g,'src={staticFile("$1")}')
  .replace(/src=\{\s*staticFile\(\s*["']staticFile\((.*?)\)["']\s*\)\s*\}/g,'src={staticFile("$1")}')
  .replace(/src=\{\s*staticFile\(\s*staticFile\((.*?)\)\s*\)\s*\}/g,'src={staticFile($1)}')
  .replace(/src=\s*\{\s*(?:scene\??\.asset\??\.src)\s*\}/g,'src={staticFile(scene.asset.src)}')
  .replace(/(\}\}|"|')\s*,\s*(\/?>|\s+[A-Za-z0-9_:-]+=)/g,'$1 $2')
  .replace(/(<AbsoluteFill[^>]*\bstyle=\{\{[^}]*?)\b(?:backgroundColor|background)\s*:\s*['"](?:#(?:0[0-9a-f]{2,5}|1[0-9a-f]{2,5})|black|rgb\(0,\s*0,\s*0\))['"]\s*,?/gi,'$1')
  .replace(/\bstyle=\{\{\s*\}\}/g,'')
  .replace(/(interpolate(?:Colors)?\s*\(\s*[^,]+,\s*)\[\s*(\d+(?:\.\d+)?)\s*,\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\]/g,(m,prefix,start,varName)=>{
   const startNum=Number(start);
   return `${prefix}[${startNum}, Math.max(${startNum+1}, ${varName})]`;
  })
  .replace(/interpolate\s*\(\s*([^,]+)\s*,\s*(\[[^\]]+\])\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*\)/g,'interpolate($1, $2, [$3, 0])')
  .replace(/interpolate\s*\(\s*([^,]+)\s*,\s*(\[[^\]]+\])\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/g,'interpolate($1, $2, [$3, $4])');
 if(scene?.map||Number.isInteger(scene?.backgroundIndex)){
  normalized=normalized.replace(/(<AbsoluteFill[^>]*\bstyle=\{\{[^}]*?)\b(?:backgroundColor|background)\s*:\s*(?:['"][^'"]*?['"]|`[^`]*?`|[^,}]+)\s*,?/gi,"$1backgroundColor: 'transparent', ").replace(/(<AbsoluteFill\s+style=\{\{\s*)\}\}/g,"$1backgroundColor: 'transparent'}}");
 }
 let interIdx=0,interOut='';
 while(interIdx<normalized.length){
  const match=normalized.slice(interIdx).match(/\b(interpolate(?:Colors)?)\s*\(/);
  if(!match){interOut+=normalized.slice(interIdx);break;}
  const startIdx=interIdx+match.index;
  const functionName=match[1];
  const argsStart=startIdx+match[0].length;
  interOut+=normalized.slice(interIdx,startIdx);
  let depth=1,i=argsStart;
  while(i<normalized.length&&depth>0){
   const ch=normalized[i];
   if(ch==='('||ch==='['||ch==='{')depth++;
   else if(ch===')'||ch===']'||ch==='}')depth--;
   i++;
  }
  const inner=normalized.slice(argsStart,i-1);
  interIdx=i;
  const args=[];let cur='',d=0;
  for(let j=0;j<inner.length;j++){
   const ch=inner[j];
   if(ch==='('||ch==='['||ch==='{')d++;
   else if(ch===')'||ch===']'||ch==='}')d--;
   else if(ch===','&&d===0){args.push(cur.trim());cur='';continue;}
   cur+=ch;
  }
  if(cur.trim())args.push(cur.trim());
  if(args[1]&&/^\[\s*-?\d/.test(args[1])){
   const values=args[1].slice(1,-1).split(',').map(value=>Number(value.trim()));
   if(values.length>1&&values.every(Number.isFinite)){
    for(let index=1;index<values.length;index++)if(values[index]<=values[index-1])values[index]=values[index-1]+1;
    args[1]='['+values.join(', ')+']';
   }
  }
  if(args.length>=4&&!args[1].startsWith('[')&&args[3].startsWith('[')){
   const inMin=args[0],inMax=args[1],val=args[2],outRange=args[3],opts=args[4];
   interOut+=`${functionName}(${val}, [${inMin}, ${inMax}], ${outRange}${opts?', '+opts:''})`;
  }else if(args.length===4&&!args[2].startsWith('[')&&!args[3].startsWith('[')){
   interOut+=`${functionName}(${args[0]}, ${args[1]}, [${args[2]}, ${args[3]}])`;
  }else if(args.length===3&&args[2].startsWith('[')&&args[2].endsWith(']')){
   const innerArr=args[2].slice(1,-1).trim();
   const subArgs=[];let subCur='',subD=0;
   for(let k=0;k<innerArr.length;k++){
    const ch=innerArr[k];
    if(ch==='('||ch==='['||ch==='{')subD++;
    else if(ch===')'||ch===']'||ch==='}')subD--;
    else if(ch===','&&subD===0){subArgs.push(subCur.trim());subCur='';continue;}
    subCur+=ch;
   }
   if(subCur.trim())subArgs.push(subCur.trim());
   if(subArgs.length===2&&(subArgs[1].startsWith('{')||subArgs[1].includes('easing')||subArgs[1].includes('extrapolate'))){
    interOut+=`${functionName}(${args[0]}, ${args[1]}, ${subArgs[0]}, ${subArgs[1]})`;
   }else{
    interOut+=`${functionName}(${args.join(', ')})`;
   }
  }else{
    interOut+=`${functionName}(${args.join(', ')})`;
  }
 }
 normalized=interOut;
 if(scene?.asset?.src){
  normalized=normalized.replace(/src=\{\s*(?:asset\??\.src|\(asset\??\.src|\?|undefined|['"]{2})[\s\S]*?\}/g,`src={staticFile("${scene.asset.src}")}`);
  normalized=normalized.replace(/src=\{\s*(?:scene\??\.)?asset\??\.src(?:\s*\?\?\s*['"][^'"]*['"])?\s*\}/g,`src={staticFile("${scene.asset.src}")}`);
  normalized=normalized.replace(/src=\{\s*staticFile\(\s*(?:scene\??\.asset\??\.src|asset\??\.src)\s*\)\s*\}/g,`src={staticFile("${scene.asset.src}")}`);
  normalized=normalized.replace(/<(OffthreadVideo|Video|Img)\b([^>]*?)\bsrc=\{([^}]+)\}([^>]*?)>/g,(m,tag,pre,val,post)=>{
   if(val.includes('staticFile'))return m;
   return `<${tag}${pre}src={staticFile("${scene.asset.src}")}${post}>`;
  });
  normalized=normalized.replace(/<(OffthreadVideo|Video|Img)\b([^>]*?)\bsrc=["']([^"']+)["']([^>]*?)>/g,(m,tag,pre,val,post)=>{
   return `<${tag}${pre}src={staticFile("${scene.asset.src}")}${post}>`;
  });
  normalized=normalized.replace(/<(OffthreadVideo|Video)\b(?![^>]*\bsrc=)([^>]*)>/g,`<$1 src={staticFile("${scene.asset.src}")} $2>`);
  normalized=normalized.replace(/<Img\b(?![^>]*\bsrc=)([^>]*)>/g,`<$1 src={staticFile("${scene.asset.src}")} $2>`);
 }
 if(scene?.asset?.kind==='video')normalized=normalized.replace(/\bImg\b/g,'OffthreadVideo');
 if(scene?.asset?.kind==='photo'||scene?.asset?.kind==='image')normalized=normalized.replace(/\bOffthreadVideo\b/g,'Img');
 if(scene && scene.asset === null){
  normalized=normalized.replace(/<(OffthreadVideo|Video)\b\s*(?:muted\s*)?src=\{\s*staticFile\([^)]*\)\s*\}[^>]*\/>/g,'<SceneBackdrop scene={scene} duration={scene?.durationInFrames||90} />');
 }
 normalized=normalized.replace(/<(OffthreadVideo|Video)\b(?![^>]*\bmuted\b)/g,'<$1 muted ');
 const used=[...remotionExports].filter(name=>new RegExp(`\\b${name}\\b`).test(normalized));
 const match=normalized.match(/import\s*\{([\s\S]*?)\}\s*from\s*['"]remotion['"]\s*;?/),shouldRepairImports=/export\s+default|<[A-Z][A-Za-z0-9]*/.test(normalized);
 if(match&&shouldRepairImports){
  const imported=new Set(match[1].split(',').map(value=>value.trim().split(/\s+as\s+/)[0]).filter(Boolean));
  const missing=used.filter(name=>!imported.has(name));
  if(missing.length)normalized=normalized.replace(match[0],match[0].replace('{','{ '+missing.join(', ')+','));
 }else if(!match&&used.length&&shouldRepairImports)normalized=`import {${used.join(',')}} from 'remotion';\n${normalized}`;
 if(scene?.isShort){
  normalized=normalized
   .replace(/width=\{1920\}\s+height=\{1080\}/g,'width={1080} height={1920}')
   .replace(/width="1920"\s+height="1080"/g,'width={1080} height={1920}')
   .replace(/viewBox="0 0 1920 1080"/g,'viewBox="0 0 1080 1920"');
 }
 normalized=normalizeDefaultExport(normalized);
 return normalized;
}

function normalizeDefaultExport(code){
 try{
  const ast=ts.createSourceFile('Scene.tsx',code,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  const topDecls=new Set(),compDecls=[];let defaultExportName=null,hasDirectDefault=false;
  for(const stmt of ast.statements){
   if(stmt.modifiers?.some(m=>m.kind===ts.SyntaxKind.DefaultKeyword))hasDirectDefault=true;
   if(ts.isExportAssignment(stmt)&&!stmt.isExportEquals){
    if(ts.isIdentifier(stmt.expression))defaultExportName=stmt.expression.text;
    else hasDirectDefault=true;
   }
   if(ts.isVariableStatement(stmt)){
    for(const d of stmt.declarationList.declarations){
     if(ts.isIdentifier(d.name)){
      const name=d.name.text;topDecls.add(name);
      if(/^[A-Z][a-zA-Z0-9_$]*$/.test(name)&&!/^[A-Z0-9_]+$/.test(name))compDecls.push(name);
     }
    }
   }else if(ts.isFunctionDeclaration(stmt)&&stmt.name){
    const name=stmt.name.text;topDecls.add(name);
    if(/^[A-Z]/.test(name))compDecls.push(name);
   }
  }
  if(hasDirectDefault)return code;
  if(defaultExportName){
   if(!topDecls.has(defaultExportName)){
    const fallback=compDecls[compDecls.length-1]||Array.from(topDecls).find(n=>/^[A-Z]/.test(n))||Array.from(topDecls).pop();
    if(fallback){
     const expMatch=code.match(/export\s+default\s+[A-Za-z0-9_$]+\s*;?/);
     if(expMatch)return code.replace(expMatch[0],`export default ${fallback};`);
    }
   }
   return code;
  }
  if(compDecls.length>0)return code+`\nexport default ${compDecls[compDecls.length-1]};\n`;
 }catch{}
 return code;
}

const diagnosticMessage=(diagnostic,source)=>{
 const message=ts.flattenDiagnosticMessageText(diagnostic.messageText,' ');
 if(!Number.isFinite(diagnostic.start))return message;
 const position=source.getLineAndCharacterOfPosition(diagnostic.start);
 const line=source.text.split(/\r?\n/)[position.line]||'';
 return `${message} Line ${position.line+1}, column ${position.character+1}. Nearby source: ${line.trim().slice(0,500)}`;
};

const nodeMessage=(message,node,source)=>{
 const position=source.getLineAndCharacterOfPosition(node.getStart(source));
 const line=source.text.split(/\r?\n/)[position.line]||'';
 return `${message} Linha ${position.line+1}, coluna ${position.character+1}. Trecho: ${line.trim().slice(0,500)}`;
};

const isSafeBoundedFor=(node,numericConstants)=>{
 if(!node.initializer||!ts.isVariableDeclarationList(node.initializer)||node.initializer.declarations.length!==1)return false;
 const declaration=node.initializer.declarations[0];
 if(!ts.isIdentifier(declaration.name)||!declaration.initializer||!ts.isNumericLiteral(declaration.initializer))return false;
 const variable=declaration.name.text;
 if(!node.condition||!ts.isBinaryExpression(node.condition)||!ts.isIdentifier(node.condition.left)||node.condition.left.text!==variable)return false;
 if(!node.condition.operatorToken||![ts.SyntaxKind.LessThanToken,ts.SyntaxKind.LessThanEqualsToken].includes(node.condition.operatorToken.kind))return false;
 const limit=node.condition.right&&ts.isNumericLiteral(node.condition.right)?Number(node.condition.right.text):node.condition.right&&ts.isIdentifier(node.condition.right)?numericConstants.get(node.condition.right.text):NaN;
 if(!Number.isFinite(limit)||limit<0||limit>500)return false;
 if(!node.incrementor)return false;
 if(ts.isPostfixUnaryExpression(node.incrementor)||ts.isPrefixUnaryExpression(node.incrementor))return ts.isIdentifier(node.incrementor.operand)&&node.incrementor.operand.text===variable&&node.incrementor.operator===ts.SyntaxKind.PlusPlusToken;
 return false;
};

export function validateMotionCode(code,scene=null){
 if(typeof code!=='string'||code.length>60000)throw Error('Código ausente ou muito extenso.');
 if(/React\.useCurrentFrame|react\.useCurrentFrame|import\s*\{[^}]*\buseCurrentFrame\b[^}]*\}\s*from\s*['\"]react['\"]/.test(code))throw Error('useCurrentFrame deve ser importado exclusivamente de remotion.');
 const ast=ts.createSourceFile('Scene.tsx',code,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 if(ast.parseDiagnostics.length)throw Error('TSX inválido: '+diagnosticMessage(ast.parseDiagnostics[0],ast));
 const numericConstants=new Map(),animatedRanges=new Map();
 const collectConstants=node=>{
  if(ts.isVariableDeclaration(node)&&ts.isIdentifier(node.name)&&node.initializer){
   if(ts.isNumericLiteral(node.initializer)&&node.parent.flags&ts.NodeFlags.Const)numericConstants.set(node.name.text,Number(node.initializer.text));
   if(ts.isCallExpression(node.initializer)&&ts.isIdentifier(node.initializer.expression)&&node.initializer.expression.text==='interpolate'){
    const range=node.initializer.arguments[2];
    if(range&&ts.isArrayLiteralExpression(range)){
     const values=range.elements.map(element=>ts.isNumericLiteral(element)?Number(element.text):null);
     if(values.length&&values.every(value=>Number.isFinite(value)))animatedRanges.set(node.name.text,{min:Math.min(...values),max:Math.max(...values)});
    }
   }
  }
  ts.forEachChild(node,collectConstants);
 };
 collectConstants(ast);
 let frame=false,exported=false,importsD3=false,firstAbsoluteFill=null;const importedRemotion=new Set(),mediaTags=new Set();
 function visit(node){
  if(ts.isPropertyAssignment(node)&&node.name.getText(ast).replace(/[\"']/g,'')==='opacity'&&ts.isIdentifier(node.initializer)&&animatedRanges.get(node.initializer.text)?.max>1)throw Error(nodeMessage('Opacidade animada ultrapassa 1 e pode cobrir toda a imagem.',node,ast));
  if(ts.isLabeledStatement(node))throw Error(nodeMessage('Declaração rotulada (labeled statement) não permitida.',node,ast));
  if(ts.isExpressionStatement(node)&&node.parent===ast&&ts.isBinaryExpression(node.expression)&&node.expression.operatorToken.kind===ts.SyntaxKind.EqualsToken&&ts.isIdentifier(node.expression.left)){
   throw Error(nodeMessage(`Declaração de constante sem palavra-chave (const/let): ${node.expression.left.text}.`,node,ast));
  }
  if(ts.isIdentifier(node)&&banned.has(node.text))throw Error('API não permitida no componente: '+node.text);
  if(ts.isIdentifier(node)&&node.text==='useCurrentFrame')frame=true;
  if(ts.isCallExpression(node)&&ts.isIdentifier(node.expression)&&node.expression.text==='interpolate'){
   const inArg=node.arguments[1],outArg=node.arguments[2];
   if(inArg&&outArg&&ts.isArrayLiteralExpression(inArg)&&ts.isArrayLiteralExpression(outArg)){
    if(inArg.elements.length!==outArg.elements.length){
     throw Error(nodeMessage(`interpolate(): inputRange (${inArg.elements.length}) e outputRange (${outArg.elements.length}) devem ter exatamente o mesmo número de elementos.`,node,ast));
    }
   }
  }
  if(ts.isPropertyAccessExpression(node)&&ts.isIdentifier(node.expression)&&node.expression.text==='Easing'&&!easingMembers.has(node.name.text))throw Error(nodeMessage(`Função de easing inexistente: Easing.${node.name.text}.`,node,ast));
  if(ts.isCallExpression(node)&&ts.isPropertyAccessExpression(node.expression)&&ts.isIdentifier(node.expression.expression)&&node.expression.expression.text==='Easing'&&zeroArgumentEasingFunctions.includes(node.expression.name.text)&&node.arguments.length===0)throw Error(nodeMessage(`Use Easing.${node.expression.name.text} sem parênteses; o Remotion espera receber essa função de easing.`,node,ast));
  if(ts.isExportAssignment(node)){
   if(ts.isBinaryExpression(node.expression)&&node.expression.operatorToken.kind===ts.SyntaxKind.EqualsToken){
    throw Error(nodeMessage('Atribuição inválida em export default. Exporte o componente diretamente sem atribuir a uma variável não declarada.',node,ast));
   }
   if(ts.isIdentifier(node.expression)){
    const exportId=node.expression.text;
    const isDeclared=ast.statements.some(stmt=>{
     if(ts.isVariableStatement(stmt))return stmt.declarationList.declarations.some(d=>ts.isIdentifier(d.name)&&d.name.text===exportId);
     if(ts.isFunctionDeclaration(stmt))return stmt.name&&stmt.name.text===exportId;
     return false;
    });
    if(!isDeclared)throw Error(nodeMessage(`O identificador exportado como default ("${exportId}") não foi declarado no componente.`,node,ast));
   }
   if(!node.isExportEquals)exported=true;
  }
  if(node.modifiers?.some(m=>m.kind===ts.SyntaxKind.DefaultKeyword))exported=true;
  if(ts.isImportDeclaration(node)){
   const from=node.moduleSpecifier.text;if(!['react','remotion','d3-geo','./motion-kit'].includes(from))throw Error('Import não permitido: '+from);
   if(from==='d3-geo')importsD3=true;
   if(from==='remotion'){
    if(node.importClause?.name||!node.importClause?.namedBindings||!ts.isNamedImports(node.importClause.namedBindings))throw Error('Use imports nomeados do Remotion.');
    for(const item of node.importClause.namedBindings.elements){const original=(item.propertyName||item.name).text;if(!remotionExports.has(original))throw Error('API Remotion não permitida: '+item.name.text);importedRemotion.add(item.name.text);}
   }
  }
  if((ts.isJsxOpeningElement(node)||ts.isJsxSelfClosingElement(node))&&ts.isIdentifier(node.tagName)){
   if(['video','img'].includes(node.tagName.text))throw Error(nodeMessage(`Use o componente Remotion ${node.tagName.text==='video'?'OffthreadVideo ou Video':'Img'}, não <${node.tagName.text}>.`,node,ast));
   if(['Video','OffthreadVideo','Img'].includes(node.tagName.text))mediaTags.add(node.tagName.text);
   if(node.tagName.text==='AbsoluteFill'&&!firstAbsoluteFill)firstAbsoluteFill=node;
  }
  if(ts.isForStatement(node)&&!isSafeBoundedFor(node,numericConstants))throw Error(nodeMessage('Use somente laços for numéricos, determinísticos e limitados a no máximo 500 itens.',node,ast));
  if(ts.isExportDeclaration(node)||ts.isImportEqualsDeclaration(node)||ts.isNewExpression(node)||ts.isWhileStatement(node)||ts.isDoStatement(node))throw Error(nodeMessage('Use um componente React puro, sem carregamento dinâmico, construtores ou loops sem limite verificável.',node,ast));
  if(ts.isCallExpression(node)&&node.expression.kind===ts.SyntaxKind.ImportKeyword)throw Error('Import dinâmico não permitido.');
  if(ts.isStringLiteralLike(node)&&/^(https?:|file:|data:|javascript:|\/\/)/i.test(node.text))throw Error('Use somente os arquivos locais fornecidos nas props.');
  if(ts.isElementAccessExpression(node)&&ts.isStringLiteral(node.argumentExpression)&&banned.has(node.argumentExpression.text))throw Error('Acesso dinâmico não permitido.');
  ts.forEachChild(node,visit);
 }
 visit(ast);if(!frame||!exported)throw Error('Exporte um componente default animado com useCurrentFrame.');
 for(const tag of mediaTags)if(!importedRemotion.has(tag))throw Error(`O componente ${tag} foi usado sem import do Remotion.`);
 if(scene?.asset?.kind==='video'&&mediaTags.has('Img'))throw Error('O material desta cena é vídeo e deve usar Video ou OffthreadVideo, nunca Img.');
 if(scene?.asset?.kind==='image'&&(mediaTags.has('Video')||mediaTags.has('OffthreadVideo')))throw Error('O material desta cena é fotografia e deve usar Img, nunca um componente de vídeo.');
 if(scene?.map&&importsD3)throw Error('A base cartográfica real já é montada pelo robô. Nesta cena, use somente overlays transparentes; não importe d3-geo nem redesenhe países.');
 if(/mixBlendMode\s*:\s*['"](?:screen|color-dodge|plus-lighter)['"]/i.test(code))throw Error('Evite modos de mesclagem luminosos que podem estourar a imagem. Use overlays escuros ou cores com opacidade baixa.');
 if(/opacity\s*:\s*(?:[2-9](?:\.\d+)?|1\.\d*[1-9]\d*)/i.test(code))throw Error('Opacidade visual deve permanecer entre 0 e 1 para evitar estouro de imagem.');
 if((scene?.map||Number.isInteger(scene?.backgroundIndex))&&firstAbsoluteFill){
  const style=firstAbsoluteFill.attributes.properties.find(p=>ts.isJsxAttribute(p)&&p.name.text==='style');
  const expression=style&&ts.isJsxAttribute(style)&&style.initializer&&ts.isJsxExpression(style.initializer)?style.initializer.expression:null;
  if(expression&&ts.isObjectLiteralExpression(expression)&&expression.properties.some(p=>ts.isPropertyAssignment(p)&&['background','backgroundColor'].includes(p.name.getText(ast).replace(/["']/g,''))&&!/transparent/i.test(p.initializer.getText(ast))))throw Error('A cena recebeu mapa ou mídia real de fundo. O AbsoluteFill principal deve permanecer transparente para não esconder esse material.');
 }
 return code;
}

const directorContract=`You are the art director of a US-English geography documentary. Study the whole timed video before directing any individual scene. Create a concise visual bible that gives a motion designer shared context and continuity without prescribing layouts, coordinates, animation recipes or a fixed template.
Return JSON only: {"vision":"short overall visual intention","rhythm":"how visual energy and documentary pacing should evolve","visualLanguage":["a few flexible principles"],"continuityPrinciples":["ways scenes may inherit or deliberately break from each other"],"sceneDirectives":[{"id":"exact scene id","intent":"what the viewer should understand or feel","mustShow":["facts or exact places that must be represented accurately"],"opportunities":["optional creative possibilities, never mandatory execution steps"],"connection":"why this scene follows the previous one; may recommend a deliberate cut"}]}.
Direct meaning, hierarchy, narrative development and breathing room. Do not write TSX. Do not dictate transitions, coordinates, colors, effect names or frame-by-frame choreography. Available media and maps are an inventory, not mandatory layouts. Distinguish mustShow obligations from optional opportunities. Preserve the motion designer's freedom to invent. Real footage should play cleanly without clutter. Maps, photos, charts, type and graphic layers may be combined when meaningful. Avoid repetitive fades, repeated layouts, presentation slides, excessive text, decorative clutter and visual fatigue. A cut is allowed whenever continuity would weaken the story. Use only facts and places supplied in the timeline.`;

export const sceneContract=`You are a highly experienced motion designer and Remotion programmer working under an art director. Create ONE scene, not a multi-scene video and not a template selection. You know the whole video's compact timeline and visual bible, but your coding task is only CURRENT_SCENE. The art director specifies communication goals; you freely choose staging, timing, composition, camera, typography, animation and the connection to neighboring scenes.
DELIVERY: Return JSON only: {"intent":"short description","beats":[{"start":0,"end":3,"action":"what visibly develops"}],"handoff":{"opening":"what the first frame inherits or deliberately replaces","persistentElements":["meaningful elements available to carry forward"],"endState":"precise visual state at the final frame","motionVector":"direction or energy continuing at the cut, or deliberate-cut","nextOpportunity":"optional possibility for the next artist; not a command"},"code":"full TSX source"}. Beat start/end values are SECONDS, never frames; the last beat must reach currentScene.durationInFrames/currentScene.fps.
COMPONENT: Export default function MotionScene({scene,context}: {scene:any;context:any}). useCurrentFrame() is local to this scene. scene.durationInFrames and scene.fps are authoritative. scene contains timed narration, selected assets, exact maps and verified chart values. context contains the visual bible, whole compact timeline, neighbors and previous handoff. Audio is handled by the parent. Canvas is 1920x1080 at 30fps.
VIEWPORT & SAFE AREA: The canvas is strictly 1920x1080. All essential typography, overlay cards, metric panels, comparison bars, indicators, SVGs and labels MUST stay strictly inside the safe zone: X between 80px and 1840px, Y between 60px and 1020px. Never position or animate elements off the screen edge.
OVERFLOW PREVENTION: Right-aligned cards/infoboxes (e.g. right: 80 to right: 120) MUST have maxWidth <= 600px (or width <= 540px) with boxSizing: 'border-box'. When animating right-aligned elements with spring/interpolate, translate inward from the center (e.g. translateX(\${interpolate(s, [0, 1], [40, 0])}px)), NEVER push elements outward off-screen. All progress bars, rule lines, and SVG indicator paths must be clamped within their container (e.g. Math.min(maxWidth, width) or overflow: 'hidden'). Nested child offsets are relative to their parent container, not the 1920 canvas.
VISUAL BREATHING ROOM & NO TEXT CLUTTER: Do NOT put cards, text boxes, or graphics on every single scene! At least 40% of VIDEO scenes MUST be clean, unobstructed cinematic footage with ZERO text or at most a minimal 2-3 word location identifier. When previousScene had an info card or graphic, CURRENT_SCENE should give the viewer visual breathing room. Never bombard the viewer with non-stop text card after text card.
TEXT RESTRAINT & MINIMALISM: Headings must be at most 3-4 words. Captions must be at most 6-8 words. NEVER display paragraphs, full sentences, or multiple stacked cards. Let the voice do the talking while the screen provides clean cinematic atmosphere or a single focal data point.
MOTION GRAPHICS & DATA VISUALIZATION: You have full creative freedom to build impressive motion graphics! When the narration introduces key statistics, percentages, currency, or economic mechanisms, bring them to life with dynamic animated counters, comparison bars, or metric cards. But reserve these moments for true data highlights — do not turn ordinary sentences into text cards.
CINEMATIC FOOTAGE & B-ROLL: When the scene is atmospheric scenery or showing a location, let the footage breathe with smooth camera motion (subtle scale 1.04 to 1.10, gentle drift) and completely uncluttered framing. Always keep video footage muted (<OffthreadVideo muted ... />).
PHOTOS & ARCHIVAL IMAGES: When scene.asset is a photo, ALWAYS use objectFit cover with an expressive Ken Burns camera push (scale 1.06 to 1.16, gentle driftX -20px to +20px), soft bottom scrim, and subtle corner vignette. NEVER leave photos static, letterboxed with black empty margins, or distorted. Treat archival photos as living cinematic moments: the subject-aware push or pan must be perceptible at normal playback, and any annotation should appear only when it explains a verified detail. Keep the image continuously moving through the scene without looping or a frozen hold. Never use a bright full-frame exposure flash, white wash, mixBlendMode screen/color-dodge/plus-lighter, or any opacity above 1; these effects destroy image detail.
MAP SCENES: The parent automatically mounts an accurate, animated Natural Earth basemap with precise country geometry, centroid highlights, labels, and animated connecting routes between focal countries at true geographic coordinates. DO NOT attempt to draw custom bezier route curves, arrows, or country pins in SceneX.tsx. Instead, design clean editorial typography: sleek context cards, chapter titles, or narrative stats in margins or sidebars over the transparent map canvas.
LAYOUT VARIETY: Vary the visual layout across scenes. Alternate between bottom-left, bottom-right, top-left pill, or side split cards based on where the footage has natural negative space, keeping the visual rhythm dynamic and pleasant.
CREATIVE FREEDOM & PACING: Do not mechanically copy the previous scene. Inherit, transform, overlay, match-cut, hard-cut or reset according to the story. Do not default to fade-in/fade-out. Building blocks are not layouts. Invent an original composition for the current idea. Cover the duration with purposeful visual development, but 'action' includes calm, cinematic holds, data reveals, and subtle continuous camera drift. Elements may settle and hold cleanly while the voice explains the idea. Do not turn missing media into a title slide. Avoid essay headings and text covering the subject. If currentScene has a map or backgroundIndex, the root MUST remain transparent so the supplied background remains visible.
FACTS: Use only supplied narration/research, exact geographic data and verified chart values. Do not invent numbers, coordinates, borders, images or travel routes. Do not portray an unrelated location as the requested place. An asset marked representationRole contextual is thematic B-roll, not proof of the named location, person, structure or event: use it for broad atmosphere or concepts and never attach a label claiming it is the exact subject. Unsupported quantitative graphics must become qualitative explanation.
TOOLS: For media use staticFile(scene.asset.src); trimStart is seconds and must be converted to frames for startFrom. Never play media past its available duration. Use objectFit cover for both photos and footage. Named imports from remotion: AbsoluteFill, Sequence, Series, Img, OffthreadVideo, Video, Freeze, interpolate, interpolateColors, spring, Easing, useCurrentFrame, useVideoConfig, staticFile, random.
INTERPOLATION SAFETY: All inputRange arrays passed to interpolate() or interpolateColors() MUST be strictly monotonically increasing (e.g. [0, 1] or [0, Math.max(1, D)], NEVER identical values like [1, 1] or [0, 0]).
EASING: Pass built-in easing functions without invoking them: Easing.quad, Easing.cubic, Easing.sin, Easing.circle, Easing.exp, Easing.ease or Easing.linear. Parameterized factories must be invoked: Easing.back(), Easing.elastic(), Easing.poly(4) or Easing.bezier(...). For example, use Easing.out(Easing.cubic), never Easing.out(Easing.cubic()).
EXECUTION: Deterministic frame-driven React only. No network, filesystem, external URLs, runtime packages, dynamic imports, browser globals, side effects, eval or timers. Arrays/map are preferred. A numeric for loop is allowed only to build deterministic visual arrays when it starts from a numeric literal, uses a numeric literal upper bound no greater than 500 and increments with ++. No while/do loops. No HTML video/img. Do not registerRoot or Composition. Keep the code focused on this one scene and reasonably compact. Code must be valid TSX.`;

const readJSON=async filename=>{try{return JSON.parse(await readFile(filename,'utf8'));}catch{return null;}};

export function sceneUnits(manifest){
 const fps=Number.isFinite(Number(manifest?.fps))&&Number(manifest.fps)>0?Number(manifest.fps):30;
 const duration=Number.isFinite(Number(manifest?.duration))&&Number(manifest.duration)>0?Number(manifest.duration):0;
 const rawScenes=Array.isArray(manifest?.scenes)?manifest.scenes:[];
 const units=rawScenes.map((source,index)=>{
  const startSec=Number.isFinite(Number(source?.start))?Number(source.start):0;
  const endSec=Number.isFinite(Number(source?.end))?Number(source.end):(startSec+1);
  const from=Math.max(0,Math.round(startSec*fps));
  const calcEnd=index===rawScenes.length-1&&duration>0?Math.ceil(duration*fps):Math.round(endSec*fps);
  const end=Math.max(from+1,Number.isFinite(calcEnd)?calcEnd:from+30);
  return {...source,index,from,originalStart:source?.start,originalEnd:source?.end,start:0,end:(end-from)/fps,durationInFrames:Math.max(1,end-from),fps,title:manifest?.title||''};
 });
 for(const scene of units){
  if(scene.asset||scene.map)continue;
  const countries=new Set(scene.countries||[]);
  const isRelevant=candidate=>candidate.asset&&(!countries.size||(candidate.countries||[]).some(country=>countries.has(country)));
  // Only real media can carry forward as a softened background. Reusing the
  // nearest map here made country outlines appear again in unrelated scenes.
  const background=units.slice(0,scene.index).reverse().find(isRelevant)||units.slice(scene.index+1).find(isRelevant);
  if(background)scene.backgroundIndex=background.index;
 }
 return units;
}

function compactScene(scene){
 return {id:scene.id,index:scene.index,start:scene.originalStart,end:scene.originalEnd,narration:scene.narration,heading:scene.heading,caption:scene.caption,kind:scene.kind,treatment:scene.treatment,label:scene.label,labelStyle:scene.labelStyle,labelRole:scene.labelRole,location:scene.location,countries:scene.countries,routes:scene.routes,layout:scene.layout,hasAsset:Boolean(scene.asset),asset:scene.asset?{src:scene.asset.src,kind:scene.asset.kind,trimStart:scene.asset.trimStart,duration:scene.asset.duration,representationRole:scene.asset.representationRole}:undefined,backgroundIndex:scene.backgroundIndex,chart:scene.chart?{unit:scene.chart.unit,values:scene.chart.values,source:scene.chart.source}:undefined};
}

export function cleanPromptScene(scene){
 return scene.map?{...scene,map:{type:scene.map.type,countries:scene.countries,features:scene.map.features?.map(f=>({properties:f.properties}))}}:scene;
}

// Kept for older local tooling that inspects a group, while new production authors one scene at a time.
export function cleanPromptSequence(sequence){
 return {...sequence,scenes:sequence.scenes.map(cleanPromptScene)};
}

export function normalizeBeats(beats,seconds,fps=30){
 if(!Array.isArray(beats))return beats;
 const maxEnd=Math.max(0,...beats.map(beat=>Number(beat?.end)||0));
 if(maxEnd>seconds*2&&maxEnd<=Math.ceil(seconds*fps)+1)return beats.map(beat=>({...beat,start:Number(beat.start)/fps,end:Number(beat.end)/fps}));
 return beats;
}

export function normalizeMotionResult(result,seconds,fps=30){
 if(!result||typeof result!=='object')return result;
 const candidate=result.beats||result.beholds||result.actions||result.timeline;
 result.beats=normalizeBeats(Array.isArray(candidate)&&candidate.length?candidate:[{start:0,end:seconds,action:String(result.intent||'Purposeful visual development continues throughout the scene.')}],seconds,fps);
 delete result.beholds;delete result.actions;delete result.timeline;
 return result;
}

function validateBeats(beats,seconds){
 if(!Array.isArray(beats)||!beats.length||beats.length>24)throw Error('Descreva as ações visuais desta cena.');
 let end=0;for(const b of beats){if(!Number.isFinite(b.start)||!Number.isFinite(b.end)||b.start<0||b.end<=b.start||b.start>end+.1||b.end>seconds+.15||typeof b.action!=='string'||!b.action.trim())throw Error('O plano contém intervalos sem ação ou tempos inválidos.');end=Math.max(end,b.end);}
 if(end<seconds-.1)throw Error('O plano visual termina antes da narração.');
}

function validateHandoff(handoff){
 if(!handoff||typeof handoff.opening!=='string'||!Array.isArray(handoff.persistentElements)||typeof handoff.endState!=='string'||typeof handoff.motionVector!=='string'||typeof handoff.nextOpportunity!=='string')throw Error('Descreva corretamente o estado visual entregue à próxima cena.');
}

const readLatestValidAttempt=async(folder,scene)=>{
 for(let attempt=3;attempt>=1;attempt--){
  const saved=await readJSON(path.join(folder,`scene-${scene.index}-attempt-${attempt}.json`));if(!saved)continue;
  try{normalizeMotionResult(saved,scene.durationInFrames/scene.fps,scene.fps);saved.code=normalizeMotionCode(saved.code,scene);validateBeats(saved.beats,scene.durationInFrames/scene.fps);validateHandoff(saved.handoff);validateMotionCode(saved.code,scene);return saved;}catch{}
 }
 try{
  const parent=path.dirname(folder);
  const siblings=await readdir(parent);
  for(const sib of siblings){
   if(sib===path.basename(folder))continue;
   const candFile=path.join(parent,sib,`scene-${scene.index}.json`);
   const candTsx=path.join(parent,sib,`Scene${scene.index}.tsx`);
   const saved=await readJSON(candFile);
   if(saved&&saved.code){
    try{
     normalizeMotionResult(saved,scene.durationInFrames/scene.fps,scene.fps);
     saved.code=normalizeMotionCode(saved.code,scene);
     validateMotionCode(saved.code,scene);
     return saved;
    }catch{}
   }
   try{
    const code=await readFile(candTsx,'utf8');
    if(code&&code.length>50){
     validateMotionCode(code,scene);
     return {intent:scene.heading||'Documentary scene',beats:[{start:0,end:scene.durationInFrames/scene.fps,action:'Pre-generated motion sequence'}],handoff:{opening:'editorial cut',persistentElements:[],endState:'visual element holding',motionVector:'gentle camera drift',nextOpportunity:'seamless continuation'},code};
    }
   }catch{}
  }
 }catch{}
 return null;
};

export function sampleTimelineForDirector(timeline,limit=12){
 if(!Array.isArray(timeline)||timeline.length<=limit)return timeline||[];
 const count=Math.max(2,limit);
 return Array.from({length:count},(_,index)=>timeline[Math.round(index*(timeline.length-1)/(count-1))]);
}
export function normalizeVisualBible(bible,scenes){
 if(!bible||typeof bible!=='object')return null;
 const vision=typeof bible.vision==='string'&&bible.vision.trim()?bible.vision.trim():'Documentary exploration of geographical and economic realities.';
 const rhythm=typeof bible.rhythm==='string'&&bible.rhythm.trim()?bible.rhythm.trim():'Paced, engaging visual storytelling with room to breathe.';
 const visualLanguage=Array.isArray(bible.visualLanguage)&&bible.visualLanguage.length?bible.visualLanguage.map(String):['Clean, focused editorial style','Purposeful motion design'];
 const continuityPrinciples=Array.isArray(bible.continuityPrinciples)&&bible.continuityPrinciples.length?bible.continuityPrinciples.map(String):['Maintain geographic context','Smooth transitions between related sequences'];
 const existingDirectives=Array.isArray(bible.sceneDirectives)?bible.sceneDirectives:Array.isArray(bible.directives)?bible.directives:Array.isArray(bible.scenes)?bible.scenes:[];
 const existingMap=new Map(existingDirectives.filter(d=>d&&d.id).map(d=>[d.id,d]));
 const sceneDirectives=scenes.map(scene=>{
  const existing=existingMap.get(scene.id);
  if(existing&&typeof existing==='object'){
   return {
    id:scene.id,
    intent:String(existing.intent||scene.heading||'Visual explanation of narrative segment'),
    mustShow:Array.isArray(existing.mustShow)?existing.mustShow.map(String):(scene.countries||[]),
    opportunities:Array.isArray(existing.opportunities)?existing.opportunities.map(String):[],
    connection:String(existing.connection||'Documentary progression')
   };
  }
  return {
   id:scene.id,
   intent:scene.heading||'Documentary continuation',
   mustShow:scene.countries||[],
   opportunities:[],
   connection:'Documentary progression'
  };
 });
 return {vision,rhythm,visualLanguage,continuityPrinciples,sceneDirectives};
}

export function validateVisualBible(bible,scenes){
 if(!bible||typeof bible.vision!=='string'||typeof bible.rhythm!=='string'||!Array.isArray(bible.visualLanguage)||!Array.isArray(bible.continuityPrinciples)||!Array.isArray(bible.sceneDirectives))throw Error('Direção visual global fora do formato esperado.');
 const ids=new Set(bible.sceneDirectives.map(x=>x?.id));
 if(scenes.some(scene=>!ids.has(scene.id)))throw Error('A direção visual global não contemplou todas as cenas.');
}

export function generateCleanMediaSceneCode(scene){
 if(!scene?.asset?.src)throw Error('Mídia limpa exige um vídeo ou fotografia selecionada.');
 const isVideo=scene.asset.kind==='video';
 const label=scene.treatment==='label'?(scene.label||scene.location||scene.heading||''):'';
 const safeLabel=String(label).replaceAll('"','\\"');
 const tones={
  documentary:{accent:'#d7eee5',style:"fontFamily:'Arial, sans-serif',color:'#f5f1e7',fontWeight:700,letterSpacing:'.01em'"},
  historical:{accent:'#d5ad68',style:"fontFamily:'Georgia, serif',color:'#f0dfbf',fontWeight:500,letterSpacing:'.035em'"},
  geopolitical:{accent:'#ef6548',style:"fontFamily:'Arial, sans-serif',color:'#f4f7f5',fontWeight:800,letterSpacing:'.12em',textTransform:'uppercase'"},
  curiosity:{accent:'#f3c64f',style:"fontFamily:'Trebuchet MS, sans-serif',color:'#fff7d8',fontWeight:800,letterSpacing:'-.015em'"},
  dramatic:{accent:'#b94235',style:"fontFamily:'Georgia, serif',color:'#fff4e8',fontWeight:700,letterSpacing:'.025em',textShadow:'0 3px 18px rgba(0,0,0,.7)'"},
  minimal:{accent:'#ffffff',style:"fontFamily:'Helvetica Neue, Arial, sans-serif',color:'#ffffff',fontWeight:500,letterSpacing:'.02em'"}
 };
 const tone=tones[scene.labelStyle]||tones.documentary;
 const roleSizes={title:52,caption:27,identity:36,date:46};
 const fontSize=roleSizes[scene.labelRole]||36;
 const variant=Math.abs(Number(scene.index)||0)%4;
 const placements=[
  "left:64,bottom:58,padding:'12px 18px',borderRadius:8,background:'rgba(7,20,18,.68)',borderLeft:'4px solid "+tone.accent+"'",
  "left:72,top:70,padding:'9px 0 9px 22px',background:'transparent',borderLeft:'5px solid "+tone.accent+"'",
  "left:'50%',bottom:76,transform:'translateX(-50%)',padding:'8px 22px',background:'rgba(5,14,18,.42)',borderBottom:'2px solid "+tone.accent+"',textAlign:'center'",
  "right:68,bottom:60,padding:'10px 17px',borderRadius:999,background:'rgba(7,20,18,.72)',border:'1px solid "+tone.accent+"'"
 ];
 const labelStyle=placements[variant]+','+tone.style;
 return `import React from 'react';
import {AbsoluteFill,Img,OffthreadVideo,interpolate,staticFile,useCurrentFrame} from 'remotion';
export default function MotionScene({scene}: {scene:any; context?:any}) {
 const frame=useCurrentFrame();
 const duration=Math.max(1,scene.durationInFrames||${scene.durationInFrames||90});
 const progress=interpolate(frame,[0,duration],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const scale=1.025+progress*.045;
 const drift=(progress-.5)*18;
 const labelOpacity=interpolate(frame,[4,12,Math.max(13,duration-12),Math.max(14,duration-4)],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const labelLift=interpolate(frame,[4,14],[12,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 return <AbsoluteFill style={{overflow:'hidden',backgroundColor:'#101817'}}>
  ${isVideo?`<OffthreadVideo muted src={staticFile("${scene.asset.src}")} startFrom={Math.round((scene.asset.trimStart||0)*30)} style={{width:'100%',height:'100%',objectFit:'cover',transform:\`scale(\${scale}) translateX(\${drift}px)\`}}/>`:`<Img src={staticFile("${scene.asset.src}")} style={{width:'100%',height:'100%',objectFit:'cover',transform:\`scale(\${scale}) translateX(\${drift}px)\`}}/>`}
  ${safeLabel?`<div style={{position:'absolute',maxWidth:'72%',boxSizing:'border-box',boxShadow:'0 10px 32px rgba(0,0,0,.18)',fontSize:${fontSize},lineHeight:1.04,opacity:labelOpacity,${labelStyle},marginTop:labelLift}}>${safeLabel}</div>`:''}
 </AbsoluteFill>;
}`;
}

export function generateFallbackSceneCode(scene,isShort=false){
 const dur=scene?.durationInFrames||90;
 const isVideo=scene?.asset?.kind==='video';
 const hasAsset=Boolean(scene?.asset?.src);
 const assetSrc=scene?.asset?.src||'';
 const heading=scene?.heading?scene.heading.replace(/"/g,'\\"'):'';
 const caption=scene?.caption?scene.caption.replace(/"/g,'\\"'):'';
 return `import React from 'react';
import {AbsoluteFill,staticFile,useCurrentFrame,interpolate,Img,OffthreadVideo} from 'remotion';

export default function MotionScene({scene}: {scene: any; context?: any}) {
  const frame = useCurrentFrame();
  const dur = scene?.durationInFrames || ${dur};
  const scale = interpolate(frame, [0, Math.max(1, dur)], [1.02, 1.08], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{backgroundColor: 'transparent', overflow: 'hidden', fontFamily: "'Helvetica Neue', Arial, sans-serif"}}>
      ${hasAsset ? (isVideo ? `
      <OffthreadVideo muted src={staticFile("${assetSrc}")} startFrom={Math.round((scene?.asset?.trimStart || 0) * 30)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: \`scale(\${scale})\`}} />` : `
      <Img src={staticFile("${assetSrc}")} style={{width: '100%', height: '100%', objectFit: 'cover', transform: \`scale(\${scale})\`}} />`) : ''}
      ${heading ? `
      <AbsoluteFill style={{justifyContent: 'flex-end', padding: ${isShort ? "'0 40px 260px'" : 80}}}>
        <div style={{background: 'rgba(7, 16, 25, 0.78)', padding: '12px 24px', borderRadius: 8, backdropFilter: 'blur(8px)', display: 'inline-block', maxWidth: ${isShort ? "'90%'" : "'620px'"}}}>
          <h2 style={{margin: 0, color: '#F2ECDD', fontSize: ${isShort ? 28 : 32}, fontWeight: 700, letterSpacing: 1}}>${heading}</h2>
          ${caption ? `<p style={{margin: '6px 0 0', color: '#E7A23C', fontSize: ${isShort ? 16 : 18}, fontWeight: 500}}>${caption}</p>` : ''}
        </div>
      </AbsoluteFill>` : ''}
    </AbsoluteFill>
  );
}
`;
}

export async function authorMotion(s,j,manifest,{root,log,repairError,repairSceneIndexes=[]}){
 const folder=path.join(root,'renderer/src/generated',j.auto.runId);await mkdir(folder,{recursive:true});
 const scenes=sceneUnits(manifest),timeline=scenes.map(compactScene),model=s.motionModel||'glm-5.3-flash';
 j.auto.motion={model,total:scenes.length,completed:0,current:1,unit:'scene'};j.auto.progress=70;
 await writeFile(path.join(folder,'motion-kit.ts'),"export {ContextMap} from '../../ContextMap';\nexport {SceneBackdrop} from '../../SceneBackdrop';\n");

 const bibleFile=path.join(folder,'visual-bible.json');let visualBible=await readJSON(bibleFile);
 if(!visualBible){
  log(j,`GLM (${model}): criando a direção visual global para ${scenes.length} cenas.`);
  try{
   if((j.events||[]).filter(event=>event.message?.includes('direção global falhou')).length>=2)throw Error('As tentativas anteriores já falharam.');
   const briefTimeline=sampleTimelineForDirector(timeline);
   const rawBible=await generateJSON({...s,sceneProvider:'go',goModel:model,timeoutMs:420000},j,directorContract+'\nVIDEO_DATA: '+JSON.stringify({title:j.title,sceneCount:scenes.length,timeline:briefTimeline})+'\nOnly direct the sampled scene IDs. Other scene directives will be derived from the full timeline locally.');
   visualBible=normalizeVisualBible(rawBible,scenes);
  }catch(err){
   log(j,`GLM: direção global indisponível (${String(err.message).slice(0,160)}). Usando direção segura derivada das cenas já revisadas.`);
   visualBible=normalizeVisualBible({},scenes);
  }
  validateVisualBible(visualBible,scenes);
  await writeFile(bibleFile,JSON.stringify(visualBible,null,2));
 }else visualBible=normalizeVisualBible(visualBible,scenes)||visualBible;
 validateVisualBible(visualBible,scenes);
 log(j,`Direção visual global pronta; iniciando programação cena por cena com ${model}.`);

 let previousHandoff=null;const handoffs=[];
 for(const scene of scenes){
  const filename=path.join(folder,`scene-${scene.index}.json`);let saved=await readJSON(filename)||await readLatestValidAttempt(folder,scene);
  const repairThisScene=Boolean(repairError&&repairSceneIndexes.includes(scene.index));
  let previousCode=repairThisScene?saved?.code:undefined;if(repairThisScene)saved=null;
  let feedback=repairThisScene?`The assembled video identified this scene in a compile/render failure: ${repairError.slice(0,2500)}. Correct the technical defect and preserve its art direction.`:'';
  const directive=visualBible.sceneDirectives.find(x=>x.id===scene.id);
  const context={visualBible,timeline,previousScene:timeline[scene.index-1]||null,currentScene:timeline[scene.index],nextScene:timeline[scene.index+1]||null,previousHandoff};
  const promptScene=cleanPromptScene(scene);
  j.auto.motion.current=scene.index+1;j.auto.progress=70+Math.round((scene.index/scenes.length)*15);
  if(scene.asset?.kind==='video'&&['clean','label'].includes(scene.treatment)&&!repairThisScene){
   const code=generateCleanMediaSceneCode(scene);
   validateMotionCode(code,scene);
   const accepted={intent:scene.treatment==='label'?'Identified documentary media':'Clean documentary media',beats:[{start:0,end:Math.round((scene.durationInFrames/scene.fps)*10)/10,action:'Subtle continuous camera movement lets the selected media breathe.'}],handoff:{opening:'direct editorial cut',persistentElements:[],endState:'full-bleed media remains visible',motionVector:'gentle camera drift'},code};
   await writeFile(filename,JSON.stringify(accepted,null,2));await writeFile(path.join(folder,`Scene${scene.index}.tsx`),code);
   previousHandoff=accepted.handoff;handoffs.push(previousHandoff);
   j.auto.motion.completed=scene.index+1;j.auto.progress=70+Math.round((j.auto.motion.completed/scenes.length)*15);
   log(j,`Cena ${scene.index+1}/${scenes.length}: mídia ${scene.treatment==='label'?'com identificação mínima':'limpa'}, sem chamada adicional ao GLM.`);
   continue;
  }
  log(j,`GLM programando cena ${scene.index+1} de ${scenes.length}...`);
  let accepted=null;
  for(let attempt=0;attempt<3;attempt++){
   let result=saved;
   if(!result){
    if(attempt>0)log(j,`GLM: corrigindo a cena ${scene.index+1}/${scenes.length} (${attempt+1}/3)...`);
    try{
     result=await generateJSON({...s,sceneProvider:'go',goModel:model,timeoutMs:420000},j,sceneContract+'\nSCENE_ASSIGNMENT: '+JSON.stringify({artDirection:directive,currentScene:promptScene,context,feedback,previousCode}));
     await writeFile(path.join(folder,`scene-${scene.index}-attempt-${attempt+1}.json`),JSON.stringify(result,null,2));
    }catch(err){
     if(attempt===2){
      log(j,`Cena ${scene.index+1}: auto-resolvida com composição segura de contingência.`);
      const fallbackCode=generateFallbackSceneCode(scene,false);
      accepted={intent:scene.heading||'Documentary Scene',beats:[{start:0,end:Math.round((scene.durationInFrames/scene.fps)*10)/10,action:scene.heading||'Visual scene'}],handoff:{opening:'clean cut',persistentElements:[],endState:'stable cut',motionVector:'deliberate-cut'},code:fallbackCode};
      await writeFile(filename,JSON.stringify(accepted,null,2));await writeFile(path.join(folder,`Scene${scene.index}.tsx`),fallbackCode);break;
     }
     feedback=`Generation attempt failed: ${err.message}. Return the requested JSON with concise valid TSX.`;continue;
    }
   }
   try{
    normalizeMotionResult(result,scene.durationInFrames/scene.fps,scene.fps);result.code=normalizeMotionCode(result.code,scene);validateBeats(result.beats,scene.durationInFrames/scene.fps);validateHandoff(result.handoff);validateMotionCode(result.code,scene);
    await writeFile(filename,JSON.stringify(result,null,2));await writeFile(path.join(folder,`Scene${scene.index}.tsx`),result.code);accepted=result;break;
   }catch(e){
    saved=null;feedback=`Your previous scene failed validation. ${e.message} Repair the specific defect while preserving the scene's creative intent.`;previousCode=result?.code;
    if(attempt===2){
     log(j,`Cena ${scene.index+1}: auto-resolvida com composição segura de contingência.`);
     const fallbackCode=generateFallbackSceneCode(scene,false);
     accepted={intent:scene.heading||'Documentary Scene',beats:[{start:0,end:Math.round((scene.durationInFrames/scene.fps)*10)/10,action:scene.heading||'Visual scene'}],handoff:{opening:'clean cut',persistentElements:[],endState:'stable cut',motionVector:'deliberate-cut'},code:fallbackCode};
     await writeFile(filename,JSON.stringify(accepted,null,2));await writeFile(path.join(folder,`Scene${scene.index}.tsx`),fallbackCode);break;
    }
   }
  }
  previousHandoff=accepted.handoff;handoffs.push(previousHandoff);
  j.auto.motion.completed=scene.index+1;j.auto.progress=70+Math.round((j.auto.motion.completed/scenes.length)*15);
  log(j,`GLM programou cena ${scene.index+1}/${scenes.length} com sucesso.`);
 }

 const imports=scenes.map(scene=>`import Scene${scene.index} from './Scene${scene.index}';`).join('\n');
 const contexts=scenes.map((scene,index)=>({visualBible,previousHandoff:handoffs[index-1]||null,previousScene:timeline[index-1]||null,nextScene:timeline[index+1]||null}));
 const children=scenes.map(scene=>`<Sequence from={${scene.from}} durationInFrames={${scene.durationInFrames}}><AbsoluteFill><SceneBackdrop scene={scenes[${scene.index}]} backgroundScene={Number.isInteger(scenes[${scene.index}].backgroundIndex)?scenes[scenes[${scene.index}].backgroundIndex]:null} duration={${scene.durationInFrames}}/><Scene${scene.index} scene={scenes[${scene.index}]} context={contexts[${scene.index}]} /></AbsoluteFill></Sequence>`).join('');
    let bgmTag='';
    const jobBgmRel=`auto/${j.auto.runId}/bgm.mp3`;
    const vol=j.selectedMusic?.defaultVolume||0.06;
    try{
     await access(path.join(root,'renderer/public',jobBgmRel));
     const bgmLoopFrames=Math.max(30,Math.floor((j.selectedMusic?.durationSeconds||60)*30));
     bgmTag=`<Loop durationInFrames={${bgmLoopFrames}}><Audio src={staticFile("${jobBgmRel}")} volume={bgmVol} /></Loop>`;
     log(j,`BGM: trilha "${j.selectedMusic?.name||'selecionada'}" com ducking dinâmico (${Math.round(vol*100)}% fala, 3% dados, 18% abertura).`);
    }catch{
     try{
      await access(path.join(root,'renderer/public/audio/bgm-ambient.mp3'));
      bgmTag=`<Loop durationInFrames={1800}><Audio src={staticFile("audio/bgm-ambient.mp3")} volume={bgmVol} /></Loop>`;
      log(j,`BGM: trilha ambiente padrão com ducking dinâmico.`);
     }catch{
      log(j,'BGM: nenhuma trilha encontrada; prosseguindo sem música de fundo.');
     }
    }
  const entry=`import React from 'react';import {AbsoluteFill,Audio,Loop,Sequence,Composition,registerRoot,staticFile} from 'remotion';import {SceneBackdrop} from './motion-kit';\n${imports}\nconst scenes=${JSON.stringify(scenes)};\nconst contexts=${JSON.stringify(contexts)};\nconst bgmVol=(f)=>{if(f<75)return 0.18;const sc=scenes.find(s=>f>=s.from&&f<s.from+s.durationInFrames);if(sc?.kind==='chart')return 0.03;return ${vol};};\nconst Video=()=> <AbsoluteFill style={{background:'#142d32',fontFamily:'Arial, sans-serif'}}><Audio src={staticFile(${JSON.stringify(manifest.voice)})}/>${bgmTag}${children}</AbsoluteFill>;registerRoot(()=> <Composition id="AutomaticVideo" component={Video} durationInFrames={${Math.ceil(manifest.duration*30)}} fps={30} width={1920} height={1080}/>);`;
  const entryPoint=path.join(folder,'index.tsx');await writeFile(entryPoint,entry);return entryPoint;
}

export const shortsDirectorContract=`You are the art director of a US-English geography curiosity YouTube Short. This is a single vertical video of approximately 50 seconds covering one fascinating curiosity. Create a concise visual bible for a vertical 1080x1920 mobile-first composition.
Return JSON only: {"vision":"short visual intention","rhythm":"how energy builds in under a minute","visualLanguage":["flexible principles"],"sceneDirectives":[{"id":"exact scene id","intent":"what the viewer should understand","mustShow":["facts that must appear"],"opportunities":["creative possibilities"]}]}.
CRITICAL SHORT FORMAT RULES:
- The narration starts IMMEDIATELY at second zero with a hook (no silent intro). The first scene MUST have a bold visual hook in the first 10 frames (0.3s).
- CLEAN UNCLUTTERED COMPOSITION: Mobile screens are compact. DO NOT overcrowd the screen with multiple competing widgets, boxes, or tags. Keep it to ONE main headline and at most ONE clean supporting stat.
- MAP DISCIPLINE: Prefer real footage (<OffthreadVideo>) or aerial photos (<Img>). At most ONE map in the entire Short. NEVER use small circular globes or tiny centered maps.
- Safe zone: top 200px reserved for YouTube UI, bottom 250px reserved for captions/title. Central zone must showcase the footage/map cleanly.
- Text must be large and legible on mobile (52-76px headlines, 36-44px stats). Maximum 4-5 words per line.
- Pacing: build rapid momentum without visual noise. Every frame counts.`;

export const shortsSceneContract=`You are a highly experienced motion designer and Remotion programmer creating ONE scene for a vertical YouTube Short. The canvas is strictly 1080x1920 at 30fps (9:16 portrait). You know the whole Short's compact timeline and visual bible, but your coding task is only CURRENT_SCENE.
DELIVERY: Return JSON only: {"intent":"short description","beats":[{"start":0,"end":3,"action":"what visibly develops"}],"handoff":{"opening":"what the first frame inherits","persistentElements":["elements to carry forward"],"endState":"visual state at final frame","motionVector":"direction continuing at cut","nextOpportunity":"optional possibility for next artist"},"code":"full TSX source"}. Beat start/end values are SECONDS.
COMPONENT: Export default function MotionScene({scene,context}: {scene:any;context:any}). useCurrentFrame() is local to this scene. scene.durationInFrames and scene.fps are authoritative. Canvas is strictly 1080x1920 at 30fps.
STRICT VERTICAL DIMENSIONS & NO HORIZONTAL CODE:
- The canvas is 1080px wide and 1920px tall. NEVER use 1920 as width or 1080 as height for the viewport.
- Any <svg> MUST specify width={1080} height={1920} or viewBox="0 0 1080 1920".
- Vertical safe area: X between 60px and 1020px (max container width 960px). Y between 200px and 1720px. Top 200px is YouTube UI, bottom 200px is YouTube caption bar.
CLEAN, ELEGANT MOBILE DESIGN — NO INFORMATION OVERLOAD:
- DO NOT clutter the screen with multiple stacked cards, badges, chips, and labels.
- Maximum ONE bold headline (top third: top: 220-300px, max 4 words, at least 52px font).
- Maximum ONE clean stat, counter, or pill card. Keep the center open so the visual media is clearly visible.
- Never stack 3 or more competing text blocks in the same scene. Less is more on mobile.
MAPS IN VERTICAL SHORTS (CRITICAL):
- NEVER draw a small circular globe or tiny horizontal map centered with empty space!
- If the scene is a map, it MUST fill the entire vertical canvas (1080x1920) in a dramatic macro zoom. Zoom tightly into the specific territory/waterway so land and water fill the screen vertically, with a bold glowing corridor and giant readable country labels (font 56-72px).
- If you cannot make the map large, dramatic and full-bleed, use vertical contextual footage (<OffthreadVideo>) or aerial photo (<Img>) with a glowing pin and callout card instead of an SVG map.
VERTICAL FOOTAGE:
- Use objectFit cover. Scale footage to fill 1080x1920 without letterboxing. Always keep video footage muted (<OffthreadVideo muted ... />).
- For still photos, use a visible but restrained subject-aware push or pan across the full shot; do not leave the image frozen behind animated text. Keep video footage clean.
PACING:
- Fast and punchy. Hook viewers within the first 0.5s of the scene. No slow fades.
TOOLS:
- staticFile(scene.asset.src) for media. Named imports from remotion: AbsoluteFill, Sequence, Series, Img, OffthreadVideo, Video, Freeze, interpolate, interpolateColors, spring, Easing, useCurrentFrame, useVideoConfig, staticFile, random.
EXECUTION:
- Deterministic frame-driven React only. No network, eval, timers, side effects. Valid TSX.`;

export async function authorShortsMotion(s,j,manifest,{root,log,shortIndex}){
 const folder=path.join(root,'renderer/src/generated',j.auto.runId,'shorts',`short-${shortIndex}`);await mkdir(folder,{recursive:true});
 const scenes=sceneUnits(manifest),timeline=scenes.map(compactScene),model=s.motionModel||'glm-5.3-flash';
 scenes.forEach(sc => { sc.isShort = true; });
 log(j,`Short ${shortIndex+1}: GLM (${model}) programando ${scenes.length} cenas verticais.`);
 await writeFile(path.join(folder,'motion-kit.ts'),"export {ShortsBackdrop as SceneBackdrop} from '../../../../ShortsBackdrop';\n");

 const bibleFile=path.join(folder,'visual-bible.json');let visualBible=await readJSON(bibleFile);
 if(!visualBible){
  for(let attempt=0;attempt<3;attempt++){
   try{
    const rawBible=await generateJSON({...s,sceneProvider:'go',goModel:model,timeoutMs:240000},j,shortsDirectorContract+'\nVIDEO_DATA: '+JSON.stringify({title:manifest.title,timeline}));
    visualBible=normalizeVisualBible(rawBible,scenes);
    if(visualBible){await writeFile(bibleFile,JSON.stringify(visualBible,null,2));break;}
   }catch(err){
    if(attempt===2)throw err;
    log(j,`Short ${shortIndex+1}: tentativa ${attempt+1}/3 de direção falhou (${err.message}).`);
   }
  }
  if(!visualBible)throw Error('Não foi possível gerar a direção visual do Short.');
 }else visualBible=normalizeVisualBible(visualBible,scenes)||visualBible;
 validateVisualBible(visualBible,scenes);

 let previousHandoff=null;const handoffs=[];
 for(const scene of scenes){
  const filename=path.join(folder,`scene-${scene.index}.json`);let saved=await readJSON(filename);
  let feedback='';
  const directive=visualBible.sceneDirectives.find(x=>x.id===scene.id);
  const context={visualBible,timeline,previousScene:timeline[scene.index-1]||null,currentScene:timeline[scene.index],nextScene:timeline[scene.index+1]||null,previousHandoff};
  const promptScene=cleanPromptScene(scene);
  log(j,`Short ${shortIndex+1}: GLM programando cena ${scene.index+1}/${scenes.length}...`);
  let accepted=null;
  for(let attempt=0;attempt<3;attempt++){
   let result=saved;
   if(!result){
    if(attempt>0)log(j,`Short ${shortIndex+1}: corrigindo cena ${scene.index+1} (${attempt+1}/3)...`);
    try{
     result=await generateJSON({...s,sceneProvider:'go',goModel:model,timeoutMs:240000},j,shortsSceneContract+'\nSCENE_ASSIGNMENT: '+JSON.stringify({artDirection:directive,currentScene:promptScene,context,feedback}));
     await writeFile(path.join(folder,`scene-${scene.index}-attempt-${attempt+1}.json`),JSON.stringify(result,null,2));
    }catch(err){
     if(attempt===2){
      log(j,`Short ${shortIndex+1} cena ${scene.index+1}: auto-resolvida com composição vertical segura de contingência.`);
      const fallbackCode=generateFallbackSceneCode(scene,true);
      accepted={intent:scene.heading||'Short Scene',beats:[{start:0,end:Math.round((scene.durationInFrames/scene.fps)*10)/10,action:scene.heading||'Vertical scene'}],handoff:{opening:'clean cut',persistentElements:[],endState:'stable cut',motionVector:'deliberate-cut'},code:fallbackCode};
      await writeFile(filename,JSON.stringify(accepted,null,2));await writeFile(path.join(folder,`Scene${scene.index}.tsx`),fallbackCode);break;
     }
     feedback=`Generation attempt failed: ${err.message}. Return valid JSON with TSX.`;continue;
    }
   }
   try{
    normalizeMotionResult(result,scene.durationInFrames/scene.fps,scene.fps);result.code=normalizeMotionCode(result.code,scene);validateBeats(result.beats,scene.durationInFrames/scene.fps);validateHandoff(result.handoff);validateMotionCode(result.code,scene);
    await writeFile(filename,JSON.stringify(result,null,2));await writeFile(path.join(folder,`Scene${scene.index}.tsx`),result.code);accepted=result;break;
   }catch(e){
    saved=null;feedback=`Validation failed: ${e.message} Fix the defect.`;
    if(attempt===2){
     log(j,`Short ${shortIndex+1} cena ${scene.index+1}: auto-resolvida com composição vertical segura de contingência.`);
     const fallbackCode=generateFallbackSceneCode(scene,true);
     accepted={intent:scene.heading||'Short Scene',beats:[{start:0,end:Math.round((scene.durationInFrames/scene.fps)*10)/10,action:scene.heading||'Vertical scene'}],handoff:{opening:'clean cut',persistentElements:[],endState:'stable cut',motionVector:'deliberate-cut'},code:fallbackCode};
     await writeFile(filename,JSON.stringify(accepted,null,2));await writeFile(path.join(folder,`Scene${scene.index}.tsx`),fallbackCode);break;
    }
   }
  }
  previousHandoff=accepted.handoff;handoffs.push(previousHandoff);
  log(j,`Short ${shortIndex+1}: cena ${scene.index+1}/${scenes.length} pronta.`);
 }

 const imports=scenes.map(scene=>`import Scene${scene.index} from './Scene${scene.index}';`).join('\n');
 const contexts=scenes.map((scene,index)=>({visualBible,previousHandoff:handoffs[index-1]||null,previousScene:timeline[index-1]||null,nextScene:timeline[index+1]||null}));
 const children=scenes.map(scene=>`<Sequence from={${scene.from}} durationInFrames={${scene.durationInFrames}}><AbsoluteFill><SceneBackdrop scene={scenes[${scene.index}]} backgroundScene={Number.isInteger(scenes[${scene.index}].backgroundIndex)?scenes[scenes[${scene.index}].backgroundIndex]:null} duration={${scene.durationInFrames}}/><Scene${scene.index} scene={scenes[${scene.index}]} context={contexts[${scene.index}]} /></AbsoluteFill></Sequence>`).join('');
 let bgmTag='';
 const shortBgmRel=`auto/${j.auto.runId}/shorts/short-${shortIndex}/bgm.mp3`;
 try{
  await access(path.join(root,'renderer/public',shortBgmRel));
  bgmTag=`<Loop durationInFrames={1800}><Audio src={staticFile("${shortBgmRel}")} volume={0.06} /></Loop>`;
 }catch{
  try{
   await access(path.join(root,'renderer/public/audio/bgm-ambient.mp3'));
   bgmTag='<Loop durationInFrames={1800}><Audio src={staticFile("audio/bgm-ambient.mp3")} volume={0.06} /></Loop>';
  }catch{}
 }
 const entry=`import React from 'react';import {AbsoluteFill,Audio,Loop,Sequence,Composition,registerRoot,staticFile} from 'remotion';import {SceneBackdrop} from './motion-kit';\n${imports}\nconst scenes=${JSON.stringify(scenes)};\nconst contexts=${JSON.stringify(contexts)};\nconst Short=()=> <AbsoluteFill style={{background:'#0f1f1d',fontFamily:'Arial, sans-serif'}}><Audio src={staticFile(${JSON.stringify(manifest.voice)})}/>${bgmTag}${children}</AbsoluteFill>;registerRoot(()=> <Composition id="AutomaticShort" component={Short} durationInFrames={${Math.ceil(manifest.duration*30)}} fps={30} width={1080} height={1920}/>);`;
 const entryPoint=path.join(folder,'index.tsx');await writeFile(entryPoint,entry);return entryPoint;
}
