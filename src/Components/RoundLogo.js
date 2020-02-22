import React from "react";
import PropTypes from "prop-types";

import logo2 from "assets/img/logo512.png";
import CardAvatar from "Components/Card/CardAvatar.js";


export default function RoundLogo(props) {
    const { width, height, objectstyle } = props;
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
