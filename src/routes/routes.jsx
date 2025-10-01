import { lazy } from "react";

const Home = lazy(() => import('../pages/Home'));

const routes = [
  {
    path: '/',
    element: <Home />,
  },
]

export default routes;