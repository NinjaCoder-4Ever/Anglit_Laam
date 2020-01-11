
import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Checkbox from "@material-ui/core/Checkbox";
import logo from "assets/img/LogoText.png";

// material-ui icons
import Assignment from "@material-ui/icons/Assignment";
import Person from "@material-ui/icons/Person";
import Edit from "@material-ui/icons/Edit";
import Close from "@material-ui/icons/Close";
import Check from "@material-ui/icons/Check";
import Remove from "@material-ui/icons/Remove";
import Add from "@material-ui/icons/Add";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";

// core components
import GridContainer from "Components/Grid/GridContainer.js";
import GridItem from "Components/Grid/GridItem.js";
import Table from "Components/Table/Table.js";
import Button from "Components/CustomButtons/Button.js";
import Card from "Components/Card/Card.js";
import CardBody from "Components/Card/CardBody.js";
import CardIcon from "Components/Card/CardIcon.js";
import CardHeader from "Components/Card/CardHeader.js";

import styles from "assets/jss/material-dashboard-pro-react/views/extendedTablesStyle.js";
import {getStudentByMail} from "Actions/firestore_functions_sutdent";
import {emailRegex} from "react-bootstrap-sweetalert/dist/constants/patterns";

const useStyles = makeStyles(styles);

export default  function ExtendedTables() {
    const [checked, setChecked] = React.useState([]);
    const [studentData,setStudentData] = React.useState({first_name: '',
        last_name: '',
        email: '',
        credits: 0,
        lessons_this_month: [[]],
        phone_number: '',
        subscription: '',
        teacher: {},
        uid: ''});

    React.useEffect(() => {
        getStudentByMail("some@mail.com").then((res)=>{
            if(res != null){
                setStudentData(res);
            }
            console.log(res);
        })
        },[]);

    const classes = useStyles();
    const simpleButtons = [
        { color: "success", icon: Edit },
        { color: "danger", icon: Close }
    ].map((prop, key) => {
        return (
            <Button
                color={prop.color}
                simple
                className={classes.actionButton}
                key={key}
            >
                <prop.icon className={classes.icon} />
            </Button>
        );
    });

    const lessons = studentData.lessons_this_month.map(lesson => {
        if(!Array.isArray(lesson))
        return (
            [lesson,lesson,simpleButtons]
        );
        else
            return []
    });

    return (
        <GridContainer>
            <GridItem>
                <img src={logo} alt="..." className={classes.logo} />
            </GridItem>
            <GridItem xs={12}>
                <Card>
                    <CardHeader color="info" icon>
                        <CardIcon color="info">
                            <Assignment />
                        </CardIcon>
                        <h4 className={classes.cardIconTitle}>Next Lessons</h4>
                    </CardHeader>
                    <CardBody>
                        <Table
                            tableHead={[
                                "#",
                                "Date",
                                "Actions"
                            ]}
                            tableData={
                                lessons
                            }
                        />
                    </CardBody>
                </Card>
            </GridItem>
        </GridContainer>
    );
}
