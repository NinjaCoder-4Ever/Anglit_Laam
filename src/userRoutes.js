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
import LocationOn from "@material-ui/icons/LocationOn";
import Notifications from "@material-ui/icons/Notifications";
import Unarchive from "@material-ui/icons/Unarchive";
// core components/views for userSideBar layout
import MyLessons from './Views/User/myLessons'
import CreditStatus from './Views/User/creditStatus'

const dashboardRoutes = [
    {
        path: "/myLessons",
        name: "My Lessons",
        icon: Dashboard,
        component: MyLessons,
        layout: "/user"
    },
    {
        path: "/user",
        name: "User Profile",
        icon: Person,
        component: CreditStatus,
        layout: "/user"
    },
    {
        path: "/creditStatus",
        name: "Credit Status",
        icon: "content_paste",
        component: CreditStatus,
        layout: "/user"
    },
    {
        path: "/myLessons",
        name: "Typography",
        icon: LibraryBooks,
        component: CreditStatus,
        layout: "/user"
    },
    {
        path: "/myLessons",
        name: "Icons",
        icon: BubbleChart,
        component: CreditStatus,
        layout: "/user"
    },
    {
        path: "/myLessons",
        name: "Notifications",
        icon: Notifications,
        component: CreditStatus,
        layout: "/user"
    },
    {
        path: "/myLessons",
        name: "Upgrade To PRO",
        icon: Unarchive,
        component: CreditStatus,
        layout: "/user"
    }
];

export default dashboardRoutes;
