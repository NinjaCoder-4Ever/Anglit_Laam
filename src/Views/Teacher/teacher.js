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
import logo from '../../logo512.png';
import image from '../../sidebarBackground.jpg';


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

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };
    const resizeFunction = () => {
        if (window.innerWidth >= 960) {
            setMobileOpen(false);
        }
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
            />
            <div className={classes.mainPanel} ref={mainPanel}>
                {
                    <div className={classes.content}>
                        <div className={classes.container}>{switchRoutes}</div>
                    </div>
                }
            </div>
        </div>
    );
}
