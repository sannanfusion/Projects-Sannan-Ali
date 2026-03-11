
        // DOM Elements
        const taskInput = document.getElementById('task-input');
        const addBtn = document.getElementById('add-btn');
        const taskList = document.getElementById('task-list');
        const emptyState = document.getElementById('empty-state');
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        // State management
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        let currentFilter = 'all';
        
        // Initialize the application
        function init() {
            renderTasks();
            setupEventListeners();
        }
        
        // Set up event listeners
        function setupEventListeners() {
            // Add task event
            addBtn.addEventListener('click', addTask);
            taskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') addTask();
            });
            
            // Filter events
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Update active filter button
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    // Set current filter and re-render
                    currentFilter = btn.dataset.filter;
                    renderTasks();
                });
            });
        }
        
        // Add a new task
        function addTask() {
            const taskText = taskInput.value.trim();
            
            if (taskText === '') {
                alert('Please enter a task!');
                return;
            }
            
            // Create new task object
            const newTask = {
                id: Date.now(),
                text: taskText,
                completed: false,
                timestamp: new Date().toISOString()
            };
            
            // Add to tasks array and update storage
            tasks.push(newTask);
            updateLocalStorage();
            
            // Clear input and re-render
            taskInput.value = '';
            renderTasks();
        }
        
        // Mark task as completed
        function completeTask(id) {
            tasks = tasks.map(task => {
                if (task.id === id) {
                    return { ...task, completed: !task.completed };
                }
                return task;
            });
            
            updateLocalStorage();
            renderTasks();
        }
        
        // Delete a task
        function deleteTask(id) {
            if (!confirm('Are you sure you want to delete this task?')) return;
            
            // Find task element for animation
            const taskElement = document.querySelector(`[data-id="${id}"]`);
            if (taskElement) {
                taskElement.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    tasks = tasks.filter(task => task.id !== id);
                    updateLocalStorage();
                    renderTasks();
                }, 300);
            } else {
                tasks = tasks.filter(task => task.id !== id);
                updateLocalStorage();
                renderTasks();
            }
        }
        
        // Update localStorage with current tasks
        function updateLocalStorage() {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
        
        // Render tasks based on current filter
        function renderTasks() {
            // Clear the task list
            taskList.innerHTML = '';
            
            // Filter tasks based on current filter
            let filteredTasks = tasks;
            if (currentFilter === 'active') {
                filteredTasks = tasks.filter(task => !task.completed);
            } else if (currentFilter === 'completed') {
                filteredTasks = tasks.filter(task => task.completed);
            }
            
            // Show empty state if no tasks
            if (filteredTasks.length === 0) {
                emptyState.classList.add('visible');
            } else {
                emptyState.classList.remove('visible');
                
                // Render each task
                filteredTasks.forEach(task => {
                    const taskElement = document.createElement('li');
                    taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
                    taskElement.dataset.id = task.id;
                    
                    taskElement.innerHTML = `
                        <span class="task-text">${task.text}</span>
                        <div class="task-actions">
                            <button class="task-btn done-btn">${task.completed ? 'Undo' : 'Complete'}</button>
                            <button class="task-btn delete-btn">Delete</button>
                        </div>
                    `;
                    
                    // Add event listeners to the buttons
                    const doneBtn = taskElement.querySelector('.done-btn');
                    const deleteBtn = taskElement.querySelector('.delete-btn');
                    
                    doneBtn.addEventListener('click', () => completeTask(task.id));
                    deleteBtn.addEventListener('click', () => deleteTask(task.id));
                    
                    taskList.appendChild(taskElement);
                });
            }
        }
        
        // Initialize the app when the DOM is loaded
        document.addEventListener('DOMContentLoaded', init);
