import mariadb from 'mariadb';
import yaml from 'yaml';
import fs from 'fs';
import { registrarErro, registrarLog } from '../utils/loggerUtil';

const config = yaml.parse(fs.readFileSync('config.yml', 'utf8'));

const pool = mariadb.createPool({
  host: config.database.host,
  port: config.database.porta,
  user: config.database.usuario,
  password: config.database.senha,
  connectionLimit: 10,
  connectTimeout: 30000,
  acquireTimeout: 30000
});

const criarBancoDeDados = async () => {
  let conexao;
  try {
    if (config.database.depurar) {
      registrarLog('Tentando criar o banco de dados...');
    }
    conexao = await pool.getConnection();
    await conexao.query(`CREATE DATABASE IF NOT EXISTS ${config.database.database_nome}`);
    if (config.database.depurar) {
      registrarLog('Banco de dados criado ou já existe.');
    }
  } catch (erro) {
    registrarErro('Erro ao criar banco de dados', erro);
    throw erro;
  } finally {
    if (conexao) conexao.release();
  }
};

const configurarPoolComDatabase = async () => {
  if (config.database.depurar) {
    registrarLog('Configurando pool com database...');
  }
  return mariadb.createPool({
    host: config.database.host,
    port: config.database.porta,
    user: config.database.usuario,
    password: config.database.senha,
    database: config.database.database_nome,
    connectionLimit: 10,
    connectTimeout: 30000,
    acquireTimeout: 30000
  });
};

let poolComDatabase: mariadb.Pool;

export const executarQuery = async (sql: string, parametros?: any[]) => {
  if (!poolComDatabase) {
    poolComDatabase = await configurarPoolComDatabase();
  }
  let conexao;
  try {
    if (config.database.depurar) {
      registrarLog(`Executando query: ${sql}`);
    }
    conexao = await poolComDatabase.getConnection();
    const resultado = await conexao.query(sql, parametros);
    return resultado;
  } catch (erro) {
    registrarErro('Erro ao executar query', erro);
    throw erro;
  } finally {
    if (conexao) conexao.release();
  }
};

export const inicializarBancoDeDados = async () => {
  try {
    await criarBancoDeDados();
    poolComDatabase = await configurarPoolComDatabase();
    await executarQuery(`
      CREATE TABLE IF NOT EXISTS config (
          id INT PRIMARY KEY AUTO_INCREMENT,
          chave_config VARCHAR(255) UNIQUE,
          valor VARCHAR(255)
      );
    `);

    await executarQuery(`
      CREATE TABLE IF NOT EXISTS entregas_enviadas (
          entregaID INT PRIMARY KEY,
          produto VARCHAR(255),
          quantidade INT,
          player VARCHAR(255),
          servidor VARCHAR(255),
          subServidor VARCHAR(255),
          codigo VARCHAR(255),
          status VARCHAR(255),
          atualizadoEm TIMESTAMP
      );
    `);

    await executarQuery(`
      CREATE TABLE IF NOT EXISTS entregas_pendentes (
          entregaID INT PRIMARY KEY,
          produto VARCHAR(255),
          quantidade INT,
          player VARCHAR(255),
          servidor VARCHAR(255),
          subServidor VARCHAR(255),
          codigo VARCHAR(255),
          status VARCHAR(255),
          atualizadoEm TIMESTAMP
      );
    `);
  } catch (erro) {
    registrarErro('Erro ao inicializar o banco de dados', erro);
  }
};

export const obterConfig = async (chave: string): Promise<string | null> => {
  const linhas = await executarQuery('SELECT valor FROM config WHERE chave_config = ? LIMIT 1', [chave]);
  return linhas.length > 0 ? linhas[0].valor : null;
};

export const definirConfig = async (chave: string, valor: string) => {
  await executarQuery('INSERT INTO config (chave_config, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)', [chave, valor]);
};
