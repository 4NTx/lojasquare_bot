import { Client, ActivityType } from 'discord.js';
import yaml from 'yaml';
import fs from 'fs';
import { registrarLog } from '../utils/loggerUtil';

const config = yaml.parse(fs.readFileSync('config.yml', 'utf8'));

let indiceAtual = 0;

const obterProximoIndice = (total: number, aleatorio: boolean) => {
    if (aleatorio) {
        return Math.floor(Math.random() * total);
    }
    const indice = indiceAtual;
    indiceAtual = (indiceAtual + 1) % total;
    return indice;
};

const tiposDeAtividade: Record<string, ActivityType> = {
    PLAYING: ActivityType.Playing,
    STREAMING: ActivityType.Streaming,
    LISTENING: ActivityType.Listening,
    WATCHING: ActivityType.Watching,
    CUSTOM: ActivityType.Custom,
    COMPETING: ActivityType.Competing,
};

export const definirStatus = (cliente: Client) => {
    const intervaloMs = (config.bot.status_intervalo_segundos || 10) * 1000;
    const statusRotativos = config.bot.status_rotativos || [];
    const aleatorio = config.bot.status_aleatorio || false;

    if (statusRotativos.length === 0) {
        if (config.bot.depurar) {
            registrarLog('Nenhum status configurado.');
        }
        return;
    }

    setInterval(() => {
        const indice = obterProximoIndice(statusRotativos.length, aleatorio);
        const { nome, tipo } = statusRotativos[indice];
        const statusTipo = tiposDeAtividade[tipo];

        cliente.user?.setActivity(nome, { type: statusTipo });

        if (config.bot.depurar) {
            registrarLog(`Status do bot alterado para: ${nome} (${tipo})`);
        }
    }, intervaloMs);
};
