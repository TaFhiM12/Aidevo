import { createBrowserRouter } from "react-router";
import RootLayout from "../root/RootLayout";
import Home from "../pages/public/Home";
import Dashboard from "../pages/public/Dashboard";
import Blog from "../pages/public/Blog";
import Organization from "../pages/public/Organization";
import About from "../pages/public/About";
import Error from "../components/common/Error";
import Login from '../pages/auth/SignIn';
import SignUp from "../pages/auth/SignUp";
import SignIn from "../pages/auth/SignIn";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout/>,
    errorElement: <Error/>,
    children:[
        {
            index: true, element: <Home/>
        },
        {
            path:'dashboard' , element: <Dashboard/>
        },
        {
            path: 'events' , element: <Blog/>
        },
        {
            path: 'organization' , element: <Organization/>
        },
        {
            path: 'about' , element: <About/>
        },
        {
            path: 'signin', element: <SignIn/>
        },
        {
            path: 'signup', element: <SignUp/>
        }
    ]
  },
]);