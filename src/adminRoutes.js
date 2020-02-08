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
import AccountBalance from "@material-ui/icons/AccountBalanceWallet";
import Calendar from "@material-ui/icons/Today";
import Help from "@material-ui/icons/Help";
// core components/views for userSideBar layout
import HomePage from './Views/Admin/homePage';
import Students from './Views/Admin/students';
import TeacherCalendar from './Views/Admin/teacherCalendar';

const dashboardRoutes = [
    {
        path: "/homePage",
        name: "Home Page",
        icon: Dashboard,
        component: HomePage,
        layout: "/Admin"
    },
    {
        path: "/teacherCalendar",
        name: "Teacher Calendar",
        icon: Dashboard,
        component: TeacherCalendar,
        layout: "/Admin"
    },
    {
        path: "/students",
        name: "Students",
        icon: Help,
        component: Students,
        layout: "/Admin"
    }
];

export default dashboardRoutes;
