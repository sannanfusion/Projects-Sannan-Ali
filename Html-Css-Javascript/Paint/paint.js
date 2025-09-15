document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('paint-canvas');
    const ctx = canvas.getContext('2d');
    const toolbar = document.querySelector('.toolbar');
    
    // UI elements
    const toolButtons = document.querySelectorAll('.tool-btn');
    const brushSizeInput = document.getElementById('brush-size');
    const colorPalette = document.querySelector('.color-palette');
    const customColorPicker = document.getElementById('custom-color-picker');
    const activeColorIndicator = document.querySelector('.active-color-indicator');
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    const newBtn = document.getElementById('new-btn');
    const saveBtn = document.getElementById('save-btn');
    const fillShapeCheckbox = document.getElementById('fill-shape');

    // State variables
    let isDrawing = false;
    let currentTool = 'pencil';
    let currentColor = '#000000';
    let currentSize = 5;
    let startPos = { x: 0, y: 0 };
    let snapshot;

    // Undo/Redo history
    const history = [];
    let historyStep = -1;
    const MAX_HISTORY = 10;

    // Set up initial canvas size and background
    function setupCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveState(); // Save initial white canvas
    }

    // Save the current canvas state to history
    function saveState() {
        // Limit history size
        if (historyStep < history.length - 1) {
            history.length = historyStep + 1;
        }
        history.push(canvas.toDataURL());
        historyStep++;

        // Trim the history array to the max size
        if (history.length > MAX_HISTORY) {
            history.shift();
            historyStep--;
        }
    }

    // Restore a canvas state from history
    function restoreState() {
        if (historyStep >= 0 && historyStep < history.length) {
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = history[historyStep];
        }
    }

    // New button functionality: clear canvas and reset
    newBtn.addEventListener('click', () => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        history.length = 0;
        historyStep = -1;
        saveState();
    });

    // Save button functionality: download canvas as PNG
    saveBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'my-drawing.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    // Undo/Redo functionality
    undoBtn.addEventListener('click', () => {
        if (historyStep > 0) {
            historyStep--;
            restoreState();
        }
    });

    redoBtn.addEventListener('click', () => {
        if (historyStep < history.length - 1) {
            historyStep++;
            restoreState();
        }
    });

    // Tool selection logic
    toolButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            toolButtons.forEach(b => b.classList.remove('active-tool'));
            btn.classList.add('active-tool');
            currentTool = btn.dataset.tool;
            canvas.style.cursor = (currentTool === 'pencil' || currentTool === 'eraser') ? 'crosshair' : 'pointer';
        });
    });

    // Color and brush size updates
    colorPalette.addEventListener('click', (e) => {
        if (e.target.classList.contains('color-box')) {
            const color = e.target.dataset.color;
            currentColor = color;
            activeColorIndicator.style.backgroundColor = color;
            // Update custom color picker to match
            customColorPicker.value = colorToHex(color);
        }
    });

    customColorPicker.addEventListener('input', (e) => {
        currentColor = e.target.value;
        activeColorIndicator.style.backgroundColor = currentColor;
    });

    brushSizeInput.addEventListener('input', (e) => {
        currentSize = parseInt(e.target.value);
    });

    // Helper function to convert color name to hex for the custom picker
    function colorToHex(colorName) {
        const colors = {
            'black': '#000000', 'red': '#ff0000', 'green': '#008000', 'blue': '#0000ff', 'yellow': '#ffff00', 'white': '#ffffff'
        };
        return colors[colorName] || colorName;
    }

    // --- Drawing Functions ---
    // Get mouse position relative to the canvas
    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    // Start drawing/action
    function startDrawing(e) {
        isDrawing = true;
        startPos = getMousePos(e);
        // Save canvas snapshot for shape tools to avoid constant redraws
        if (currentTool !== 'pencil' && currentTool !== 'eraser') {
            snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }
        draw(e);
    }

    // Main drawing loop
    function draw(e) {
        if (!isDrawing) return;
        const pos = getMousePos(e);
        
        ctx.lineWidth = currentSize;
        ctx.lineCap = 'round';
        
        switch(currentTool) {
            case 'pencil':
            case 'eraser':
                // Eraser is just drawing with the background color
                ctx.strokeStyle = (currentTool === 'eraser') ? 'white' : currentColor;
                ctx.lineTo(pos.x, pos.y);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(pos.x, pos.y);
                break;
            case 'line':
                ctx.putImageData(snapshot, 0, 0); // Restore canvas state
                ctx.strokeStyle = currentColor;
                ctx.beginPath();
                ctx.moveTo(startPos.x, startPos.y);
                ctx.lineTo(pos.x, pos.y);
                ctx.stroke();
                break;
            case 'rectangle':
                ctx.putImageData(snapshot, 0, 0);
                const rectWidth = pos.x - startPos.x;
                const rectHeight = pos.y - startPos.y;
                if (fillShapeCheckbox.checked) {
                    ctx.fillStyle = currentColor;
                    ctx.fillRect(startPos.x, startPos.y, rectWidth, rectHeight);
                } else {
                    ctx.strokeStyle = currentColor;
                    ctx.strokeRect(startPos.x, startPos.y, rectWidth, rectHeight);
                }
                break;
            case 'circle':
                ctx.putImageData(snapshot, 0, 0);
                const radiusX = Math.abs(pos.x - startPos.x);
                const radiusY = Math.abs(pos.y - startPos.y);
                const centerX = startPos.x + (pos.x - startPos.x) / 2;
                const centerY = startPos.y + (pos.y - startPos.y) / 2;

                ctx.beginPath();
                ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
                if (fillShapeCheckbox.checked) {
                    ctx.fillStyle = currentColor;
                    ctx.fill();
                } else {
                    ctx.strokeStyle = currentColor;
                    ctx.stroke();
                }
                break;
            default:
                break;
        }
    }

    // Stop drawing/action
    function stopDrawing(e) {
        if (!isDrawing) return;
        isDrawing = false;
        ctx.beginPath();
        saveState();
    }
    
    // Mouse event handlers for drawing
    canvas.addEventListener('mousedown', (e) => {
        const pos = getMousePos(e);
        switch (currentTool) {
            case 'pencil':
            case 'eraser':
            case 'line':
            case 'rectangle':
            case 'circle':
                startDrawing(e);
                break;
            case 'fill':
                fillTool(pos.x, pos.y);
                saveState();
                break;
            case 'picker':
                pickColor(pos.x, pos.y);
                break;
        }
    });

    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    // --- Fill Tool Logic (Flood-Fill Algorithm) ---
    function fillTool(x, y) {
        const targetColor = ctx.getImageData(x, y, 1, 1).data;
        const fillColor = hexToRgb(currentColor);

        // Don't fill if colors are the same
        if (colorsMatch(targetColor, fillColor)) {
            return;
        }

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixelStack = [[x, y]];

        while (pixelStack.length) {
            const [cx, cy] = pixelStack.pop();
            const pixelPos = (cy * canvas.width + cx) * 4;
            
            // Check if pixel is within bounds and has the target color
            if (cx < 0 || cx >= canvas.width || cy < 0 || cy >= canvas.height) continue;
            
            const currentPixelColor = [
                imageData.data[pixelPos],
                imageData.data[pixelPos + 1],
                imageData.data[pixelPos + 2],
                imageData.data[pixelPos + 3]
            ];

            if (colorsMatch(currentPixelColor, targetColor)) {
                // Change the pixel color
                imageData.data[pixelPos] = fillColor.r;
                imageData.data[pixelPos + 1] = fillColor.g;
                imageData.data[pixelPos + 2] = fillColor.b;
                imageData.data[pixelPos + 3] = 255; // Alpha
                
                // Add adjacent pixels to the stack
                pixelStack.push([cx + 1, cy]);
                pixelStack.push([cx - 1, cy]);
                pixelStack.push([cx, cy + 1]);
                pixelStack.push([cx, cy - 1]);
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }

    // Helper to check if two RGBA colors are a match
    function colorsMatch(c1, c2) {
        // Use a small tolerance for alpha, as it can vary slightly
        const alpha1 = c1[3] !== undefined ? c1[3] : 255;
        const alpha2 = c2.a !== undefined ? c2.a : 255;
        
        return (c1[0] === c2.r && c1[1] === c2.g && c1[2] === c2.b && Math.abs(alpha1 - alpha2) < 5);
    }
    
    // Helper to convert hex to RGB
    function hexToRgb(hex) {
        const r = parseInt(hex.substring(1, 3), 16);
        const g = parseInt(hex.substring(3, 5), 16);
        const b = parseInt(hex.substring(5, 7), 16);
        return { r, g, b, a: 255 };
    }

    // --- Color Picker Logic ---
    function pickColor(x, y) {
        const pixelData = ctx.getImageData(x, y, 1, 1).data;
        const hex = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
        currentColor = hex;
        activeColorIndicator.style.backgroundColor = hex;
        customColorPicker.value = hex;
    }

    // Helper to convert RGB to Hex
    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }
    
    // Initialize canvas on load
    window.addEventListener('resize', () => {
        // This clears canvas, so a more advanced solution would save and redraw
        // For this prompt, a simple resize is sufficient
        setupCanvas();
    });
    
    setupCanvas();
});