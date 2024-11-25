// Code goes here!
// Project Type
enum ProjectStatus{
    ACTIVE = "active",FINISHED = 'finished',
}


class Project{
    public readonly id: string;
    constructor(public title:string,public description:string,public people:number,public  status:ProjectStatus) {
        this.id= Date.now().toString();
        this.title=title;
        this.description=description;
        this.people=people;
    }
}

//Project State Management
type Listener= (items:Project[]) => void;

class  ProjectState{
    private listeners:Listener[] = []
    private projects:Project[]= []
    private static instance:ProjectState

    private constructor() {
    }

    static getInstance(){
        if(this.instance){
            return this.instance
        }
        this.instance = new ProjectState();
        return this.instance;
    }

    addProject(title:string,description:string,numOfPeople:number){
        const newProject = new Project(title,description,numOfPeople,ProjectStatus.ACTIVE);
        this.projects.push(newProject);
        for (const  listenerFn of this.listeners) listenerFn(this.projects.slice())

    }

    addListener(listenerFn:Listener){
        this.listeners.push(listenerFn)
    }
}

const projectsState = ProjectState.getInstance();


//autoBind decorator

interface Validatable {
    value:string|number;
    required?:boolean
    minLength?:number;
    maxLength?:number;
    min?:number;
    max?:number;
}

function validate(validatableInput:Validatable){
    let isValid = true;
    if(validatableInput.required) isValid = isValid && validatableInput.value.toString().trim().length > 0;
    if(typeof validatableInput.value === "string") {
        if ((validatableInput.minLength || validatableInput.minLength === 0)) isValid = isValid && validatableInput.value.length >= validatableInput.minLength
        if ((validatableInput.maxLength || validatableInput.maxLength === 0)) isValid = isValid && validatableInput.value.length <= validatableInput.maxLength
    }
    if(typeof validatableInput.value === "number") {
       if ((validatableInput.min || validatableInput.min === 0)) isValid = isValid && validatableInput.value >= validatableInput.min
       if ((validatableInput.max || validatableInput.max === 0)) isValid = isValid && validatableInput.value <= validatableInput.max
   }
    return isValid
}

function  AutoBind(_:any,_2:string,descriptor:PropertyDescriptor){
    const originalMethod = descriptor.value
    const adjDescriptor: PropertyDescriptor = {
        configurable:true,
        get(){
            return originalMethod.bind(this)
        }
    }
    return adjDescriptor
}


class ProjectList{
    templateElement:HTMLTemplateElement;
    hostElement:HTMLDivElement;
    element:HTMLElement;
    assignedProjects:Project[]
    constructor(private type:'active' | 'finished') {
        this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;
        this.assignedProjects = []
        const importedNode = document.importNode(this.templateElement.content,true)
        this.element = importedNode.firstElementChild as HTMLElement;
        this.element.id = `${this.type}-projects`;


        projectsState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter(prj => prj.status === this.type)
            this.assignedProjects = relevantProjects;
            this.renderProjects()
        })

        this.attach()
        this.renderContent()
    }

    private renderProjects(){
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
        listEl.textContent = ''
        for (const priItem of this.assignedProjects){
            const listItem = document.createElement('li');
            listItem.textContent = priItem.title
            listEl.appendChild(listItem)
        }
    }

    private  renderContent(){
        this.element.querySelector('ul')!.id =  `${this.type}-projects-list`;
        this.element.querySelector('h2')!.textContent =  this.type.toUpperCase() + ' PROJECTS';
    }

    private attach(){
        this.hostElement.insertAdjacentElement('beforeend', this.element)
    }


}


class  ProjectInput{
    templateElement:HTMLTemplateElement;
    hostElement:HTMLDivElement;
    element:HTMLFormElement;
    titleInputElement:HTMLInputElement;
    descriptionInputElement:HTMLInputElement;
    peopleInputElement:HTMLInputElement;


    constructor() {
    this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;
    const importedNode = document.importNode(this.templateElement.content,true)
        this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = 'user-input'

        this.titleInputElement = this.element.querySelector('#title')! as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description')! as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people')! as HTMLInputElement;
        this.configure()
        this.attach()

    }


    private gatherUserInput():[string,string,number] | void{
        const enteredTitle = this.titleInputElement.value
        const enteredDescription = this.descriptionInputElement.value
        const enteredPeople = this.peopleInputElement.value

        const titleValidatable:Validatable = {
            value:enteredTitle,
            required:true
        }
        const descriptionValidatable:Validatable ={
            value:enteredDescription,
            required:true,
            minLength:5
        }

        const peopleValidatable:Validatable ={
            value:+enteredPeople,
            required:true,
            min:1,
            max:5
        }
        console.log(validate(titleValidatable),validate(descriptionValidatable),validate(peopleValidatable))
        // if(enteredTitle.trim().length === 0 || enteredDescription.trim().length === 0 || enteredPeople.trim().length === 0) {
        if(!validate(titleValidatable) || !validate(descriptionValidatable) || !validate(peopleValidatable)) {
            return alert('Invalid input, please try again!');
        }

        return [enteredTitle,enteredDescription,+enteredPeople]

    }

    private clearInputs(){
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }

    @AutoBind
    private submitHandler(event: Event) {
        event.preventDefault()
        const  userInput = this.gatherUserInput();
        if(!userInput) return;
        const [title,description,people] = userInput;
        projectsState.addProject(title,description,people);
        this.clearInputs()
    }

    private  configure(){
        this.element.addEventListener('submit',this.submitHandler)
    }

    private  attach(){
        this.hostElement.insertAdjacentElement('afterbegin', this.element)
    }
}

const prjInput = new ProjectInput();
const activePrjList = new ProjectList('active')
const finishedPrjList = new ProjectList('finished')