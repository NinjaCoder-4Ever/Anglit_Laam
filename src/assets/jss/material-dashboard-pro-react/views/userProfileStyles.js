import buttonStyle from "assets/jss/material-dashboard-pro-react/components/buttonStyle.js";
import {
  cardTitle,
  grayColor
} from "assets/jss/material-dashboard-pro-react.js";

const userProfileStyles = {
  cardTitle,
  cardIconTitle: {
    ...cardTitle,
    marginTop: "15px",
    marginBottom: "0px",
    "& small": {
      fontSize: "80%",
      fontWeight: "400"
    }
  },
  cardCategory: {
    marginTop: "10px",
    color: grayColor[0] + " !important",
    textAlign: "center"
  },
  description: {
    color: grayColor[0]
  },
  updateProfileButton: {
    float: "right"
  },
  ...buttonStyle
};
export default userProfileStyles;
