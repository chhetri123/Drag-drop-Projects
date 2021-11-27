// project type and

enum ProjectStatus {
  Active,
  Finished,
}
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}
// project state manage ment classss
type Listener = (items: Project[]) => void;
class ProjectState {
  private listeners: Listener[] = [];
  private projects: Project[] = [];
  private static instance: ProjectState;
  private constructor() {}

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }
  addProject(title: string, description: string, people: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      people,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    for (const listner of this.listeners) {
      listner(this.projects.slice());
    }
  }
  addListener(listenerFn: Listener) {
    this.listeners.push(listenerFn);
  }
}
const projectState = ProjectState.getInstance();

// validation logic

//  *********1) Normal method
interface Validator {
  value: number | string;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  max?: number;
  min?: number;
}

function validate(inputValue: Validator): boolean {
  let isValid = true;

  if (inputValue.required) {
    isValid = isValid && inputValue.value.toString().trim().length !== 0;
  }

  if (inputValue.maxLength && typeof inputValue.value === "string") {
    isValid = isValid && inputValue.value.length < inputValue.maxLength;
  }
  if (inputValue.minLength && typeof inputValue.value === "string") {
    isValid = isValid && inputValue.value.length > inputValue.minLength;
  }
  if (inputValue.min != null && typeof inputValue.value === "number") {
    isValid = isValid && inputValue.value > inputValue.min;
  }
  if (inputValue.max != null && typeof inputValue.value === "number") {
    isValid = isValid && inputValue.value < inputValue.max;
  }

  return isValid;
}
//  ****** Reusable method
// interface validation {
//   [propertyName: string]: {
//     [propertyName: string]: string[];
//   };
// }
// const regestratedValidator: validation = {};

// function Required(target: any, propName: string) {
//   regestratedValidator[target.constructor.name] = {
//     ...regestratedValidator[target.constructor.name],
//     [propName]: ["required"],
//   };
// }

// function Positve(target: any, propName: string) {
//   regestratedValidator[target.constructor.name] = {
//     ...regestratedValidator[target.constructor.name],
//     [propName]: ["positive"],
//   };
// }

// function validate(obj: any) {
//   console.log(obj);
//   const objValidator = regestratedValidator[obj.constructor.name];
//   if (!objValidator) {
//     return true;
//   }
//   let isValid = true;
//   for (const propName in objValidator) {
//     for (const validator of objValidator[propName]) {
//       switch (validator) {
//         case "required":
//           isValid = isValid && !!obj[propName];
//           break;
//         case "positive":
//           isValid = isValid && obj[propName] > 0;
//           break;
//       }
//     }
//   }
//   return isValid;
// }

// Decorator

function AutoBind(_: any, _2: string | Symbol, descriptor: PropertyDescriptor) {
  const objDescripter: PropertyDescriptor = {
    configurable: true,
    enumerable: false,
    get() {
      return descriptor.value.bind(this);
    },
  };
  return objDescripter;
}

// Project list class

class ProjectList {
  templateEl: HTMLTemplateElement;
  hostEl: HTMLDivElement;
  element: HTMLElement;
  assignedProject: any[];
  constructor(private type: "active" | "finished") {
    this.templateEl = document.getElementById(
      "project-list"
    )! as HTMLTemplateElement;
    this.hostEl = document.getElementById("app")! as HTMLDivElement;
    const importedNode = document.importNode(this.templateEl.content, true);
    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;
    this.assignedProject = [];

    projectState.addListener((projects: Project[]) => {
      const relevantProject = projects.filter((prj) => {
        if (this.type === "active") {
          return prj.status === ProjectStatus.Active;
        }
        return prj.status === ProjectStatus.Finished;
      });
      this.assignedProject = relevantProject;
      this.renderProject();
    });
    this.attach();
    this.renderContent();
  }
  private renderProject() {
    const listEl = document.getElementById(
      `${this.type}-project-list`
    ) as HTMLUListElement;
    listEl.innerHTML = "";
    for (const prjItem of this.assignedProject) {
      const listItem = document.createElement("li");
      listItem.textContent = prjItem.title;
      listEl.appendChild(listItem);
    }
  }

  private attach() {
    this.hostEl.insertAdjacentElement("beforeend", this.element);
  }
  private renderContent() {
    const listId = `${this.type}-project-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  }
}

// project items
class ProjectInput {
  templateEl: HTMLTemplateElement;
  hostEl: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateEl = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement;
    this.hostEl = document.getElementById("app")! as HTMLDivElement;
    const importedNode = document.importNode(this.templateEl.content, true);
    this.element = importedNode.firstElementChild as HTMLFormElement;
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

    this.attach();
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
      min: 1,
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

  private configure() {
    this.element.addEventListener("submit", this.submitHandler.bind(this));
  }
  private attach() {
    this.hostEl.insertAdjacentElement("afterbegin", this.element);
  }
}

const prjInput = new ProjectInput();
const prjList = new ProjectList("active");
const prjList2 = new ProjectList("finished");
