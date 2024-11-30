namespace App{
    //Project State Management
    type Listener<T>= (items:T[]) => void;

    abstract class State<T>{
        protected listeners:Listener<T>[] = []

        addListener(listenerFn:Listener<T>){
            this.listeners.push(listenerFn)
        }
    }


    export class  ProjectState extends State<Project>{
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


        moveProject(projectId:string,newStatus:ProjectStatus){
            const project = this.projects.find(prj => prj.id === projectId)
            if(project && project.status !== newStatus){
                project.status = newStatus
                this.updateListenners()
            }
        }

        private updateListenners(){
            for (const  listenerFn of this.listeners) listenerFn(this.projects.slice())
        }

    }

   export const projectsState = ProjectState.getInstance();
}