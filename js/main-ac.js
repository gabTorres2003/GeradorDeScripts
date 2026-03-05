import { copiarParaClipboard } from './modules/utils.js';
import { gerarTemplatesAC } from './modules/templates-ac.js';

window.atualizarListaSAPs = () => {
    const ambiente = document.getElementById("ambiente").value;
    const select = document.getElementById("sap_aplicacao");
    
    // Pega os dados do arquivo saps.js
    const dadosSaps = window.SAPS_DATABASE || {};
    const lista = dadosSaps[ambiente] || [];
    
    // Limpa e popula o select
    select.innerHTML = ""; 
    
    if (lista.length === 0) {
        const opt = document.createElement("option");
        opt.value = "";
        opt.text = "Nenhuma aplicação encontrada para este ambiente";
        select.appendChild(opt);
    } else {
        lista.forEach(item => {
            const opt = document.createElement("option");
            opt.value = item;
            opt.text = item;
            select.appendChild(opt);
        });
    }

    if (typeof window.toggleCamposAC === "function") {
        window.toggleCamposAC();
    }
};

window.toggleCamposAC = () => {
    const acao = document.querySelector('input[name="acao"]:checked').value;
    const ambiente = document.getElementById("ambiente").value;
    const aplicacao = document.getElementById("sap_aplicacao").value;
    
    const isGco = ambiente === "GCO" || aplicacao.toUpperCase().includes("GCO");

    document.getElementById("campoID").classList.toggle("hidden", acao === "senha");
    document.getElementById("campoSenhaAC").classList.toggle("hidden", acao === "novo");
    
    // Exibe opção de usuário existente apenas para Novo Usuário GCO
    const divGco = document.getElementById("opcaoGCO");
    if (divGco) divGco.classList.toggle("hidden", !(isGco && acao === "novo"));
    
    document.getElementById("outAssunto").value = acao === "novo" ? "Controle de Acessos - Novo Usuário" : "Controle de Acessos - Nova Senha";
};

window.gerarScriptsAC = () => {
    const dados = {
        acao: document.querySelector('input[name="acao"]:checked').value,
        ambiente: document.getElementById("ambiente").value,
        nome: document.getElementById("nome").value.trim().toUpperCase(),
        email_colaborador: document.getElementById("email_colaborador").value.trim().toLowerCase(),
        usuario_id: document.getElementById("usuario_id").value.trim().toUpperCase(),
        aplicacao: document.getElementById("sap_aplicacao").value,
        senha: document.getElementById("senha_ac").value.trim(),
        gcoExistente: document.getElementById("gco_check")?.checked
    };

    const scripts = gerarTemplatesAC(dados);
    document.getElementById("outEmailAC").value = scripts.email;
    document.getElementById("outChamadoAC").value = scripts.chamado;
};

window.limparCamposAC = () => {
    // Lista de todos os IDs de campos de texto e áreas de script
    const campos = [
        "nome", 
        "email_colaborador", 
        "usuario_id", 
        "senha_ac", 
        "outEmailAC", 
        "outChamadoAC"
    ];

    // Limpa cada campo de texto se ele existir na página
    campos.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.value = "";
    });

    // Resetar o Assunto para o padrão inicial
    const outAssunto = document.getElementById("outAssunto");
    if (outAssunto) outAssunto.value = "Controle de Acessos - Novo Usuário";

    // Resetar o Checkbox do GCO (se existir)
    const gcoCheck = document.getElementById("gco_check");
    if (gcoCheck) gcoCheck.checked = false;

    // Voltar o rádio para "Novo Usuário"
    const radioNovo = document.querySelector('input[value="novo"]');
    if (radioNovo) radioNovo.checked = true;

    // Resetar o Select de Ambiente para a primeira opção e atualizar a lista
    const selectAmbiente = document.getElementById("ambiente");
    if (selectAmbiente) {
        selectAmbiente.selectedIndex = 0;
        window.atualizarListaSAPs();
    }

    // Atualizar a visibilidade dos campos (ID, Senha, GCO)
    if (typeof window.toggleCamposAC === "function") {
        window.toggleCamposAC();
    }
};

window.execCopiar = (id, btn) => {
    copiarParaClipboard(id).then(() => {
        const txt = btn.innerText;
        btn.innerText = "Copiado!";
        setTimeout(() => btn.innerText = txt, 2000);
    });
};

document.addEventListener("DOMContentLoaded", () => {
    window.atualizarListaSAPs();
});