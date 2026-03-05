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
    const errorDiv = document.getElementById("errorMsg");
    errorDiv.style.display = "none";

    if (!rawData) return;

    const linhas = rawData.split('\n');
    const cabecalho = linhas[0].split('\t').map(c => c.trim().toLowerCase());

    // BUSCA INTELIGENTE POR TERMOS
    const findIndex = (terms) => cabecalho.findIndex(c => terms.some(t => c.includes(t)));

    const map = {
        inc: findIndex(["identificador", "inc", "número", "registro"]),
        solicitante: findIndex(["solicitante", "usuário", "colaborador", "nome"]),
        criado: findIndex(["criado em", "aberto em", "data de criação", "criado"]),
        desc: findIndex(["descrição", "resumida", "assunto", "título"])
    };

    // Validação Robusta
    const faltantes = [];
    if (map.inc === -1) faltantes.push("Identificador");
    if (map.solicitante === -1) faltantes.push("Solicitante");
    if (map.criado === -1) faltantes.push("Criado em");
    if (map.desc === -1) faltantes.push("Descrição");

    if (faltantes.length > 0) {
        errorDiv.innerText = `Erro de Reconhecimento: Não encontramos as colunas [${faltantes.join(", ")}]. Verifique o cabeçalho da tabela.`;
        errorDiv.style.display = "block";
        return;
    }

    fila = linhas.slice(1).map(linha => {
        const col = linha.split('\t').map(c => c.trim());
        if (col.length < 2) return null; // Ignora linhas vazias

        const descricao = col[map.desc] || "";
        let sistemaFinal = "";
        
        // Identificação GSE e Distribuidoras
        if (descricao.toUpperCase().includes("GSE")) {
            const dist = descricao.match(/COELBA|PERNAMBUCO|COSERN/i);
            sistemaFinal = `GSE (${dist ? dist[0].toUpperCase() : "GSE"})`;
        } else if (descricao.toUpperCase().includes("UE WEB")) {
            sistemaFinal = "UE WEB";
        } else {
            return null; // Filtro de GSE/UE WEB
        }

        const nomeMatricula = col[map.solicitante] || "";
        const matricula = (nomeMatricula.match(/[A-Z][0-9.]+/i) || [""])[0];
        const nomeLimpo = nomeMatricula.split(' - ')[0];

        return {
            registro: col[map.inc] || "N/A",
            nome: nomeLimpo || "Desconhecido",
            matricula: matricula || "N/A",
            data: new Date(col[map.criado]?.replace(/-/g, '/') || Date.now()),
            dataExibicao: col[map.criado] || "N/A",
            sistema: sistemaFinal,
            tipoOriginal: descricao.toLowerCase().includes("reset") ? "reset" : "desbloqueio"
        };
    }).filter(item => item !== null && item.registro !== "N/A");

    if (fila.length === 0) {
        alert("Nenhum chamado de GSE ou UE WEB encontrado na tabela processada.");
        return;
    }

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