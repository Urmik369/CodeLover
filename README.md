# CodeLover

![CodeLover Screenshot](https://picsum.photos/seed/codelover/1200/800)

This is a Next.js starter project for an online code editor with AI-powered assistance.

## ✅ Features

*   **Multi-language support:** Write and run code in JavaScript, Python, C++, Java, and C.
*   **Clean, intuitive UI:** A modern, dark-themed interface built with ShadCN UI and Tailwind CSS.
*   **Simulated Code Execution:** A mock code execution environment for quick testing and demonstration.
*   **Shareable Links:** (Mocked) A feature to generate a shareable link for your code.
*   **Save Functionality:** (Mocked) A button to simulate saving your code.

## ✅ Prerequisites

*   Node.js (v18 or higher recommended)
*   npm or yarn

## ✅ Installation Steps

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd <your-repository-name>
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## ✅ Quick Start Commands

*   `npm run dev`: Starts the development server.
*   `npm run build`: Builds the application for production.
*   `npm run start`: Starts a production server.
*   `npm run lint`: Lints the codebase.

## ✅ Project Structure

```
.
├── src
│   ├── app
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Main page component
│   ├── components
│   │   ├── code-collab     # Components specific to the code editor
│   │   └── ui              # Reusable UI components from ShadCN
│   ├── lib
│   │   └── utils.ts        # Utility functions
│   └── hooks
│       └── use-toast.ts    # Toast notification hook
├── public                  # Static assets
├── tailwind.config.ts      # Tailwind CSS configuration
└── next.config.ts          # Next.js configuration
```

## ✅ VS Code Tasks

This project is set up to be used with Firebase Studio, which provides a seamless development experience. No special VS Code tasks are required to get started. Just open the project and start coding!

## ✅ Troubleshooting

*   **Hydration Errors:** If you encounter hydration errors, ensure that any code using browser-specific APIs (like `window` or `Math.random()`) is placed inside a `useEffect` hook.
*   **Build Failures:** Ensure you have the correct Node.js version installed and that all dependencies are properly installed by running `npm install`.
*   **Styling Issues:** If styles are not applying correctly, check `tailwind.config.ts` and `src/app/globals.css` for any configuration errors.
