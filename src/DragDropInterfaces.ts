namespace App {
  export interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
  }

  export interface DragTarget {
    dragOverHandler(event: DragEvent): void;
    drogHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
  }
}
