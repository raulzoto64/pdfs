import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Home } from "./components/Home";
import { Auth } from "./components/Auth";
import { Templates } from "./components/Templates";
import { Editor } from "./components/Editor";
import { MyDocuments } from "./components/MyDocuments";
import { CommunitySections } from "./components/CommunitySections";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "auth", Component: Auth },
      { path: "templates", Component: Templates },
      { path: "editor/:templateId?", Component: Editor },
      { path: "my-documents", Component: MyDocuments },
      { path: "community", Component: CommunitySections },
    ],
  },
]);
