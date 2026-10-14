# Archimind — AI-Powered UML Diagram Generator

**Transform natural-language descriptions into UML diagrams with the assistance of AI.**

Archimind is a web application designed to simplify software modeling by allowing users to describe a system in natural language and generate UML diagrams from their descriptions. It combines AI-assisted Mermaid code generation with interactive diagram visualization and editing tools.

## Project Overview

Creating UML diagrams manually can be time-consuming, particularly during software analysis and design. Archimind aims to simplify this process by helping students, developers, software engineers, and educators transform textual requirements into visual software models.

The platform provides a centralized workspace for creating projects, generating diagrams, editing Mermaid code, viewing diagram previews, and exporting results.

## Screenshots

### Application Interface

<img width="1754" height="897" alt="Capture d&#39;écran 2026-05-11 142053" src="https://github.com/user-attachments/assets/1458d948-ac20-4528-92b0-07bf0dcb8eb6" />

<img width="1713" height="892" alt="Capture d&#39;écran 2026-05-11 142108" src="https://github.com/user-attachments/assets/bbe662f2-ea7c-4b3b-8117-b92adeb413e0" />



### UML Diagram Editor

<img width="1850" height="913" alt="Capture d&#39;écran 2026-05-19 183615" src="https://github.com/user-attachments/assets/fe9b42dc-e616-4074-965d-b3383fae1c13" />


### Generated UML Diagram

<img width="1750" height="912" alt="Capture d&#39;écran 2026-05-19 183548" src="https://github.com/user-attachments/assets/94487fb6-a7d4-4059-b310-2afcf2202da8" />

### Export Diagram

<img width="1830" height="907" alt="Capture d&#39;écran 2026-05-19 183638" src="https://github.com/user-attachments/assets/af15dab7-7d2e-4efd-a16d-0611a3caadb5" />


## Key Features

- **AI-assisted UML generation:** Transform natural-language descriptions into Mermaid diagram code through the integrated AI service.
- **Diagram visualization:** Render generated Mermaid code as visual diagrams.
- **Interactive editing:** Modify Mermaid code and preview the resulting diagram.
- **Project management:** Organize and manage modeling projects.
- **Diagram history:** Access previously generated diagrams and conversations, according to the implemented features.
- **Export functionality:** Export diagrams in the formats supported by the application.
- **Authentication:** Provide user registration and login.
- **Administration:** Manage user accounts through a dedicated administrator interface.

## Technologies

### Frontend
- Next.js
- React
- JavaScript
- CSS
- Mermaid.js

### Backend
- NestJS
- Node.js
- REST API

### AI and Diagram Generation
- AI service / language model for generating Mermaid code from natural-language prompts.
- Mermaid.js for parsing and rendering supported diagram syntax.

### Data Layer
- The database and persistence technologies configured by the backend.

## Architecture

Archimind follows a modular client-server architecture.

1. **Frontend — Next.js:** Provides the user interface, editor, project dashboard, and administration interface.
2. **Backend — NestJS:** Handles API requests, application logic, authentication, and communication with the data layer and AI service.
3. **AI service:** Interprets the user's textual description and produces Mermaid-compatible diagram code.
4. **Mermaid.js:** Converts the generated code into a visual diagram in the application.

```text
User
  |
  v
Next.js Frontend
  |
  | REST API
  v
NestJS Backend
  |
  +------> AI Service
  |            |
  |            v
  |       Mermaid Code
  |
  +------> Database
  |
  v
Frontend receives diagram code
  |
  v
Mermaid.js renders the diagram
```



## Project Structure

```text
src/
├── app/          # Pages and application routes
├── components/   # Reusable UI components
├── context/      # Shared application state
├── hooks/        # Reusable React hooks
├── lib/          # API utilities and application logic
└── types/        # Application data types
```

## Project Objectives

- Simplify the creation of UML diagrams from textual requirements.
- Reduce the effort required for initial software modeling.
- Provide an interactive environment for reviewing and editing generated diagrams.
- Combine AI-assisted code generation with Mermaid-based visualization.
- Centralize project and diagram management in a web application.

## Future Improvements

- Support additional UML diagram types.
- Improve diagram validation and error recovery.
- Enhance collaborative modeling features.
- Expand export and diagram customization options.
- Improve application deployment, monitoring, and scalability.

## Academic Project

Archimind is developed as part of a final-year project for a Bachelor's degree in Computer Science at the Institut Supérieur d'Informatique et des Technologies de Communication de Hammam Sousse, Tunisia.

---

**Archimind — From natural language to visual software models.**
