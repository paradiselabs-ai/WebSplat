// newDesign.js

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    updateDashboard();

    // Set up navigation
    setupNavigation();

    // Set up button event listeners
    document.getElementById('initialize-project').addEventListener('click', initializeProject);
    document.getElementById('next-step').addEventListener('click', nextStep);

    // Set up settings form
    document.getElementById('ai-settings-form').addEventListener('submit', saveSettings);
});

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            const view = this.getAttribute('data-view');
            showView(view);
        });
    });
}

function showView(view) {
    const views = ['dashboard', 'agents', 'performance', 'settings'];
    views.forEach(v => {
        document.getElementById(`${v}-view`).style.display = v === view ? 'block' : 'none';
    });
    if (view === 'dashboard') updateDashboard();
    if (view === 'agents') updateAgents();
    if (view === 'performance') updatePerformance();
}

function showLoading() {
    document.getElementById('loading-indicator').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading-indicator').style.display = 'none';
}

async function updateDashboard() {
    showLoading();
    try {
        const response = await fetch('/dashboard-data');
        const data = await response.json();
        if (data.success) {
            updateProjectState(data.project_state);
            updateRecentActivities(data.performance_logs);
            updateProgressTimeline(data.project_state);
        } else {
            console.error('Failed to fetch dashboard data:', data.error);
        }
    } catch (error) {
        console.error('Error updating dashboard:', error);
    }
    hideLoading();
}

function updateProjectState(projectState) {
    const stateDisplay = document.getElementById('project-state-display');
    stateDisplay.textContent = JSON.stringify(projectState, null, 2);
}

function updateRecentActivities(logs) {
    const activitiesContainer = document.getElementById('recent-activities');
    activitiesContainer.innerHTML = '';
    logs.slice(-5).reverse().forEach(log => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.textContent = `${log.timestamp}: ${log.agent} - ${log.action}`;
        activitiesContainer.appendChild(activityItem);
    });
}

function updateProgressTimeline(projectState) {
    const ctx = document.getElementById('progress-timeline-chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: projectState.current_tasks.map((_, index) => `Step ${index + 1}`),
            datasets: [{
                label: 'Project Progress',
                data: projectState.current_tasks.map((task, index) => index + 1),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Steps Completed'
                    }
                }
            }
        }
    });
}

async function updateAgents() {
    showLoading();
    try {
        const response = await fetch('/get-agent-statuses');
        const data = await response.json();
        if (data.success) {
            const agentCardsContainer = document.getElementById('agent-cards');
            agentCardsContainer.innerHTML = '';
            Object.entries(data.agent_statuses).forEach(([role, status]) => {
                const agentCard = document.createElement('div');
                agentCard.className = 'agent-card';
                agentCard.innerHTML = `
                    <h3>${role}</h3>
                    <p>Current Task: ${status.current_task || 'None'}</p>
                    <button class="btn assign-task" data-agent="${role}">Assign Task</button>
                `;
                agentCardsContainer.appendChild(agentCard);
            });
            setupAssignTaskButtons();
        } else {
            console.error('Failed to fetch agent statuses:', data.error);
        }
    } catch (error) {
        console.error('Error updating agents:', error);
    }
    hideLoading();
}

function setupAssignTaskButtons() {
    document.querySelectorAll('.assign-task').forEach(button => {
        button.addEventListener('click', function() {
            const agent = this.getAttribute('data-agent');
            const task = prompt(`Enter a task for ${agent}:`);
            if (task) assignTask(agent, task);
        });
    });
}

async function assignTask(agent, task) {
    showLoading();
    try {
        const response = await fetch('/agent-action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'execute_task',
                agent_role: agent,
                task: task
            }),
        });
        const data = await response.json();
        if (data.success) {
            alert(`Task assigned to ${agent}: ${task}`);
            updateAgents();
        } else {
            console.error('Failed to assign task:', data.error);
        }
    } catch (error) {
        console.error('Error assigning task:', error);
    }
    hideLoading();
}

async function updatePerformance() {
    showLoading();
    try {
        const response = await fetch('/get-aggregated-metrics');
        const data = await response.json();
        if (data.success) {
            updatePerformanceChart(data.aggregated_metrics);
            updatePerformanceLogs(data.aggregated_metrics);
        } else {
            console.error('Failed to fetch performance data:', data.error);
        }
    } catch (error) {
        console.error('Error updating performance:', error);
    }
    hideLoading();
}

function updatePerformanceChart(metrics) {
    const ctx = document.getElementById('performance-metrics-chart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Total Calls', 'O1 Calls', 'Vertex Calls', 'Errors'],
            datasets: [{
                label: 'API Calls',
                data: [metrics.total_calls, metrics.o1_calls, metrics.vertex_calls, metrics.error_count],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 99, 132, 0.2)'
                ],
                borderColor: [
                    'rgb(75, 192, 192)',
                    'rgb(54, 162, 235)',
                    'rgb(153, 102, 255)',
                    'rgb(255, 99, 132)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updatePerformanceLogs(metrics) {
    const logsContainer = document.getElementById('performance-logs');
    logsContainer.innerHTML = `
        <p>Average Execution Time: ${metrics.average_execution_time.toFixed(2)}s</p>
        <p>Total Tokens Used: ${metrics.total_tokens}</p>
    `;
}

async function initializeProject() {
    showLoading();
    try {
        const response = await fetch('/initialize-project', { method: 'POST' });
        const data = await response.json();
        if (data.success) {
            alert('Project initialized successfully!');
            updateDashboard();
        } else {
            console.error('Failed to initialize project:', data.error);
        }
    } catch (error) {
        console.error('Error initializing project:', error);
    }
    hideLoading();
}

async function nextStep() {
    showLoading();
    try {
        const response = await fetch('/next-step', { method: 'POST' });
        const data = await response.json();
        if (data.success) {
            alert('Next step executed successfully!');
            updateDashboard();
        } else {
            console.error('Failed to execute next step:', data.error);
        }
    } catch (error) {
        console.error('Error executing next step:', error);
    }
    hideLoading();
}

function saveSettings(event) {
    event.preventDefault();
    const defaultModel = document.getElementById('default-model').value;
    // Here you would typically send this to the backend
    alert(`Settings saved! Default model set to: ${defaultModel}`);
}