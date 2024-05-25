import axios from 'axios';
import yaml from 'yaml';
import fs from 'fs';
import { registrarErro } from '../utils/loggerUtil';

const config = yaml.parse(fs.readFileSync('config.yml', 'utf8'));

const clienteApi = axios.create({
    baseURL: 'https://api.lojasquare.net/v1',
    headers: {
        'Authorization': `${config.lojasquare.api_secret}`,
        'Content-Type': 'application/json',
    },
});

clienteApi.interceptors.request.use(request => {
    const urlCompleta = `${request.baseURL}${request.url}`;
    const parametros = request.params ? `?${new URLSearchParams(request.params).toString()}` : '';
    return request;
});

export const obterEntregas = async (statusID: number, dataInicio: string, dataFim: string) => {
    try {
        const resposta = await clienteApi.get(`/entregas/${statusID}`, {
            params: {
                dataInicio,
                dataFim,
            },
        });
        return resposta.data;
    } catch (erro) {
        registrarErro('Erro ao buscar entregas', erro);
        return null;
    }
};
