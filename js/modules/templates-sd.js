import { rodapePadrao } from './utils.js';

/**
 * @param {Object} dados - Objeto contendo acao, registro, sistema, nome, matricula e senha.
 * @returns {Object} Objeto com as strings para email e chamado.
 */
export function gerarTemplatesSD(dados) {
    const { acao, registro, sistema, nome, matricula, senha } = dados;
    const saudacao = nome ? `Olá, ${nome}` : `Olá,`;
    const isUEWEB = sistema === "UE WEB (CS) - PRD";
    const nomeSistemaUE = "UE WEB (CS)";

    let email = "";
    let chamado = "";

    // LÓGICA PARA LOGIN DESABILITADO
    if (acao === "disabled") {
        const corpoDisabled = `${saudacao}\n\nVerificado que não foi possível realizar o desbloqueio/reset de senha, pois o login não está ativo.\n\nLogin: ${matricula}\nSistema/Empresa: ${sistema}\n\nPor favor, realizar a abertura da solicitação via ITnow, para a reativação do usuário e atribuição de grupo desejado no GSE.\n\nEssa ação, requer aprovação gerencial, no qual deverá ser tratada via solicitação de serviço (RITM) e não por incidente (INC), para atuação da equipe responsável posteriormente.\n\nTemplate: Conceder acesso à Aplicações Corporativas\nLink para acesso: https://iberdrola.service-now.com/itnow?id=sc_cat_item_guide&sys_id=20fc4fbddbc1af40b716e2e15b9619a6\n\nGentileza entrar em contato com o agente de perfil da sua área/departamento, para apoio na tratativa da demanda. Caso não saiba quem é o seu agente de perfil, fineza acessar o portal "acessosap.neoenergia.net" e clicar no Menu: Agente de Perfil.\n\n${rodapePadrao}`;
        
        email = corpoDisabled;
        chamado = corpoDisabled;

    // LÓGICA PARA DESBLOQUEIO
    } else if (acao === "unlock") {
        if (isUEWEB) {
            const corpoUnlockUE = `${saudacao}\n\nFoi realizado o desbloqueio no acesso, conforme solicitado.\nObs: Informamos que a senha atual não foi alterada.\n\nLOGIN: ${matricula}\nSISTEMA/AMBIENTE: ${nomeSistemaUE}\n\n${rodapePadrao}`;
            email = corpoUnlockUE;
            chamado = corpoUnlockUE;
        } else {
            const corpoUnlockGSE = `${saudacao}\n\nFoi realizado o desbloqueio no acesso, conforme solicitado.\n\nObs: Informamos que a senha atual não foi alterada.\n\nLOGIN: ${matricula} \nSISTEMA/AMBIENTE: ${sistema} \n\nImportante: O Terminal Service (TS) deverá ser acessado com o mesmo login (matrícula) no GSE, para que não ocorra bloqueio automático no GSE.\n\n${rodapePadrao}`;
            email = corpoUnlockGSE;
            chamado = corpoUnlockGSE;
        }

    // LÓGICA PARA RESET DE SENHA
    } else {
        if (isUEWEB) {
            email = `${saudacao}\n\nNotificamos que o seu acesso foi reativado, e foi gerada solicitação de nova senha de acesso foi atendida, seguem informações.\n\nRegistro ITNOW: ${registro}\nSISTEMA / AMBIENTE: ${nomeSistemaUE}\nLOGIN: ${matricula}\nNOVA SENHA: ${senha}\n\nOBS. ALTERAR ATÉ O FINAL DO DIA PARA EVITAR BLOQUEIO AUTOMÁTICO DO SISTEMA.\n\nEsta é uma mensagem automática. Por favor, não responda este e-mail.\n\n${rodapePadrao}`;
            chamado = `${saudacao}\n\nNotificamos que foi realizado a reativação de acesso, e o reset de senha foi enviada para o e-mail cadastrado no Itnow.\n\nLOGIN: ${matricula}\nSISTEMA/AMBIENTE: ${nomeSistemaUE}\n\nImportante (Orientações futuras para o reset de senha no UE WEB).\n\nSe houver necessidade de nova senha, deverá orientar o(a) colaborador(a) que para o envio de nova senha temporária para o e-mail cadastrado, deverá inserir o login utilizado no UE WEB no campo “Usuário” e depois clicar na opção “Esqueceu a senha? Clique aqui.\n\n${rodapePadrao}`;
        } else {
            email = `${saudacao} \n\nSua solicitação de nova senha de acesso foi atendida, seguem informações.\n\nRegistro ITNOW: ${registro}\nSISTEMA / AMBIENTE: ${sistema}\nLOGIN: ${matricula}\nNOVA SENHA: ${senha}\n\nOBS. ALTERAR ATÉ O FINAL DO DIA PARA EVITAR BLOQUEIO AUTOMÁTICO DO SISTEMA.\n\nImportante: O Terminal Service (TS) deverá ser acessado com o mesmo login (matrícula) no GSE, para que não ocorra bloqueio automático no GSE.\n\nEsta é uma mensagem automática. Por favor, não responda este e-mail. \n\n${rodapePadrao}`;
            
            chamado = `${saudacao} \n\nRealizado o reset de senha no GSE enviada para o e-mail cadastrado no Itnow.\n\nLOGIN: ${matricula}\nSISTEMA/AMBIENTE: ${sistema}\n\nImportante: O Terminal Service (TS) deverá ser acessado com o mesmo login (matrícula) no GSE, para que não ocorra bloqueio automático no GSE.\n\n${rodapePadrao}`;
        }
    }

    return { email, chamado };
}