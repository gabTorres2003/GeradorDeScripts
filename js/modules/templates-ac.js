import { rodapePadrao } from './utils.js';

export function gerarTemplatesAC(dados) {
    const { acao, nome, usuario_id, aplicacao, senha, email_colaborador, ambiente } = dados;
    const saudacao = nome ? `Olá, ${nome}` : `Olá,`;
    const isHana = ambiente === "HANA" || (aplicacao && aplicacao.toUpperCase().includes("HANA"));
    const templates = {
        assunto: acao === "novo" ? "Controle de Acessos - Novo Usuário" : "Controle de Acessos - Nova Senha",
        email: "",
        chamado: ""
    };

    const textoSeguranca = "Lembramos que a segurança das informações é uma prioridade para nós, e, como tal, a credencial fornecida é de uso pessoal e intransferível. É de sua inteira responsabilidade manter a confidencialidade desta credencial, que não deve ser compartilhada ou utilizada por terceiros.";

    if (acao === "novo") {
        templates.email = `${saudacao}\n\nInformamos que o novo usuário foi criado em nosso sistema. Por favor, encontre abaixo os detalhes da sua solicitação:\n\nAplicação: ${aplicacao}\n\nNome do Usuário: ${nome}\n\nID do Usuário: ${usuario_id}\n\n${textoSeguranca}\n\n${rodapePadrao}`;
    } else {
        templates.email = `${saudacao}\n\nInformamos que a sua senha de acesso está disponível. Segue abaixo os detalhes da sua solicitação:\n\nAplicação: ${aplicacao}\n\nSenha: ${senha}\n\n${textoSeguranca}\n\n${rodapePadrao}`;
    }

    let obsHana = "";
    if (isHana) {
        obsHana = `\n\nObservação: Desmarcar a opção de auto-reconect.\n- Em caso de falha no login, orientamos a realizar o mapeamento de logins no Hana Studio do zero.`;
    }

    templates.chamado = `${saudacao}\n\nInformamos que seu chamado foi atendido com sucesso, de acordo com a solicitação realizada. Para garantir a segurança e a confidencialidade, as credenciais de acesso necessárias foram enviadas diretamente para o seguinte endereço de e-mail: ${email_colaborador}${obsHana}\n\nEm caso de dúvidas, estamos à disposição.\n\n${rodapePadrao}`;

    return templates;
}