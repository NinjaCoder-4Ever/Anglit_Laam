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
import BubbleChart from "@material-ui/icons/BubbleChart";
import Notifications from "@material-ui/icons/Notifications";
import Unarchive from "@material-ui/icons/Unarchive";
// core components/views for userSideBar layout
import HomePage from './Views/Teacher/homePage'
import MyFeedbacks from './Views/Teacher/myFeedbacks'
import MySchedule from './Views/Teacher/mySchedule'
import MyStudents from './Views/Teacher/myStudents'
import ContactUs from './Views/Teacher/contactUs'

const dashboardRoutes = [
    {
        path: "/homePage",
        name: "Home Page",
        icon: Dashboard,
        component: HomePage,
        layout: "/Teacher"
    },
    {
        path: "/mySchedule",
        name: "My Schedule",
        icon: Notifications,
        component: MySchedule,
        layout: "/Teacher"
    },
    {
        path: "/myStudents",
        name: "My Students",
        icon: "content_paste",
        component: MyStudents,
        layout: "/Teacher"
    },
    {
        path: "/myFeedbacks",
        name: "My Feedbacks",
        icon: LibraryBooks,
        component: MyFeedbacks,
        layout: "/Teacher"
    },
    {
        path: "/contactUs",
        name: "Contact Us",
        icon: BubbleChart,
        component: ContactUs,
        layout: "/Teacher"
    }
];

export default dashboardRoutes;
