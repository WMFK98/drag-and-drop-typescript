"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["ACTIVE"] = "active";
    ProjectStatus["FINISHED"] = "finished";
})(ProjectStatus || (ProjectStatus = {}));
class Project {
    constructor(title, description, people, status) {
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
        this.id = Date.now().toString();
        this.title = title;
        this.description = description;
        this.people = people;
    }
}
class ProjectState {
    constructor() {
        this.listeners = [];
        this.projects = [];
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }
    addProject(title, description, numOfPeople) {
        const newProject = new Project(title, description, numOfPeople, ProjectStatus.ACTIVE);
        this.projects.push(newProject);
        for (const listenerFn of this.listeners)
            listenerFn(this.projects.slice());
    }
    addListener(listenerFn) {
        this.listeners.push(listenerFn);
    }
}
const projectsState = ProjectState.getInstance();
function validate(validatableInput) {
    let isValid = true;
    if (validatableInput.required)
        isValid = isValid && validatableInput.value.toString().trim().length > 0;
    if (typeof validatableInput.value === "string") {
        if ((validatableInput.minLength || validatableInput.minLength === 0))
            isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
        if ((validatableInput.maxLength || validatableInput.maxLength === 0))
            isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
    }
    if (typeof validatableInput.value === "number") {
        if ((validatableInput.min || validatableInput.min === 0))
            isValid = isValid && validatableInput.value >= validatableInput.min;
        if ((validatableInput.max || validatableInput.max === 0))
            isValid = isValid && validatableInput.value <= validatableInput.max;
    }
    return isValid;
}
function AutoBind(_, _2, descriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor = {
        configurable: true,
        get() {
            return originalMethod.bind(this);
        }
    };
    return adjDescriptor;
}
class ProjectList {
    constructor(type) {
        this.type = type;
        this.templateElement = document.getElementById('project-list');
        this.hostElement = document.getElementById('app');
        this.assignedProjects = [];
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.element.id = `${this.type}-projects`;
        projectsState.addListener((projects) => {
            const relevantProjects = projects.filter(prj => prj.status === this.type);
            this.assignedProjects = relevantProjects;
            this.renderProjects();
        });
        this.attach();
        this.renderContent();
    }
    renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`);
        listEl.textContent = '';
        for (const priItem of this.assignedProjects) {
            const listItem = document.createElement('li');
            listItem.textContent = priItem.title;
            listEl.appendChild(listItem);
        }
    }
    renderContent() {
        this.element.querySelector('ul').id = `${this.type}-projects-list`;
        this.element.querySelector('h2').textContent = this.type.toUpperCase() + ' PROJECTS';
    }
    attach() {
        this.hostElement.insertAdjacentElement('beforeend', this.element);
    }
}
class ProjectInput {
    constructor() {
        this.templateElement = document.getElementById('project-input');
        this.hostElement = document.getElementById('app');
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.element.id = 'user-input';
        this.titleInputElement = this.element.querySelector('#title');
        this.descriptionInputElement = this.element.querySelector('#description');
        this.peopleInputElement = this.element.querySelector('#people');
        this.configure();
        this.attach();
    }
    gatherUserInput() {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;
        const titleValidatable = {
            value: enteredTitle,
            required: true
        };
        const descriptionValidatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        };
        const peopleValidatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5
        };
        console.log(validate(titleValidatable), validate(descriptionValidatable), validate(peopleValidatable));
        if (!validate(titleValidatable) || !validate(descriptionValidatable) || !validate(peopleValidatable)) {
            return alert('Invalid input, please try again!');
        }
        return [enteredTitle, enteredDescription, +enteredPeople];
    }
    clearInputs() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }
    submitHandler(event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if (!userInput)
            return;
        const [title, description, people] = userInput;
        projectsState.addProject(title, description, people);
        this.clearInputs();
    }
    configure() {
        this.element.addEventListener('submit', this.submitHandler);
    }
    attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
}
__decorate([
    AutoBind
], ProjectInput.prototype, "submitHandler", null);
const prjInput = new ProjectInput();
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');
//# sourceMappingURL=app.js.map