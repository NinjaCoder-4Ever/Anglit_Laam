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
import LibraryBooks from "@material-ui/icons/LibraryBooks";
import People from "@material-ui/icons/PeopleAlt";
import Help from "@material-ui/icons/Help";
// core components/views for userSideBar layout
import HomePage from './Views/Teacher/homePage'
import FeedbackToFill from './Views/Teacher/feedbackToFill'
import MyStudents from './Views/Teacher/myStudents'
import ContactUs from './Views/Teacher/contactUs';

const dashboardRoutes = [
    {
        path: "/homePage",
        name: "Home Page",
        icon: Dashboard,
        component: HomePage,
        layout: "/Teacher"
    },
    {
        path: "/feedbackToFill",
        name: "Feedback To Fill",
        icon: LibraryBooks,
        component: FeedbackToFill,
        layout: "/Teacher"
    },
    {
        path: "/myStudents",
        name: "My Students",
        icon: People,
        component: MyStudents,
        layout: "/Teacher"
    },
    {
        path: "/contactUs",
        name: "Contact Us",
        icon: Help,
        component: ContactUs,
        layout: "/Teacher"
    }
];

export default dashboardRoutes;
