import { TextChannel, EmbedBuilder, Client } from 'discord.js';
import yaml from 'yaml';
import fs from 'fs';
import { registrarLog } from '../utils/loggerUtil';

const config = yaml.parse(fs.readFileSync('config.yml', 'utf8'));

export const enviarNotificacaoEntregaPendente = async (cliente: Client, grupo: any) => {
    const notificacaoConfig = config.entregas_pendentes.notificacao;
    const subServidorConfig = config.entregas_pendentes.usar_sub_servidor ? config.entregas_pendentes.sub_servidores.find((s: any) => s.nome === grupo.subservidor) : null;
    const canalId = subServidorConfig ? subServidorConfig.canal : config.entregas_pendentes.canal_de_entregas_geral;

    if (!canalId) {
        registrarLog('ID do canal não está definido nas configurações.');
        return;
    }

    const canal = cliente.channels.cache.get(canalId) as TextChannel;
    if (canal) {
        const embed = new EmbedBuilder()
            .setColor(notificacaoConfig.cor)
            .setTimestamp();

        if (notificacaoConfig.footer.usar) {
            embed.setFooter({
                text: notificacaoConfig.footer.texto || "",
                iconURL: notificacaoConfig.footer.icone_url || "",
            });
        }

        if (notificacaoConfig.imagem.usar) {
            embed.setImage(notificacaoConfig.imagem.url || "");
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
            embed.setTitle(notificacaoConfig.titulo_multiplas_entregas);

            adicionarCampoSeMostrar(notificacaoConfig.campos.player, grupo.player);
            adicionarCampoSeMostrar(notificacaoConfig.campos.servidor, grupo.servidor);
            adicionarCampoSeMostrar(notificacaoConfig.campos.atualizado_em, new Date(grupo.atualizadoEm * 1000).toLocaleString());

            const produtos = grupo.entregas.map((entrega: any) => entrega.produto).join(', ');
            adicionarCampoSeMostrar(notificacaoConfig.campos.produto, produtos);

            adicionarCampoSeMostrar(notificacaoConfig.campos.quantidade, grupo.entregas.length.toString());

        } else {
            const entrega = grupo.entregas[0];
            embed.setTitle(notificacaoConfig.titulo_sucesso);

            adicionarCampoSeMostrar(notificacaoConfig.campos.produto, entrega.produto);
            adicionarCampoSeMostrar(notificacaoConfig.campos.player, entrega.player);
            adicionarCampoSeMostrar(notificacaoConfig.campos.servidor, entrega.servidor);
            adicionarCampoSeMostrar(notificacaoConfig.campos.subservidor, entrega.subServidor);
            adicionarCampoSeMostrar(notificacaoConfig.campos.codigo, entrega.codigo);
            adicionarCampoSeMostrar(notificacaoConfig.campos.quantidade, entrega.quantidade.toString());
            adicionarCampoSeMostrar(notificacaoConfig.campos.status, entrega.status);
            adicionarCampoSeMostrar(notificacaoConfig.campos.atualizado_em, new Date(entrega.atualizadoEm * 1000).toLocaleString());
        }

        await canal.send({ embeds: [embed] });
    }
};
