document.getElementById('btnTestar').addEventListener('click', validarRegex);

function validarRegex() {
    const regexPattern = document.getElementById('regexInput').value;
    const text = document.getElementById('textInput').value;
    const resultadoDiv = document.getElementById('resultado');

    if (!regexPattern) {
        resultadoDiv.className = "neutro";
        resultadoDiv.innerHTML = "Por favor, insira uma expressão regular.";
        return;
    }

    try {
        const regex = new RegExp(`^(?:${regexPattern})$`);
        
        const estaDeAcordo = regex.test(text);

        if (estaDeAcordo) {
            resultadoDiv.className = "valido";
            resultadoDiv.innerHTML = "O texto está de acordo com a expressão regular (Válido).";
        } else {
            resultadoDiv.className = "invalido";
            resultadoDiv.innerHTML = "O texto NÃO está de acordo com a expressão regular (Inválido).";
        }
    } catch (e) {
        resultadoDiv.className = "invalido";
        resultadoDiv.innerHTML = `Erro na Expressão Regular: ${e.message}`;
    }
}