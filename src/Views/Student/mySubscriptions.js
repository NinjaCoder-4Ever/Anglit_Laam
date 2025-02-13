
import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
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

import styles from "assets/jss/material-dashboard-pro-react/views/extendedTablesStyle.js";
import {getStudentByUID, getAllPastLessonsForStudent} from "Actions/firestore_functions_student";
import Loader from "Components/Loader/Loader.js";

const useStyles = makeStyles(styles);
function printFeedback(feedback) {
    return "this is feedback for the class"
}
export default  function ExtendedTables() {
    const [loading, setLoading] = React.useState(true);
    const [alert, setAlert] = React.useState(null);
    const [studentData,setStudentData] = React.useState({first_name: '',
        last_name: '',
        email: '',
        credits: 0,
        lessons_this_month: {},
        phone_number: '',
        subscription: '',
        teacher: {},
        uid: ''});
    const [pastLessons,setPastLessons] = React.useState({});

    React.useEffect(() => {

        getStudentByUID(firebase.auth().currentUser.uid).then((studentInfo)=>{
            if(studentInfo != null){
                setStudentData(studentInfo);
            }
            getAllPastLessonsForStudent(studentInfo.email).then((res)=>{
                if(res != null){
                    setPastLessons(res);
                }
                setLoading(false);
            });
        });

    },[]);

    const hideAlert = () => {
        setAlert(null);
    };

    const popFeedback = (line) => {
        setAlert(
            <SweetAlert

                style={{ display: "block"}}
                title="Feedback"
                onConfirm={() => hideAlert()}
                onCancel={() => hideAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
                confirmBtnText="close"
            >
                {printFeedback(line.lesson_data.feedback)}
            </SweetAlert>
        );
    };


    const classes = useStyles();

    function getSimpleButtons(line)
    {
        return  [
            {color: "success", icon: Check, data: line}
        ].map((prop, key) => {
            return (
                <Button
                    color={prop.color}

                    className={classes.actionButton}
                    key={key}
                    onClick={() => {
                        popFeedback(prop.data);
                    }}
                >
                    Feedback
                </Button>
            );
        });
    }
    let lessons = Object.keys(pastLessons).map((lesson_id,index) => {
        let teacher_name = studentData.teacher.first_name + " " + studentData.teacher.last_name;
        let lesson_date = new Date(pastLessons[lesson_id].date_utc.full_date_string).toString().slice(0, 21);
        let duration = pastLessons[lesson_id].duration;
        return (
            [teacher_name, lesson_date, duration,getSimpleButtons({lesson_date: lesson_date, index: lesson_id, lesson_data: pastLessons[lesson_id]})]
        );

    });

    return (
        <div>
            {alert}

            <GridContainer>
                <GridItem xs={12}>
                    <Card>
                        <CardHeader color="info" icon>
                            <CardIcon color="info">
                                <Assignment />
                            </CardIcon>
                            <h4 className={classes.cardIconTitle}>Past Lessons</h4>
                        </CardHeader>
                        {
                            loading === true ?
                                <Loader width={'20%'}/>:
                                <CardBody>
                                    <Table
                                        tableHead={[
                                            "Teacher",
                                            "Date",
                                            "Duration"
                                        ]}
                                        tableData={
                                            lessons
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
