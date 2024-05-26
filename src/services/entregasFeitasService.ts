import dayjs from 'dayjs';
import yaml from 'yaml';
import fs from 'fs';
import { obterEntregas } from '../api/lojasquare';
import { executarQuery, obterConfig, definirConfig } from '../db/database';
import { enviarNotificacaoEntregaFeita } from '../embeds/entregaFeitasEmbeds';
import { Client } from 'discord.js';
import { registrarLog, registrarErro } from '../utils/loggerUtil';

const config = yaml.parse(fs.readFileSync('config.yml', 'utf8'));

const inicioBot = dayjs().unix();
const intervaloBusca = Math.max(config.lojasquare.intervalo_de_checagem_segundos, 60) * 1000;

export const verificarEntregasFeitas = async (cliente: Client) => {
    if (!config.entregas_feitas.ativar) {
        registrarLog('Sistema de entregas feitas está desativado.');
        return;
    }

    let ultimoProcessado = await obterConfig('lastProcessedTimestampFeitas');
    if (config.entregas_feitas.depurar) {
        registrarLog(`Último Timestamp Processado (Feitas): ${ultimoProcessado}`);
    }

    if (!ultimoProcessado || isNaN(parseInt(ultimoProcessado))) {
        ultimoProcessado = inicioBot.toString();
        await definirConfig('lastProcessedTimestampFeitas', ultimoProcessado);
    }

    const timestampParseado = parseInt(ultimoProcessado);
    if (config.entregas_feitas.depurar) {
        registrarLog(`Timestamp Parseado (Feitas): ${timestampParseado}`);
    }

    const dataInicio = dayjs.unix(timestampParseado).add(1, 'second').format('DD/MM/YYYY');
    const dataFim = dayjs().format('DD/MM/YYYY');

    if (config.entregas_feitas.depurar) {
        registrarLog(`Data Início (Feitas): ${dataInicio}, Data Fim: ${dataFim}`);
    }

    const entregas = await obterEntregas(2, dataInicio, dataFim);
    if (entregas && entregas.length > 0) {
        const novasEntregas = await filtrarNovasEntregas(entregas);

        const entregasAgrupadas = agruparEntregas(novasEntregas);

        for (const grupo of entregasAgrupadas) {
            await enviarNotificacaoEntregaFeita(cliente, grupo);
            for (const entrega of grupo.entregas) {
                if (entrega.produto) {
                    try {
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
                    } catch (erro) {
                        registrarErro('Erro ao inserir entrega no banco de dados', erro);
                    }
                }
            }
        }

        const novoUltimoTimestamp = Math.max(...novasEntregas.map((entrega: any) => entrega.atualizadoEm));
        await definirConfig('lastProcessedTimestampFeitas', novoUltimoTimestamp.toString());
    } else {
        if (config.entregas_feitas.depurar) {
            registrarLog('Nenhuma entrega encontrada.');
        }
    }

    setTimeout(() => verificarEntregasFeitas(cliente), intervaloBusca);
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
        const chave = `${entrega.player}-${entrega.atualizadoEm}-${entrega.servidor}-${entrega.subServidor}`;
        if (!mapa.has(chave)) {
            mapa.set(chave, {
                player: entrega.player,
                atualizadoEm: entrega.atualizadoEm,
                servidor: entrega.servidor,
                subservidor: entrega.subServidor,
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
