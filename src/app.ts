/// <reference path="DragDropInterfaces.ts" />
/// <reference path="project-model.ts" />
// Drag & Drop events
// project type and
namespace App {
  // project state management c
  type Listener<T> = (items: T[]) => void;

  // state class
  class State<T> {
    protected listeners: Listener<T>[] = [];
    addListener(listenerFn: Listener<T>) {
      this.listeners.push(listenerFn);
    }
  }
  class ProjectState extends State<Project> {
    private projects: Project[] = [];
    private static instance: ProjectState;
    private constructor() {
      super();
    }

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
      this.updateListeners();
    }
    moveProject(projectId: string, newStatus: ProjectStatus) {
      const project = this.projects.find((prj) => prj.id === projectId);
      if (project && project.status !== newStatus) {
        project.status = newStatus;
        this.updateListeners();
      }
    }

    private updateListeners() {
      for (const listner of this.listeners) {
        listner(this.projects.slice());
      }
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

  function AutoBind(
    _: any,
    _2: string | Symbol,
    descriptor: PropertyDescriptor
  ) {
    const objDescripter: PropertyDescriptor = {
      configurable: true,
      enumerable: false,
      get() {
        return descriptor.value.bind(this);
      },
    };
    return objDescripter;
  }

  // component base class
  abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateEl: HTMLTemplateElement;
    hostEl: T;
    element: U;

    constructor(
      templateId: string,
      hostElementId: string,
      insertAtStart: boolean,
      newElementId?: string
    ) {
      this.templateEl = document.getElementById(
        templateId
      )! as HTMLTemplateElement;
      this.hostEl = document.getElementById(hostElementId)! as T;
      const importedNode = document.importNode(this.templateEl.content, true);
      this.element = importedNode.firstElementChild as U;
      if (newElementId) {
        this.element.id = newElementId;
      }
      this.attach(insertAtStart);
    }
    private attach(insertAtBegin: boolean) {
      this.hostEl.insertAdjacentElement(
        insertAtBegin ? "afterbegin" : "beforeend",
        this.element
      );
    }

    abstract configure(): void;
    abstract renderContent?(): void;
  }

  // projetc item class methods
  class ProjectItem
    extends Component<HTMLUListElement, HTMLLIElement>
    implements Draggable
  {
    private project: Project;
    get persons() {
      if (this.project.people === 1) {
        return `1 person`;
      } else {
        return `${this.project.people} persons`;
      }
    }
    constructor(hostId: string, project: Project) {
      super("single-project", hostId, false, project.id);

      this.project = project;
      this.configure();
      this.renderContent();
    }
    @AutoBind
    dragStartHandler(event: DragEvent) {
      event.dataTransfer!.setData("text/plain", this.project.id);
      event.dataTransfer!.effectAllowed = "move";
    }
    dragEndHandler(_: DragEvent) {
      // console.log("dragEnd");
    }
    configure() {
      this.element.addEventListener("dragstart", this.dragStartHandler);
      this.element.addEventListener("dragend", this.dragEndHandler);
    }
    renderContent() {
      this.element.querySelector("h2")!.textContent = this.project.title;
      this.element.querySelector("h3")!.textContent =
        this.persons + " assigned";
      this.element.querySelector("p")!.textContent = this.project.description;
    }
  }
  // Project list class

  class ProjectList
    extends Component<HTMLDivElement, HTMLElement>
    implements DragTarget
  {
    assignedProject: Project[];
    constructor(private type: "active" | "finished") {
      super("project-list", "app", false, `${type}-projects`);
      this.assignedProject = [];
      this.configure();

      this.renderContent();
    }
    @AutoBind
    dragOverHandler(event: DragEvent) {
      if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
        event.preventDefault();
        const listEl = this.element.querySelector("ul")!;
        listEl.classList.add("droppable");
      }
    }
    @AutoBind
    drogHandler(event: DragEvent) {
      const prjId = event.dataTransfer!.getData("text/plain");
      projectState.moveProject(
        prjId,
        this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
      );
    }
    @AutoBind
    dragLeaveHandler(_: DragEvent) {
      const listEl = this.element.querySelector("ul")!;
      listEl.classList.remove("droppable");
    }

    configure() {
      this.element.addEventListener("dragover", this.dragOverHandler);
      this.element.addEventListener("dragleave", this.dragLeaveHandler);
      this.element.addEventListener("drop", this.drogHandler);
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
    }

    // rendering project
    private renderProject() {
      const listEl = document.getElementById(
        `${this.type}-project-list`
      ) as HTMLUListElement;
      listEl.innerHTML = "";
      for (const prjItem of this.assignedProject) {
        new ProjectItem(this.element.querySelector("ul")!.id, prjItem);
      }
    }

    // rendering content
    renderContent() {
      const listId = `${this.type}-project-list`;
      this.element.querySelector("ul")!.id = listId;
      this.element.querySelector("h2")!.textContent =
        this.type.toUpperCase() + " PROJECTS";
    }
  }

  // project items
  class ProjectInput extends Component<HTMLDivElement, HTMLElement> {
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
  new ProjectInput();
  new ProjectList("active");
  new ProjectList("finished");
}
