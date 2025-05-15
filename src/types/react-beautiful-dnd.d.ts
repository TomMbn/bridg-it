declare module 'react-beautiful-dnd' {
  import * as React from 'react';

  export type DraggableId = string;
  export type DroppableId = string;
  export type DragStart = {
    draggableId: DraggableId;
    type: string;
    source: {
      droppableId: DroppableId;
      index: number;
    };
  };

  export type DropResult = {
    draggableId: DraggableId;
    type: string;
    source: {
      droppableId: DroppableId;
      index: number;
    };
    destination: {
      droppableId: DroppableId;
      index: number;
    } | null;
    reason: 'DROP' | 'CANCEL';
  };

  export type DraggableProps = {
    draggableId: string;
    index: number;
    children: (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => React.ReactNode;
  };

  export type DroppableProps = {
    droppableId: string;
    children: (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => React.ReactNode;
  };

  export type DraggableProvided = {
    innerRef: (element: HTMLElement | null) => void;
    draggableProps: {
      'data-rbd-draggable-context-id': string;
      'data-rbd-draggable-id': string;
      style?: React.CSSProperties;
    };
    dragHandleProps: {
      'data-rbd-drag-handle-draggable-id': string;
      'data-rbd-drag-handle-context-id': string;
      'aria-labelledby': string;
      tabIndex: number;
      draggable: boolean;
      onDragStart: (event: React.DragEvent<HTMLElement>) => void;
    } | null;
  };

  export type DroppableProvided = {
    innerRef: (element: HTMLElement | null) => void;
    droppableProps: {
      'data-rbd-droppable-context-id': string;
      'data-rbd-droppable-id': string;
    };
    placeholder?: React.ReactNode;
  };

  export type DraggableStateSnapshot = {
    isDragging: boolean;
    isDropAnimating: boolean;
    draggingOver: DroppableId | null;
    dropAnimation: {
      curve: string;
      duration: number;
    } | null;
  };

  export type DroppableStateSnapshot = {
    isDraggingOver: boolean;
    draggingOverWith: DraggableId | null;
    draggingFromThisWith: DraggableId | null;
    isUsingPlaceholder: boolean;
  };

  export const DragDropContext: React.ComponentType<{
    onDragEnd: (result: DropResult) => void;
    onDragStart?: (initial: DragStart) => void;
    children?: React.ReactNode;
  }>;

  export const Droppable: React.ComponentType<DroppableProps>;
  export const Draggable: React.ComponentType<DraggableProps>;
} 