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
    const prioridade = calcularPrioridade(temperatura, pressao, saturacao, batimentos);

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

// Cálculo simplificado de prioridade
function calcularPrioridade(temp, pressao, sat, bpm) {

    if (temp >= 39 || sat < 90 || bpm > 140) {
        return "VERMELHO (Emergência)";
    }

    if (temp >= 38 || sat < 94 || bpm > 120) {
        return "AMARELO (Urgência)";
    }

    return "VERDE (Rotina)";
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
