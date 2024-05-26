import { Client, GatewayIntentBits } from 'discord.js';
import yaml from 'yaml';
import fs from 'fs';
import { verificarEntregasPendentes } from '../services/entregasPendentesService';
import { registrarLog } from '../utils/loggerUtil';
import { inicializarBancoDeDados } from '../db/database';
import { verificarEntregasFeitas } from '../services/entregasFeitasService';
import { definirStatus } from './botStatus';

const config = yaml.parse(fs.readFileSync('config.yml', 'utf8'));

const cliente = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

cliente.once('ready', async () => {
    registrarLog('O Bot está online!');
    await inicializarBancoDeDados();
    verificarEntregasFeitas(cliente);
    verificarEntregasPendentes(cliente);
    definirStatus(cliente);
});

cliente.login(config.bot.token);
