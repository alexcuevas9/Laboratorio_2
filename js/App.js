document.addEventListener('DOMContentLoaded', () => {
    const apiBaseUrl = 'http://127.0.0.1:8000/api';

    const loadEmployees = () => {
        fetch(`${apiBaseUrl}/empleados`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar empleados: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    const employeeSelect = document.getElementById('employee');
                    const filterEmployeeSelect = document.getElementById('filter-employee');
                    employeeSelect.innerHTML = '<option value="">Seleccione Responsable</option>';
                    filterEmployeeSelect.innerHTML = '<option value="">Filtrar por Responsable</option>';
                    data.forEach(employee => {
                        const option = document.createElement('option');
                        option.value = employee.id;
                        option.textContent = employee.nombre;
                        employeeSelect.appendChild(option);
                        filterEmployeeSelect.appendChild(option.cloneNode(true));
                    });
                } else {
                    console.error('Error al cargar empleados: La respuesta del servidor no es un array');
                }
            })
            .catch(error => console.error('Error al cargar empleados:', error));
    };

    const loadTasks = () => {
        fetch(`${apiBaseUrl}/tareas`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar tareas: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                if (Array.isArray(data.data)) {
                    const tasksTableBody = document.getElementById('tasks-table-body');
                    tasksTableBody.innerHTML = '';
                    data.data.forEach(task => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                        <td>${task.titulo}</td>
                        <td>${task.descripcion}</td>
                        <td>${task.fechaEstimadaFinalizacion}</td>
                        <td>${task.prioridad.nombre}</td>
                        <td>${task.estado.nombre}</td>
                        <td>${task.empleado.nombre}</td>
                        <td>
                            <button class="edit-button" data-id="${task.id}">Editar</button>
                            <button class="delete-button" data-id="${task.id}">Eliminar</button>
                        </td>
                        `;
                        tasksTableBody.appendChild(row);
                    });
                    addTaskEventListeners();
                } else {
                    console.error('Error al cargar tareas: La respuesta del servidor no es un array');
                }
            })
            .catch(error => console.error('Error al cargar tareas:', error));
    };

    const addTaskEventListeners = () => {
        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', handleEditTask);
        });

        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', handleDeleteTask);
        });
    };

    const handleCreateTask = event => {
        event.preventDefault();
        const taskData = {
            titulo: document.getElementById('title').value,
            descripcion: document.getElementById('description').value,
            fechaEstimadaFinalizacion: document.getElementById('estimated-end-date').value,
            creadorTarea: document.getElementById('creator').value,
            idEmpleado: document.getElementById('employee').value,
            idEstado: document.getElementById('status').value,
            idPrioridad: document.getElementById('priority').value,
            observaciones: document.getElementById('observations').value
        };
        fetch(`${apiBaseUrl}/tareas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(({ status, body }) => {
            if (status !== 201) {
                console.error('Error al crear tarea:', body);
                throw new Error(`Error al crear tarea: ${status} - ${JSON.stringify(body)}`);
            }
            loadTasks();
            document.getElementById('create-task-form').reset();
        })
        .catch(error => console.error(error));
    };
    

    const handleEditTask = event => {
        const taskId = event.target.dataset.id;
        fetch(`${apiBaseUrl}/tareas/${taskId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar tarea: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                document.getElementById('title').value = data.titulo;
                document.getElementById('description').value = data.descripcion;
                document.getElementById('estimated-end-date').value = data.fechaEstimadaFinalizacion;
                document.getElementById('creator').value = data.creadorTarea;
                document.getElementById('employee').value = data.idEmpleado;
                document.getElementById('status').value = data.idEstado;
                document.getElementById('priority').value = data.idPrioridad;
                document.getElementById('observations').value = data.observaciones;
                document.getElementById('task-form').dataset.editing = taskId;
            })
            .catch(error => console.error('Error al cargar tarea:', error));
    };
    
    const handleUpdateTask = taskId => {
        const taskData = {
            titulo: document.getElementById('title').value,
            descripcion: document.getElementById('description').value,
            fechaEstimadaFinalizacion: document.getElementById('estimated-end-date').value,
            creadorTarea: document.getElementById('creator').value,
            idEmpleado: document.getElementById('employee').value,
            idEstado: document.getElementById('status').value,
            idPrioridad: document.getElementById('priority').value,
            observaciones: document.getElementById('observations').value
        };
        fetch(`${apiBaseUrl}/tareas/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(({ status, body }) => {
            if (status !== 200) {
                console.error('Error al actualizar tarea:', body);
                throw new Error(`Error al actualizar tarea: ${status} - ${JSON.stringify(body)}`);
            }
            loadTasks();
            document.getElementById('create-task-form').reset();
            document.getElementById('task-form').dataset.editing = '';
        })
        .catch(error => console.error(error));
    };
    

    const handleDeleteTask = event => {
        const taskId = event.target.dataset.id;
        fetch(`${apiBaseUrl}/tareas/${taskId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al eliminar tarea: ' + response.statusText);
            }
            loadTasks();
        })
        .catch(error => console.error('Error al eliminar tarea:', error));
    };

    document.getElementById('create-task-form').addEventListener('submit', event => {
        const taskId = document.getElementById('task-form').dataset.editing;
        if (taskId) {
            handleUpdateTask(taskId);
        } else {
            handleCreateTask(event);
        }
    });

    document.getElementById('filter-button').addEventListener('click', () => {
        const filters = {
            titulo: document.getElementById('search-title').value,
            fechaInicio: document.getElementById('filter-start-date').value,
            fechaFin: document.getElementById('filter-end-date').value,
            idPrioridad: document.getElementById('filter-priority').value,
            idEstado: document.getElementById('filter-status').value,
            idEmpleado: document.getElementById('filter-employee').value
        };
        let queryString = Object.keys(filters)
            .map(key => filters[key] ? `${key}=${filters[key]}` : '')
            .filter(param => param)
            .join('&');

        fetch(`${apiBaseUrl}/tareas?${queryString}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al filtrar tareas: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                if (Array.isArray(data.data)) {
                    const tasksTableBody = document.getElementById('tasks-table-body');
                    tasksTableBody.innerHTML = '';
                    data.data.forEach(task => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                        <td>${task.titulo}</td>
                        <td>${task.descripcion}</td>
                        <td>${task.fechaEstimadaFinalizacion}</td>
                        <td>${task.prioridad.nombre}</td>
                        <td>${task.estado.nombre}</td>
                        <td>${task.empleado.nombre}</td>
                        <td>
                            <button class="edit-button" data-id="${task.id}">Editar</button>
                            <button class="delete-button" data-id="${task.id}">Eliminar</button>
                        </td>
                        `;
                        tasksTableBody.appendChild(row);
                    });
                    addTaskEventListeners();
                } else {
                    console.error('Error al filtrar tareas: La respuesta del servidor no es un array');
                }
            })
            .catch(error => console.error('Error al filtrar tareas:', error));
    });

    document.getElementById('create-task-nav').addEventListener('click', () => {
        document.getElementById('home').classList.add('hidden');
        document.getElementById('task-form').classList.remove('hidden');
        document.getElementById('task-list').classList.add('hidden');
    });

    document.getElementById('list-tasks-nav').addEventListener('click', () => {
        document.getElementById('home').classList.add('hidden');
        document.getElementById('task-form').classList.add('hidden');
        document.getElementById('task-list').classList.remove('hidden');
        loadTasks();
    });

    loadEmployees();
    loadTasks();
});

