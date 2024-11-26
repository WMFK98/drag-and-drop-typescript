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
type Listener<T>= (items:T[]) => void;

abstract class State<T>{
    protected listeners:Listener<T>[] = []

    addListener(listenerFn:Listener<T>){
        this.listeners.push(listenerFn)
    }
}


class  ProjectState extends State<Project>{
    private projects:Project[]= []
    private static instance:ProjectState

    private constructor() {
        super()
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

abstract class Component<T extends HTMLElement,U extends HTMLElement>{
    templateElement:HTMLTemplateElement;
    hostElement:T;
    element:U;

    constructor(templateId:string,hostElementId:string,insertAtStart:boolean,newElementId?:string){
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElementId)! as T;
        const importedNode = document.importNode(this.templateElement.content,true)
        this.element = importedNode.firstElementChild as U;
        if(newElementId) {
            this.element.id = newElementId
        }
        this.attach(insertAtStart)
    }

    private attach(insertAtBeginning:boolean){
        this.hostElement.insertAdjacentElement(insertAtBeginning ? 'afterbegin': 'beforeend', this.element)
    }

    abstract  configure?():void
    abstract  renderContent():void;
}

class ProjectItem extends Component<HTMLUListElement, HTMLElement> {


    private project:Project

    constructor(hostId:string,project:Project) {
        super('single-project',hostId,false,project.id);
        this.project=project;
        this.configure()
        this.renderContent()
    }

    configure() {
    }

    renderContent() {
        this.element.querySelector('h2')!.textContent = this.project.title;
        this.element.querySelector('h3')!.textContent = this.project.people.toString();
        this.element.querySelector('p')!.textContent = this.project.description
    }

    //  renderItems(listElId:string){
    //     const listEl = document.getElementById(listElId)! as HTMLUListElement;
    //     listEl.textContent = ''
    //     for (const priItem of this.assignedProjects){
    //         const listItem = document.createElement('li');
    //         listItem.textContent = priItem.title
    //         listEl.appendChild(listItem)
    //     }
    // }
}

class ProjectList extends Component<HTMLDivElement, HTMLElement>{
    assignedProjects:Project[];

    constructor(private type:'active' | 'finished') {
        super('project-list','app',false,`${type}-projects`)
        this.assignedProjects = []
        this.configure()
        this.renderContent()
    }

    private renderProjects(){
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
        listEl.textContent = ''
        for (const priItem of this.assignedProjects){
            new ProjectItem(this.element.querySelector('ul')!.id,priItem)
        }
    }

    renderContent(){
        this.element.querySelector('ul')!.id =  `${this.type}-projects-list`;
        this.element.querySelector('h2')!.textContent =  this.type.toUpperCase() + ' PROJECTS';
    }


    configure() {
        projectsState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter(prj => prj.status === this.type)
            this.assignedProjects = relevantProjects;
            this.renderProjects()
        })
    }


}


class  ProjectInput extends  Component<HTMLDivElement,HTMLFormElement>{
    titleInputElement:HTMLInputElement;
    descriptionInputElement:HTMLInputElement;
    peopleInputElement:HTMLInputElement;


    constructor() {
        super('project-input','app',true,'user-input')
        this.titleInputElement = this.element.querySelector('#title')! as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description')! as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people')! as HTMLInputElement;
        this.configure()
        this.renderContent()
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

    configure(){
        this.element.addEventListener('submit',this.submitHandler)
    }


    renderContent(): void {
        this.hostElement.insertAdjacentElement('afterbegin', this.element)
    }
}

 new ProjectInput();
 new ProjectList('active')
 new ProjectList('finished')