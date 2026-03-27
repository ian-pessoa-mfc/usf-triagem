// triagem.js - Sistema de Triagem Atualizado

// Elementos do DOM
const nomeInput = document.getElementById('nome');
const idadeInput = document.getElementById('idade');
const queixaSelect = document.getElementById('queixa');
const sinaisVitaisInputs = {
    pressao: document.getElementById('pressao'),
    frequencia_cardiaca: document.getElementById('frequencia_cardiaca'),
    frequencia_respiratoria: document.getElementById('frequencia_respiratoria'),
    temperatura: document.getElementById('temperatura'),
    saturacao: document.getElementById('saturacao'),
    glasgow: document.getElementById('glasgow')
};
const chkSinais = document.querySelectorAll('.chk-sinal');
const chkRiscos = document.querySelectorAll('.chk-risco');
const resultadoDiv = document.getElementById('resultado');
const salvarBtn = document.getElementById('salvar');
const triagensList = document.getElementById('triagens-list'); // Para triagens.html

// Emergências diretas baseadas na queixa
const emergenciasDiretas = ['convulsao', 'dor_toracica_intensa', 'hemorragia_grave', 'choque', 'parada_cardiaca'];

// Função para detectar emergência direta
function detectarEmergenciaDireta(queixa) {
    return emergenciasDiretas.includes(queixa);
}

// Função para ler sinais vitais
function lerSinaisVitais() {
    return {
        pressao: sinaisVitaisInputs.pressao.value,
        frequencia_cardiaca: sinaisVitaisInputs.frequencia_cardiaca.value,
        frequencia_respiratoria: sinaisVitaisInputs.frequencia_respiratoria.value,
        temperatura: sinaisVitaisInputs.temperatura.value,
        saturacao: sinaisVitaisInputs.saturacao.value,
        glasgow: sinaisVitaisInputs.glasgow.value
    };
}

// Função para ler checkboxes visíveis
function lerCheckboxes(selector) {
    const checkboxes = document.querySelectorAll(selector);
    const selecionados = [];
    checkboxes.forEach(chk => {
        if (chk.checked && chk.offsetParent !== null) { // Verifica se está visível
            selecionados.push(chk.id);
        }
    });
    return selecionados;
}

// Algoritmo avançado (assumindo funções já existentes ou implementadas)
function detectarEmergencia(sinais, checklist, risco) {
    // Lógica para detectar emergência baseada em sinais, checklist e risco
    // Exemplo simplificado: se sinais vitais anômalos ou checklist alta
    if (sinais.glasgow < 15 || sinais.pressao < 90 || checklist.length > 3) {
        return true;
    }
    return false;
}

function calcularScoreChecklist(checklist) {
    // Score baseado no número de sintomas
    return checklist.length;
}

function calcularScoreRisco(risco) {
    // Score baseado em fatores de risco
    return risco.length * 2;
}

function avaliarSinaisVitais(sinais) {
    // Avaliação de sinais vitais
    let score = 0;
    if (sinais.frequencia_cardiaca > 100) score += 1;
    if (sinais.temperatura > 38) score += 1;
    // Adicionar mais lógica
    return score;
}

function definirPrioridade(emergencia, scoreChecklist, scoreRisco, scoreSinais) {
    if (emergencia) return 'VERMELHO';
    const total = scoreChecklist + scoreRisco + scoreSinais;
    if (total >= 5) return 'LARANJA';
    if (total >= 3) return 'AMARELO';
    return 'VERDE';
}

// Função principal de triagem
function realizarTriagem() {
    const nome = nomeInput.value;
    const idade = idadeInput.value;
    const queixa = queixaSelect.value;
    const sinais = lerSinaisVitais();
    const checklist = lerCheckboxes('.chk-sinal');
    const risco = lerCheckboxes('.chk-risco');

    // Verificar emergência direta
    if (detectarEmergenciaDireta(queixa)) {
        const prioridade = 'VERMELHO';
        mostrarResultado(prioridade);
        salvarTriagem({ nome, idade, queixa, sinais, checklist, risco, prioridade });
        return;
    }

    // Usar algoritmo avançado
    const emergencia = detectarEmergencia(sinais, checklist, risco);
    const scoreChecklist = calcularScoreChecklist(checklist);
    const scoreRisco = calcularScoreRisco(risco);
    const scoreSinais = avaliarSinaisVitais(sinais);
    const prioridade = definirPrioridade(emergencia, scoreChecklist, scoreRisco, scoreSinais);

    mostrarResultado(prioridade);
    salvarTriagem({ nome, idade, queixa, sinais, checklist, risco, prioridade });
}

// Função para mostrar resultado
function mostrarResultado(prioridade) {
    resultadoDiv.innerHTML = `<h2>Prioridade: ${prioridade}</h2>`;
}

// Função para salvar no localStorage
function salvarTriagem(triagem) {
    const triagens = JSON.parse(localStorage.getItem('triagens')) || [];
    triagens.push({ ...triagem, timestamp: new Date().toISOString() });
    localStorage.setItem('triagens', JSON.stringify(triagens));
}

// Função para carregar triagens (para triagens.html)
function carregarTriagens() {
    if (!triagensList) return; // Só executa se estiver na página triagens.html
    const triagens = JSON.parse(localStorage.getItem('triagens')) || [];
    triagensList.innerHTML = '';
    triagens.forEach(t => {
        const li = document.createElement('li');
        li.textContent = `${t.nome} - ${t.prioridade} - ${t.timestamp}`;
        triagensList.appendChild(li);
    });
}

// Event listeners
salvarBtn.addEventListener('click', realizarTriagem);

// Carregar triagens ao carregar a página
document.addEventListener('DOMContentLoaded', carregarTriagens);
