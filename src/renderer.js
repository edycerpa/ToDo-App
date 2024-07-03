window.addEventListener('DOMContentLoaded', async () => {
  const editorContainer = document.getElementById('editor-container');
  const addButton = document.getElementById('add-todo');
  const todoList = document.getElementById('todo-list');
  const toggleDarkModeButton = document.getElementById('toggle-dark-mode');

  const minimizeButton = document.getElementById('minimize');
  const maximizeButton = document.getElementById('maximize');
  const closeButton = document.getElementById('close');

  minimizeButton.addEventListener('click', () => {
    window.electron.send('minimize-window');
  });

  maximizeButton.addEventListener('click', () => {
    window.electron.send('maximize-window');
  });

  closeButton.addEventListener('click', () => {
    window.electron.send('close-window');
  });

  const quill = new Quill(editorContainer, {
    theme: 'snow'
  });

  // Aplicar el tema almacenado en localStorage al cargar la aplicación
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.body.classList.toggle('dark-mode', JSON.parse(savedTheme));
  }

  toggleDarkModeButton.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', JSON.stringify(isDark));
  });

  const renderTodos = (todos) => {
    todoList.innerHTML = '';
    todos.forEach((todo, index) => {
      const li = document.createElement('li');
      li.className = 'todo-wrapper';

      const todoDiv = document.createElement('div');
      todoDiv.className = 'todo';
      todoDiv.innerHTML = todo;

      const buttonsDiv = document.createElement('div');
      buttonsDiv.className = 'buttons';

      const editButton = document.createElement('button');
      editButton.className = 'edit-btn';
      editButton.innerHTML = '<img src="icons/edit.svg" />';
      editButton.addEventListener('click', () => {
        quill.root.innerHTML = todo; // Cargar el contenido actual en el editor
        addButton.textContent = 'Save';
        addButton.onclick = () => {
          const updatedTodo = quill.root.innerHTML;
          if (updatedTodo.trim()) {
            todos[index] = updatedTodo.trim();
            saveTodos(todos);
            renderTodos(todos);
            quill.setText('');
            addButton.textContent = 'Add';
            addButton.onclick = addTodo;
          }
        };
      });

      const deleteButton = document.createElement('button');
      deleteButton.className = 'delete-btn';
      deleteButton.innerHTML = '<img src="icons/trash.svg" />';
      deleteButton.addEventListener('click', () => {
        todos.splice(index, 1);
        saveTodos(todos);
        renderTodos(todos);
      });

      buttonsDiv.appendChild(editButton);
      buttonsDiv.appendChild(deleteButton);
      li.appendChild(todoDiv);
      li.appendChild(buttonsDiv);
      todoList.appendChild(li);
    });
  };

  const saveTodos = async (todos) => {
    await window.electron.invoke('save-todos', todos);
  };

  const todos = await window.electron.invoke('get-todos');
  renderTodos(todos);

  const addTodo = () => {
    const todo = quill.root.innerHTML;
    if (todo.trim()) {
      todos.push(todo.trim());
      saveTodos(todos);
      renderTodos(todos);
      quill.setText('');
    }
  };

  addButton.onclick = addTodo;
});

