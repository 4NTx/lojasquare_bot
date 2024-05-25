export const registrarLog = (mensagem: string) => {
  console.log(`[${new Date().toISOString()}] ${mensagem}`);
};

export const registrarErro = (mensagem: string, erro: any) => {
  console.error(`[${new Date().toISOString()}] ${mensagem}`, erro);
};
