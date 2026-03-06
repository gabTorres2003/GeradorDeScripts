import { copiarParaClipboard, processarSenha } from './modules/utils.js'
import { gerarTemplatesSD } from './modules/templates-sd.js'

let fila = []
let indexAtual = 0

// Import UI

window.toggleImport = (show) => {
  document.getElementById('import-section').classList.toggle('hidden', !show)

  document.getElementById('queue-section').classList.toggle('hidden', show)

  document.getElementById('errorMsg').style.display = 'none'

  if (show) document.getElementById('bulkPaste').focus()
}

// Import Tabela ServiceNow

window.importarParaFila = () => {
  const rawData = document.getElementById('bulkPaste').value.trim()

  const errorDiv = document.getElementById('errorMsg')

  errorDiv.style.display = 'none'

  if (!rawData) return

  const linhas = rawData.split('\n')

// Cabeçalho

  const header = linhas[0].split('\t').map((h) => h.trim().toLowerCase())

  const findIndex = (keywords) =>
    header.findIndex((h) => keywords.some((k) => h.includes(k)))

  const map = {
    inc: findIndex(['identificador', 'incident', 'inc']),

    solicitante: findIndex([
      'solicitante',
      'caller',
      'requested',
      'usuário',
      'usuario',
    ]),

    criado: findIndex(['criado', 'created', 'aberto']),

    desc: findIndex(['descrição resumida', 'short description', 'descrição']),
  }

  if (map.inc === -1 || map.solicitante === -1) {
    errorDiv.innerText =
      'Erro: Cabeçalho não identificado. Copie a linha de títulos da tabela.'

    errorDiv.style.display = 'block'

    return
  }

// Processar linhas

  fila = linhas
    .slice(1)
    .map((linha) => {
      let col = linha.split('\t').map((c) => c.trim())
      while (col.length && col[0] === '') {
        col.shift()
      }

      const inc = col[map.inc]

      if (!inc || !inc.match(/^INC\d+/)) return null

      const descricao = (col[map.desc] || '').toUpperCase()

// Identificar sistema

      const ehGse = descricao.includes('GSE')

      const ehUe =
        descricao.includes('UE WEB') ||
        descricao.includes('UEWEB') ||
        descricao.includes('UE-WEB')

      let sistemaFinal = 'Apenas Nota (15 min)'

      if (ehGse) {
        const dist = descricao.match(/COELBA|COSERN|PERNAMBUCO/i)

        sistemaFinal = `GSE (${dist ? dist[0].toUpperCase() : 'GSE'})`
      } else if (ehUe) {
        sistemaFinal = 'UE WEB'
      }

// Solicitante 

      const nomeMatricula = col[map.solicitante] || ''

      const partes = nomeMatricula.split(' - ')

      const nomeLimpo = partes[0].trim()

      const matricula = partes[1] ? partes[1].split(' ')[0].trim() : ''

// Data

      const dataRaw = col[map.criado] || ''

      const dataObj = new Date(dataRaw.replace(/-/g, '/'))

      return {
        registro: inc,

        nome: nomeLimpo,

        matricula: matricula,

        data: dataObj,

        dataExibicao: dataRaw,

        sistema: sistemaFinal,

        isPriority: ehGse || ehUe,

        tipoOriginal: descricao.toLowerCase().includes('reset')
          ? 'reset'
          : 'desbloqueio',
      }
    })
    .filter(Boolean)

  if (fila.length === 0) {
    errorDiv.innerText = 'Nenhum chamado identificado.'

    errorDiv.style.display = 'block'

    return
  }

  fila.sort((a, b) => a.data - b.data)

  toggleImport(false)

  carregarChamado(0)
}

// Carregar chamado

function carregarChamado(idx) {
  indexAtual = idx

  const item = fila[idx]

  if (!item) return

  document.getElementById('registro').value = item.registro

  document.getElementById('nome').value = item.nome

  document.getElementById('matricula').value = item.matricula

  document.getElementById('data_txt').value = item.dataExibicao

  document.getElementById('sistema_txt').value = item.sistema

  document.getElementById('lblContador').innerText =
    `Chamado ${idx + 1} de ${fila.length}`

  const card = document.getElementById('card-atendimento')

  const tag = document.getElementById('tag_sistema')

  const areaSenha = document.getElementById('campoSenhaMassa')

  const areaTipo = document.getElementById('area-tipo')

  if (item.isPriority) {
    card.style.background = '#f0f9ff'
    card.style.borderColor = '#bee3f8'

    areaSenha.classList.remove('hidden')
    areaTipo.classList.remove('hidden')

    tag.innerText = item.sistema.includes('GSE') ? 'GSE' : 'UE WEB'

    tag.className = `status-tag ${
      item.sistema.includes('GSE') ? 'tag-gse' : 'tag-ue'
    }`

    document.querySelector(
      `input[name="acao"][value="${item.tipoOriginal}"]`,
    ).checked = true
  } else {
    card.style.background = '#f9f9f9'
    card.style.borderColor = '#eee'

    areaSenha.classList.add('hidden')
    areaTipo.classList.add('hidden')

    tag.innerText = 'NOTA'

    tag.className = 'status-tag tag-nota'
  }

  document.getElementById('outEmail').value = ''

  document.getElementById('outChamado').value = ''

  document.getElementById('outNota').value = `Olá, ${item.nome}

Seu chamado se encontra na fila de atendimento para atuação.

Cordialmente,
Service Desk Neoenergia.`

  if (item.isPriority) document.getElementById('senha').focus()
}

// Navegação entre chamados

window.navegarSeletivo = (direcao) => {
  let i = indexAtual + direcao

  while (i >= 0 && i < fila.length) {
    if (fila[i].isPriority) {
      carregarChamado(i)

      return
    }

    i += direcao
  }

  alert('Fim da fila de chamados técnicos.')
}

window.navegar = (direcao) => {
  let novo = indexAtual + direcao

  if (novo >= 0 && novo < fila.length) carregarChamado(novo)
}

// Gerador dos Scripts

window.gerarInstantaneo = () => {
  const acao = document.querySelector('input[name="acao"]:checked').value

  const item = fila[indexAtual]

  const senhaRaw = document.getElementById('senha').value

  const dados = {
    acao,

    registro: item.registro,

    sistema: item.sistema,

    nome: item.nome,

    matricula: item.matricula,

    senha: processarSenha(senhaRaw),
  }

  const { email, chamado } = gerarTemplatesSD(dados)

  document.getElementById('outEmail').value = email

  document.getElementById('outChamado').value = chamado
}

// motor de cópia dos textos

window.execCopiar = (id, btn) => {
  copiarParaClipboard(id).then(() => {
    const txt = btn.innerText

    btn.innerText = 'Copiado!'

    setTimeout(() => (btn.innerText = txt), 2000)
  })
}
