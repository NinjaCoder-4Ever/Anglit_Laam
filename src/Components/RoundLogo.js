import React from "react";
import cx from "classnames";
import PropTypes from "prop-types";

// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";

import styles from "assets/jss/material-dashboard-pro-react/components/headingStyle.js";
import logo2 from "assets/img/logo512.png";
import CardAvatar from "Components/Card/CardAvatar.js";

const useStyles = makeStyles(styles);

export default function RoundLogo(props) {
    const { width, height, objectstyle, ...rest } = props;
    return(
        <CardAvatar testimonial testimonialFooter style={objectstyle} >
            <img src={logo2} alt="..." style={{ height: height, width: width}} />
        </CardAvatar>
    )
}

RoundLogo.propTypes = {
    height: PropTypes.string,
    width: PropTypes.string,
    objectstyle: PropTypes.object,
};
