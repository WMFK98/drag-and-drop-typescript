/// <reference path="base-component.ts" />
/// <reference path="../decorator/autobind.ts" />
/// <reference path="../state/project-states.ts" />
namespace App{
   export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget{
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
            this.element.addEventListener('dragover',this.dragOverHandler);
            this.element.addEventListener('drop',this.dropHandler);
            this.element.addEventListener('dragleave',this.dragLeaveHandler);
            projectsState.addListener((projects: Project[]) => {
                const relevantProjects = projects.filter(prj => prj.status === this.type)
                this.assignedProjects = relevantProjects;
                this.renderProjects()
            })
        }
        @AutoBind
        dragLeaveHandler(_: DragEvent): void {
            const listEl = this.element.querySelector('ul')!;
            listEl.classList.remove('droppable');
        }

        @AutoBind
        dragOverHandler(event: DragEvent): void {
            if(event.dataTransfer && event.dataTransfer.types[0] === 'text/plain'){
                event.preventDefault()
                const listEl = this.element.querySelector('ul')!;
                listEl.classList.add('droppable');
            }

        }

        @AutoBind
        dropHandler(event: DragEvent): void {
            const prjId = event.dataTransfer!.getData('text/plain');
            projectsState.moveProject(prjId,this.type === 'active' ? ProjectStatus.ACTIVE : ProjectStatus.FINISHED)
            console.log(event.dataTransfer!.getData('text/plain'));
        }


    }

}