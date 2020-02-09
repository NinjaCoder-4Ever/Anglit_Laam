import React from "react";

import spinner from "assets/globe-spinner.svg";
import PropTypes from "prop-types";

export default function Loader(props) {
    const { width } = props;
    return(
            <img src={spinner} alt="..." style={{width: width,
                margin:'auto'}}/>
    )

}

Loader.propTypes = {
    width: PropTypes.string,
};
