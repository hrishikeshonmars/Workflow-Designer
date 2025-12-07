# HR Workflow Designer Prototype

This is a functional prototype of a React-based HR Workflow Designer built for the Tredence Inc fullstack developer assignment.

## 🚀 Quick Start

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Run the development server:**
    ```bash
    npm run dev
    ```
3.  **Build for production:**
    ```bash
    npm run build
    ```

## 🏗 Architecture & Design Decisions

### Tech Stack
*   **React 18**: Core UI library.
*   **React Flow**: Chosen for its robust graph state management, customizable handles, and drag-and-drop features suited for workflow editors.
*   **TypeScript**: Ensures type safety across Node Data structures and API interfaces.
*   **Tailwind CSS**: Used for rapid, consistent styling following a clean, "Linear-like" aesthetic.
*   **Lucide React**: Lightweight icon library.

### Key Architectural Patterns
1.  **Feature-Based Folder Structure**: Logic is grouped by feature (`nodes`, `services`, `components`) to maintain modularity.
2.  **Separation of Concerns**:
    *   `WorkflowBuilder.tsx`: Manages the overall application state (Nodes, Edges, Selection).
    *   `PropertiesPanel.tsx`: Handles form state and updates the active node independently.
    *   `mockApi.ts`: Abstrates async logic, allowing easy replacement with a real backend later.
3.  **Custom Nodes**: Built using React `memo` to prevent unnecessary re-renders during canvas interactions.

### Assumptions
*   Authentication is out of scope.
*   The "Simulation" is a simplified Breadth-First-Search traversal mock to demonstrate state handling, rather than a full backend execution engine.
*   Basic validation checks if Start and End nodes exist.

## ✅ Features Implemented
*   **Drag-and-Drop Canvas**: Add nodes from the sidebar.
*   **Custom Node Types**: Start, Task, Approval, Automated (with mock API loading), End.
*   **Contextual Configuration**: Clicking a node opens a specific form based on its type.
*   **Dynamic Custom Fields**: Key-Value editors for Start Node Metadata and Task Node Custom Fields.
*   **Mock Simulation**: "Test Workflow" button validates the graph and shows a step-by-step log.
*   **JSON Export**: Ability to download the current graph structure.
*   **Node Management**: Ability to delete nodes via UI or keyboard.

## 🔮 Future Improvements (With more time)
*   **Edge Validation**: Prevent cycles or invalid connections (e.g., End node connecting to Start).
*   **Undo/Redo History**: Using `zundo` or similar middleware.
*   **Dynamic Handles**: Allow nodes to have variable inputs/outputs based on configuration.
