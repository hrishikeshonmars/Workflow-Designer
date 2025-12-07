# Workflow Designer

A simple drag-and-drop workflow builder built with React, TypeScript, and React Flow.
Users can create workflows using different node types, edit their properties, and simulate the workflow.

## Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Run the development server:**
    ```bash
    npm run dev
    ```

## Architecture & Design Decisions

### Tech Stack
*   **React 18**: Core UI library.
*   **React Flow**: Chosen for its robust graph state management, customizable handles, and drag-and-drop features suited for workflow editors.
*   **TypeScript**: Ensures type safety across Node Data structures and API interfaces.
*   **Tailwind CSS**: Used for rapid, consistent styling following a clean, "Linear-like" aesthetic.
*   **Lucide React**: Lightweight icon library.


## Features Implemented
*   **Drag-and-Drop Canvas**: Add nodes from the sidebar.
*   **Custom Node Types**: Start, Task, Approval, Automated (with mock API loading), End.
*   **Contextual Configuration**: Clicking a node opens a specific form based on its type.
*   **Dynamic Custom Fields**: Key-Value editors for Start Node Metadata and Task Node Custom Fields.
*   **Mock Simulation**: "Test Workflow" button validates the graph and shows a step-by-step log.
*   **JSON Export**: Ability to download the current graph structure.
*   **Node Management**: Ability to delete nodes via UI or keyboard.


