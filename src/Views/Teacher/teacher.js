import React from 'react';
import { Switch, Route, Redirect } from "react-router-dom";
// creates a beautiful scrollbar
import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
// core components
import Sidebar from "../../Components/Sidebar/Sidebar";
import routes from "../../teacherRoutes";
import styles from "../../Layouts/adminStyle";
import logo from '../../assets/img/logo512.png';
import image from '../../assets/img/sidebarBackground.jpg';
import AdminNavbar from "../../Components/Navbars/AdminNavbar";


let ps;

const switchRoutes = (
    <Switch>
        {routes.map((prop) => {
            if (prop.layout === "/Teacher") {
                return (
                    <Route
                        path={prop.layout + prop.path}
                        component={prop.component}
                    />
                );
            }
            return null;
        })}
        <Redirect from="/Teacher" to="/Teacher/homePage" />
    </Switch>
);

const useStyles = makeStyles(styles);

export default function Admin({ ...rest }) {
    // styles
    const classes = useStyles();
    // ref to help us initialize PerfectScrollbar on windows devices
    const mainPanel = React.createRef();
    // states and functions
    //const [image, setImage] = React.useState(bgImage);
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [miniActive, setMiniActive] = React.useState(false);
    const [bgColor, setBgColor] = React.useState("black");
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };
    const sidebarMinimize = () => {
        setMiniActive(!miniActive);
    };

    const resizeFunction = () => {
        if (window.innerWidth >= 960) {
            setMobileOpen(false);
        }
    };
    const getActiveRoute = routes => {
        let activeRoute = "Default Brand Text";
        for (let i = 0; i < routes.length; i++) {
            if (routes[i].collapse) {
                let collapseActiveRoute = getActiveRoute(routes[i].views);
                if (collapseActiveRoute !== activeRoute) {
                    return collapseActiveRoute;
                }
            } else {
                if (
                    window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
                ) {
                    return routes[i].name;
                }
            }
        }
        return activeRoute;
    };
    // initialize and destroy the PerfectScrollbar plugin
    React.useEffect(() => {
        if (navigator.platform.indexOf("Win") > -1) {
            ps = new PerfectScrollbar(mainPanel.current, {
                suppressScrollX: true,
                suppressScrollY: false
            });
            document.body.style.overflow = "hidden";
        }
        window.addEventListener("resize", resizeFunction);
        // Specify how to clean up after this effect:
        return function cleanup() {
            if (navigator.platform.indexOf("Win") > -1) {
                ps.destroy();
            }
            window.removeEventListener("resize", resizeFunction);
        };
    }, [mainPanel]);
    return (
        <div className={classes.wrapper}>
            <Sidebar
                routes={routes}
                logoText={"Anglit Laam"}
                logo={logo}
                image={image}
                handleDrawerToggle={handleDrawerToggle}
                open={mobileOpen}
                color={"blue"}
                {...rest}
                bgColor={bgColor}
                miniActive={miniActive}
                {...rest}
            />
            <div className={classes.mainPanel} ref={mainPanel}>
                <AdminNavbar
                    sidebarMinimize={sidebarMinimize.bind(this)}
                    miniActive={miniActive}
                    brandText={getActiveRoute(routes)}
                    handleDrawerToggle={handleDrawerToggle}
                    {...rest}
                />
                {
                    <div className={classes.content}>
                        <div className={classes.container}>{switchRoutes}</div>
                    </div>
                }
            </div>
        </div>
    );
}
