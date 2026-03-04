import { processarSenha, copiarParaClipboard } from './modules/utils.js';
import { gerarTemplatesSD } from './modules/templates-sd.js';

// Funções expostas ao global (window) para o HTML
window.toggleCampos = () => {
    const acao = document.querySelector('input[name="acao"]:checked').value;
    const divSenha = document.getElementById("campoSenha");
    divSenha.classList.toggle("hidden", acao === "unlock" || acao === "disabled");
};

window.gerarScripts = () => {
    const dados = {
        acao: document.querySelector('input[name="acao"]:checked').value,
        registro: document.getElementById("registro").value.trim(),
        sistema: document.getElementById("sistema").value,
        nome: document.getElementById("nome").value.trim(),
        matricula: document.getElementById("matricula").value.trim(),
        senha: processarSenha(document.getElementById("senha").value)
    };

    const { email, chamado } = gerarTemplatesSD(dados);
    document.getElementById("outEmail").value = email;
    document.getElementById("outChamado").value = chamado;
};

window.copiarTexto = (id, btn) => {
    copiarParaClipboard(id).then(() => {
        const textoOriginal = btn.innerText;
        btn.innerText = "Copiado!";
        btn.style.backgroundColor = "#0b5a0b";
        setTimeout(() => {
            btn.innerText = textoOriginal;
            btn.style.backgroundColor = "#107c10";
        }, 2000);
    });
};

window.limparCampos = () => {
    ["registro", "nome", "matricula", "senha"].forEach(id => document.getElementById(id).value = "");
    document.getElementById("sistema").selectedIndex = 0;
    document.getElementById("outEmail").value = "";
    document.getElementById("outChamado").value = "";
};