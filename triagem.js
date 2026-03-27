// ---------- BOTÃO DE CLASSIFICAR ----------
document.getElementById("btn-classificar").addEventListener("click", () => {

    const idade = parseInt(document.getElementById("idade").value);
    const queixa = document.getElementById("queixa").value.toLowerCase();
    const medicacoes = document.getElementById("medicacoes").value.toLowerCase();

    const pa = document.getElementById("pa").value;
    const fc = parseInt(document.getElementById("fc").value);
    const fr = parseInt(document.getElementById("fr").value);
    const spo2 = parseInt(document.getElementById("spo2").value);
    const temp = parseFloat(document.getElementById("temp").value);

    const comorbidades = [...document.querySelectorAll(".checkbox-list input:checked")]
        .map(c => c.value);

    const paciente = {
        idade,
        queixa,
        comorbidades,
        medicacoes,
        pa,
        fc,
        fr,
        spo2,
        temp
    };

    // EMERGÊNCIA AUTOMÁTICA
    if (checaEmergencia(paciente)) {
        mostraAlertaEmergencia();
        mostraResultadoFinal("EMERGÊNCIA", paciente);
        return;
    }

    // CLASSIFICAÇÃO NORMAL
    const resultado = classificaNormal(paciente);
    mostraResultadoFinal(resultado, paciente);
});



// ---------- EMERGÊNCIA AUTOMÁTICA ----------
function checaEmergencia(p) {

    const emergencias = [
        "convulsão", "convulsao",
        "crise convulsiva",
        "status epilepticus",
        "primeira crise",
        "inconsciente",
        "rebaixamento",
        "desmaio",
        "dor torácica intensa",
        "dispneia grave",
        "hemorragia",
        "sangramento"
    ];

    // Se a queixa tiver qualquer termo crítico → EMERGÊNCIA
    for (let termo of emergencias) {
        if (p.queixa.includes(termo)) return true;
    }

    // Anticoagulante + trauma/quebra/sangue → EMERGÊNCIA
    if (p.comorbidades.includes("anticoagulante")) {
        if (
            p.queixa.includes("queda") ||
            p.queixa.includes("trauma") ||
            p.queixa.includes("batida") ||
            p.queixa.includes("sangue")
        ) {
            return true;
        }
    }

    return false;
}



// ---------- CLASSIFICAÇÃO NORMAL (REFINADA) ----------
function classificaNormal(p) {
    let risco = 0;

    // IDADE
    if (p.idade <= 2) risco += 3;
    else if (p.idade <= 12) risco += 1;
    else if (p.idade >= 80) risco += 3;
    else if (p.idade >= 65) risco += 2;

    // COMORBIDADES
    const moderadas = ["asma", "hipertensao", "diabetes"];
    const altas = ["dpoc", "renal", "cardiopatia"];
    const muitoAltas = ["imuno", "gestante"];

    p.comorbidades.forEach(c => {
        if (moderadas.includes(c)) risco += 1;
        else if (altas.includes(c)) risco += 2;
        else if (muitoAltas.includes(c)) risco += 3;
    });

    // MEDICAÇÕES
    if (p.medicacoes.includes("insulina")) risco += 1;
    if (p.medicacoes.includes("metformina")) risco += 1;
    if (p.medicacoes.includes("prednisona")) risco += 1;

    // QUEIXA CLÍNICA
    const muitoAlto = ["falta de ar", "dispneia", "dor no peito", "sangramento", "trauma grave"];
    const alto = ["febre alta", "tontura", "queda", "trauma"];
    const moderado = ["febre", "dor forte", "dor moderada"];

    muitoAlto.forEach(pal => { if (p.queixa.includes(pal)) risco += 4; });
    alto.forEach(pal => { if (p.queixa.includes(pal)) risco += 2; });
    moderado.forEach(pal => { if (p.queixa.includes(pal)) risco += 1; });

    // SINAIS VITAIS
    risco += riscoSinaisVitais(p);

    // INTERAÇÕES ESPECIAIS
    if (p.comorbidades.includes("anticoagulante")) {
        if (p.queixa.includes("queda") || p.queixa.includes("trauma")) {
            return "URGÊNCIA";
        }
    }

    // DECISÃO FINAL
    if (risco >= 7) return "URGÊNCIA";
    if (risco >= 5) return "PRIORITÁRIO";
    if (risco >= 2) return "POUCO URGENTE";
    return "NÃO URGENTE";
}



// ---------- SINAIS VITAIS ----------
function riscoSinaisVitais(p) {
    let risco = 0;

    // FC
    if (p.fc >= 130) risco += 4;
    else if (p.fc >= 110) risco += 2;
    else if (p.fc <= 50) risco += 3;

    // FR
    if (p.fr >= 30) risco += 4;
    else if (p.fr >= 24) risco += 2;
    else if (p.fr <= 10) risco += 3;

    // SpO2
    if (p.spo2 <= 89) risco += 4;
    else if (p.spo2 <= 94) risco += 2;

    // Temperatura
    if (p.temp >= 39) risco += 2;
    else if (p.temp >= 38) risco += 1;
    else if (p.temp <= 35) risco += 4;

    // PA (sistólica/diastólica)
    if (p.pa && p.pa.includes("/")) {
        const [pas, pad] = p.pa.split("/").map(a => parseInt(a));
        if (pas <= 90 || pad <= 60) risco += 2;
        if (pas >= 180 || pad >= 120) risco += 4;
    }

    return risco;
}



// ---------- INTERFACE ----------
function mostraAlertaEmergencia() {
    const box = document.getElementById("alerta-topo");
    box.innerHTML = "🚨 EMERGÊNCIA IMEDIATA! Atender agora!";
    box.className = "alerta-emergencia";
    box.style.display = "block";
}

function mostraResultadoFinal(classificacao, p) {
    const area = document.getElementById("resultado-final");
    area.style.display = "block";

    area.innerHTML = `
        <h2>Resultado da Triagem</h2>
        <p><strong>Classificação:</strong> ${classificacao}</p>
        <p><strong>Idade:</strong> ${p.idade}</p>
        <p><strong>Queixa:</strong> ${p.queixa}</p>
        <p><strong>Comorbidades:</strong> ${p.comorbidades.join(", ")}</p>
        <p><strong>Medicações:</strong> ${p.medicacoes}</p>
        <p><strong>PA:</strong> ${p.pa}</p>
        <p><strong>FC:</strong> ${p.fc}</p>
        <p><strong>FR:</strong> ${p.fr}</p>
        <p><strong>SpO₂:</strong> ${p.spo2}%</p>
        <p><strong>Temperatura:</strong> ${p.temp} °C</p>
    `;
salvarTriagem(classificacao, p);
    criaBotaoNovaTriagem();
}



// ---------- BOTÃO DE NOVA TRIAGEM ----------
function criaBotaoNovaTriagem() {

    if (document.getElementById("btn-nova")) return;

    const area = document.getElementById("resultado-final");
    const btn = document.createElement("button");
    btn.id = "btn-nova";
    btn.textContent = "Nova Triagem";

    btn.addEventListener("click", () => {
        document.getElementById("form-triagem").reset();
        document.getElementById("resultado-final").style.display = "none";

        const alerta = document.getElementById("alerta-topo");
        alerta.style.display = "none";
        alerta.className = "";
        alerta.innerHTML = "";
    });

    area.appendChild(btn);
}
// --------- SALVAR TRIAGEM NO LOCALSTORAGE ---------
function salvarTriagem(classificacao, p) {

    const registro = {
        classificacao,
        paciente: p,
        data: new Date().toLocaleDateString("pt-BR"),
        hora: new Date().toLocaleTimeString("pt-BR")
    };

    // Pega lista anterior
    let triagens = JSON.parse(localStorage.getItem("triagens")) || [];

    // Adiciona a nova
    triagens.push(registro);

    // Salva de volta
    localStorage.setItem("triagens", JSON.stringify(triagens));
}