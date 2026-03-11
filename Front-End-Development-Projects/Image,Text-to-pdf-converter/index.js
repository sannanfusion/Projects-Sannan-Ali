        // Wait for the jsPDF library to load
        window.onload = function() {
            // Get DOM elements
            const tabs = document.querySelectorAll('.tab');
            const tabContents = document.querySelectorAll('.tab-content');
            
            const imageUploadArea = document.getElementById('image-upload-area');
            const imageInput = document.getElementById('image-input');
            const imagePreviewContainer = document.getElementById('image-preview-container');
            const imagePreview = document.getElementById('image-preview');
            
            const textUploadArea = document.getElementById('text-upload-area');
            const textInput = document.getElementById('text-input');
            const textInputArea = document.getElementById('text-input-area');
            const textPreviewContainer = document.getElementById('text-preview-container');
            const textPreview = document.getElementById('text-preview');
            
            const imageOptions = document.getElementById('image-options');
            const textOptions = document.getElementById('text-options');
            
            const convertBtn = document.getElementById('convert-btn');
            const downloadBtn = document.getElementById('download-btn');
            const resetBtn = document.getElementById('reset-btn');
            const statusDiv = document.getElementById('status');
            
            // PDF options
            const pageSizeSelect = document.getElementById('page-size');
            const orientationSelect = document.getElementById('orientation');
            const marginInput = document.getElementById('margin');
            const qualitySelect = document.getElementById('quality');
            const fontSizeSelect = document.getElementById('font-size');
            const lineHeightSelect = document.getElementById('line-height');
            
            let currentImage = null;
            let currentText = '';
            let pdfBlob = null;
            let currentMode = 'image';
            
            // Tab switching
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const tabId = tab.getAttribute('data-tab');
                    
                    // Update active tab
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    
                    // Update active content
                    tabContents.forEach(content => content.classList.remove('active'));
                    document.getElementById(tabId).classList.add('active');
                    
                    // Update current mode and UI
                    currentMode = tabId === 'image-tab' ? 'image' : 'text';
                    updateOptionsVisibility();
                    updateConvertButtonState();
                });
            });
            
            // Update which options are visible based on current mode
            function updateOptionsVisibility() {
                if (currentMode === 'image') {
                    imageOptions.style.display = 'flex';
                    textOptions.style.display = 'none';
                } else {
                    imageOptions.style.display = 'none';
                    textOptions.style.display = 'flex';
                }
            }
            
            // Event listeners for Image upload
            imageUploadArea.addEventListener('click', () => imageInput.click());
            
            imageUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                imageUploadArea.classList.add('highlight');
            });
            
            imageUploadArea.addEventListener('dragleave', () => {
                imageUploadArea.classList.remove('highlight');
            });
            
            imageUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                imageUploadArea.classList.remove('highlight');
                
                if (e.dataTransfer.files.length) {
                    handleImageFile(e.dataTransfer.files[0]);
                }
            });
            
            imageInput.addEventListener('change', (e) => {
                if (e.target.files.length) {
                    handleImageFile(e.target.files[0]);
                }
            });
            
            // Event listeners for text upload
            textUploadArea.addEventListener('click', () => textInput.click());
            
            textUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                textUploadArea.classList.add('highlight');
            });
            
            textUploadArea.addEventListener('dragleave', () => {
                textUploadArea.classList.remove('highlight');
            });
            
            textUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                textUploadArea.classList.remove('highlight');
                
                if (e.dataTransfer.files.length) {
                    handleTextFile(e.dataTransfer.files[0]);
                }
            });
            
            textInput.addEventListener('change', (e) => {
                if (e.target.files.length) {
                    handleTextFile(e.target.files[0]);
                }
            });
            
            // Handle text input changes
            textInputArea.addEventListener('input', () => {
                currentText = textInputArea.value;
                updateTextPreview();
                updateConvertButtonState();
            });
            
            // Handle image file selection
            function handleImageFile(file) {
                if (!file.type.match('image.*')) {
                    showStatus('Please select a valid image file (JPG, PNG, GIF, WebP).', 'error');
                    return;
                }
                
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    currentImage = new Image();
                    currentImage.onload = function() {
                        imagePreview.src = e.target.result;
                        imagePreviewContainer.style.display = 'block';
                        updateConvertButtonState();
                        downloadBtn.disabled = true;
                        statusDiv.className = 'status';
                    };
                    currentImage.src = e.target.result;
                };
                
                reader.readAsDataURL(file);
                showStatus('Image loaded successfully. You can now convert it to PDF.', 'success');
            }
            
            // Handle text file selection
            function handleTextFile(file) {
                if (!file.type.match('text.*') && !file.name.endsWith('.txt')) {
                    showStatus('Please select a valid text file (.txt).', 'error');
                    return;
                }
                
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    currentText = e.target.result;
                    textInputArea.value = currentText;
                    updateTextPreview();
                    updateConvertButtonState();
                    downloadBtn.disabled = true;
                    showStatus('Text file loaded successfully. You can now convert it to PDF.', 'success');
                };
                
                reader.readAsText(file);
            }
            
            // Update text preview
            function updateTextPreview() {
                textPreview.textContent = currentText;
                if (currentText.trim() !== '') {
                    textPreviewContainer.style.display = 'block';
                } else {
                    textPreviewContainer.style.display = 'none';
                }
            }
            
            // Update convert button state
            function updateConvertButtonState() {
                if (currentMode === 'image') {
                    convertBtn.disabled = !currentImage;
                } else {
                    convertBtn.disabled = !currentText.trim();
                }
            }
            
            // Convert to PDF
            convertBtn.addEventListener('click', () => {
                if (currentMode === 'image' && !currentImage) return;
                if (currentMode === 'text' && !currentText.trim()) return;
                
                try {
                    // Get PDF options
                    const pageSize = pageSizeSelect.value;
                    const orientation = orientationSelect.value;
                    const margin = parseInt(marginInput.value);
                    
                    // Create a new PDF document
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF({
                        orientation: orientation,
                        unit: 'mm',
                        format: pageSize
                    });
                    
                    if (currentMode === 'image') {
                        // Image conversion
                        const quality = parseFloat(qualitySelect.value);
                        
                        // Calculate dimensions
                        const pageWidth = doc.internal.pageSize.getWidth();
                        const pageHeight = doc.internal.pageSize.getHeight();
                        
                        const contentWidth = pageWidth - (2 * margin);
                        const contentHeight = pageHeight - (2 * margin);
                        
                        // Calculate image dimensions to fit the page
                        let imgWidth = currentImage.width;
                        let imgHeight = currentImage.height;
                        
                        const ratio = Math.min(contentWidth / imgWidth, contentHeight / imgHeight);
                        imgWidth *= ratio;
                        imgHeight *= ratio;
                        
                        // Center the image on the page
                        const x = (pageWidth - imgWidth) / 2;
                        const y = (pageHeight - imgHeight) / 2;
                        
                        // Add image to PDF
                        doc.addImage(
                            currentImage, 
                            'JPEG', 
                            x, 
                            y, 
                            imgWidth, 
                            imgHeight,
                            null,
                            'FAST',
                            0,
                            quality
                        );
                    } else {
                        // Text conversion
                        const fontSize = parseInt(fontSizeSelect.value);
                        const lineHeight = parseFloat(lineHeightSelect.value);
                        
                        // Set text properties
                        doc.setFontSize(fontSize);
                        doc.setTextColor(0, 0, 0);
                        
                        // Calculate text area
                        const pageWidth = doc.internal.pageSize.getWidth();
                        const textWidth = pageWidth - (2 * margin);
                        
                        // Split text into lines
                        const lines = doc.splitTextToSize(currentText, textWidth);
                        
                        // Add text to PDF
                        let y = margin;
                        const lineHeightPx = fontSize * lineHeight * 0.3528; // Convert to mm
                        
                        for (let i = 0; i < lines.length; i++) {
                            // Check if we need a new page
                            if (y + lineHeightPx > doc.internal.pageSize.getHeight() - margin) {
                                doc.addPage();
                                y = margin;
                            }
                            
                            doc.text(lines[i], margin, y);
                            y += lineHeightPx;
                        }
                    }
                    
                    // Generate PDF blob
                    pdfBlob = doc.output('blob');
                    
                    // Enable download button
                    downloadBtn.disabled = false;
                    
                    showStatus('PDF created successfully! Click "Download PDF" to save it.', 'success');
                } catch (error) {
                    console.error('Error creating PDF:', error);
                    showStatus('Error creating PDF. Please try again.', 'error');
                }
            });
            
            // Download PDF
            downloadBtn.addEventListener('click', () => {
                if (!pdfBlob) return;
                
                const url = URL.createObjectURL(pdfBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `converted-${currentMode}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                showStatus('PDF downloaded successfully!', 'success');
            });
            
            // Reset everything
            resetBtn.addEventListener('click', () => {
                imageInput.value = '';
                textInput.value = '';
                textInputArea.value = '';
                imagePreviewContainer.style.display = 'none';
                textPreviewContainer.style.display = 'none';
                convertBtn.disabled = true;
                downloadBtn.disabled = true;
                currentImage = null;
                currentText = '';
                pdfBlob = null;
                statusDiv.className = 'status';
                
                showStatus('Reset completed. You can upload a new file.', 'success');
            });
            
            // Show status message
            function showStatus(message, type) {
                statusDiv.textContent = message;
                statusDiv.className = `status ${type}`;
            }
            
            // Initialize UI
            updateOptionsVisibility();
        };
