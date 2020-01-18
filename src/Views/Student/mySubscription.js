
import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import logo from "assets/img/LogoText.png";
import firebase from 'Config/fire';
import SweetAlert from "react-bootstrap-sweetalert";


// material-ui icons
import Assignment from "@material-ui/icons/Assignment";
import Edit from "@material-ui/icons/Edit";
import Close from "@material-ui/icons/Close";

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
import {getStudentByUID, cancelLesson, getAllPastLessonsForStudent} from "Actions/firestore_functions_student";

const useStyles = makeStyles(styles);

export default  function ExtendedTables() {
    const [checked, setChecked] = React.useState(0);
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

        getStudentByUID(firebase.auth().currentUser.uid).then((res)=>{
            if(res != null){
                setStudentData(res);
            }
            console.log('getStudentByUID '+res);
        });
        getAllPastLessonsForStudent('some@mail.com').then((res)=>{
            if(res != null){
                setPastLessons(res);
            }
            console.log('past lessons: '+res);
        });
    },[]);

    const deleteLesson = (line) => {
        let student_mail = studentData.email;
        let teacher_mail = studentData.teacher.email;
        let lesson_date = new Date(line.lesson_date);
        console.log(line);
        cancelLesson(student_mail, teacher_mail, lesson_date);

        delete studentData.lessons_this_month[line.index];
        setChecked(checked+1);
    }

    const hideAlert = () => {
        setAlert(null);
    };

    const warningWithConfirmMessage = (line) => {
        setAlert(
            <SweetAlert
                warning
                style={{ display: "block"}}
                title="Are you sure?"
                onConfirm={() => successDelete(line)}
                onCancel={() => hideAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
                cancelBtnCssClass={classes.button + " " + classes.danger}
                confirmBtnText="Yes, delete it!"
                cancelBtnText="Cancel"
                showCancel
            >
                You will not be able to recover this imaginary file!
            </SweetAlert>
        );
    };

    const successDelete = (line) => {
        deleteLesson(line);
        setAlert(
            <SweetAlert
                success
                style={{ display: "block"}}
                title="Deleted!"
                onConfirm={() => hideAlert()}
                onCancel={() => hideAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
            >
                Your lesson has been deleted.
            </SweetAlert>
        );
    };

    const classes = useStyles();

    function getSimpleButtons(line)
    {
        return  [
            {color: "danger", icon: Close, data: line}
        ].map((prop, key) => {
            return (
                <Button
                    color={prop.color}
                    simple
                    className={classes.actionButton}
                    key={key}
                    onClick={() => {
                        warningWithConfirmMessage(prop.data);
                    }}
                >
                    <prop.icon className={classes.icon}/>
                </Button>
            );
        });
    }
    let lessons = Object.keys(pastLessons).map((lesson_id,index) => {
        let teacher_name = studentData.teacher.first_name + " " + studentData.teacher.last_name;
        let lesson_date = new Date(pastLessons[lesson_id].date_utc.full_date_string).toString().slice(0, 21);
        let duration = pastLessons[lesson_id].duration;
        return (
            [teacher_name, lesson_date, duration,getSimpleButtons({lesson_date: lesson_date, index: lesson_id})]
        );

    });

    return (
        <div>
            {alert}

            <GridContainer>
                <GridItem>
                    <Card style={{margin: 'auto'}}>
                        <img src={logo} alt="..." className={classes.logo} />
                    </Card>
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
                                    "Teacher",
                                    "Date",
                                    "Duration",
                                    "Cancel Lesson"
                                ]}
                                tableData={
                                    lessons
                                }
                            />
                        </CardBody>
                    </Card>
                </GridItem>
            </GridContainer>
        </div>
    );
}
