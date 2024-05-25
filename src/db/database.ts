import mariadb from 'mariadb';
import yaml from 'yaml';
import fs from 'fs';
import { registrarErro } from '../utils/loggerUtil';

const config = yaml.parse(fs.readFileSync('config.yml', 'utf8'));

const pool = mariadb.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  connectionLimit: 5,
  connectTimeout: 10000
});

const criarBancoDeDados = async () => {
  let conexao;
  try {
    conexao = await pool.getConnection();
    await conexao.query(`CREATE DATABASE IF NOT EXISTS ${config.database.name}`);
  } catch (erro) {
    registrarErro('Erro ao criar banco de dados', erro);
    throw erro;
  } finally {
    if (conexao) conexao.release();
  }
};

const configurarPoolComDatabase = async () => {
  return mariadb.createPool({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.name,
    connectionLimit: 5,
    connectTimeout: 10000
  });
};

let poolComDatabase: mariadb.Pool;

export const executarQuery = async (sql: string, parametros?: any[]) => {
  if (!poolComDatabase) {
    poolComDatabase = await configurarPoolComDatabase();
  }
  let conexao;
  try {
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
