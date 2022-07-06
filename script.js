const input = document.querySelector('#input');
const todos = document.querySelector('#todos');
const filterBtns = document.querySelector('#controls');
const clearBtn = document.querySelector('#clear');
const finishBtn = document.querySelector('#finish');

let filterStatus = 'all';

let todoList = [];


const createTodo = (input, checked = false) => {
    const todoObj = {
        id: new Date().getTime().toString(),
        value: input,
        checked
    }
    return todoObj;
}

const toggleTodo = (todo) => {
    todoList = todoList.map((item) => {
        return item.id === todo.id ? {...item, checked: !item.checked } : item
    })
}

const deleteTodo = (item) => {
    todoList = todoList.filter(i => i.id != item.id)
}

const filterTodos = () => {
    if (filterStatus === 'complete'){
        return todoList.filter(item => item.checked);
    }
    if (filterStatus === 'active'){
        return todoList.filter(item => !item.checked);
    }
    return todoList
}

const updateTodo = (todo, newValue) => {
    todoList = todoList.map((item) => {
        return item.id === todo.id ? {...item, value: newValue} : item
    })
}

const renderTodo = (todoObj) => {
    const item = document.createElement('li');
    const checkbox = document.createElement('input');
    const text = document.createElement('p');
    const deleteBtn = document.createElement('button');   
    
    item.id = todoObj.id;
    checkbox.type = 'checkbox';
    checkbox.checked = todoObj.checked;
    text.innerHTML = todoObj.value;
    deleteBtn.innerHTML = 'X';

    checkbox.dataset.id = 'checkbox';
    text.dataset.id = 'text';
    deleteBtn.dataset.id = 'deleteBtn';

    item.appendChild(checkbox);
    item.appendChild(text);
    item.appendChild(deleteBtn);

    text.addEventListener('dblclick', () => {
        let input = document.createElement('input');
        input.type = 'text'
        input.value = text.innerHTML;
        text.style.display = 'none';
        item.insertBefore(input, text);
        input.focus();
        input.onblur = () => {
            text.innerHTML = input.value;
            updateTodo(item, input.value)
            if(!input.value){
                deleteTodo(item);
                render();
                showFooter();
            }
            item.removeChild(input);
            text.style.display = '';
            let localTodoList = JSON.parse(localStorage.getItem('todoList'));
            let localItem = localTodoList.find(element => element.id == item.id)
            localItem.value = input.value
            localStorage.setItem('todoList', JSON.stringify(localTodoList))
        }
    })
    return item;
}

const render = () => {
    todos.innerHTML = '';
    let list = filterTodos();
    list.map((item) => {
        let newTodo = renderTodo(item);
        todos.append(newTodo);
    })
    let localTodoList = JSON.stringify(list)
    localStorage.setItem('todoList', localTodoList)
    // console.log(JSON.parse(localStorage.getItem('todoList')))
    showFooter();
};

const showFooter = () => {
    let length = todoList.length 
    const footer = document.querySelector('#footer');
    const count = document.querySelector('#count');
    if (length) {
        footer.style.visibility = 'visible';
        count.innerHTML = todos.children.length;
        return
    }
        footer.style.visibility = 'hidden';
}

const init = () => {
    let localTodoList = JSON.parse(localStorage.getItem('todoList'));
    if (localTodoList.length){
        todoList = [...localTodoList]
        render();
    } 
}

const handleClickTodos = (event) => {
    const item = event.target.parentNode;
    if (event.target.dataset.id === 'deleteBtn'){
        deleteTodo(item);
        showFooter();
        render();
    }
    if (event.target.dataset.id === 'checkbox'){
        event.target.nextElementSibling.classList.toggle('complete');
        toggleTodo(item)
        render();
    }
}

const handleClickFilterBtns = (event) => {
    let id = event.target.id
    filterStatus = id
    filterTodos(); 
    render();
}

todos.addEventListener('click', handleClickTodos)
filterBtns.addEventListener('click', handleClickFilterBtns)

input.addEventListener('keyup', (event) => {
    if (event.key === "Enter" && input.value != '') {
        let newTodo = createTodo(input.value, false)
        todoList.push(newTodo);
        input.value = '';
        render();
    }
});
clearBtn.addEventListener('click', () => {
    todoList = todoList.filter(item => !item.checked);
    render();
})

finishBtn.addEventListener('click', () => {
    todoList.map((i) => {
        if (!i.checked){
            i.checked = !i.checked;
        }
    }) 
    render();
})

init();

