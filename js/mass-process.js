import { copiarParaClipboard, processarSenha } from './modules/utils.js';
import { gerarTemplatesSD } from './modules/templates-sd.js';

let fila = [];
let indexAtual = 0;

window.toggleImport = (show) => {
    document.getElementById("import-section").classList.toggle("hidden", !show);
    document.getElementById("queue-section").classList.toggle("hidden", show);
    if(show) document.getElementById("bulkPaste").focus();
};

window.importarParaFila = () => {
    const rawData = document.getElementById("bulkPaste").value.trim();
    if (!rawData) return;

    const linhas = rawData.split('\n');
    
    fila = linhas.map(linha => {
        const col = linha.split('\t').map(c => c.trim());
        if (col.length < 5) return null;

        const registro = col[2];
        const nomeMatricula = col[3] || "";
        const dataStr = col[4] || "";
        const descricao = col[5] || "";

        let sistemaFinal = "";
        // Identificação automática de Distribuidora (Mantendo PERNAMBUCO)
        if (descricao.toUpperCase().includes("GSE")) {
            const dist = descricao.match(/COELBA|PERNAMBUCO|COSERN/i);
            const nomeDist = dist ? dist[0].toUpperCase() : "GSE";
            sistemaFinal = `GSE (${nomeDist})`;
        } else if (descricao.toUpperCase().includes("UE WEB")) {
            sistemaFinal = "UE WEB";
        } else {
            return null; // Filtra apenas GSE e UE WEB
        }

        const matricula = (nomeMatricula.match(/[A-Z][0-9]+/i) || [""])[0];
        const nomeLimpo = nomeMatricula.split(' - ')[0];

        return {
            registro,
            nome: nomeLimpo,
            matricula,
            data: new Date(dataStr.replace(/-/g, '/')),
            dataExibicao: dataStr,
            sistema: sistemaFinal,
            tipoOriginal: descricao.toLowerCase().includes("reset") ? "reset" : "desbloqueio"
        };
    }).filter(item => item !== null && item.registro && item.registro.startsWith("INC"));

    fila.sort((a, b) => a.data - b.data);

    if (fila.length === 0) return alert("Nenhum chamado GSE ou UE WEB encontrado.");

    window.toggleImport(false);
    carregarChamado(0);
};

function carregarChamado(idx) {
    indexAtual = idx;
    const item = fila[idx];
    if(!item) return;
    
    document.getElementById("registro").value = item.registro;
    document.getElementById("nome").value = item.nome;
    document.getElementById("matricula").value = item.matricula;
    document.getElementById("data_txt").value = item.dataExibicao;
    document.getElementById("sistema_txt").value = item.sistema;
    document.getElementById("lblContador").innerText = `Chamado ${idx + 1} de ${fila.length}`;
    
    const tag = document.getElementById("tag_sistema");
    const ehGse = item.sistema.includes("GSE");
    tag.innerText = ehGse ? "GSE" : "UE WEB";
    tag.className = `status-tag ${ehGse ? "tag-gse" : "tag-ue"}`;

    document.querySelector(`input[name="acao"][value="${item.tipoOriginal}"]`).checked = true;

    document.getElementById("senha").value = "";
    document.getElementById("outEmail").value = "";
    document.getElementById("outChamado").value = "";
    
    // Nota de 15 minutos gerada automaticamente
    document.getElementById("outNota").value = `Olá, ${item.nome}\n\nSeu chamado se encontra na fila de atendimento para a atuação.\n\nCordialmente,\nService Desk Neoenergia.`;
    
    document.getElementById("senha").focus();
}

window.gerarInstantaneo = () => {
    const acao = document.querySelector('input[name="acao"]:checked').value;
    const item = fila[indexAtual];
    if(!item) return;

    const senhaRaw = document.getElementById("senha").value;
    const dados = {
        acao: acao,
        registro: item.registro,
        sistema: item.sistema,
        nome: item.nome,
        matricula: item.matricula,
        senha: processarSenha(senhaRaw)
    };
    
    const { email, chamado } = gerarTemplatesSD(dados);
    document.getElementById("outEmail").value = email;
    document.getElementById("outChamado").value = chamado;
};

window.navegar = (direcao) => {
    let novoIndex = indexAtual + direcao;
    if (novoIndex >= 0 && novoIndex < fila.length) carregarChamado(novoIndex);
};

window.execCopiar = (id, btn) => {
    copiarParaClipboard(id).then(() => {
        const txt = btn.innerText;
        btn.innerText = "Copiado!";
        setTimeout(() => btn.innerText = txt, 2000);
    });
};

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("lblContador").innerText = "Aguardando Lista...";
});