/// <reference path="base-components.ts"/>
/// <reference path="../decorator/autobind.ts"/>
/// <reference path="../utills/validation.ts"/>
/// <reference path="../state/project-state.ts"/>

namespace App {
  export class ProjectInput extends Component<HTMLDivElement, HTMLElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
      super("project-input", "app", true, "user-input");
      this.titleInputElement = <HTMLInputElement>(
        this.element.querySelector("#title")!
      );
      this.descriptionInputElement = <HTMLInputElement>(
        this.element.querySelector("#description")!
      );
      this.peopleInputElement = <HTMLInputElement>(
        this.element.querySelector("#people")!
      );
      this.configure();
    }

    configure() {
      this.element.addEventListener("submit", this.submitHandler);
    }
    private clearInput(): void {
      this.titleInputElement.value = "";
      this.descriptionInputElement.value = "";
      this.peopleInputElement.value = "";
    }
    private getUserInput(): [string, string, number] | void {
      const title = this.titleInputElement.value;

      const description = this.descriptionInputElement.value;

      const people = +this.peopleInputElement.value;

      // 1) Normal method of validator
      const titleValue: Validator = {
        value: title,
        required: true,
      };
      const descriptionValue: Validator = {
        value: description,
        required: true,
        minLength: 6,
      };
      const peopleValue: Validator = {
        value: people,
        min: 0,
      };
      if (
        !validate(titleValue) ||
        !validate(descriptionValue) ||
        !validate(peopleValue)
      ) {
        alert("Invalid Input");
        return;
      } else {
        return [title, description, people];
      }
      // return [title, description, people];
    }

    @AutoBind
    private submitHandler(event: Event) {
      event.preventDefault();
      const userData = this.getUserInput();
      if (Array.isArray(userData)) {
        const [title, description, people] = userData;
        projectState.addProject(title, description, people);
        this.clearInput();
      }
    }

    renderContent() {}
  }
}
