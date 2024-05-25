import dayjs from 'dayjs';
import yaml from 'yaml';
import fs from 'fs';
import { obterEntregas } from '../api/lojasquare';
import { executarQuery, obterConfig, definirConfig } from '../db/database';
import { enviarNotificacaoEntrega } from '../embeds/entregaEmbeds';
import { Client } from 'discord.js';
import { registrarLog } from '../utils/loggerUtil';

const config = yaml.parse(fs.readFileSync('config.yml', 'utf8'));

const inicioBot = dayjs().unix();
const intervaloBusca = Math.max(config.tempo_busca.intervalo_segundos, 60) * 1000;

export const verificarEntregas = async (cliente: Client) => {
    const ultimoProcessado = await obterConfig('lastProcessedTimestamp');
    registrarLog(`Último Timestamp Processado: ${ultimoProcessado}`);

    const timestampParseado = ultimoProcessado ? parseInt(ultimoProcessado) : inicioBot;
    registrarLog(`Timestamp Parseado: ${timestampParseado}`);

    const dataInicio = isNaN(timestampParseado)
        ? dayjs().subtract(1, 'day').format('DD/MM/YYYY')
        : dayjs.unix(timestampParseado).add(1, 'second').format('DD/MM/YYYY');
    const dataFim = dayjs().format('DD/MM/YYYY');

    registrarLog(`Data Início: ${dataInicio}, Data Fim: ${dataFim}`);

    const entregas = await obterEntregas(2, dataInicio, dataFim);
    if (entregas && entregas.length > 0) {
        const novasEntregas = await filtrarNovasEntregas(entregas);

        const entregasAgrupadas = agruparEntregas(novasEntregas);

        for (const grupo of entregasAgrupadas) {
            await enviarNotificacaoEntrega(cliente, grupo);
            for (const entrega of grupo.entregas) {
                if (entrega.produto) {
                    await executarQuery(
                        `INSERT INTO entregas_enviadas 
            (entregaID, produto, quantidade, player, servidor, subServidor, codigo, status, atualizadoEm) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            entrega.entregaID,
                            entrega.produto,
                            entrega.quantidade,
                            entrega.player,
                            entrega.servidor,
                            entrega.subServidor,
                            entrega.codigo,
                            entrega.status,
                            new Date(entrega.atualizadoEm * 1000)
                        ]
                    );
                }
            }
        }

        const novoUltimoTimestamp = Math.max(...novasEntregas.map((entrega: any) => entrega.atualizadoEm));
        await definirConfig('lastProcessedTimestamp', novoUltimoTimestamp.toString());
    }

    setTimeout(() => verificarEntregas(cliente), intervaloBusca);
};

const filtrarNovasEntregas = async (entregas: any[]) => {
    const entregasFiltradas = [];
    for (const entrega of entregas) {
        if (entrega.atualizadoEm > inicioBot && entrega.produto) {
            const existe = await executarQuery('SELECT 1 FROM entregas_enviadas WHERE entregaID = ? LIMIT 1', [entrega.entregaID]);
            if (existe.length === 0) {
                entregasFiltradas.push(entrega);
            }
        }
    }
    return entregasFiltradas;
};

const agruparEntregas = (entregas: any[]) => {
    const grupos: any[] = [];
    const mapa = new Map();

    for (const entrega of entregas) {
        const chave = `${entrega.player}-${entrega.atualizadoEm}-${entrega.servidor}`;
        if (!mapa.has(chave)) {
            mapa.set(chave, {
                player: entrega.player,
                atualizadoEm: entrega.atualizadoEm,
                servidor: entrega.servidor,
                entregas: []
            });
        }
        mapa.get(chave).entregas.push(entrega);
    }

    for (const grupo of mapa.values()) {
        grupos.push(grupo);
    }

    return grupos;
};
