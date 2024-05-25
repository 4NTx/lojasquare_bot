import { Client, GatewayIntentBits } from 'discord.js';
import yaml from 'yaml';
import fs from 'fs';
import { verificarEntregas } from '../services/entregaService';
import { registrarLog } from '../utils/loggerUtil';
import { inicializarBancoDeDados } from '../db/database';

const config = yaml.parse(fs.readFileSync('config.yml', 'utf8'));

const cliente = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

cliente.once('ready', async () => {
    registrarLog('Bot está online!');
    await inicializarBancoDeDados();
    verificarEntregas(cliente);
});

cliente.login(config.discord.token);
