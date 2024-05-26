import dayjs from 'dayjs';
import yaml from 'yaml';
import fs from 'fs';
import { obterEntregas } from '../api/lojasquare';
import { executarQuery, obterConfig, definirConfig } from '../db/database';
import { enviarNotificacaoEntregaPendente } from '../embeds/entregaPendentesEmbeds';
import { Client } from 'discord.js';
import { registrarLog, registrarErro } from '../utils/loggerUtil';

const config = yaml.parse(fs.readFileSync('config.yml', 'utf8'));

const inicioBot = dayjs().unix();
const intervaloBusca = Math.max(config.lojasquare.intervalo_de_checagem_segundos, 60) * 1000;

export const verificarEntregasPendentes = async (cliente: Client) => {
    if (!config.entregas_pendentes.ativar) {
        registrarLog('Sistema de entregas pendentes está desativado.');
        return;
    }

    let ultimoProcessado = await obterConfig('lastProcessedTimestampPendentes');
    if (config.entregas_pendentes.depurar) {
        registrarLog(`Último Timestamp Processado (Pendentes): ${ultimoProcessado}`);
    }

    if (!ultimoProcessado || isNaN(parseInt(ultimoProcessado))) {
        ultimoProcessado = inicioBot.toString();
        await definirConfig('lastProcessedTimestampPendentes', ultimoProcessado);
    }

    const timestampParseado = parseInt(ultimoProcessado);
    if (config.entregas_pendentes.depurar) {
        registrarLog(`Timestamp Parseado (Pendentes): ${timestampParseado}`);
    }

    const dataInicio = dayjs.unix(timestampParseado).add(1, 'second').format('DD/MM/YYYY');
    const dataFim = dayjs().format('DD/MM/YYYY');

    if (config.entregas_pendentes.depurar) {
        registrarLog(`Data Início (Pendentes): ${dataInicio}, Data Fim: ${dataFim}`);
    }

    const entregas = await obterEntregas(1, dataInicio, dataFim);
    if (entregas && entregas.length > 0) {
        const novasEntregas = await filtrarNovasEntregasPendentes(entregas);

        const entregasAgrupadas = agruparEntregas(novasEntregas);

        for (const grupo of entregasAgrupadas) {
            await enviarNotificacaoEntregaPendente(cliente, grupo);
            for (const entrega of grupo.entregas) {
                if (entrega.produto) {
                    try {
                        await executarQuery(
                            `INSERT INTO entregas_pendentes 
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
                        registrarErro('Erro ao inserir entrega pendente no banco de dados', erro);
                    }
                }
            }
        }

        const novoUltimoTimestamp = Math.max(...novasEntregas.map((entrega: any) => entrega.atualizadoEm));
        await definirConfig('lastProcessedTimestampPendentes', novoUltimoTimestamp.toString());
    } else {
        if (config.entregas_pendentes.depurar) {
            registrarLog('Nenhuma entrega pendente encontrada.');
        }
    }

    setTimeout(() => verificarEntregasPendentes(cliente), intervaloBusca);
};

const filtrarNovasEntregasPendentes = async (entregas: any[]) => {
    const entregasFiltradas = [];
    for (const entrega of entregas) {
        if (entrega.atualizadoEm > inicioBot && entrega.produto) {
            const existe = await executarQuery('SELECT 1 FROM entregas_pendentes WHERE entregaID = ? LIMIT 1', [entrega.entregaID]);
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
