## Project Overview

This project is a data analyst trainer application built with **React, TypeScript, and Vite**. It provides interactive challenges for learning Python and SQL. The application runs Python code in the browser using **Pyodide** and SQL queries using **sql.js**.

## Architecture

The project follows a component-based architecture with a clear separation of concerns between the UI and the core logic.

- **`src/pages`**: Contains the main pages of the application, such as `HomePage`, `PythonPage`, and `SqlPage`.
- **`src/components`**: Contains reusable React components like `Navbar`, `PythonRunner`, and `SqlRunner`.
- **`src/challenges`**: Contains the logic for Python and SQL challenges, including the evaluator and validators.
- **`src/engine`**: Contains the core reusable logic extracted from the application UI, such as `sqlValidation.ts`.

## Development Workflow

### Getting Started

1.  Install dependencies: `npm install`
2.  Start the development server: `npm run dev`

### Testing

-   Run unit tests: `npm run test`
-   Watch for changes and run tests: `npm test:watch`

### Validation

The project includes several validation scripts to ensure the quality of the challenges.

-   **Python Challenges**:
    -   `npm run validate:python`: Performs static linting and heuristics on Python challenges.
    -   `npm run validate:python:runtime`: Executes Python challenges in a browser-like environment (using Pyodide).
-   **SQL Challenges**:
    -   `npm run run:sql`: Executes SQL challenges.

## Python Challenges

Python challenges are defined in the `src/challenges` directory and validated using the scripts mentioned above. When authoring new Python challenges, refer to the guidelines in `docs/CHALLENGE_AUTHORING.md`.

## Conventions

-   **Styling**: The project uses CSS modules for styling. Each component has its own CSS file (e.g., `Navbar.css`, `PythonRunner.css`).
-   **State Management**: The project uses React hooks for state management.
-   **Linting**: The project uses ESLint for code quality and consistency.

## External Dependencies

-   **Pyodide**: Used to run Python code in the browser.
-   **sql.js**: Used to execute SQL queries.
-   **Monaco Editor**: Used as the code editor for the challenges.
-   **React Router**: Used for routing within the application.
