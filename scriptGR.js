document.getElementById('btnTestarGR').addEventListener('click', validarGR);

function validarGR() {
    const grammarText = document.getElementById('grammarInput').value.trim();
    const word = document.getElementById('textInputGR').value;
    const resultadoDiv = document.getElementById('resultadoGR');
    const formalDefDiv = document.getElementById('formalDefinitionDiv');

    if (!grammarText) {
        resultadoDiv.className = "neutro";
        resultadoDiv.textContent = "Por favor, insira as regras da Gramática Regular.";
        formalDefDiv.style.display = 'none';
        return;
    }

    try {
        const { rules, startSymbol } = parseGrammar(grammarText);
        validateGrammar(rules);
        
        // G = (V, T, P, S)
        const V = new Set();
        const T = new Set();

        for (const [nonTerminal, productions] of Object.entries(rules)) {
            V.add(nonTerminal);
            
            for (let prod of productions) {
                for (let char of prod) {
                    if (char === '&') continue;
                    
                    if (char.match(/[A-Z]/)) {
                        V.add(char);
                    } else {
                        T.add(char);
                    }
                }
            }
        }

        // Exibe
        document.getElementById('defV').textContent = Array.from(V).join(', ');
        document.getElementById('defT').textContent = Array.from(T).join(', ');
        document.getElementById('defS').textContent = startSymbol;
        formalDefDiv.style.display = 'block';

        const isAccepted = testWord(word, startSymbol, rules, 0);

        if (isAccepted) {
            resultadoDiv.className = "valido";
            resultadoDiv.textContent = `A palavra ${word === '' ? 'ε (palavra vazia)' : JSON.stringify(word)} pertence à linguagem gerada pela GR (Aceita).`;
        } else {
            resultadoDiv.className = "invalido";
            resultadoDiv.textContent = `A palavra ${word === '' ? 'ε (palavra vazia)' : JSON.stringify(word)} NÃO pertence à linguagem gerada pela GR (Rejeitada).`;
        }
    } catch (e) {
        resultadoDiv.className = "invalido";
        resultadoDiv.textContent = `Erro na Gramática: ${e.message}`;
        formalDefDiv.style.display = 'none';
    }
}

function parseGrammar(text) {
    const lines = text.split('\n');
    const rules = Object.create(null);
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

// Valida todas as regras antes de testar a palavra, inclusive as que não
// seriam visitadas durante a derivação.
function validateGrammar(rules) {
    const nonTerminalPattern = /^[A-Z]$/;
    const referencedNonTerminals = new Set();

    function isTerminal(symbol) {
        return symbol.length === 1
            && !/[A-Z]/.test(symbol)
            && symbol !== '&'
            && symbol !== '|'
            && !/\s/.test(symbol);
    }

    for (const [nonTerminal, productions] of Object.entries(rules)) {
        if (!nonTerminalPattern.test(nonTerminal)) {
            throw new Error("O lado esquerdo de cada regra deve ser um único não terminal maiúsculo (A-Z).");
        }

        for (const production of productions) {
            if (production === '&') continue;

            if (production === '') {
                throw new Error("Existe uma produção vazia. Use '&' para representar épsilon.");
            }

            if (production.length === 1 && isTerminal(production)) {
                continue;
            }

            if (production.length === 2
                && isTerminal(production[0])
                && nonTerminalPattern.test(production[1])) {
                referencedNonTerminals.add(production[1]);
                continue;
            }

            throw new Error(
                "A produção '" + production
                + "' é inválida. Use o formato aA, a ou & (um símbolo terminal e, opcionalmente, um não terminal maiúsculo)."
            );
        }
    }

    for (const nonTerminal of referencedNonTerminals) {
        if (!Object.prototype.hasOwnProperty.call(rules, nonTerminal)) {
            throw new Error(
                "O não terminal '" + nonTerminal
                + "' é usado em uma produção, mas não possui regra definida."
            );
        }
    }
}
