import {createStore} from '../lib/store.mjs';
import {preflight} from '../lib/automatic.mjs';
import {defaults} from '../lib/providers.mjs';
import path from 'node:path';
const store=createStore('data');try{await preflight(path.resolve('.'),{...defaults,...store.settings()});console.log('Pré-requisitos locais e configuração presentes. Nenhuma API chamada e nenhum vídeo gerado.');}finally{store.close();}
