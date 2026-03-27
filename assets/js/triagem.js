// Função principal da triagem
document.addEventListener("DOMContentLoaded", function () {

    // Se estiver na página de triagem.html
    const form = document.getElementById("formTriagem");

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            processarTriagem();
        });
    }

    // Se estiver na página triagens.html
    carregarTriagens();
});

// Processa os dados do formulário
function processarTriagem() {

    const nome = document.getElementById("nome").value;
    const idade = parseInt(document.getElementById("idade").value);
    const temperatura = parseFloat(document.getElementById("temperatura").value);
    const pressao = document.getElementById("pressao").value;
    const saturacao = parseInt(document.getElementById("saturacao").value);
    const batimentos = parseInt(document.getElementById("batimentos").value);

    // Por enquanto, ainda não existem campos de queixa/checklist/riscos no HTML.
    const queixa = "";         
    const checklistMarcado = [];   
    const riscosMarcados = [];

    const vitais = { temperatura, pressao, saturacao, batimentos };

    const prioridade = definirPrioridade(
        queixa,
        checklistMarcado,
        riscosMarcados,
        vitais
    );

    const dadosTriagem = {
        nome,
        idade,
        temperatura,
        pressao,
        saturacao,
        batimentos,
        prioridade,
        data: new Date().toLocaleString()
    };

    salvarTriagem(dadosTriagem);
    mostrarResultado(dadosTriagem);
}

// Salva a triagem no navegador
function salvarTriagem(dados) {
    let lista = JSON.parse(localStorage.getItem("triagens")) || [];
    lista.push(dados);
    localStorage.setItem("triagens", JSON.stringify(lista));
}

// Mostra o resultado na página de triagem.html
function mostrarResultado(dados) {
    const box = document.getElementById("resultadoTriagem");
    if (!box) return;

    box.innerHTML = `
        <h3>Triagem concluída</h3>
        <p><strong>Nome:</strong> ${dados.nome}</p>
        <p><strong>Idade:</strong> ${dados.idade}</p>
        <p><strong>Temperatura:</strong> ${dados.temperatura}°C</p>
        <p><strong>Pressão:</strong> ${dados.pressao}</p>
        <p><strong>Saturação:</strong> ${dados.saturacao}%</p>
        <p><strong>Batimentos:</strong> ${dados.batimentos} bpm</p>
        <p><strong>Classificação:</strong> ${dados.prioridade}</p>
        <p><strong>Data:</strong> ${dados.data}</p>
        <br>
        <a href="triagens.html">
            <button>Ver todas as triagens</button>
        </a>
    `;
}

// Carrega triagens já salvas (triagens.html)
function carregarTriagens() {
    const box = document.getElementById("listaTriagens");
    if (!box) return;

    const lista = JSON.parse(localStorage.getItem("triagens")) || [];

    if (lista.length === 0) {
        box.innerHTML = "<p>Nenhuma triagem registrada ainda.</p>";
        return;
    }

    lista.forEach(t => {
        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
            <h3>${t.nome}</h3>
            <p><strong>Idade:</strong> ${t.idade}</p>
            <p><strong>Temperatura:</strong> ${t.temperatura}°C</p>
            <p><strong>Saturação:</strong> ${t.saturacao}%</p>
            <p><strong>Batimentos:</strong> ${t.batimentos} bpm</p>
            <p><strong>Pressão:</strong> ${t.pressao}</p>
            <p><strong>Classificação:</strong> ${t.prioridade}</p>
            <p><em>${t.data}</em></p>
        `;

        box.appendChild(div);
    });
}

// ==============================
// ALGORITMO DE TRIAGEM AVANÇADA
// ==============================

// Detecta emergências diretas pela queixa ou checklist
function detectarEmergencia(queixa, checklist) {

    const emergenciasDiretas = [
        "convulsão", "convulsao", "dor torácica intensa", "dor no peito",
        "dispneia grave", "falta de ar grave", "inconsciência", "desmaio",
        "hemorragia ativa", "suspeita de avc", "rigidez de nuca",
        "febre com petéquias", "petequias", "cianose"
    ];

    const texto = queixa.toLowerCase();
    if (emergenciasDiretas.some(e => texto.includes(e))) return true;

    const itensEmergencia = [
        "tiragem", "incapacidade de falar", "cianose", "rigidez de nuca",
        "hemorragia ativa", "desmaio", "convulsão", "pulso fraco",
        "dor torácica forte"
    ];

    return checklist.some(item => itensEmergencia.includes(item.toLowerCase()));
}

// Soma pontos com base no checklist
function calcularScoreChecklist(checklist) {

    let score = 0;

    const pesos = {
        "dispneia moderada": 3,
        "dispneia grave": 6,
        "tiragem": 8,
        "estridor": 8,
        "cianose": 10,
        "rigidez de nuca": 10,
        "sonolência": 4,
        "rebaixamento": 7,
        "confusão": 5,
        "convulsão": 12,
        "dor torácica moderada": 6,
        "dor torácica intensa": 10,
        "febre alta": 3,
        "vômitos repetidos": 3,
        "diarreia intensa": 3,
        "desidratação": 4,
        "criança hipoativa": 6,
        "sangramento vaginal": 6,
        "cefaleia intensa": 6
    };

    checklist.forEach(item => {
        const chave = item.toLowerCase();
        if (pesos[chave]) score += pesos[chave];
    });

    return score;
}

// Pontos extras para fatores de risco
function calcularScoreRisco(riscos) {

    let score = 0;

    const pesosRisco = {
        "idoso": 2,
        "criança": 2,
        "gestante": 2,
        "diabetes": 2,
        "hipertensão": 1,
        "asma": 1,
        "dpoc": 1,
        "doença cardíaca": 2,
        "imunossuprimido": 3,
        "corticoide": 1,
        "anticoagulante": 2
    };

    riscos.forEach(r => {
        const chave = r.toLowerCase();
        if (pesosRisco[chave]) score += pesosRisco[chave];
    });

    return score;
}

// Pontuação baseada nos sinais vitais
function avaliarSinaisVitais(v) {

    let score = 0;

    if (v.temperatura >= 39) score += 3;
    if (v.temperatura <= 35) score += 4;

    if (v.saturacao < 90) score += 8;
    else if (v.saturacao < 94) score += 4;

    if (v.batimentos > 140) score += 6;
    else if (v.batimentos > 120) score += 3;

    const [pas, pad] = v.pressao.split("/").map(Number);

    if (pas < 90 || pad < 60) score += 6;
    if (pas > 180 || pad > 110) score += 4;

    return score;
}

// Função final que define a prioridade
function definirPrioridade(queixa, checklist, riscos, vitais) {

    if (detectarEmergencia(queixa, checklist)) {
        return "VERMELHO (Emergência)";
    }

    let score = 0;

    score += calcularScoreChecklist(checklist);
    score += calcularScoreRisco(riscos);
    score += avaliarSinaisVitais(vitais);

    if (score >= 18) return "LARANJA (Urgência Grave)";
    if (score >= 10) return "AMARELO (Urgência)";
    if (score >= 4) return "VERDE (Rotina)";

    return "AZUL (Baixa Complexidade)";
}
