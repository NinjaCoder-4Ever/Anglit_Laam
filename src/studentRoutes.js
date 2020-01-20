/*!

=========================================================
* Material Dashboard React - v1.8.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/material-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
// @material-ui/icons
import Dashboard from "@material-ui/icons/Dashboard";
import Person from "@material-ui/icons/Person";
import LibraryBooks from "@material-ui/icons/LibraryBooks";
import Notifications from "@material-ui/icons/Notifications";
import Unarchive from "@material-ui/icons/Unarchive";
// core components/views for userSideBar layout
import HomePage from './Views/Student/homePage'
import SetNewLesson from './Views/Student/SetNewLesson'
import MyFeedback from './Views/Student/myFeedback'
import MySubscriptions from './Views/Student/mySubscriptions'
import MyProfile from './Views/Student/myProfile'
import ContactUs from './Views/Student/contactUs'

const dashboardRoutes = [
    {
        path: "/homePage",
        name: "Home Page",
        icon: Dashboard,
        component: HomePage,
        layout: "/Student"
    },
    {
        path: "/setNewLesson",
        name: "Set New Lesson",
        icon: Notifications,
        component: SetNewLesson,
        layout: "/Student"
    },
    {
        path: "/myFeedback",
        name: "My Feedback",
        icon: LibraryBooks,
        component: MyFeedback,
        layout: "/Student"
    },
    {
        path: "/mySubscriptions",
        name: "My Subscriptions",
        icon: "content_paste",
        component: MySubscriptions,
        layout: "/Student"
    },
    {
        path: "/myProfile",
        name: "My Profile",
        icon: Person,
        component: MyProfile,
        layout: "/Student"
    },
    {
        path: "/contactUs",
        name: "Contact Us",
        icon: Unarchive,
        component: ContactUs,
        layout: "/Student"
    }
];

export default dashboardRoutes;
