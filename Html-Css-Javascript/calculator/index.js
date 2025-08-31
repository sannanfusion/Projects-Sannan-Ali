
        // DOM Elements
        const previousOperandElement = document.querySelector('.previous-operand');
        const currentOperandElement = document.querySelector('.current-operand');
        const buttons = document.querySelectorAll('button');
        
        // Calculator state
        let currentOperand = '0';
        let previousOperand = '';
        let operation = undefined;
        let resetCurrentOperand = false;
        
        // Update display
        function updateDisplay() {
            currentOperandElement.textContent = currentOperand;
            if (operation != null) {
                previousOperandElement.textContent = `${previousOperand} ${getOperationSymbol(operation)}`;
            } else {
                previousOperandElement.textContent = previousOperand;
            }
        }
        
        // Get operation symbol for display
        function getOperationSymbol(op) {
            switch(op) {
                case '+': return '+';
                case '-': return '-';
                case '×': return '×';
                case '÷': return '÷';
                case '%': return '%';
                default: return '';
            }
        }
        
        // Add digit to current operand
        function addDigit(digit) {
            if (currentOperand === '0' || resetCurrentOperand) {
                currentOperand = digit;
                resetCurrentOperand = false;
            } else {
                currentOperand += digit;
            }
        }
        
        // Handle decimal point
        function addDecimal() {
            if (resetCurrentOperand) {
                currentOperand = '0.';
                resetCurrentOperand = false;
                return;
            }
            
            if (!currentOperand.includes('.')) {
                currentOperand += '.';
            }
        }
        
        // Handle operations
        function chooseOperation(op) {
            if (currentOperand === '' && previousOperand !== '') {
                operation = op;
                return;
            }
            
            if (previousOperand !== '') {
                calculate();
            }
            
            operation = op;
            previousOperand = currentOperand;
            resetCurrentOperand = true;
        }
        
        // Perform calculation
        function calculate() {
            let computation;
            const prev = parseFloat(previousOperand);
            const current = parseFloat(currentOperand);
            
            if (isNaN(prev) || isNaN(current)) return;
            
            switch(operation) {
                case '+':
                    computation = prev + current;
                    break;
                case '-':
                    computation = prev - current;
                    break;
                case '×':
                    computation = prev * current;
                    break;
                case '÷':
                    if (current === 0) {
                        computation = 'Error';
                    } else {
                        computation = prev / current;
                    }
                    break;
                case '%':
                    computation = prev % current;
                    break;
                default:
                    return;
            }
            
            currentOperand = computation.toString();
            operation = undefined;
            previousOperand = '';
            resetCurrentOperand = true;
        }
        
        // Clear calculator
        function clear() {
            currentOperand = '0';
            previousOperand = '';
            operation = undefined;
            resetCurrentOperand = false;
        }
        
        // Delete last digit
        function deleteDigit() {
            if (currentOperand.length === 1) {
                currentOperand = '0';
            } else {
                currentOperand = currentOperand.slice(0, -1);
            }
        }
        
        // Handle button clicks
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                // Number buttons
                if (button.classList.contains('number')) {
                    if (button.textContent === '.' && currentOperand.includes('.')) return;
                    if (button.textContent === '.') {
                        addDecimal();
                    } else {
                        addDigit(button.textContent);
                    }
                    updateDisplay();
                    return;
                }
                
                // Operator buttons
                if (button.classList.contains('operator')) {
                    chooseOperation(button.textContent);
                    updateDisplay();
                    return;
                }
                
                // Equals button
                if (button.classList.contains('equals')) {
                    calculate();
                    updateDisplay();
                    return;
                }
                
                // Function buttons (Clear and Delete)
                if (button.classList.contains('function')) {
                    if (button.textContent === 'C') {
                        clear();
                    } else if (button.textContent === 'DEL') {
                        deleteDigit();
                    }
                    updateDisplay();
                    return;
                }
            });
        });
        
        // Initialize display
        updateDisplay();
    


        // ✅ Keyboard support
document.addEventListener('keydown', (event) => {
    if (!isNaN(event.key)) { 
        // Number keys 0-9
        addDigit(event.key);
        updateDisplay();
    } else if (event.key === '.') {
        addDecimal();
        updateDisplay();
    } else if (event.key === '+' || event.key === '-') {
        chooseOperation(event.key);
        updateDisplay();
    } else if (event.key === '*' || event.key === 'x' || event.key === 'X') {
        chooseOperation('×');
        updateDisplay();
    } else if (event.key === '/' || event.key === '÷') {
        chooseOperation('÷');
        updateDisplay();
    } else if (event.key === '%') {
        chooseOperation('%');
        updateDisplay();
    } else if (event.key === 'Enter' || event.key === '=') {
        calculate();
        updateDisplay();
    } else if (event.key === 'Backspace') {
        deleteDigit();
        updateDisplay();
    } else if (event.key === 'Escape') {
        clear();
        updateDisplay();
    }
});
