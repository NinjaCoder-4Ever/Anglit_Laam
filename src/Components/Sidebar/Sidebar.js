/*eslint-disable*/
import React from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import PerfectScrollbar from "perfect-scrollbar";
// @material-ui/core components
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Icon from "@material-ui/core/Icon";
import withStyles from "@material-ui/core/styles/withStyles";
import Collapse from "@material-ui/core/Collapse";
// core components
import sidebarStyle from "../../assets/jss/material-dashboard-pro-react/components/sidebarStyle";
import avatar from "../../assets/img/UserAvatar0.png";
import cx from "classnames";
import AdminNavbarLinks from "../Navbars/AdminNavbarLinks.js";

import {getFullNameByUID} from "Actions/firestore_functions_general.js"
import firebase from "firebase";
import RoundLogo from "../RoundLogo";
var ps;

class SidebarWrapper extends React.Component {
    sidebarWrapper = React.createRef();
    componentDidMount() {
        if (navigator.platform.indexOf("Win") > -1) {
            ps = new PerfectScrollbar(this.sidebarWrapper.current, {
                suppressScrollX: true,
                suppressScrollY: false
            });

        }
    }
    componentWillUnmount() {
        if (navigator.platform.indexOf("Win") > -1) {
            ps.destroy();
        }
    }
    render() {
        const { className, user, headerLinks, links } = this.props;
        return (
            <div className={className} ref={this.sidebarWrapper}>
                {user}
                {headerLinks}
                {links}
            </div>
        );
    }
}

class Sidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            openAvatar: false,
            miniActive: true,
            username: "",
            ...this.getCollapseStates(props.routes)
        };
    }
    connectData(name){
        this.setState({userName: name});
    }
    componentDidMount() {
        getFullNameByUID(firebase.auth().currentUser.uid).then(this.connectData.bind(this))
    }

    mainPanel = React.createRef();
    // this creates the intial state of this component based on the collapse routes
    // that it gets through this.props.routes
    getCollapseStates = routes => {
        let initialState = {};
        routes.map(prop => {
            if (prop.collapse) {
                initialState = {
                    [prop.state]: this.getCollapseInitialState(prop.views),
                    ...this.getCollapseStates(prop.views),
                    ...initialState
                };
            }
            return null;
        });
        return initialState;
    };
    // this verifies if any of the collapses should be default opened on a rerender of this component
    // for example, on the refresh of the page,
    // while on the src/views/forms/RegularForms.jsx - route /admin/regular-forms
    getCollapseInitialState(routes) {
        for (let i = 0; i < routes.length; i++) {
            if (routes[i].collapse && this.getCollapseInitialState(routes[i].views)) {
                return true;
            } else if (window.location.href.indexOf(routes[i].path) !== -1) {
                return true;
            }
        }
        return false;
    }
    // verifies if routeName is the one active (in browser input)
    activeRoute = routeName => {
        return window.location.href.indexOf(routeName) > -1 ? "active" : "";
    };
    openCollapse(collapse) {
        var st = {};
        st[collapse] = !this.state[collapse];
        this.setState(st);
    }
    // this function creates the links and collapses that appear in the sidebar (left menu)
    createLinks = routes => {
        const { classes, color, rtlActive } = this.props;
        return routes.map((prop, key) => {
            if (prop.redirect) {
                return null;
            }
            if (prop.collapse) {
                var st = {};
                st[prop["state"]] = !this.state[prop.state];
                const navLinkClasses =
                    classes.itemLink +
                    " " +
                    cx({
                        [" " + classes.collapseActive]: this.getCollapseInitialState(
                            prop.views
                        )
                    });
                const itemText =
                    classes.itemText +
                    " " +
                    cx({
                        [classes.itemTextMini]:
                        this.props.miniActive && this.state.miniActive,
                        [classes.itemTextMiniRTL]:
                        rtlActive && this.props.miniActive && this.state.miniActive,
                        [classes.itemTextRTL]: rtlActive
                    });
                const collapseItemText =
                    classes.collapseItemText +
                    " " +
                    cx({
                        [classes.collapseItemTextMini]:
                        this.props.miniActive && this.state.miniActive,
                        [classes.collapseItemTextMiniRTL]:
                        rtlActive && this.props.miniActive && this.state.miniActive,
                        [classes.collapseItemTextRTL]: rtlActive
                    });
                const itemIcon =
                    classes.itemIcon +
                    " " +
                    cx({
                        [classes.itemIconRTL]: rtlActive
                    });
                const caret =
                    classes.caret +
                    " " +
                    cx({
                        [classes.caretRTL]: rtlActive
                    });
                const collapseItemMini =
                    classes.collapseItemMini +
                    " " +
                    cx({
                        [classes.collapseItemMiniRTL]: rtlActive
                    });
                return (
                    <ListItem
                        key={key}
                        className={cx(
                            { [classes.item]: prop.icon !== undefined },
                            { [classes.collapseItem]: prop.icon === undefined }
                        )}
                    >
                        <NavLink
                            to={"#"}
                            className={navLinkClasses}
                            onClick={e => {
                                e.preventDefault();
                                this.setState(st);
                            }}
                        >
                            {prop.icon !== undefined ? (
                                typeof prop.icon === "string" ? (
                                    <Icon className={itemIcon}>{prop.icon}</Icon>
                                ) : (
                                    <prop.icon className={itemIcon} />
                                )
                            ) : (
                                <span className={collapseItemMini}>
                  {rtlActive ? prop.rtlMini : prop.mini}
                </span>
                            )}
                            <ListItemText
                                primary={rtlActive ? prop.rtlName : prop.name}
                                secondary={
                                    <b
                                        className={
                                            caret +
                                            " " +
                                            (this.state[prop.state] ? classes.caretActive : "")
                                        }
                                    />
                                }
                                disableTypography={true}
                                className={cx(
                                    { [itemText]: prop.icon !== undefined },
                                    { [collapseItemText]: prop.icon === undefined }
                                )}
                            />
                        </NavLink>
                        <Collapse in={this.state[prop.state]} unmountOnExit>
                            <List className={classes.list + " " + classes.collapseList}>
                                {this.createLinks(prop.views)}
                            </List>
                        </Collapse>
                    </ListItem>
                );
            }
            const innerNavLinkClasses =
                classes.collapseItemLink +
                " " +
                cx({
                    [" " + classes[color]]: this.activeRoute(prop.path)
                });
            const collapseItemMini =
                classes.collapseItemMini +
                " " +
                cx({
                    [classes.collapseItemMiniRTL]: rtlActive
                });
            const navLinkClasses =
                classes.itemLink +
                " " +
                cx({
                    [" " + classes[color]]: this.activeRoute(prop.path)
                });
            const itemText =
                classes.itemText +
                " " +
                cx({
                    [classes.itemTextMini]:
                    this.props.miniActive && this.state.miniActive,
                    [classes.itemTextMiniRTL]:
                    rtlActive && this.props.miniActive && this.state.miniActive,
                    [classes.itemTextRTL]: rtlActive
                });
            const collapseItemText =
                classes.collapseItemText +
                " " +
                cx({
                    [classes.collapseItemTextMini]:
                    this.props.miniActive && this.state.miniActive,
                    [classes.collapseItemTextMiniRTL]:
                    rtlActive && this.props.miniActive && this.state.miniActive,
                    [classes.collapseItemTextRTL]: rtlActive
                });
            const itemIcon =
                classes.itemIcon +
                " " +
                cx({
                    [classes.itemIconRTL]: rtlActive
                });
            return (
                <ListItem
                    key={key}
                    className={cx(
                        { [classes.item]: prop.icon !== undefined },
                        { [classes.collapseItem]: prop.icon === undefined }
                    )}
                >
                    <NavLink
                        to={prop.layout + prop.path}
                        className={cx(
                            { [navLinkClasses]: prop.icon !== undefined },
                            { [innerNavLinkClasses]: prop.icon === undefined }
                        )}
                    >
                        {prop.icon !== undefined ? (
                            typeof prop.icon === "string" ? (
                                <Icon className={itemIcon}>{prop.icon}</Icon>
                            ) : (
                                <prop.icon className={itemIcon} />
                            )
                        ) : (
                            <span className={collapseItemMini}>
                {rtlActive ? prop.rtlMini : prop.mini}
              </span>
                        )}
                        <ListItemText
                            primary={rtlActive ? prop.rtlName : prop.name}
                            disableTypography={true}
                            className={cx(
                                { [itemText]: prop.icon !== undefined },
                                { [collapseItemText]: prop.icon === undefined }
                            )}
                        />
                    </NavLink>
                </ListItem>
            );
        });
    };
    render() {
        const {
            classes,
            logo,
            image,
            logoText,
            routes,
            bgColor,
            rtlActive
        } = this.props;
        const itemText =
            classes.itemText +
            " " +
            cx({
                [classes.itemTextMini]: this.props.miniActive && this.state.miniActive,
                [classes.itemTextMiniRTL]:
                rtlActive && this.props.miniActive && this.state.miniActive,
                [classes.itemTextRTL]: rtlActive
            });
        const collapseItemText =
            classes.collapseItemText +
            " " +
            cx({
                [classes.collapseItemTextMini]:
                this.props.miniActive && this.state.miniActive,
                [classes.collapseItemTextMiniRTL]:
                rtlActive && this.props.miniActive && this.state.miniActive,
                [classes.collapseItemTextRTL]: rtlActive
            });
        const userWrapperClass =
            classes.user +
            " " +
            cx({
                [classes.whiteAfter]: bgColor === "white"
            });
        const caret =
            classes.caret +
            " " +
            cx({
                [classes.caretRTL]: rtlActive
            });
        const collapseItemMini =
            classes.collapseItemMini +
            " " +
            cx({
                [classes.collapseItemMiniRTL]: rtlActive
            });
        const photo =
            classes.photo +
            " " +
            cx({
                [classes.photoRTL]: rtlActive
            });
        var user = (
            <div className={userWrapperClass}>
                <div className={photo}>
                    <img src={avatar} className={classes.avatarImg} alt="..." />
                </div>
                <List className={classes.list}>
                    <ListItem className={classes.item + " " + classes.userItem}>
                        <NavLink
                            to={"#"}
                            className={classes.itemLink + " " + classes.userCollapseButton}
                            onClick={() => this.openCollapse("openAvatar")}
                        >
                            <ListItemText
                                /* This is where the user name should be used */
                                primary={rtlActive ? "تانيا أندرو" : this.state.userName}
                                disableTypography={true}
                                className={itemText + " " + classes.userItemText}
                            />
                        </NavLink>
                        <Collapse in={this.state.openAvatar} unmountOnExit>
                        </Collapse>
                    </ListItem>
                </List>
            </div>
        );
        var links = (
            <List className={classes.list}>{this.createLinks(routes)}</List>
        );

        const logoNormal =
            classes.logoNormal +
            " " +
            cx({
                [classes.logoNormalSidebarMini]:
                this.props.miniActive && this.state.miniActive,
                [classes.logoNormalSidebarMiniRTL]:
                rtlActive && this.props.miniActive && this.state.miniActive,
                [classes.logoNormalRTL]: rtlActive
            });
        const logoMini =
            classes.logoMini +
            " " +
            cx({
                [classes.logoMiniRTL]: rtlActive
            });
        const logoClasses =
            classes.logo +
            " " +
            cx({
                [classes.whiteAfter]: bgColor === "white"
            });
        var brand = (
            <div className={logoClasses}>
                <a
                    href="https://www.anglitlaam.com/"
                    target="_blank"
                    className={logoMini}
                >
                    <img src={logo} alt="logo" className={classes.img + " " + classes.logoAL} />
                </a>
                <a
                    href="https://www.anglitlaam.com/"
                    target="_blank"
                    className={logoNormal}
                >
                    {logoText}
                </a>
            </div>
        );
        const drawerPaper =
            classes.drawerPaper +
            " " +
            cx({
                [classes.drawerPaperMini]:
                this.props.miniActive && this.state.miniActive,
                [classes.drawerPaperRTL]: rtlActive
            });
        const sidebarWrapper =
            classes.sidebarWrapper +
            " " +
            cx({
                [classes.drawerPaperMini]:
                this.props.miniActive && this.state.miniActive,
                [classes.sidebarWrapperWithPerfectScrollbar]:
                navigator.platform.indexOf("Win") > -1
            });
        return (
            <div ref={this.mainPanel}>
                <Hidden mdUp implementation="css">
                    <Drawer
                        variant="temporary"
                        anchor={rtlActive ? "left" : "right"}
                        open={this.props.open}
                        classes={{
                            paper: drawerPaper + " " + classes[bgColor + "Background"]
                        }}
                        onClose={this.props.handleDrawerToggle}
                        ModalProps={{
                            keepMounted: true // Better open performance on mobile.
                        }}
                    >
                        {brand}
                        <SidebarWrapper
                            className={sidebarWrapper}
                            user={user}
                            headerLinks={<AdminNavbarLinks rtlActive={rtlActive} />}
                            links={links}
                        />
                        {image !== undefined ? (
                            <div
                                className={classes.background}
                                style={{ backgroundImage: "url(" + image + ")" }}
                            />
                        ) : null}
                    </Drawer>
                </Hidden>
                <Hidden smDown implementation="css">
                    <Drawer
                        onMouseOver={() => this.setState({ miniActive: false })}
                        onMouseOut={() => this.setState({ miniActive: true })}
                        anchor={rtlActive ? "right" : "left"}
                        variant="permanent"
                        open
                        classes={{
                            paper: drawerPaper + " " + classes[bgColor + "Background"]
                        }}
                    >
                        {brand}
                        <SidebarWrapper
                            className={sidebarWrapper}
                            user={user}
                            links={links}
                        />
                        {image !== undefined ? (
                            <div
                                className={classes.background}
                                style={{ backgroundImage: "url(" + image + ")" }}
                            />
                        ) : null}
                    </Drawer>
                </Hidden>
            </div>
        );
    }
}

Sidebar.defaultProps = {
    bgColor: "blue"
};

Sidebar.propTypes = {
    classes: PropTypes.object.isRequired,
    bgColor: PropTypes.oneOf(["white", "black", "blue"]),
    rtlActive: PropTypes.bool,
    color: PropTypes.oneOf([
        "white",
        "red",
        "orange",
        "green",
        "blue",
        "purple",
        "rose"
    ]),
    logo: PropTypes.string,
    logoText: PropTypes.string,
    image: PropTypes.string,
    routes: PropTypes.arrayOf(PropTypes.object),
    miniActive: PropTypes.bool,
    open: PropTypes.bool,
    handleDrawerToggle: PropTypes.func
};

SidebarWrapper.propTypes = {
    className: PropTypes.string,
    user: PropTypes.object,
    headerLinks: PropTypes.object,
    links: PropTypes.object
};

export default withStyles(sidebarStyle)(Sidebar);
