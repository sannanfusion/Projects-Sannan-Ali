        // Application State
        const AUTH_STATE = {
            currentUser: null,
            isLoggedIn: false,
            resetEmailSent: false
        };

        // Initialize app on page load
        document.addEventListener('DOMContentLoaded', function() {
            checkSavedLogin();
        });

        /**
         * Check if user has a saved login session
         * This would typically validate with a backend server
         */
        function checkSavedLogin() {
            const savedUser = localStorage.getItem('rememberedUser');
            if (savedUser) {
                const userData = JSON.parse(savedUser);
                AUTH_STATE.currentUser = userData;
                AUTH_STATE.isLoggedIn = true;
                showWelcome(userData.name);
            }
        }

        /**
         * Toggle password visibility
         * @param {string} inputId - ID of the password input
         */
        function togglePassword(inputId) {
            const input = document.getElementById(inputId);
            const button = input.nextElementSibling;
            
            if (input.type === 'password') {
                input.type = 'text';
                button.textContent = '🙈';
            } else {
                input.type = 'password';
                button.textContent = '👁';
            }
        }

        /**
         * Show specific form section
         * @param {string} formId - ID of the form to show
         */
        function showForm(formId) {
            // Hide all form sections
            const sections = document.querySelectorAll('.form-section, .welcome-section');
            sections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Show target section
            document.getElementById(formId).classList.add('active');
            
            // Clear any messages and errors
            clearMessages();
            clearFieldErrors();
            
            // Reset forms
            if (formId === 'forgotForm') {
                resetForgotPasswordForm();
            }
        }

        /**
         * Clear all message displays
         */
        function clearMessages() {
            const messageElements = ['loginMessage', 'signupMessage', 'forgotMessage'];
            messageElements.forEach(id => {
                document.getElementById(id).innerHTML = '';
            });
        }

        /**
         * Clear field-specific error messages
         */
        function clearFieldErrors() {
            const errorElements = document.querySelectorAll('.field-error');
            errorElements.forEach(element => {
                element.textContent = '';
            });
        }

        /**
         * Display message in specified container
         * @param {string} containerId - ID of message container
         * @param {string} message - Message to display
         * @param {string} type - 'success' or 'error'
         */
        function showMessage(containerId, message, type) {
            const container = document.getElementById(containerId);
            container.innerHTML = `<div class="${type}-message">${message}</div>`;
            
            // Auto-hide success messages after 3 seconds
            if (type === 'success') {
                setTimeout(() => {
                    container.innerHTML = '';
                }, 3000);
            }
        }

        /**
         * Show field-specific error
         * @param {string} fieldId - ID of error element
         * @param {string} message - Error message
         */
        function showFieldError(fieldId, message) {
            document.getElementById(fieldId).textContent = message;
        }

        /**
         * Validate email format
         * @param {string} email - Email to validate
         * @returns {boolean} - Valid email format
         */
        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        /**
         * Get registered users from localStorage
         * In a real app, this would be a backend API call
         * @returns {Array} - Array of registered users
         */
        function getRegisteredUsers() {
            const users = localStorage.getItem('registeredUsers');
            return users ? JSON.parse(users) : [];
        }

        /**
         * Save user to localStorage
         * In a real app, this would be a backend API call
         * @param {Object} userData - User data to save
         */
        function saveUser(userData) {
            const users = getRegisteredUsers();
            users.push(userData);
            localStorage.setItem('registeredUsers', JSON.stringify(users));
        }

        /**
         * Find user by email
         * In a real app, this would be a backend API call
         * @param {string} email - Email to search for
         * @returns {Object|null} - User object or null
         */
        function findUserByEmail(email) {
            const users = getRegisteredUsers();
            return users.find(user => user.email === email) || null;
        }

        /**
         * Update user password
         * In a real app, this would be a backend API call
         * @param {string} email - User email
         * @param {string} newPassword - New password
         */
        function updateUserPassword(email, newPassword) {
            const users = getRegisteredUsers();
            const userIndex = users.findIndex(user => user.email === email);
            if (userIndex !== -1) {
                users[userIndex].password = newPassword;
                localStorage.setItem('registeredUsers', JSON.stringify(users));
            }
        }

        /**
         * Handle login form submission
         */
        function handleLogin() {
            clearMessages();
            clearFieldErrors();
            
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            // Validation
            let hasErrors = false;
            
            if (!email) {
                showFieldError('loginEmailError', 'Email is required');
                hasErrors = true;
            } else if (!isValidEmail(email)) {
                showFieldError('loginEmailError', 'Please enter a valid email');
                hasErrors = true;
            }
            
            if (!password) {
                showFieldError('loginPasswordError', 'Password is required');
                hasErrors = true;
            }
            
            if (hasErrors) return;
            
            // Check credentials
            // In a real app, this would be an API call to your backend
            const user = findUserByEmail(email);
            
            if (!user || user.password !== password) {
                showMessage('loginMessage', 'Invalid email or password', 'error');
                return;
            }
            
            // Successful login
            AUTH_STATE.currentUser = user;
            AUTH_STATE.isLoggedIn = true;
            
            // Handle remember me
            if (rememberMe) {
                localStorage.setItem('rememberedUser', JSON.stringify(user));
            }
            
            showWelcome(user.name);
        }

        /**
         * Handle signup form submission
         */
        function handleSignup() {
            clearMessages();
            clearFieldErrors();
            
            const name = document.getElementById('signupName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validation
            let hasErrors = false;
            
            if (!name) {
                showFieldError('signupNameError', 'Full name is required');
                hasErrors = true;
            }
            
            if (!email) {
                showFieldError('signupEmailError', 'Email is required');
                hasErrors = true;
            } else if (!isValidEmail(email)) {
                showFieldError('signupEmailError', 'Please enter a valid email');
                hasErrors = true;
            } else if (findUserByEmail(email)) {
                showFieldError('signupEmailError', 'This email is already registered');
                hasErrors = true;
            }
            
            if (!password) {
                showFieldError('signupPasswordError', 'Password is required');
                hasErrors = true;
            } else if (password.length < 6) {
                showFieldError('signupPasswordError', 'Password must be at least 6 characters');
                hasErrors = true;
            }
            
            if (!confirmPassword) {
                showFieldError('confirmPasswordError', 'Please confirm your password');
                hasErrors = true;
            } else if (password !== confirmPassword) {
                showFieldError('confirmPasswordError', 'Passwords do not match');
                hasErrors = true;
            }
            
            if (hasErrors) return;
            
            // Create new user
            // In a real app, this would be an API call to your backend
            const newUser = {
                id: Date.now().toString(),
                name: name,
                email: email,
                password: password,
                createdAt: new Date().toISOString()
            };
            
            saveUser(newUser);
            
            showMessage('signupMessage', 'Account created successfully! Please sign in.', 'success');
            
            // Clear form and redirect to login after delay
            setTimeout(() => {
                document.getElementById('signupForm').reset();
                showForm('loginForm');
            }, 2000);
        }

        /**
         * Handle forgot password form submission
         */
        function handleForgotPassword() {
            clearMessages();
            clearFieldErrors();
            
            const email = document.getElementById('forgotEmail').value.trim();
            
            if (!AUTH_STATE.resetEmailSent) {
                // First step: Check if email exists
                if (!email) {
                    showFieldError('forgotEmailError', 'Email is required');
                    return;
                }
                
                if (!isValidEmail(email)) {
                    showFieldError('forgotEmailError', 'Please enter a valid email');
                    return;
                }
                
                const user = findUserByEmail(email);
                if (!user) {
                    showMessage('forgotMessage', 'If this email is registered, you will receive a reset link.', 'success');
                    return;
                }
                
                // Simulate sending reset email
                AUTH_STATE.resetEmailSent = true;
                document.getElementById('newPasswordGroup').style.display = 'block';
                document.getElementById('resetBtn').textContent = 'Reset Password';
                showMessage('forgotMessage', 'Email verified! Please enter your new password.', 'success');
                
            } else {
                // Second step: Reset password
                const newPassword = document.getElementById('newPassword').value;
                
                if (!newPassword) {
                    showFieldError('newPasswordError', 'New password is required');
                    return;
                }
                
                if (newPassword.length < 6) {
                    showFieldError('newPasswordError', 'Password must be at least 6 characters');
                    return;
                }
                
                // Update password
                // In a real app, this would be an API call to your backend
                updateUserPassword(email, newPassword);
                
                showMessage('forgotMessage', 'Password reset successfully! Please sign in with your new password.', 'success');
                
                setTimeout(() => {
                    resetForgotPasswordForm();
                    showForm('loginForm');
                }, 2000);
            }
        }

        /**
         * Reset forgot password form to initial state
         */
        function resetForgotPasswordForm() {
            AUTH_STATE.resetEmailSent = false;
            document.getElementById('newPasswordGroup').style.display = 'none';
            document.getElementById('resetBtn').textContent = 'Send Reset Link';
            document.getElementById('forgotForm').reset();
        }

        /**
         * Show welcome screen after successful login
         * @param {string} userName - Name of logged in user
         */
        function showWelcome(userName) {
            document.getElementById('welcomeUserName').textContent = userName;
            showForm('welcomeSection');
        }

        /**
         * Handle user logout
         */
        function handleLogout() {
            // Clear session data
            AUTH_STATE.currentUser = null;
            AUTH_STATE.isLoggedIn = false;
            
            // Clear remembered login
            localStorage.removeItem('rememberedUser');
            
            // Reset all forms
            document.querySelectorAll('form').forEach(form => form.reset());
            
            // Show login form
            showForm('loginForm');
            
            showMessage('loginMessage', 'You have been logged out successfully.', 'success');
        }

        // Prevent form submission on Enter key for better UX
        document.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const activeSection = document.querySelector('.form-section.active');
                if (activeSection) {
                    const submitButton = activeSection.querySelector('.btn');
                    if (submitButton) {
                        submitButton.click();
                    }
                }
            }
        });
