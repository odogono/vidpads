## VO Pads - Architectural Overview

This document provides an overview of the VO Pads application architecture. VO Pads is a single-page web application designed for video playback, editing, and sequencing, primarily using in-browser technologies.  It uses a component-based structure, leveraging React, Next.js, and XState for state management. The application emphasizes client-side processing with optional data persistence using IndexedDB.

### 1. Core Technologies

*   **Frontend Framework:** React (with Next.js). Next.js is used for routing (although currently single-page), serverless functions (primarily for Open Graph metadata generation), and potentially for server-side rendering (SSR) or static site generation (SSG) benefits in the future.
*   **State Management:** XState.  XState provides a robust, finite state machine-based approach to managing complex application and UI state. This allows for predictable state transitions and easier debugging.
*   **UI Components:** HeroUI. A React component library is used for pre-built, accessible UI elements. This facilitates rapid development and ensures a consistent look and feel.
*   **Styling:** Tailwind CSS. A utility-first CSS framework is used, enabling rapid styling with pre-defined classes. `tailwind-merge` is used to intelligently merge Tailwind classes, avoiding conflicts. `clsx` (and `classnames`) are used for conditional class application.
*   **Data Persistence:** IndexedDB.  A browser-based database is used for storing project data, allowing users to save and load their work locally. The application avoids the need for a traditional backend server.
*   **Asynchronous Operations:** React Query (TanStack Query). Used to manage asynchronous data fetching (like fetching video metadata) and caching.
*   **Build Tool:** Bun (primary), Node.js (Dockerfile fallback). Bun is a fast JavaScript runtime and bundler.  The Dockerfile provides a Node.js-based build for environments where Bun is not available.
*   **Package Manager:** pnpm. This is used for dependency management.
*   **Linting/Formatting:** ESLint with Next.js, Prettier, and various plugins (eslint-plugin-react-hooks, eslint-plugin-prefer-arrow-functions, etc).
*   **Type Checking:** TypeScript.  TypeScript is used throughout the application for static typing.
* **Internationalization**: `@lingui/macro`, `@lingui/cli`, `@lingui/swc-plugin` used for message localization and generation.
* **Testing:** Jest + @testing-library/react

### 2. Application Structure

The application is structured into the following key directories:

*   **`/src/app`**: This directory contains the core application logic, leveraging Next.js's app router. It contains the root layout (`layout.tsx`) and page components.
*   **`/src/components`**: Reusable React components. This includes UI elements (buttons, sliders, modals), custom components for video playback (Player), and layout-related components.  These are organized into subfolders for clarity.
*   **`/src/helpers`**: Utility functions for common tasks, such as:
    *   `clipboard.ts`: Clipboard interaction (copy/paste).
    *   `datetime.ts`: Date and time formatting/conversion.
    *   `log.ts`: A custom logging utility.
    *   `number.ts`: Number manipulation/formatting.
    *   `tailwind.ts`: Tailwind CSS-related helpers (like `cn` for merging class names).
    *   `url.ts`: URL manipulation, including handling custom URL schemes (e.g., `odgn-vo://`).
    *   `youtube.ts`:  Functions to interact with YouTube (e.g., extract video ID, fetch metadata).
    * `image.ts`: Functions for handling image operations (resize, create thumbnails).
    * `file.ts`: Functions for handling files and generating file identifiers.
*   **`/src/hooks`**: Custom React hooks for managing state, side effects, and complex logic. This promotes reusability and separation of concerns. Key hooks include:
    *   `useEvents`:  A custom event system using `mitt`.
    *   `useKeyboard`:  Handles keyboard shortcuts and input.
    *   `useMidi`:  Integrates with MIDI devices (if available).
    *   `useProject`:  Manages the current project state and interactions.
    *   `useSettings`:  Manages application settings, including persistence to IndexedDB.
    *   `useStepSequencer`: Logic for the step sequencer component.
    *   `useTimeSequencer`: Logic for the time sequencer.
    *   `usePadDnD`:  Handles drag-and-drop functionality for pads.
    *   `useFullScreen`: Manages fullscreen state.
*   **`/src/model`**:  This directory houses the application's data models and related logic:
    *   `constants.ts`: Application-wide constants.
    *   `db`: Contains IndexedDB interaction logic (CRUD operations).
        * `api.ts`: Functions for interacting with the IndexedDB database (get, set, delete, etc.).
        * `worker.ts`: (Empty) Likely intended for offloading IndexedDB operations to a Web Worker.
    *   `helpers.ts`: Utility functions related to the model.
    *   `pad.ts`: Functions for managing individual "pads" (video players).
    *   `sequencerEvent.ts`: Functions for managing sequencer events (timing and playback of pads).
    *   `serialise`: Functions for serializing/deserializing project data to/from JSON and URL strings.
    *   `store`: XState state machine logic for managing the application's core state.
        *   `actions`: XState actions (functions that trigger state transitions).
        *   `store.ts`: Defines the XState state machine.
        *   `types.ts`: TypeScript types related to the state machine.
    *   `types.ts`: General TypeScript type definitions.
*   **`/public`**: Static assets, including favicon, images, and `robots.txt`.
*   **`/
