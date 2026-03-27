// ========== triagem.js CORRIGIDO E FUNCIONAL ==========

// Campos principais
const nomeInput = document.getElementById("nome");
const idadeInput = document.getElementById("idade");
const queixaSelect = document.getElementById("queixa");

// Sinais vitais
const temperaturaInput = document.getElementById("temperatura");
const pressaoInput = document.getElementById("pressao");
const saturacaoInput = document.getElementById("saturacao");
const batimentosInput = document.getElementById("batimentos");

// Resultado
const resultadoDiv = document.getElementById("resultadoTriagem");

// Emergências diretas
const emergenciasDiretas = [
    "convulsao",
    "dor_toracica_intensa",
    "dispneia_grave",
    "hemorragia_ativa",
    "inconsciencia",
    "suspeita_avc",
    "anafilaxia",
    "abdominal_agudo",
    "trauma_grave"
];

// ========== FUNÇÕES ==========
function lerSinaisVitais() {
    return {
        temperatura: parseFloat(temperaturaInput.value),
        pressao: pressaoInput.value,
        saturacao: parseFloat(saturacaoInput.value),
        batimentos: parseInt(batimentosInput.value)
    };
}

function lerCheckboxesSeVisivel(selector) {
    const itens = document.querySelectorAll(selector);
    const selecionados = [];

    itens.forEach(chk => {
        if (chk.checked && chk.offsetParent !== null) {
            selecionados.push(chk.value);
        }
    });

    return selecionados;
}

function detectarEmergenciaAvancada(sinais, checklist, fatores) {
    if (sinais.saturacao < 92) return true;
    if (sinais.batimentos > 140 || sinais.batimentos < 50) return true;
    if (sinais.temperatura >= 40) return true;
    if (fatores.includes("idoso") && checklist.length >= 3) return true;

    return false;
}

function calcularPrioridade(sinais, checklist, fatores) {
    let score = 0;

    if (sinais.saturacao < 95) score++;
    if (sinais.temperatura >= 38.5) score++;
    if (checklist.length >= 2) score++;
    if (fatores.includes("idoso")) score++;
    if (fatores.includes("gestante")) score++;

    if (score >= 4) return "LARANJA";
    if (score >= 2) return "AMARELO";
    return "VERDE";
}

function mostrarResultado(prioridade) {
    resultadoDiv.innerHTML =
        `<h2 style="padding:15px;border-radius:8px;background:${
            prioridade === "VERMELHO" ? "#d9534f" :
            prioridade === "LARANJA" ? "#f0ad4e" :
            prioridade === "AMARELO" ? "#ffd500" :
            "#5cb85c"
        }; color:white; text-align:center">
            PRIORIDADE: ${prioridade}
        </h2>`;
}

function salvarTriagem(dados) {
    const triagens = JSON.parse(localStorage.getItem("triagens")) || [];
    triagens.push({ ...dados, timestamp: new Date().toLocaleString() });
    localStorage.setItem("triagens", JSON.stringify(triagens));
}

function realizarTriagem(event) {
    event.preventDefault();

    const nome = nomeInput.value.trim();
    const idade = idadeInput.value;
    const queixa = queixaSelect.value;

    const sinais = lerSinaisVitais();
    const checklist = lerCheckboxesSeVisivel(".chk-sinal");
    const fatores = lerCheckboxesSeVisivel(".chk-risco");

    // Emergência direta
    if (emergenciasDiretas.includes(queixa)) {
        mostrarResultado("VERMELHO");
        salvarTriagem({ nome, idade, queixa, sinais, checklist, fatores, prioridade: "VERMELHO" });
        return;
    }

    // Emergência avançada
    if (detectarEmergenciaAvancada(sinais, checklist, fatores)) {
        mostrarResultado("LARANJA");
        salvarTriagem({ nome, idade, queixa, sinais, checklist, fatores, prioridade: "LARANJA" });
        return;
    }

    // Prioridade geral
    const prioridade = calcularPrioridade(sinais, checklist, fatores);
    mostrarResultado(prioridade);

    salvarTriagem({ nome, idade, queixa, sinais, checklist, fatores, prioridade });
}

document.getElementById("formTriagem").addEventListener("submit", realizarTriagem);

// ========== CARREGAR TRIAGENS NA OUTRA PÁGINA ==========
function carregarTriagens() {
    const lista = document.getElementById("triagens-list");
    if (!lista) return;

    const triagens = JSON.parse(localStorage.getItem("triagens")) || [];

    triagens.forEach(t => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${t.nome}</strong> — ${t.prioridade}<br>
            <small>${t.timestamp}</small>
        `;
        lista.appendChild(li);
    });
}

document.addEventListener("DOMContentLoaded", carregarTriagens);
