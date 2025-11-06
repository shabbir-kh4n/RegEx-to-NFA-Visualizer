// ===== PART 1: NFA GENERATION LOGIC =====

let stateIdCounter = 0;
let conversionSteps = []; // Store conversion steps for educational mode

class State {
    constructor(isEndState = false) {
        this.id = State.nextId();
        this.isEndState = isEndState;
        this.transitions = new Map();
    }

    static nextId() {
        return stateIdCounter++;
    }

    addTransition(symbol, targetState) {
        if (!this.transitions.has(symbol)) {
            this.transitions.set(symbol, []);
        }
        this.transitions.get(symbol).push(targetState);
    }
}

function resetStateCounter() {
    stateIdCounter = 0;
}

function createCharNFA(char) {
    const startState = new State(false);
    const endState = new State(true);
    startState.addTransition(char, endState);
    
    // Log Thompson's Construction rule
    conversionSteps.push({
        type: 'thompson',
        rule: 'Character Recognition',
        description: `Create NFA for character '${char}' with start state and accept state`,
        detail: `States: ${startState.id} → ${endState.id} on '${char}'`
    });
    
    return { startState, endState };
}

function createConcatNFA(nfa1, nfa2) {
    nfa1.endState.isEndState = false;
    nfa1.endState.addTransition('ε', nfa2.startState);
    
    // Log Thompson's Construction rule
    conversionSteps.push({
        type: 'thompson',
        rule: 'Concatenation',
        description: `Connect two NFAs in sequence using ε-transition`,
        detail: `Merge state ${nfa1.endState.id} with ${nfa2.startState.id}`
    });
    
    return { startState: nfa1.startState, endState: nfa2.endState };
}

function createUnionNFA(nfa1, nfa2) {
    const startState = new State(false);
    const endState = new State(true);

    startState.addTransition('ε', nfa1.startState);
    startState.addTransition('ε', nfa2.startState);

    nfa1.endState.isEndState = false;
    nfa2.endState.isEndState = false;

    nfa1.endState.addTransition('ε', endState);
    nfa2.endState.addTransition('ε', endState);
    
    // Log Thompson's Construction rule
    conversionSteps.push({
        type: 'thompson',
        rule: 'Union (OR)',
        description: `Create new start state with ε-transitions to both alternatives, and new accept state`,
        detail: `New states: ${startState.id} (start) and ${endState.id} (accept)`
    });

    return { startState, endState };
}

function createStarNFA(nfa) {
    const startState = new State(false);
    const endState = new State(true);

    startState.addTransition('ε', nfa.startState);
    startState.addTransition('ε', endState);

    nfa.endState.isEndState = false;
    nfa.endState.addTransition('ε', nfa.startState);
    nfa.endState.addTransition('ε', endState);
    
    // Log Thompson's Construction rule
    conversionSteps.push({
        type: 'thompson',
        rule: 'Kleene Star (*)',
        description: `Allow zero or more repetitions using ε-transitions for loops and bypass`,
        detail: `New states: ${startState.id} (start) and ${endState.id} (accept)`
    });

    return { startState, endState };
}

const CONCAT_SYMBOL = '.';
const OPERATORS = new Set(['|', '*', CONCAT_SYMBOL]);
const PRECEDENCE = { '|': 1, [CONCAT_SYMBOL]: 2, '*': 3 };

function isLiteral(char) {
    return char && !OPERATORS.has(char) && char !== '(' && char !== ')';
}

function shouldConcat(prev, next) {
    if (!prev || !next) {
        return false;
    }

    const prevIsLiteral = isLiteral(prev) || prev === ')';
    const prevIsStar = prev === '*';
    const nextIsLiteral = isLiteral(next) || next === '(';

    if (prevIsLiteral && nextIsLiteral) {
        return true;
    }

    if (prevIsStar && nextIsLiteral) {
        return true;
    }

    if ((prevIsLiteral || prevIsStar) && next === '(') {
        return true;
    }

    if (prev === ')' && (nextIsLiteral || next === '(')) {
        return true;
    }

    return false;
}

function addExplicitConcat(regex) {
    let result = '';
    for (let i = 0; i < regex.length; i++) {
        const current = regex[i];
        const next = regex[i + 1];
        result += current;

        if (shouldConcat(current, next)) {
            result += CONCAT_SYMBOL;
        }
    }
    
    // Log conversion step
    conversionSteps.push({
        type: 'conversion',
        step: 'Step 1: Add Explicit Concatenation',
        original: regex,
        result: result,
        explanation: 'Insert concatenation operator (.) between characters that should be concatenated'
    });
    
    return result;
}

function infixToPostfix(regex) {
    const output = [];
    const stack = [];

    for (const token of regex) {
        if (token === '(') {
            stack.push(token);
        } else if (token === ')') {
            while (stack.length && stack[stack.length - 1] !== '(') {
                output.push(stack.pop());
            }
            stack.pop();
        } else if (OPERATORS.has(token)) {
            while (
                stack.length &&
                OPERATORS.has(stack[stack.length - 1]) &&
                PRECEDENCE[stack[stack.length - 1]] >= PRECEDENCE[token]
            ) {
                output.push(stack.pop());
            }
            stack.push(token);
        } else {
            output.push(token);
        }
    }

    while (stack.length) {
        output.push(stack.pop());
    }
    
    const postfix = output.join('');
    
    // Log conversion step
    conversionSteps.push({
        type: 'conversion',
        step: 'Step 2: Convert to Postfix Notation',
        original: regex,
        result: postfix,
        explanation: 'Convert infix expression to postfix using operator precedence: * > . > |'
    });

    return postfix;
}

function regexToNFA(regexString) {
    resetStateCounter();
    conversionSteps = []; // Reset conversion steps
    
    // Log initial regex
    conversionSteps.push({
        type: 'conversion',
        step: 'Input Regular Expression',
        result: regexString,
        explanation: 'Original regular expression to be converted to NFA'
    });
    
    const explicitRegex = addExplicitConcat(regexString);
    const postfix = infixToPostfix(explicitRegex);
    const stack = [];
    
    // Log start of Thompson's Construction
    conversionSteps.push({
        type: 'conversion',
        step: 'Step 3: Apply Thompson\'s Construction',
        result: '',
        explanation: 'Build NFA from postfix expression using Thompson\'s Construction rules'
    });

    for (const token of postfix) {
        if (!OPERATORS.has(token)) {
            stack.push(createCharNFA(token));
            continue;
        }

        if (token === '*') {
            const nfa = stack.pop();
            stack.push(createStarNFA(nfa));
            continue;
        }

        if (token === CONCAT_SYMBOL) {
            const nfa2 = stack.pop();
            const nfa1 = stack.pop();
            stack.push(createConcatNFA(nfa1, nfa2));
            continue;
        }

        if (token === '|') {
            const nfa2 = stack.pop();
            const nfa1 = stack.pop();
            stack.push(createUnionNFA(nfa1, nfa2));
        }
    }

    if (stack.length !== 1) {
        throw new Error('Invalid regular expression');
    }

    const nfa = stack[0];
    nfa.endState.isEndState = true;
    return nfa;
}

// ===== PART 2: VISUALIZATION LOGIC =====

let globalNFA = null;

function convertNFAtoVisData(startState, endState) {
    const visited = new Map();
    const queue = [startState];
    visited.set(startState.id, startState);

    while (queue.length) {
        const current = queue.shift();
        for (const targets of current.transitions.values()) {
            for (const target of targets) {
                if (!visited.has(target.id)) {
                    visited.set(target.id, target);
                    queue.push(target);
                }
            }
        }
    }

    const edgeMap = new Map();
    visited.forEach((state) => {
        for (const [symbol, targets] of state.transitions.entries()) {
            const label = symbol || 'ε';
            for (const target of targets) {
                const key = `${state.id}-${target.id}`;
                if (!edgeMap.has(key)) {
                    edgeMap.set(key, {
                        from: state.id,
                        to: target.id,
                        labels: new Set(),
                    });
                }
                edgeMap.get(key).labels.add(label);
            }
        }
    });

    const nodes = [];
    visited.forEach((state) => {
        const node = {
            id: state.id,
            label: `S${state.id}`,
            shape: 'circle',
            borderWidth: 2,
            borderWidthSelected: 2,
            color: {
                border: '#94a3b8',
                background: '#ffffff',
                highlight: {
                    border: '#1d4ed8',
                    background: '#e0e7ff',
                },
            },
            font: {
                color: '#1f2933',
                size: 18,
                face: 'Arial',
            },
        };

        if (state.id === startState.id) {
            node.color = {
                border: '#2563eb',
                background: '#e0f2fe',
                highlight: {
                    border: '#1d4ed8',
                    background: '#bae6fd',
                },
            };
        }

        if (state.id === endState.id) {
            node.borderWidth = 4;
            node.borderWidthSelected = 4;
            node.color = {
                border: '#f59e0b',
                background: '#fff7ed',
                highlight: {
                    border: '#fbbf24',
                    background: '#ffedd5',
                },
            };
        }

        nodes.push(node);
    });

    const edges = Array.from(edgeMap.values()).map(({ from, to, labels }) => ({
        from,
        to,
        label: Array.from(labels).join(', '),
        arrows: 'to',
        color: { color: '#94a3b8', highlight: '#2563eb' },
        font: {
            color: '#1f2933',
            size: 20,
            bold: true,
            background: '#ffffff',
            strokeWidth: 3,
            strokeColor: '#ffffff',
        },
        width: 2,
        smooth: { 
            enabled: true, 
            type: 'dynamic',
        },
        selfReference: {
            size: 30,
            angle: Math.PI / 4
        },
    }));

    return { nodes, edges };
}

function drawNFA(visData) {
    const container = document.getElementById('nfa-graph');
    if (!container) {
        return;
    }

    container.innerHTML = '';
    const data = {
        nodes: new vis.DataSet(visData.nodes),
        edges: new vis.DataSet(visData.edges),
    };

    const options = {
        autoResize: true,
        layout: {
            hierarchical: {
                enabled: true,
                direction: 'LR',
                levelSeparation: 200,
                nodeSpacing: 150,
                sortMethod: 'directed',
            },
        },
        physics: { enabled: false },
        interaction: { hover: true },
        nodes: { shape: 'circle' },
        edges: {
            arrows: { to: { enabled: true, scaleFactor: 0.8 } },
            smooth: {
                enabled: true,
                type: 'straightCross',
            },
        },
    };

    globalNetwork = new vis.Network(container, data, options);
}

// ===== STATISTICS UPDATE =====
function updateStatistics(visData, regex) {
    // Count states
    const numStates = visData.nodes.length;
    document.getElementById('stat-states').textContent = numStates;
    
    // Count transitions
    const numTransitions = visData.edges.length;
    document.getElementById('stat-transitions').textContent = numTransitions;
    
    // Extract alphabet (unique non-epsilon characters)
    const alphabet = new Set();
    visData.edges.forEach(edge => {
        if (edge.label && edge.label !== 'ε') {
            alphabet.add(edge.label);
        }
    });
    const alphabetStr = alphabet.size > 0 ? Array.from(alphabet).sort().join(', ') : 'None';
    document.getElementById('stat-alphabet').textContent = alphabetStr;
    
    // Calculate complexity (simple metric: states + transitions)
    const complexity = numStates + numTransitions;
    let complexityLevel = 'Low';
    if (complexity > 20) complexityLevel = 'High';
    else if (complexity > 10) complexityLevel = 'Medium';
    document.getElementById('stat-complexity').textContent = complexityLevel;
}

// ===== EXAMPLE BUTTONS =====
document.querySelectorAll('.example-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const regex = btn.getAttribute('data-regex');
        const regexInput = document.getElementById('regex-input');
        if (regexInput) {
            regexInput.value = regex;
            // Auto-generate NFA
            document.getElementById('generate-btn')?.click();
        }
    });
});

document.getElementById('generate-btn')?.addEventListener('click', () => {
    const regexInput = document.getElementById('regex-input');
    const regexValue = regexInput?.value.trim() ?? '';

    if (!regexValue) {
        alert('Please enter a regular expression.');
        return;
    }

    try {
        const nfa = regexToNFA(regexValue);
        globalNFA = nfa;

        const visData = convertNFAtoVisData(nfa.startState, nfa.endState);
        
        drawNFA(visData);
        
        // Update statistics
        updateStatistics(visData, regexValue);
        
        // Display educational conversion steps
        displayConversionSteps();

        // Enable export buttons
        document.getElementById('download-png-btn').disabled = false;
        document.getElementById('copy-regex-btn').disabled = false;

        // Clear step display
        const stepDisplay = document.getElementById('step-display');
        if (stepDisplay) {
            stepDisplay.innerHTML = '<p class="step-placeholder">Click "Test String" to see step-by-step execution</p>';
        }
    } catch (error) {
        console.error(error);
        alert(`Invalid regular expression: ${error.message}`);
    }
});

// ===== EXPORT FEATURES =====

// Download NFA as PNG
document.getElementById('download-png-btn')?.addEventListener('click', () => {
    if (!globalNetwork) return;
    
    const canvas = document.querySelector('#nfa-graph canvas');
    if (!canvas) {
        alert('Unable to export: canvas not found');
        return;
    }
    
    // Create a temporary canvas with white background
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    
    // Fill with white background
    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw the original canvas on top
    tempCtx.drawImage(canvas, 0, 0);
    
    // Create a link element and trigger download
    const link = document.createElement('a');
    const regexValue = document.getElementById('regex-input')?.value || 'nfa';
    link.download = `nfa-${regexValue}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
});

// Copy regex to clipboard
document.getElementById('copy-regex-btn')?.addEventListener('click', async () => {
    const regexValue = document.getElementById('regex-input')?.value;
    if (!regexValue) return;
    
    try {
        await navigator.clipboard.writeText(regexValue);
        const btn = document.getElementById('copy-regex-btn');
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    } catch (error) {
        alert('Failed to copy to clipboard');
    }
});

// Collapsible panel toggle handler
document.getElementById('educational-header')?.addEventListener('click', () => {
    const content = document.getElementById('conversion-steps');
    const icon = document.getElementById('toggle-steps');
    
    if (content && icon) {
        content.classList.toggle('collapsed');
        icon.classList.toggle('collapsed');
    }
});

// Initialize panel as collapsed
document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('conversion-steps');
    const icon = document.getElementById('toggle-steps');
    
    if (content && icon) {
        content.classList.add('collapsed');
        icon.classList.add('collapsed');
    }
});

// ===== PART 3: SIMULATION LOGIC =====

function getEpsilonClosure(states) {
    const closure = new Set(states);
    const stack = [...states];

    while (stack.length) {
        const state = stack.pop();
        const epsilonTargets = state.transitions.get('ε') ?? [];

        for (const target of epsilonTargets) {
            if (!closure.has(target)) {
                closure.add(target);
                stack.push(target);
            }
        }
    }

    return closure;
}

function move(states, char) {
    const nextStates = new Set();
    for (const state of states) {
        const targets = state.transitions.get(char) ?? [];
        for (const target of targets) {
            nextStates.add(target);
        }
    }
    return nextStates;
}

function simulateNFA(startState, endState, inputString) {
    let currentStates = getEpsilonClosure(new Set([startState]));

    for (const char of inputString) {
        const movedStates = move(currentStates, char);
        currentStates = getEpsilonClosure(movedStates);
        if (currentStates.size === 0) {
            break;
        }
    }

    return currentStates.has(endState);
}

// Animation control variables
let animationSteps = [];
let currentStepIndex = 0;
let isPaused = false;
let animationSpeed = 1000; // Medium speed
let isAnimating = false;

// Speed control
document.getElementById('speed-slider')?.addEventListener('input', (e) => {
    const speed = parseInt(e.target.value);
    const speedLabel = document.getElementById('speed-label');
    
    if (speed === 1) {
        animationSpeed = 2000;
        if (speedLabel) speedLabel.textContent = 'Slow';
    } else if (speed === 2) {
        animationSpeed = 1000;
        if (speedLabel) speedLabel.textContent = 'Medium';
    } else {
        animationSpeed = 500;
        if (speedLabel) speedLabel.textContent = 'Fast';
    }
});

// Pause/Resume button
document.getElementById('pause-btn')?.addEventListener('click', () => {
    isPaused = !isPaused;
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) {
        pauseBtn.textContent = isPaused ? '▶' : '⏸';
        pauseBtn.classList.toggle('playing', !isPaused);
    }
});

// Step forward button
document.getElementById('step-forward-btn')?.addEventListener('click', () => {
    if (currentStepIndex < animationSteps.length - 1) {
        currentStepIndex++;
        displayStep(currentStepIndex);
    }
});

// Step backward button
document.getElementById('step-backward-btn')?.addEventListener('click', () => {
    if (currentStepIndex > 0) {
        currentStepIndex--;
        displayStep(currentStepIndex);
    }
});

function displayStep(stepIndex) {
    if (!globalNetwork || !animationSteps.length) return;
    
    const step = animationSteps[stepIndex];
    const stateIds = Array.from(step.states).map(s => s.id);
    const prevStateIds = Array.from(step.previousStates).map(s => s.id);
    
    // Update step display
    const stepDisplay = document.getElementById('step-display');
    if (stepDisplay) {
        stepDisplay.innerHTML = `
            <p class="step-current">
                <strong>Step ${stepIndex + 1}/${animationSteps.length}:</strong> ${step.description}<br>
                <strong>Current States:</strong> {${step.statesList}}
            </p>
        `;
    }
    
    // Reset all edges
    globalNetwork.body.data.edges.forEach(edge => {
        globalNetwork.body.data.edges.update({
            id: edge.id,
            color: { color: '#94a3b8', highlight: '#1d4ed8' },
            width: 1
        });
    });
    
    // Highlight edges being traversed
    globalNetwork.body.data.edges.forEach(edge => {
        const label = edge.label || '';
        const isEpsilon = label.includes('ε');
        const matchesChar = step.char === 'ε' ? isEpsilon : label.includes(step.char);
        
        if (matchesChar && prevStateIds.includes(edge.from) && stateIds.includes(edge.to)) {
            globalNetwork.body.data.edges.update({
                id: edge.id,
                color: { color: '#3b82f6', highlight: '#2563eb' },
                width: 3
            });
        }
    });
    
    // Update node colors
    globalNetwork.body.data.nodes.forEach(node => {
        if (stateIds.includes(node.id)) {
            globalNetwork.body.data.nodes.update({
                id: node.id,
                color: {
                    border: '#3b82f6',
                    background: '#dbeafe',
                    highlight: {
                        border: '#2563eb',
                        background: '#bfdbfe'
                    }
                },
                borderWidth: 4
            });
        } else {
            globalNetwork.body.data.nodes.update({
                id: node.id,
                color: {
                    border: '#94a3b8',
                    background: '#ffffff',
                    highlight: {
                        border: '#1d4ed8',
                        background: '#e0e7ff'
                    }
                },
                borderWidth: 2
            });
        }
    });
    
    // Update button states
    const stepBackBtn = document.getElementById('step-backward-btn');
    const stepForwardBtn = document.getElementById('step-forward-btn');
    if (stepBackBtn) stepBackBtn.disabled = stepIndex === 0;
    if (stepForwardBtn) stepForwardBtn.disabled = stepIndex === animationSteps.length - 1;
}

// Animation function
async function animateNFA(startState, endState, inputString, network) {
    const steps = [];
    let currentStates = getEpsilonClosure(new Set([startState]));
    let previousStates = new Set([startState]);
    
    // Initial step (epsilon closure from start)
    steps.push({
        states: new Set(currentStates),
        previousStates: previousStates,
        char: 'ε',
        description: 'Initial ε-closure from start state',
        statesList: Array.from(currentStates).map(s => `S${s.id}`).join(', ')
    });

    // Process each character
    for (let i = 0; i < inputString.length; i++) {
        const char = inputString[i];
        previousStates = new Set(currentStates);
        const movedStates = move(currentStates, char);
        
        if (movedStates.size > 0) {
            steps.push({
                states: movedStates,
                previousStates: previousStates,
                char: char,
                description: `Reading character '${char}' (position ${i + 1})`,
                statesList: Array.from(movedStates).map(s => `S${s.id}`).join(', ')
            });
            
            previousStates = new Set(movedStates);
            currentStates = getEpsilonClosure(movedStates);
            
            if (currentStates.size > 0) {
                steps.push({
                    states: new Set(currentStates),
                    previousStates: previousStates,
                    char: 'ε',
                    description: `ε-closure after reading '${char}'`,
                    statesList: Array.from(currentStates).map(s => `S${s.id}`).join(', ')
                });
            }
        } else {
            currentStates = new Set();
            break;
        }
    }

    const stepDisplay = document.getElementById('step-display');
    
    // Store steps for playback controls
    animationSteps = steps;
    currentStepIndex = 0;
    isPaused = false;
    isAnimating = true;
    
    // Enable playback controls
    const pauseBtn = document.getElementById('pause-btn');
    const stepBackBtn = document.getElementById('step-backward-btn');
    const stepForwardBtn = document.getElementById('step-forward-btn');
    
    if (pauseBtn) {
        pauseBtn.disabled = false;
        pauseBtn.textContent = '⏸';
        pauseBtn.classList.remove('playing');
    }
    if (stepBackBtn) stepBackBtn.disabled = false;
    if (stepForwardBtn) stepForwardBtn.disabled = false;
    
    // Animate each step
    for (let i = 0; i < steps.length; i++) {
        // Wait if paused
        while (isPaused && isAnimating) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (!isAnimating) break; // Animation stopped
        
        currentStepIndex = i;
        const step = steps[i];
        const stateIds = Array.from(step.states).map(s => s.id);
        const prevStateIds = Array.from(step.previousStates).map(s => s.id);
        
        // Update step display
        if (stepDisplay) {
            stepDisplay.innerHTML = `
                <p class="step-current">
                    <strong>Step ${i + 1}/${steps.length}:</strong> ${step.description}<br>
                    <strong>Current States:</strong> {${step.statesList}}
                </p>
            `;
        }
        
        // Update button states
        if (stepBackBtn) stepBackBtn.disabled = i === 0;
        if (stepForwardBtn) stepForwardBtn.disabled = i === steps.length - 1;
        
        // Reset all edges first
        network.body.data.edges.forEach(edge => {
            network.body.data.edges.update({
                id: edge.id,
                color: { color: '#94a3b8', highlight: '#1d4ed8' },
                width: 1
            });
        });
        
        // Highlight edges being traversed
        network.body.data.edges.forEach(edge => {
            const label = edge.label || '';
            const isEpsilon = label.includes('ε');
            const matchesChar = step.char === 'ε' ? isEpsilon : label.includes(step.char);
            
            if (matchesChar && prevStateIds.includes(edge.from) && stateIds.includes(edge.to)) {
                network.body.data.edges.update({
                    id: edge.id,
                    color: { color: '#3b82f6', highlight: '#2563eb' },
                    width: 3
                });
            }
        });
        
        // Update node colors
        network.body.data.nodes.forEach(node => {
            if (stateIds.includes(node.id)) {
                network.body.data.nodes.update({
                    id: node.id,
                    color: {
                        border: '#3b82f6',
                        background: '#dbeafe',
                        highlight: {
                            border: '#2563eb',
                            background: '#bfdbfe'
                        }
                    },
                    borderWidth: 4
                });
            } else {
                network.body.data.nodes.update({
                    id: node.id,
                    color: {
                        border: '#94a3b8',
                        background: '#ffffff',
                        highlight: {
                            border: '#1d4ed8',
                            background: '#e0e7ff'
                        }
                    },
                    borderWidth: 2
                });
            }
        });
        
        // Wait for animation with current speed
        await new Promise(resolve => setTimeout(resolve, animationSpeed));
    }
    
    isAnimating = false;

    // Reset all edges at the end
    network.body.data.edges.forEach(edge => {
        network.body.data.edges.update({
            id: edge.id,
            color: { color: '#94a3b8', highlight: '#1d4ed8' },
            width: 1
        });
    });

    // Final state check
    const accepted = currentStates.has(endState);
    
    // Highlight final states
    network.body.data.nodes.forEach(node => {
        if (node.id === endState.id && accepted) {
            network.body.data.nodes.update({
                id: node.id,
                color: {
                    border: '#16a34a',
                    background: '#bbf7d0',
                    highlight: {
                        border: '#15803d',
                        background: '#86efac'
                    }
                },
                borderWidth: 5
            });
        } else if (Array.from(currentStates).map(s => s.id).includes(node.id)) {
            network.body.data.nodes.update({
                id: node.id,
                color: {
                    border: accepted ? '#16a34a' : '#dc2626',
                    background: accepted ? '#bbf7d0' : '#fecaca',
                    highlight: {
                        border: accepted ? '#15803d' : '#b91c1c',
                        background: accepted ? '#86efac' : '#fca5a5'
                    }
                },
                borderWidth: 4
            });
        } else {
            network.body.data.nodes.update({
                id: node.id,
                color: {
                    border: '#94a3b8',
                    background: '#ffffff',
                    highlight: {
                        border: '#1d4ed8',
                        background: '#e0e7ff'
                    }
                },
                borderWidth: 2
            });
        }
    });

    // Update step display with final result
    const stepDisplayFinal = document.getElementById('step-display');
    if (stepDisplayFinal) {
        const finalStates = Array.from(currentStates).map(s => `S${s.id}`).join(', ');
        stepDisplayFinal.innerHTML = `
            <p class="step-current" style="background: ${accepted ? '#bbf7d0' : '#fecaca'}; border-color: ${accepted ? '#16a34a' : '#dc2626'};">
                <strong>✓ Simulation Complete!</strong><br>
                <strong>Final States:</strong> {${finalStates || 'none'}}<br>
                <strong>Result:</strong> String is <strong>${accepted ? 'ACCEPTED ✓' : 'REJECTED ✗'}</strong>
            </p>
        `;
    }
    
    // Keep playback controls enabled so user can step through the animation
    isAnimating = false;
    isPaused = false;
    
    if (pauseBtn) {
        pauseBtn.disabled = true; // Disable pause since animation is complete
        pauseBtn.textContent = '⏸';
        pauseBtn.classList.remove('playing');
    }
    // Keep step buttons enabled for manual navigation
    if (stepBackBtn) stepBackBtn.disabled = false;
    if (stepForwardBtn) stepForwardBtn.disabled = (animationSteps.length === 0);

    return accepted;
}

// Display educational conversion steps
function displayConversionSteps() {
    const educationalPanel = document.getElementById('educational-panel');
    const conversionStepsEl = document.getElementById('conversion-steps');
    
    if (educationalPanel) educationalPanel.classList.remove('hidden');
    
    if (!conversionStepsEl || conversionSteps.length === 0) return;
    
    let html = '';
    
    // Display conversion steps
    const conversionOnlySteps = conversionSteps.filter(s => s.type === 'conversion');
    conversionOnlySteps.forEach((step, index) => {
        html += `
            <div class="conversion-step">
                <div class="conversion-step-title">${step.step || 'Step ' + (index + 1)}</div>
                <div style="margin-top: 0.375rem; color: #4a5568;">${step.explanation}</div>
                ${step.original ? `<div class="conversion-step-content"><strong>Input:</strong> ${step.original}</div>` : ''}
                ${step.result ? `<div class="conversion-step-content"><strong>Output:</strong> ${step.result}</div>` : ''}
            </div>
        `;
    });
    
    // Display Thompson's Construction rules
    const thompsonSteps = conversionSteps.filter(s => s.type === 'thompson');
    if (thompsonSteps.length > 0) {
        html += `<div style="margin-top: 1rem; font-weight: 700; color: #764ba2;">Thompson's Construction Rules Applied:</div>`;
        thompsonSteps.forEach((step, index) => {
            html += `
                <div class="thompson-rule">
                    <span class="thompson-rule-name">${index + 1}. ${step.rule}:</span> ${step.description}
                    <div style="margin-top: 0.25rem; font-size: 0.8rem; color: #4a5568;">${step.detail}</div>
                </div>
            `;
        });
    }
    
    conversionStepsEl.innerHTML = html;
    
    // Auto-expand when new content is generated
    const icon = document.getElementById('toggle-steps');
    if (conversionStepsEl.classList.contains('collapsed') && icon) {
        conversionStepsEl.classList.remove('collapsed');
        icon.classList.remove('collapsed');
    }
}

let globalNetwork = null;

document.getElementById('animate-btn')?.addEventListener('click', async () => {
    const stringInput = document.getElementById('string-input');
    const testString = stringInput?.value ?? '';

    if (!globalNFA) {
        alert('Please generate the NFA before testing a string.');
        return;
    }

    if (!globalNetwork) {
        alert('Please generate the NFA visualization first.');
        return;
    }

    // Run animation
    const accepted = await animateNFA(globalNFA.startState, globalNFA.endState, testString, globalNetwork);
});
