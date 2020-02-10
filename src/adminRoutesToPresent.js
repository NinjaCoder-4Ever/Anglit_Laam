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
import School from "@material-ui/icons/School";
import People from "@material-ui/icons/PeopleAlt";
// core components/views for userSideBar layout
import Teachers from './Views/Admin/teachers';
import Students from './Views/Admin/students';


const dashboardRoutes = [
    {
        path: "/teachers",
        name: "Teachers",
        icon: People,
        component: Teachers,
        layout: "/Admin"
    },
    {
        path: "/students",
        name: "Students",
        icon: School,
        component: Students,
        layout: "/Admin"
    }
];

export default dashboardRoutes;
