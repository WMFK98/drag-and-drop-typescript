/// <reference path="base-component.ts" />
/// <reference path="../decorator/autobind.ts" />
/// <reference path="../state/project-states.ts" />
namespace App {
   export class ProjectItem extends Component<HTMLUListElement, HTMLElement> implements Draggable{

        get persons(){
            if(this.project.people === 1){
                return '1 person'
            }else{
                return   `${this.project.people} persons`
            }

        }

        private project:Project

        constructor(hostId:string,project:Project) {
            super('single-project',hostId,false,project.id);
            this.project=project;
            this.configure()
            this.renderContent()
        }

        @AutoBind
        configure() {
            this.element.addEventListener('dragstart',this.dragStartHandler);
            this.element.addEventListener('dragend',this.dragEndHandler);
        }

        renderContent() {
            this.element.querySelector('h2')!.textContent = this.project.title;
            this.element.querySelector('h3')!.textContent =  `${this.persons}  assigned.`
            this.element.querySelector('p')!.textContent = this.project.description
        }
        @AutoBind
        dragEndHandler(_: DragEvent): void {
            console.log('DragEnd')
        }
        @AutoBind
        dragStartHandler(event: DragEvent): void {

            event.dataTransfer!.setData('text/plain',this.project.id)
            event.dataTransfer!.effectAllowed = 'move'
        }

    }
}