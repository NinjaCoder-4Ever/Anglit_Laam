
import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
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
import CardAvatar from "Components/Card/CardAvatar.js";
import RoundLogo from "Components/RoundLogo.js";

import styles from "assets/jss/material-dashboard-pro-react/views/extendedTablesStyle.js";
import {getStudentByUID, cancelLesson, getNextLessonsStudentByUID} from "Actions/firestore_functions_student";
import {CalendarToday, School} from "@material-ui/icons";

const useStyles = makeStyles(styles);
function openSkype(data) {
    window.open("skype:n.sharbat?chat", '_blank');
}
export default  function ExtendedTables() {
    const [checked, setChecked] = React.useState(0);
    const [alert, setAlert] = React.useState(null);
    const [nextLesson, setNextLesson] = React.useState({});
    const [nextLessonDate, setNextLessonDate] = React.useState("");
    const [studentData,setStudentData] = React.useState({first_name: '',
        last_name: '',
        email: '',
        credits: 0,
        lessons_this_month: {},
        phone_number: '',
        subscription: '',
        teacher: {},
        uid: ''});

    React.useEffect(() => {

        getStudentByUID(firebase.auth().currentUser.uid).then((res)=>{
            if(res != null){
                setStudentData(res);
            }
            console.log(res);
        });
        getNextLessonsStudentByUID(firebase.auth().currentUser.uid,10).then((res)=>{
            if(res !== null && res !== undefined){
                setNextLesson(res);
                    // setNextLessonDate(res[0].)
                if (res[0] !== null && res[0] !== undefined) {
                    setNextLessonDate(new Date(res[0].date_utc.full_date_string));
                }
            }
        })
        },[]);

    const deleteLesson = (line) => {
        let student_mail = studentData.email;
        let teacher_mail = studentData.teacher.email;
        let lesson_date = new Date(line.lesson_date);
        console.log(line);
        cancelLesson(student_mail, teacher_mail, lesson_date);
        if (new Date(lesson_date) === new Date(nextLessonDate)){
            delete nextLesson[Object.keys(nextLesson)[0]];
            let nextLessonData = nextLesson[Object.keys(nextLesson)[0]];
            console.log(nextLessonData);
            setNextLessonDate(new Date(nextLessonData.date_utc.full_date_string).toString().slice(0, 21));
        }
        else {
            delete nextLesson[line.index];
        }

        setChecked(checked+1);
    };

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
    let lessons = Object.keys(nextLesson).map((lesson_id,index) => {
        let teacher_name = studentData.teacher.first_name + " " + studentData.teacher.last_name;
        let lesson_full_date = new Date(nextLesson[lesson_id].date_utc.full_date_string);
        let lesson_date = new Date(nextLesson[lesson_id].date_utc.full_date_string).toString().slice(0, 21);
        let duration = nextLesson[lesson_id].duration;
        return (
            [teacher_name, lesson_date, duration,getSimpleButtons({lesson_date: lesson_full_date, index: lesson_id})]
        );

    });
    // let nextLesson =
    return (
        <div>
        {alert}

        <GridContainer justify="center">
            <GridItem xs={6} sm={6} lg={6}>
                <Card pricing>
                    <CardHeader color="info">
                        <CardIcon color="rose">
                            <School/>
                        </CardIcon>
                        <h3 className={classes.cardCategory}>Your next lesson</h3>
                    </CardHeader>
                    <CardBody pricing>
                        <h6 className={classes.cardCategory}>Your next lesson</h6>
                        <div className={classes.icon}>

                        </div>
                        <RoundLogo width={"100px"} height={"100px"} objectstyle={{ margin: "0 auto 25px", width: "min-content"}}>
                        </RoundLogo>
                        <h1 className={`${classes.cardTitle} ${classes.marginTop30}`}
                            style={{fontSize: "25px", fontWeight: "bold", marginBottom: "10x" }}>
                            {nextLessonDate.toString().slice(0, 21)}
                        </h1>
                        <Button round color="info" onClick={() => {
                            openSkype(studentData);
                        }}>
                            Open Skype
                        </Button>
                    </CardBody>
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
