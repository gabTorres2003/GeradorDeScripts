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

    // Mapeamento Dinâmico por nome de coluna
    const map = {
        inc: cabecalho.indexOf("identificador"),
        solicitante: cabecalho.indexOf("solicitante"),
        criado: cabecalho.indexOf("criado em"),
        desc: cabecalho.indexOf("descrição resumida")
    };

    // Validação de Colunas
    const faltantes = [];
    if (map.inc === -1) faltantes.push("Identificador");
    if (map.solicitante === -1) faltantes.push("Solicitante");
    if (map.criado === -1) faltantes.push("Criado em");
    if (map.desc === -1) faltantes.push("Descrição resumida");

    if (faltantes.length > 0) {
        errorDiv.innerText = `Erro: Colunas não encontradas: [${faltantes.join(", ")}]. Copie a tabela com o cabeçalho.`;
        errorDiv.style.display = "block";
        return;
    }

    fila = linhas.slice(1).map(linha => {
        const col = linha.split('\t').map(c => c.trim());
        if (col.length < cabecalho.length) return null;

        const descricao = col[map.desc] || "";
        let sistemaFinal = "";
        
        // Identificação automática (GSE mantém PERNAMBUCO)
        if (descricao.toUpperCase().includes("GSE")) {
            const dist = descricao.match(/COELBA|PERNAMBUCO|COSERN/i);
            sistemaFinal = `GSE (${dist ? dist[0].toUpperCase() : "GSE"})`;
        } else if (descricao.toUpperCase().includes("UE WEB")) {
            sistemaFinal = "UE WEB";
        } else {
            return null; // Filtra apenas GSE/UE WEB
        }

        const nomeMatricula = col[map.solicitante] || "";
        const matricula = (nomeMatricula.match(/[A-Z][0-9.]+/i) || [""])[0];
        const nomeLimpo = nomeMatricula.split(' - ')[0];

        return {
            registro: col[map.inc],
            nome: nomeLimpo,
            matricula,
            data: new Date(col[map.criado].replace(/-/g, '/')),
            dataExibicao: col[map.criado],
            sistema: sistemaFinal,
            tipoOriginal: descricao.toLowerCase().includes("reset") ? "reset" : "desbloqueio"
        };
    }).filter(item => item !== null && item.registro && item.registro.startsWith("INC"));

    if (fila.length === 0) return alert("Nenhum chamado GSE ou UE WEB encontrado.");

    fila.sort((a, b) => a.data - b.data); // Mais antigo primeiro
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
    
    // Nota de 15 min gerada na tela principal
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