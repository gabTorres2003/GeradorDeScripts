import { copiarParaClipboard, processarSenha } from './modules/utils.js';
import { gerarTemplatesSD } from './modules/templates-sd.js';

let fila = [];
let indexAtual = 0;

window.toggleImport = (show) => {
    document.getElementById("import-section").classList.toggle("hidden", !show);
    document.getElementById("queue-section").classList.toggle("hidden", show);
    document.getElementById("errorMsg").style.display = "none";
    if(show) document.getElementById("bulkPaste").focus();
};

window.importarParaFila = () => {
    const rawData = document.getElementById("bulkPaste").value.trim();
    if (!rawData) return;

    const linhas = rawData.split('\n');
    
    // Motor de Busca Inteligente: analisa o conteúdo de cada célula
    fila = linhas.map(linha => {
        const col = linha.split('\t').map(c => c.trim()).filter(c => c !== "");
        if (col.length < 3) return null;

        // Tenta encontrar o INC (ex: INC4864203)
        const registro = col.find(c => /^INC\d+|^RITM\d+/i.test(c));
        // Tenta encontrar a Data (ex: 2026-03-05)
        const dataStr = col.find(c => /\d{4}-\d{2}-\d{2}/.test(c));
        // Tenta encontrar a Descrição (contendo GSE ou UE WEB)
        const descricao = col.find(c => /GSE|UE WEB/i.test(c)) || "";
        // Tenta encontrar o Solicitante (contendo hífens ou matrículas)
        const solicitante = col.find(c => c.includes(" - ") || /[A-Z]\d{5,7}/i.test(c));

        if (!registro || !descricao) return null;

        let sistemaFinal = "";
        if (descricao.toUpperCase().includes("GSE")) {
            const dist = descricao.match(/COELBA|PERNAMBUCO|COSERN/i);
            sistemaFinal = `GSE (${dist ? dist[0].toUpperCase() : "GSE"})`;
        } else if (descricao.toUpperCase().includes("UE WEB")) {
            sistemaFinal = "UE WEB";
        } else {
            return null; // Filtra apenas GSE/UE WEB
        }

        const matricula = (solicitante?.match(/[A-Z][0-9.]+/i) || [""])[0];
        const nomeLimpo = solicitante?.split(' - ')[0] || "Colaborador";

        return {
            registro,
            nome: nomeLimpo,
            matricula,
            data: dataStr ? new Date(dataStr.replace(/-/g, '/')) : new Date(),
            dataExibicao: dataStr || "N/A",
            sistema: sistemaFinal,
            tipoOriginal: descricao.toLowerCase().includes("reset") ? "reset" : "desbloqueio"
        };
    }).filter(item => item !== null);

    if (fila.length === 0) {
        document.getElementById("errorMsg").innerText = "Falha: Nenhum chamado de GSE ou UE WEB identificado. Verifique se copiou a linha inteira do ServiceNow.";
        document.getElementById("errorMsg").style.display = "block";
        return;
    }

    // Ordenação: Do mais antigo para o mais novo
    fila.sort((a, b) => a.data - b.data);
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