export function processarSenha(textoRaw) {
    if (!textoRaw) return "";
    const regex = /temporária\s+(.*?)\s+foi/i;
    const match = textoRaw.match(regex);
    return match && match[1] ? match[1].trim() : textoRaw.trim();
}

export function copiarParaClipboard(elementId) {
    const textarea = document.getElementById(elementId);
    textarea.select();
    return navigator.clipboard.writeText(textarea.value);
}

export const rodapePadrao = `Em caso de dúvidas, estamos à disposição. 
Sinta-se à vontade para entrar em contato pelos Canais de Atendimento listados abaixo:

Chat via ITNOW: https://iberdrola.service-now.com/itnow
Telefone Externo: 7133706000

Cordialmente,
Service Desk Neoenergia.`;