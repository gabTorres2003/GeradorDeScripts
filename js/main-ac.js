import { copiarParaClipboard } from './modules/utils.js';
import { gerarTemplatesAC } from './modules/templates-ac.js';

window.atualizarListaSAPs = () => {
    const ambiente = document.getElementById("ambiente").value;
    const select = document.getElementById("sap_aplicacao");
    const dadosSaps = window.SAPS_DATABASE || {};
    const lista = dadosSaps[ambiente] || [];
    
    if (lista.length === 0) {
        select.innerHTML = '<option value="">Nenhuma aplicação encontrada</option>';
    } else {
        select.innerHTML = lista.map(item => `<option value="${item}">${item}</option>`).join('');
    }
};

window.toggleCamposAC = () => {
    const acao = document.querySelector('input[name="acao"]:checked').value;
    const campoID = document.getElementById("campoID");
    const campoSenha = document.getElementById("campoSenhaAC");
    const inputAssunto = document.getElementById("outAssunto");

    if (acao === "novo") {
        campoID.classList.remove("hidden");
        campoSenha.classList.add("hidden");
        inputAssunto.value = "Controle de Acessos - Novo Usuário";
    } else {
        campoID.classList.add("hidden");
        campoSenha.classList.remove("hidden");
        inputAssunto.value = "Controle de Acessos - Nova Senha";
    }
};

window.gerarScriptsAC = () => {
    const acao = document.querySelector('input[name="acao"]:checked').value;
    const ambiente = document.getElementById("ambiente").value;
    
    const dados = {
        acao,
        ambiente,
        nome: document.getElementById("nome").value.trim().toUpperCase(),
        email_colaborador: document.getElementById("email_colaborador").value.trim().toLowerCase(),
        usuario_id: document.getElementById("usuario_id").value.trim().toUpperCase(),
        aplicacao: document.getElementById("sap_aplicacao").value,
        senha: document.getElementById("senha_ac").value.trim()
    };

    const scripts = gerarTemplatesAC(dados);
    
    document.getElementById("outEmailAC").value = scripts.email;
    document.getElementById("outChamadoAC").value = scripts.chamado;
    document.getElementById("outAssunto").value = scripts.assunto;
};

window.execCopiar = (id, btn) => {
    copiarParaClipboard(id).then(() => {
        const textoOriginal = btn.innerText;
        btn.innerText = "Copiado!";
        btn.style.backgroundColor = "var(--green-hover)";
        setTimeout(() => {
            btn.innerText = textoOriginal;
            btn.style.backgroundColor = ""; 
        }, 2000);
    });
};

window.limparCamposAC = () => {
    ["nome", "email_colaborador", "usuario_id", "senha_ac", "outEmailAC", "outChamadoAC"].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.value = "";
    });
    const radioNovo = document.querySelector('input[value="novo"]');
    if(radioNovo) radioNovo.checked = true;
    window.toggleCamposAC();
};

document.addEventListener("DOMContentLoaded", () => {
    window.atualizarListaSAPs();
    window.toggleCamposAC();
});