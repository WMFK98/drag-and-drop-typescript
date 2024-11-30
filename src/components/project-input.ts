/// <reference path="../util/validation.ts" />
/// <reference path="base-component.ts" />
/// <reference path="../decorator/autobind.ts" />
/// <reference path="../state/project-states.ts" />
namespace App{
   export class  ProjectInput extends  Component<HTMLDivElement,HTMLFormElement>{
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


}