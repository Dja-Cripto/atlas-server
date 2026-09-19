import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {validateServiceAccount} from '../lib/vertex.mjs';
import {createStore} from '../lib/store.mjs';
const filename=process.argv[2];if(!filename)throw new Error('Informe o caminho do JSON da conta de serviço.');
let credentials;try{credentials=validateServiceAccount(await readFile(filename,'utf8'));}catch{console.error('Não foi possível ler ou validar a conta de serviço. Nenhum segredo foi exibido.');process.exit(1);}
const store=createStore(fileURLToPath(new URL('../data/',import.meta.url)));
const settings=store.settings();settings.vertexCredentials=JSON.stringify(credentials);settings.vertexProject=credentials.project_id;settings.vertexLocation='global';settings.geminiBackend='vertex';store.saveSettings(settings);store.close();console.log('Conta de serviço importada e Vertex AI selecionado.');
