import { Fragment } from 'react'
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import routes from './routes';

const RoutesList = () => {

    const router = createBrowserRouter(routes);

    return (
        <Fragment>
            <RouterProvider router={router} />
        </Fragment>
    )
}

export default RoutesList