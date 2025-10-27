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
import OrganizationDashboard from "../pages/dashboard/OrganizationDashboard";
import EventCreation from "../pages/dashboard/Organization/EventCreation";
import OrganizationProfile from "../pages/dashboard/Organization/OrganizationProfile";

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
            path:'dashboard' , element: <OrganizationDashboard/>
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
  {
    path: 'dashboard',
    element: <Dashboard/>,
    children: [
        {
            index: true, element: <div>Organization</div>
        },
        {
            path:'create-event' , element: <EventCreation/>
        },
        {
            path: 'profile', element: <OrganizationProfile/>
        }
    ]
  }
]);