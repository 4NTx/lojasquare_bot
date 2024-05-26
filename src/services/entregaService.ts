import { Client } from 'discord.js';
import { verificarEntregasFeitas } from './entregasFeitasService';
import { verificarEntregasPendentes } from './entregasPendentesService';
import { registrarLog } from '../utils/loggerUtil';
import yaml from 'yaml';
import fs from 'fs';

const config = yaml.parse(fs.readFileSync('config.yml', 'utf8'));

export const verificarEntregas = async (cliente: Client) => {
    if (config.entregas_feitas.ativar) {
        registrarLog('Verificação de entregas feitas ativada.');
        verificarEntregasFeitas(cliente);
    } else {
        registrarLog('Verificação de entregas feitas desativada.');
    }

    if (config.entregas_pendentes.ativar) {
        registrarLog('Verificação de entregas pendentes ativada.');
        verificarEntregasPendentes(cliente);
    } else {
        registrarLog('Verificação de entregas pendentes desativada.');
    }
};
