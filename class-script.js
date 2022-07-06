
const sendRequest = async (method, url, body = null) => {
    const header = {
        'Content-Type':'application/json'
    }
    try {
        return fetch('http://localhost:5000' + url, {
            method: method,
            body: JSON.stringify(body),
            headers: header
        }).then(response => {
            console.log(response.json())
            return response.json()
        }) 
    } catch (error) {
        console.log(error)
    }
}
//then => async await

class Main {
    constructor(){
        this.todoManager = new Todos()
        this.renderManager = new Render(this.todoManager)
        this.input = document.querySelector('#input');
        this.todosContainer = document.querySelector('#todos');
        this.filterBtns = document.querySelector('#controls');
        this.clearBtn = document.querySelector('#clear');
        this.finishBtn = document.querySelector('#finish');
        this.filterStatus = 'all';

    }

    init() {
        let localTodoList = JSON.parse(localStorage.getItem('todoList'));
        if (localTodoList.length){
            this.todoManager.todoList = [...localTodoList]
        }
        this.render(this.filterStatus)
    }

    render() {
        this.renderManager.render(this.filterStatus)
    }
    
    async handleCreateTodo(event) {
        if (event.key === "Enter" && input.value != '') {

            let todo = JSON.stringify({ "value": this.input.value, "checked": false })
            const newTodo = await sendRequest('POST', '/todos', todo)
            this.todoManager.createTodo(newTodo);
            this.input.value = '';
            this.renderManager.render(this.filterStatus)
            // localStorage.setItem('todoList', JSON.stringify(this.todoManager.todos))
        }
    }

    handleClickTodos(event) {
        const item = event.target.parentNode;
        if (event.target.dataset.id === 'deleteBtn'){
            this.todoManager.deleteTodo(item);
            this.renderManager.showFooter();
            this.renderManager.render(this.filterStatus)
            localStorage.setItem('todoList', JSON.stringify(this.todos))
        }
        if (event.target.dataset.id === 'checkbox'){
            event.target.nextElementSibling.classList.toggle('complete');
            this.todoManager.toggleTodo(item)
            this.renderManager.render(this.filterStatus)
            localStorage.setItem('todoList', JSON.stringify(this.todoManager.todos))
        }
    }

    handleClickFilterBtns(event) {
        let id = event.target.id
        this.filterStatus = id
        this.todoManager.filterTodos(this.filterStatus); 
        this.renderManager.render(this.filterStatus)
        localStorage.setItem('todoList', JSON.stringify(this.todoManager.todos))
    }

    handleClickClearBtn() {
        this.todoManager.todos = this.todoManager.todos.filter(item => !item.checked);
        this.renderManager.render(this.filterStatus);
        localStorage.setItem('todoList', JSON.stringify(this.todoManager.todos))
    }

    handleClickFinishBtn(){
        this.todoManager.todos.forEach((i) => {
            if (!i.checked){
                i.checked = !i.checked;
            }
        }) 
        localStorage.setItem('todoList', JSON.stringify(this.todoManager.todos))
        this.renderManager.render(this.filterStatus);
    }

    createListners() {
        console.log('ok')
        this.input.addEventListener('keyup',  async event => this.handleCreateTodo(event))
        this.todosContainer.addEventListener('click', this.handleClickTodos.bind(this))
        this.filterBtns.addEventListener('click', (event) => this.handleClickFilterBtns(event))
        this.clearBtn.addEventListener('click', this.handleClickClearBtn.bind(this))
        this.finishBtn.addEventListener('click', this.handleClickFinishBtn.bind(this))
    }
}

// class Todo {
//     constructor(input) {
//         this.id = new Date().getTime().toString();
//         this.value = input;
//         this.checked = false;
//     }
// }

class Todos {
    constructor(){
        this.todos = [];
    }

    createTodo(todo){
        this.todos.push(todo);
    }

    deleteTodo(item) {
        this.todos = this.todos.filter(i => i.id != item.id)
    }
    
    toggleTodo(todo) {
        this.todos = this.todos.map((item) => {
            return item.id === todo.id ? {...item, checked: !item.checked } : item
        })
    }
    
    filterTodos(filterStatus){
        if (filterStatus === 'complete'){
            return this.todos.filter(item => item.checked);
        }
        if (filterStatus === 'active'){
            return this.todos.filter(item => !item.checked);
        }
        return this.todos
    }
    
    updateTodo(todo, newValue) {
        this.todos = this.todos.map((item) => {
            return item.id === todo.id ? {...item, value: newValue} : item
        })
    }

}

class Render {
    constructor(todoService) {
        this.todoService = todoService
        this.footer = document.querySelector('#footer');
        this.count = document.querySelector('#count');
        this.todosContainer = document.querySelector('#todos');
    }
    renderTodo(todoObj) {
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
                this.todoService.updateTodo(item, input.value)
                if(!input.value){
                    this.todoService.deleteTodo(item);
                    this.render();
                    this.showFooter();
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
    
    render(filterStatus) {
        this.todosContainer.innerHTML = '';
        let list = this.todoService.filterTodos(filterStatus);
        list.forEach((item) => {
            let newTodo = this.renderTodo(item);
            this.todosContainer.append(newTodo);
        })
        this.showFooter();
    };
    
    showFooter() {
        let length = this.todoService.todos.length 
            this.footer.style.visibility = length ? 'visible' : 'hidden';
            this.count.innerHTML = length;
    }
}

const todos = new Main()
todos.init()
todos.createListners()

