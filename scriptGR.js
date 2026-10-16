document.getElementById('btnTestarGR').addEventListener('click', validarGR);

function validarGR() {
    const grammarText = document.getElementById('grammarInput').value.trim();
    const word = document.getElementById('textInputGR').value.trim();
    const resultadoDiv = document.getElementById('resultadoGR');
    const formalDefDiv = document.getElementById('formalDefinitionDiv');

    if (!grammarText) {
        resultadoDiv.className = "neutro";
        resultadoDiv.innerHTML = "Por favor, insira as regras da Gramática Regular.";
        formalDefDiv.style.display = 'none';
        return;
    }

    try {
        const { rules, startSymbol } = parseGrammar(grammarText);
        
        // --- Extração da Definição Formal G = (V, T, P, S) ---
        const V = new Set();
        const T = new Set();

        for (const [nonTerminal, productions] of Object.entries(rules)) {
            V.add(nonTerminal); // Adiciona o lado esquerdo em V
            
            for (let prod of productions) {
                for (let char of prod) {
                    if (char === '&') continue; // Épsilon não entra no conjunto T
                    
                    // Se for letra maiúscula, considera Não Terminal (V), senão Terminal (T)
                    if (char.match(/[A-Z]/)) {
                        V.add(char);
                    } else {
                        T.add(char);
                    }
                }
            }
        }

        // Exibe na interface
        document.getElementById('defV').innerText = Array.from(V).join(', ');
        document.getElementById('defT').innerText = Array.from(T).join(', ');
        document.getElementById('defS').innerText = startSymbol;
        formalDefDiv.style.display = 'block';
        // ----------------------------------------------------

        // Testa a palavra a partir do símbolo inicial
        const isAccepted = testWord(word, startSymbol, rules, 0);

        if (isAccepted) {
            resultadoDiv.className = "valido";
            resultadoDiv.innerHTML = `A palavra <strong>"${word}"</strong> pertence à linguagem gerada pela GR (Aceita).`;
        } else {
            resultadoDiv.className = "invalido";
            resultadoDiv.innerHTML = `A palavra <strong>"${word}"</strong> NÃO pertence à linguagem gerada pela GR (Rejeitada).`;
        }
    } catch (e) {
        resultadoDiv.className = "invalido";
        resultadoDiv.innerHTML = `Erro na Gramática: ${e.message}`;
        formalDefDiv.style.display = 'none';
    }
}

function parseGrammar(text) {
    const lines = text.split('\n');
    const rules = {};
    let startSymbol = null;

    for (let line of lines) {
        line = line.trim();
        if (!line) continue;

        const parts = line.split('->');
        if (parts.length !== 2) throw new Error(`Regra mal formatada: ${line}`);

        const nonTerminal = parts[0].trim();
        if (!startSymbol) startSymbol = nonTerminal;

        const productions = parts[1].split('|').map(p => p.trim());
        
        if (!rules[nonTerminal]) {
            rules[nonTerminal] = [];
        }
        rules[nonTerminal].push(...productions);
    }

    return { rules, startSymbol };
}

function testWord(word, currentSymbol, rules, currentIndex) {
    if (!rules[currentSymbol]) return false;

    for (let production of rules[currentSymbol]) {
        if (production === '&') {
            if (currentIndex === word.length) return true;
            continue;
        }

        if (production.length === 1 && !production.match(/[A-Z]/)) {
            if (currentIndex === word.length - 1 && word[currentIndex] === production) {
                return true;
            }
        }
        else if (production.length === 2) {
            const terminal = production[0];
            const nextNonTerminal = production[1];

            if (currentIndex < word.length && word[currentIndex] === terminal) {
                if (testWord(word, nextNonTerminal, rules, currentIndex + 1)) {
                    return true;
                }
            }
        } else {
             throw new Error(`A produção '${production}' não está no formato linear à direita padrão (aA, a, ou &).`);
        }
    }

    return false;
}