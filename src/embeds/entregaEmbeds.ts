import { TextChannel, EmbedBuilder, Client } from 'discord.js';
import yaml from 'yaml';
import fs from 'fs';
import { registrarLog } from '../utils/loggerUtil';

const config = yaml.parse(fs.readFileSync('config.yml', 'utf8'));

export const enviarNotificacaoEntrega = async (cliente: Client, grupo: any) => {
    const canalId = config.discord.channel_id;
    if (!canalId) {
        registrarLog('ID do canal não está definido nas configurações.');
        return;
    }

    const canal = cliente.channels.cache.get(canalId) as TextChannel;
    if (canal) {
        const embed = new EmbedBuilder()
            .setColor(config.mensagens.notificacao_entrega.cor)
            .setTimestamp();

        if (config.mensagens.notificacao_entrega.footer.usar) {
            embed.setFooter({
                text: config.mensagens.notificacao_entrega.footer.texto,
                iconURL: config.mensagens.notificacao_entrega.footer.icone_url,
            });
        }

        const adicionarCampoSeMostrar = (campoConfig: any, valor: any) => {
            if (campoConfig.mostrar) {
                embed.addFields({
                    name: campoConfig.nome,
                    value: valor || campoConfig.desconhecido,
                    inline: campoConfig.inline,
                });
            }
        };

        if (grupo.entregas.length > 1) {
            embed.setTitle(config.mensagens.notificacao_entrega.titulo_multiplas);

            adicionarCampoSeMostrar(config.mensagens.notificacao_entrega.campos.player, grupo.player);
            adicionarCampoSeMostrar(config.mensagens.notificacao_entrega.campos.servidor, grupo.servidor);
            adicionarCampoSeMostrar(config.mensagens.notificacao_entrega.campos.atualizado_em, new Date(grupo.atualizadoEm * 1000).toLocaleString());

            grupo.entregas.forEach((entrega: any) => {
                adicionarCampoSeMostrar(config.mensagens.notificacao_entrega.campos.produto, entrega.produto);
                adicionarCampoSeMostrar(config.mensagens.notificacao_entrega.campos.quantidade, entrega.quantidade.toString());
            });

        } else {
            const entrega = grupo.entregas[0];
            embed.setTitle(config.mensagens.notificacao_entrega.titulo_sucesso);

            adicionarCampoSeMostrar(config.mensagens.notificacao_entrega.campos.produto, entrega.produto);
            adicionarCampoSeMostrar(config.mensagens.notificacao_entrega.campos.player, entrega.player);
            adicionarCampoSeMostrar(config.mensagens.notificacao_entrega.campos.servidor, entrega.servidor);
            adicionarCampoSeMostrar(config.mensagens.notificacao_entrega.campos.subservidor, entrega.subServidor);
            adicionarCampoSeMostrar(config.mensagens.notificacao_entrega.campos.codigo, entrega.codigo);
            adicionarCampoSeMostrar(config.mensagens.notificacao_entrega.campos.quantidade, entrega.quantidade.toString());
            adicionarCampoSeMostrar(config.mensagens.notificacao_entrega.campos.status, entrega.status);
            adicionarCampoSeMostrar(config.mensagens.notificacao_entrega.campos.atualizado_em, new Date(entrega.atualizadoEm * 1000).toLocaleString());
        }

        await canal.send({ embeds: [embed] });
    }
};
