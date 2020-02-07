
import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import logo from "assets/img/LogoText.png";
import firebase from 'Config/fire';
import SweetAlert from "react-bootstrap-sweetalert";


// material-ui icons
import Assignment from "@material-ui/icons/Assignment";
import Check from "@material-ui/icons/Check";

// core components
import GridContainer from "Components/Grid/GridContainer.js";
import GridItem from "Components/Grid/GridItem.js";
import Table from "Components/Table/Table.js";
import Button from "Components/CustomButtons/Button.js";
import Card from "Components/Card/Card.js";
import CardBody from "Components/Card/CardBody.js";
import CardIcon from "Components/Card/CardIcon.js";
import CardHeader from "Components/Card/CardHeader.js";
import {School} from "@material-ui/icons";

import stylesPopup from "assets/jss/material-dashboard-pro-react/modalStyle.js";
import styles from "assets/jss/material-dashboard-pro-react/views/extendedTablesStyle.js";
import Loader from "Components/Loader/Loader.js";
import {getAllStudents} from 'Actions/firestore_functions_admin.js'
import {getStudentLastFeedbackByMail} from "../../Actions/firestore_functions_teacher";
import DialogTitle from "@material-ui/core/DialogTitle";
import Close from "@material-ui/core/SvgIcon/SvgIcon";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import Transition from "react-transition-group/Transition";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";

const useStyles = makeStyles(styles);
const useStylesPopup = makeStyles(stylesPopup);


export default  function ExtendedTables() {
    const classes = useStyles();
    const [loading, setLoading] = React.useState(true);

    const [studentsTable, setStudentsTable] = React.useState([]);


    React.useEffect(() => {

        getAllStudents().then((student)=>{
            console.log(student);

            //table for all rows/students
            let studentsInfoTable = [];

            //for each student in the collection
            student.forEach(student =>{
                let row = [];

                row.push(student.first_name + " " + student.last_name);
                row.push(student.email);
                row.push(student.phone_number);
                row.push(student.teacher.first_name + " " + student.teacher.last_name);
                //if (student.subscription.recurring === true)
                //    row.push("recurring");
               //else
                //    row.push(student.subscription.lessons_num);

                row.push(student.credits);
                row.push(getSimpleButtons(student.email));
                console.log(row);

                studentsInfoTable.push(row);
            })
            setStudentsTable(studentsInfoTable);
            setLoading(false);
        });
    },[]);


    function getSimpleButtons(data)
    {
        return  [
            {color: "info", icon: Check, data: data}
        ].map((prop, key) => {
            return (
                <Button
                    color={prop.color}

                    className={classes.actionButton}
                    key={key}
                    onClick={() => {
                    }}
                >
                    EDIT STUDENT INFO
                </Button>
            );
        });
    }

    return (
        <div>
            {alert}

            <GridContainer>
                <GridItem xs={12}>
                    <Card>
                        <CardHeader color="info">
                            <CardIcon color="rose">
                                <School/>
                            </CardIcon>
                            <h4 className={classes.cardCategory}>Students List</h4>
                        </CardHeader>
                        {
                            loading === true ?
                                <Loader width={'20%'}/>:
                                <CardBody>
                                    <Table
                                        tableHead={[
                                            "Name",
                                            "Mail",
                                            "Phone",
                                            "Teacher",
                                            //"Subscription",
                                            "Credit",
                                        ]}
                                        tableData={
                                            studentsTable
                                        }
                                    />
                                </CardBody>
                        }
                    </Card>
                </GridItem>
            </GridContainer>

        </div>
    );
}
