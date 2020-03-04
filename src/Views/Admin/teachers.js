
import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import firebase from 'Config/fire';
import SweetAlert from "react-bootstrap-sweetalert";

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
import DialogTitle from "@material-ui/core/DialogTitle";
import Close from "@material-ui/icons/Close";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import TextField from "@material-ui/core/TextField";
import {
    deleteTeacher,
    editTeacherCategory,
    editTeacherContactInfo,
    editTeacherWorkingDays,
    getAdminByUid,
    setNewAdmin
} from "../../Actions/firestore_functions_admin";
import {Redirect} from "react-router-dom";
import {Checkbox} from "@material-ui/core";
import Slide from "@material-ui/core/Slide";
import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import ListItemText from "@material-ui/core/ListItemText";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import {setNewTeachers} from "../../Actions/firestore_functions_teacher";
import admin from "./admin";

const useStyles = makeStyles(styles);
const useStylesPopup = makeStyles(stylesPopup);


export default  function ExtendedTables() {
    const classes = useStyles();
    const classesPopup = useStylesPopup();
    const [loading, setLoading] = React.useState(true);
    const [alert, setAlert] = React.useState(null);
    const [redirect, setRedirect] = React.useState(false);
    const [teachersTable, setTeachersTable] = React.useState([]);
    const [modal, setModal] = React.useState(false);
    const [modal2, setModal2] = React.useState(false);
    const [modal3, setModal3] = React.useState(false);
    const [contactInfoModal, setContactInfoModal] = React.useState(false);
    const [categoryModal, setCategoryModal] = React.useState(false);
    const [workingDaysModal, setWorkingDaysModal] = React.useState(false);
    const [category, setCategory] = React.useState([]);
    const [workingDays, setWorkingDays] = React.useState([]);
    const [breakTime, setBreaKTime] = React.useState("");
    const categories = ["Kids","Adults","Business","Spoken"];
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const [grantFirebaseAccess, setGrantFirebaseAccess] = React.useState(false);

    const Transition = React.forwardRef(function Transition(props, ref) {
        return <Slide direction="down" ref={ref} {...props} />;
    });

    const [selectedTeacher, setSelectedTeacher] = React.useState({
        category: "",
        credits: 0,
        phone_number: "",
        skype_username: "",
        teacher_name: "",
        teacher_mail: "",
        uid: "",
        students: "",
        working_days: []
    });
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [allTeacherMailsList, setAllTeacherMailsList] =React.useState([]);
    const [triggerMount, setTriggerMount] = React.useState(true);
    const [firebaseAccess, setFireBaseAccess] = React.useState(true);


    React.useEffect(() => {

        getAdminByUid(firebase.auth().currentUser.uid).then((adminData)=>{
            setAllTeacherMailsList(Object.keys(adminData.all_teachers));
            let all_teachers = adminData.all_teachers;
            setFireBaseAccess(adminData.firebase_access);
            //table for all rows/students
            let teacherInfoTable = [];

            //for each student in the collection
            let index = 0;
            Object.keys(all_teachers).forEach(teacher =>{
                let row = [];
                row.push(all_teachers[teacher].teacher_name);
                row.push(all_teachers[teacher].teacher_mail);
                row.push(all_teachers[teacher].phone_number);
                row.push(all_teachers[teacher].skype_username);
                row.push(all_teachers[teacher].category.toString());
                row.push(getScheduleButtons(all_teachers[teacher], index));
                row.push(getInfoButtons(all_teachers[teacher], index));

                teacherInfoTable.push(row);
                index = index + 1;
            });
            setTeachersTable(teacherInfoTable);
            setLoading(false);
        });

    },[triggerMount]);


    function goToTeacherSchedule(teacherData, index) {

        setRedirect(
            <Redirect
                to={{
                    pathname: "/Admin/teacherCalendar",
                    search: "?email=" + teacherData.teacher_mail,
                    state: { teacher: teacherData }
                }}
            /> );
    }

    function getScheduleButtons(teacherData, index)
    {
        return (
            <>
                <Button
                    color={"info"}
                    className={classes.actionButton}
                    onClick={() => goToTeacherSchedule(teacherData, index)}
                >
                    See Schedule
                </Button>
            </>
        )
    }

    function getInfoButtons(teacherData, index)
    {
        return (
            <>
                <Button
                    color={"info"}
                    className={classes.actionButton}
                    onClick={() => actionModal(teacherData, index)}
                >
                    Edit Teacher Info
                </Button>
            </>
        )
    }

    const closeAlert = () => {
        setAlert(null);
    };

    const actionModal = (teacherData, index) => {
        setSelectedTeacher(teacherData);
        setSelectedIndex(index);
        setModal(true);
    };

    const contactInfoSetup = () => {
        setModal(false);
        setContactInfoModal(true);
    };

    const updateContactInfoFunction = () => {
        setAlert(
            <SweetAlert
                customButtons={
                    <React.Fragment>
                    </React.Fragment>
                }>
                <Loader width={'30%'}/>
            </SweetAlert>
        );
      let newPhoneNumber = document.getElementById('phoneForm').value;
      let newSkypeUser = document.getElementById('skypeForm').value;
      if (newSkypeUser === "" || newSkypeUser === undefined || newSkypeUser === null){
          newSkypeUser = selectedTeacher.skype_username;
      }
        if (newPhoneNumber === "" || newPhoneNumber === undefined || newPhoneNumber === null){
            newPhoneNumber = selectedTeacher.phone_number;
        }
      editTeacherContactInfo(selectedTeacher.teacher_mail, newPhoneNumber, newSkypeUser, selectedTeacher.students).then(() =>{
          setContactInfoModal(false);
          confirmContactUpdateAlert();
          setTriggerMount(!triggerMount);
          document.getElementById('conactForm').reset();
      })
    };

    const closeModal2 = () => {
        document.getElementById("teacher-signup-form").reset();
        setModal2(false)
    };
    const closeModal3 = () => {
        document.getElementById("admin-signup-form").reset();
        setModal3(false)
    };

    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: 48 * 4.5 + 8,
                width: "20%",
            },
        },
    };

    const confirmContactUpdateAlert = () => {
        setAlert(
            <SweetAlert
                success
                style={{ display: "block"}}
                title="Contact Info Updated"
                onConfirm={() => closeAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
            >
                Updated contact info for {selectedTeacher.teacher_name}
            </SweetAlert>
        );
    };

    const categoryModalSetup = () => {
      setModal(false);
      setCategoryModal(true);
    };

    const updateCategoryFunction = () => {
        setAlert(
            <SweetAlert
                customButtons={
                    <React.Fragment>
                    </React.Fragment>
                }>
                <Loader width={'30%'}/>
            </SweetAlert>
        );
        let categoryList = [];
        for (const cat of category){
            categoryList.push(cat.toLowerCase());
        }
        if (categoryList.length === 0){
            noCategorySelectedAlert();
            return 0;
        }
        editTeacherCategory(selectedTeacher.teacher_mail, categoryList).then(() =>{
            closeCategoryModal();
            confirmCategoryUpdateAlert();
            document.getElementById("categoryForm").reset();
            setTriggerMount(!triggerMount);
        })
    };

    const noCategorySelectedAlert = () => {
        setAlert(
            <SweetAlert
                warning
                style={{ display: "block"}}
                title="No Categories Selected"
                onConfirm={() => closeAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
            >
                Please select a category for the teacher.
            </SweetAlert>
        );
    };

    const confirmCategoryUpdateAlert = () => {
        setAlert(
            <SweetAlert
                success
                style={{ display: "block"}}
                title="Categories Updated"
                onConfirm={() => closeAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
            >
                Updated categories info for {selectedTeacher.teacher_name}
            </SweetAlert>
        );
    };

    const closeCategoryModal = () => {
        document.getElementById("categoryForm").reset();
        setCategoryModal(false);
    };

    const workingDaysModalSetup = () => {
        setModal(false);
        setWorkingDaysModal(true);
    };

    const closeWorkingDays = () => {
        document.getElementById('working-days-change-form').reset();
        setWorkingDaysModal(false);
    };

    const warningWithConfirmMessage = () => {
        setAlert(
            <SweetAlert
                warning
                style={{ display: "block"}}
                title="Are you sure?"
                onConfirm={() => deleteTeacherFunction()}
                onCancel={() => setAlert(null)}
                confirmBtnCssClass={classes.button + " " + classes.success}
                cancelBtnCssClass={classes.button + " " + classes.danger}
                confirmBtnText={"Yes, delete " + selectedTeacher.teacher_name + "!"}
                cancelBtnText="Cancel"
                showCancel
            >
                <b>Once deleted there is no going back!</b>
            </SweetAlert>
        );
    };

    const deleteTeacherFunction = () => {
        setAlert(
            <SweetAlert
                customButtons={
                    <React.Fragment>
                    </React.Fragment>
                }>
                <Loader width={'30%'}/>
            </SweetAlert>
        );
        deleteTeacher(selectedTeacher.teacher_mail).then(() => {
            confirmDeletion();
            setTriggerMount(!triggerMount);
        });
    };

    const confirmDeletion = () => {
        setAlert(
            <SweetAlert
                success
                style={{ display: "block"}}
                title="Teacher Deleted"
                onConfirm={() => closeAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
            >
                {selectedTeacher.teacher_name} was deleted!
            </SweetAlert>
        );
    };

    const backToControlPanel = () => {
        setContactInfoModal(false);
        closeCategoryModal();
        closeWorkingDays();
        setModal(true);
    };

    const handleChange_category = event => {
        setCategory(event.target.value);
    };

    const handleChange_working_days = event => {
        setWorkingDays(event.target.value);
    };

    const handleChange_break = event => {
        setBreaKTime(event.target.value);
    };

    const handleChange_firebase = event => {
        setFireBaseAccess(event.target.value);
    };

    const teacherSignUp = () => {
        let first_name = document.getElementById('first_name').value;
        let last_name = document.getElementById("last_name").value;
        let uid = document.getElementById("uid").value;
        let phone_number = document.getElementById('phone_number').value;
        let skype_id = document.getElementById('skype_id').value;
        let teacher_mail = document.getElementById('email').value;
        if (first_name === null || first_name === undefined || first_name.length === 0 ||
            last_name === null || last_name === undefined || last_name.length === 0 ||
            uid === null || uid === undefined || uid.length === 0 ||
            phone_number === null || phone_number === undefined || phone_number.length === 0 ||
            skype_id === null || skype_id === undefined || skype_id.length === 0 ||
            teacher_mail === null || teacher_mail === undefined || teacher_mail.length === 0){
            fillFullFormAlertTeacher();
            return 0;
        }
        if (category.length === 0){
            noCategorySelectedAlert();
            return 0;
        }
        if (workingDays.length === 0){
            noWorkingDaysAlert();
            return 0;
        }
        setNewTeachers(uid, teacher_mail, first_name, last_name, phone_number, skype_id, category,
            workingDays, breakTime).then(function () {
            confirmTeacherSignUp();
            setTriggerMount(!triggerMount);
            closeModal2();
        });
    };

    const confirmTeacherSignUp = () => {
        setAlert(
            <SweetAlert
                success
                style={{ display: "block"}}
                title="Teacher Signd up"
                onConfirm={() => closeAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
            >
            </SweetAlert>
        );
    };

    const adminSignup = () => {
        let first_name = document.getElementById('admin_first_name').value;
        let last_name = document.getElementById("admin_last_name").value;
        let uid = document.getElementById("admin_uid").value;
        let admin_mail = document.getElementById('admin_email').value;
        if (first_name === null || first_name === undefined || first_name.length === 0 ||
            last_name === null || last_name === undefined || last_name.length === 0 ||
            uid === null || uid === undefined || uid.length === 0 ||
            admin_mail === null || admin_mail === undefined || admin_mail.length === 0){
            fillFullFormAlertAdmin();
            return 0;
        }
        setNewAdmin(uid, admin_mail, first_name, last_name, firebaseAccess).then(function () {
            confirmAdminSignup();
            closeModal3();
        });
    };

    const confirmAdminSignup = () => {
        setAlert(
            <SweetAlert
                success
                style={{ display: "block"}}
                title="Admin Signd up"
                onConfirm={() => closeAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
            >
            </SweetAlert>
        );
    };

    const changeWorkingDays = () => {
        if (workingDays.length === 0){
            noWorkingDaysAlert();
            return 0
        }
        editTeacherWorkingDays(selectedTeacher.teacher_mail, workingDays, breakTime).then(function () {
            confirmWorkingDaysChange();
            closeWorkingDays();
            setTriggerMount(!triggerMount);
        })
    };

    const confirmWorkingDaysChange = () => {
        setAlert(
            <SweetAlert
                success
                style={{ display: "block"}}
                title={"Updated Working Days for " + selectedTeacher.teacher_name}
                onConfirm={() => closeAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
            >
            </SweetAlert>
        );
    };

    const noWorkingDaysAlert = () => {
        setAlert(
            <SweetAlert
                warning
                style={{ display: "block"}}
                title="No Working Days Selected"
                onConfirm={() => closeAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
            >
                Please select a working days for the teacher.
            </SweetAlert>
        );
    };

    const fillFullFormAlertTeacher = () => {
        setAlert(
            <SweetAlert
                warning
                style={{ display: "block"}}
                title="Please Fill All The Details to Sign Up a new Teacher"
                onConfirm={() => closeAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
            >
            </SweetAlert>
        );
    };

    const fillFullFormAlertAdmin = () => {
        setAlert(
            <SweetAlert
                warning
                style={{ display: "block"}}
                title="Please Fill All The Details to Sign Up a new Admin"
                onConfirm={() => closeAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
            >
            </SweetAlert>
        );
    };


    return (
        <div>
            {redirect}
            {alert}
            <br/>
            <GridContainer>
                <GridItem xs={12}>
                    <Card>
                        <CardHeader color="info">
                            <CardIcon color="rose">
                                <School/>
                            </CardIcon>
                            <h4 className={classes.cardCategory}>Teachers List</h4>
                        </CardHeader>
                        {
                            loading === true ?
                                <Loader width={'20%'}/>:
                                <CardBody>
                                    <Table
                                        tableHead={[
                                            "Name",
                                            "Email",
                                            "Phone",
                                            "Skype Username",
                                            "Categories",
                                            <Button onClick={() => setModal2(true)} disabled={!firebaseAccess} color="rose">ADD TEACHER</Button>,
                                            <Button onClick={() => setModal3(true)} disabled={!firebaseAccess} color="primary">ADD Admin</Button>
                                        ]}
                                        tableData={
                                            teachersTable
                                        }
                                    />
                                </CardBody>
                        }
                    </Card>
                </GridItem>
            </GridContainer>


            <Dialog
                classes={{
                    root: classesPopup.center,
                    paper: classesPopup.modal
                }}
                open={modal}
                transition={Transition}
                keepMounted
                onClose={() => setModal(false)}
                aria-labelledby="modal-slide-title"
                aria-describedby="modal-slide-description"
            >
                <DialogTitle
                    id="classic-modal-slide-title"
                    disableTypography
                    className={classesPopup.modalHeader}
                >
                    <Button
                        justIcon
                        className={classesPopup.modalCloseButton}
                        key="close"
                        aria-label="Close"
                        color="transparent"
                        onClick={() => setModal(false)}
                    >
                        <Close className={classesPopup.modalClose} />
                    </Button>
                    <h3 className={classesPopup.modalTitle}>Control Panel: {selectedTeacher.teacher_name}</h3>
                </DialogTitle>
                <DialogContent
                    id="modal-slide-description"
                    className={classesPopup.modalBody}
                >
                </DialogContent>
                <DialogActions
                    className={classesPopup.modalFooterCenter + " " +
                    classesPopup.modalFooterCenter + " " + classesPopup.modalFooterCenter}
                >
                    <GridContainer justify="center">
                        <GridItem  xs={5} sm={5} md={5}>
                            <div>
                                <Button disabled={!firebaseAccess} onClick={() => workingDaysModalSetup()} color="info" style={{width:"100%"}}>Edit working time</Button>
                                <Button onClick={() => contactInfoSetup()} color="info" style={{width:"100%"}}>Edit contact info</Button>
                                <Button onClick={() => categoryModalSetup()} color="info" style={{width:"100%"}}>Edit categories</Button>
                                <Button disabled={!firebaseAccess} onClick={() => warningWithConfirmMessage()} color="danger" style={{width:"100%"}}>Delete Teacher</Button>
                                <Button onClick={() => setModal(false)} color="default" style={{width:"100%"}}>Never Mind..</Button>
                            </div>
                        </GridItem>
                    </GridContainer>
                </DialogActions>
            </Dialog>

            <Dialog
                classes={{
                    root: classesPopup.center,
                    paper: classesPopup.modal
                }}
                open={contactInfoModal}
                transition={Transition}
                keepMounted
                onClose={() => setContactInfoModal(false)}
                aria-labelledby="modal-slide-title"
                aria-describedby="modal-slide-description"
            >
                <DialogTitle
                    id="classic-modal-slide-title"
                    disableTypography
                    className={classesPopup.modalHeader}
                >
                    <Button
                        justIcon
                        className={classesPopup.modalCloseButton}
                        key="close"
                        aria-label="Close"
                        color="transparent"
                        onClick={() => setContactInfoModal(false)}
                    >
                        <Close className={classesPopup.modalClose} />
                    </Button>
                    <h3 className={classesPopup.modalTitle}>Contact Info for {selectedTeacher.teacher_name}</h3>
                </DialogTitle>
                <DialogContent
                    id="modal-slide-description"
                    className={classesPopup.modalBody}
                >
                    <form id={"conactForm"}>
                        <h5>Teacher's phone number: {selectedTeacher.phone_number}</h5>
                        <TextField
                            id={"phoneForm"}
                            fullWidth
                            label={"Enter new phone number"}
                            defaultValue={selectedTeacher.phone_number}
                        />
                        <br/>
                        <h5>Teacher's Skype username: {selectedTeacher.skype_username} </h5>
                        <TextField
                            id={"skypeForm"}
                            fullWidth
                            label={"Enter new Skype username:"}
                            defaultValue={selectedTeacher.skype_username}
                        />
                    </form>
                </DialogContent>
                <DialogActions
                    className={classesPopup.modalFooterCenter + " " +
                    classesPopup.modalFooterCenter + " " + classesPopup.modalFooterCenter}
                >
                    <GridContainer justify="center">
                        <GridItem   xs={5} sm={5} md={5}>
                            <Button onClick={() => updateContactInfoFunction()} color="info" style={{width:"100%"}}>Update Changes</Button>
                            <Button onClick={() => backToControlPanel()} color="primary" style={{width:"100%"}}>Back to Control Panel</Button>
                            <Button onClick={() => setContactInfoModal(false)} color="default" style={{width:"100%"}}>Never Mind...</Button>
                        </GridItem>
                    </GridContainer>
                </DialogActions>
            </Dialog>


            <Dialog
                classes={{
                    root: classesPopup.center,
                    paper: classesPopup.modal
                }}
                open={categoryModal}
                transition={Transition}
                keepMounted
                onClose={() => closeCategoryModal()}
                aria-labelledby="modal-slide-title"
                aria-describedby="modal-slide-description"
            >
                <DialogTitle
                    id="classic-modal-slide-title"
                    disableTypography
                    className={classesPopup.modalHeader}
                >
                    <Button
                        justIcon
                        className={classesPopup.modalCloseButton}
                        key="close"
                        aria-label="Close"
                        color="transparent"
                        onClick={() => closeCategoryModal()}
                    >
                        <Close className={classesPopup.modalClose} />
                    </Button>
                    <h3 className={classesPopup.modalTitle}>Set Category for {selectedTeacher.teacher_name}</h3>
                </DialogTitle>
                <DialogContent
                    id="modal-slide-description"
                    className={classesPopup.modalBody}
                >
                    <h5>Current Categories: {selectedTeacher.category.toString()}</h5>
                    <br/>
                    <form id={"categoryForm"}>
                        <Grid item xs={12}>
                            <h5>Would you like to change the categories?</h5>
                            <Select
                                labelId="demo-mutiple-checkbox-label"
                                id="categories-checkbox"
                                multiple
                                value={category}
                                onChange={handleChange_category}
                                input={<Input />}
                                renderValue={selected => selected.join(', ')}
                                MenuProps={MenuProps}
                                style={{width:"100%"}}
                            >
                                {categories.map(name => (
                                    <MenuItem key={name} value={name}>
                                        <Checkbox checked={category.indexOf(name) > -1} />
                                        <ListItemText primary={name} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                    </form>
                </DialogContent>
                <DialogActions
                    className={classesPopup.modalFooterCenter + " " +
                    classesPopup.modalFooterCenter + " " + classesPopup.modalFooterCenter}
                >
                    <GridContainer justify="center">
                        <GridItem   xs={5} sm={5} md={5}>
                            <Button onClick={() => updateCategoryFunction()} color="info" style={{width:"100%"}}>Update Categories</Button>
                            <Button onClick={() => backToControlPanel()} color="primary" style={{width:"100%"}}>Back to Control Panel</Button>
                            <Button onClick={() => closeCategoryModal()} color="default" style={{width:"100%"}}>Never Mind...</Button>
                        </GridItem>
                    </GridContainer>
                </DialogActions>
            </Dialog>


            <Dialog
                classes={{
                    root: classesPopup.center
                }}
                open={modal2}
                transition={Transition}
                keepMounted
                onClose={() => closeModal2()}
                aria-labelledby="modal-slide-title"
                aria-describedby="modal-slide-description"
                maxWidth={"90%"}
            >
                <DialogTitle
                    id="classic-modal-slide-title"
                    disableTypography
                    className={classesPopup.modalHeader}
                >
                    <Button
                        justIcon
                        className={classesPopup.modalCloseButton}
                        key="close"
                        aria-label="Close"
                        color="transparent"
                        onClick={() => closeModal2()}
                    >
                        <Close className={classesPopup.modalClose} />
                    </Button>
                    <h3 className={classesPopup.modalTitle}>Add new teacher</h3>
                </DialogTitle>
                <DialogContent>
                    <form id="teacher-signup-form" className={classes.form}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    name="first_name"
                                    variant="outlined"
                                    fullWidth
                                    required
                                    id="first_name"
                                    label="First name"
                                    autoFocus
                                    autoComplete="first_name"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="last_name"
                                    label="Last name"
                                    name="last_name"
                                    autoComplete="last_name"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="uid"
                                    label="Teacher's uid from the Firebase auth console"
                                    name="uid"
                                    autoComplete="uid"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email"
                                    name="email"
                                    autoComplete="email"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="phone_number"
                                    label="Phone number"
                                    name="phone_number"
                                    autoComplete="phone_number"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="skype_id"
                                    label="Skype id"
                                    name="skype_id"
                                    autoComplete="skype_id"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <h5>Categories</h5>
                                <Select
                                    labelId="demo-mutiple-checkbox-label"
                                    id="categories-checkbox"
                                    multiple
                                    value={category}
                                    onChange={handleChange_category}
                                    input={<Input />}
                                    renderValue={selected => selected.join(', ')}
                                    MenuProps={MenuProps}
                                    style={{width:"100%"}}
                                >
                                    {categories.map(name => (
                                        <MenuItem key={name} value={name}>
                                            <Checkbox checked={category.indexOf(name) > -1} />
                                            <ListItemText primary={name} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Grid>
                            <Grid item xs={12}>
                                <h5>Working Days</h5>
                                <Select
                                    labelId="demo-mutiple-checkbox-label"
                                    id="working-days-checkbox"
                                    multiple
                                    value={workingDays}
                                    onChange={handleChange_working_days}
                                    input={<Input />}
                                    renderValue={selected => selected.join(', ')}
                                    MenuProps={MenuProps}
                                    style={{width:"100%"}}
                                >
                                    {days.map(name => (
                                        <MenuItem key={name} value={name}>
                                            <Checkbox checked={workingDays.indexOf(name) > -1} />
                                            <ListItemText primary={name} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Grid>
                            <Grid item xs={12}>
                                <h5>Break Time</h5>
                                <Select
                                    className={"startTime"}
                                    id="break-time-select"
                                    value={breakTime}
                                    onChange={handleChange_break}
                                >
                                    <MenuItem value={'08:00'}>10:00</MenuItem>
                                    <MenuItem value={'09:00'}>11:00</MenuItem>
                                    <MenuItem value={'10:00'}>12:00</MenuItem>
                                    <MenuItem value={'11:00'}>13:00</MenuItem>
                                    <MenuItem value={'12:00'}>14:00</MenuItem>
                                    <MenuItem value={'13:00'}>15:00</MenuItem>
                                    <MenuItem value={'14:00'}>16:00</MenuItem>
                                    <MenuItem value={'15:00'}>17:00</MenuItem>
                                    <MenuItem value={'16:00'}>18:00</MenuItem>
                                </Select>
                            </Grid>
                        </Grid>
                        <Grid>
                            <br/>
                        </Grid>
                    </form>
                </DialogContent>
                <DialogActions
                    className={classesPopup.modalFooter + " " + classesPopup.modalFooterCenter}
                >
                    <GridContainer>
                        <GridItem>
                            <Button onClick={() => teacherSignUp()} color="info">
                                ADD TEACHER
                            </Button>
                        </GridItem>
                        <GridItem>
                            <Button onClick={() => closeModal2()} color="default">
                                Close
                            </Button>
                        </GridItem>
                    </GridContainer>
                </DialogActions>
            </Dialog>

            <Dialog
                classes={{
                    root: classesPopup.center
                }}
                open={modal3}
                transition={Transition}
                keepMounted
                onClose={() => closeModal3()}
                aria-labelledby="modal-slide-title"
                aria-describedby="modal-slide-description"
                maxWidth={"90%"}
            >
                <DialogTitle
                    id="classic-modal-slide-title"
                    disableTypography
                    className={classesPopup.modalHeader}
                >
                    <Button
                        justIcon
                        className={classesPopup.modalCloseButton}
                        key="close"
                        aria-label="Close"
                        color="transparent"
                        onClick={() => closeModal3()}
                    >
                        <Close className={classesPopup.modalClose} />
                    </Button>
                    <h3 className={classesPopup.modalTitle}>Add new teacher</h3>
                </DialogTitle>
                <DialogContent>
                    <form id="admin-signup-form" className={classes.form}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    name="admin_first_name"
                                    variant="outlined"
                                    fullWidth
                                    required
                                    id="admin_first_name"
                                    label="First name"
                                    autoFocus
                                    autoComplete="first_name"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="admin_last_name"
                                    label="Last name"
                                    name="admin_last_name"
                                    autoComplete="last_name"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="admin_uid"
                                    label="Admin's uid from the Firebase auth console"
                                    name="admin_uid"
                                    autoComplete="uid"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="admin_email"
                                    label="Email"
                                    name="admin_email"
                                    autoComplete="email"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <h5>Can Access Firebase Console?</h5>
                                <Select
                                    className={"startTime"}
                                    id="grant-firebase-access"
                                    value={grantFirebaseAccess}
                                    onChange={handleChange_firebase}
                                >
                                    <MenuItem value={true}>Yes</MenuItem>
                                    <MenuItem value={false}>No</MenuItem>
                                </Select>
                            </Grid>
                        </Grid>
                        <Grid>
                            <br/>
                        </Grid>
                    </form>
                </DialogContent>
                <DialogActions
                    className={classesPopup.modalFooter + " " + classesPopup.modalFooterCenter}
                >
                    <GridContainer>
                        <GridItem>
                            <Button onClick={() => adminSignup()} color="info">
                                ADD admin
                            </Button>
                        </GridItem>
                        <GridItem>
                            <Button onClick={() => closeModal3()} color="default">
                                Close
                            </Button>
                        </GridItem>
                    </GridContainer>
                </DialogActions>
            </Dialog>

            <Dialog
                classes={{
                    root: classesPopup.center,
                    paper: classesPopup.modal
                }}
                open={workingDaysModal}
                transition={Transition}
                keepMounted
                onClose={() => closeWorkingDays()}
                aria-labelledby="modal-slide-title"
                aria-describedby="modal-slide-description"
            >
                <DialogTitle
                    id="classic-modal-slide-title"
                    disableTypography
                    className={classesPopup.modalHeader}
                >
                    <Button
                        justIcon
                        className={classesPopup.modalCloseButton}
                        key="close"
                        aria-label="Close"
                        color="transparent"
                        onClick={() => closeWorkingDays()}
                    >
                        <Close className={classesPopup.modalClose} />
                    </Button>
                    <h3 className={classesPopup.modalTitle}>Set Category for {selectedTeacher.teacher_name}</h3>
                </DialogTitle>
                <DialogContent
                    id="modal-slide-description"
                    className={classesPopup.modalBody}
                >
                    <h5>Current Working Days: {selectedTeacher.working_days.toString()}</h5>
                    <h5>Would you like to change his work days?</h5>
                    <br/>
                    <form id="working-days-change-form" className={classes.form}>
                    <Grid item xs={12}>

                        <h5>Working Days</h5>
                        <Select
                            labelId="demo-mutiple-checkbox-label"
                            id="working-days-checkbox-2"
                            multiple
                            value={workingDays}
                            onChange={handleChange_working_days}
                            input={<Input />}
                            renderValue={selected => selected.join(', ')}
                            MenuProps={MenuProps}
                            style={{width:"100%"}}
                        >
                            {days.map(name => (
                                <MenuItem key={name} value={name}>
                                    <Checkbox checked={workingDays.indexOf(name) > -1} />
                                    <ListItemText primary={name} />
                                </MenuItem>
                            ))}
                        </Select>
                    </Grid>
                    <Grid item xs={12}>
                        <h5>Break Time</h5>
                        <Select
                            className={"startTime"}
                            id="break-time-select-2"
                            value={breakTime}
                            onChange={handleChange_break}
                        >
                            <MenuItem value={'08:00'}>10:00</MenuItem>
                            <MenuItem value={'09:00'}>11:00</MenuItem>
                            <MenuItem value={'10:00'}>12:00</MenuItem>
                            <MenuItem value={'11:00'}>13:00</MenuItem>
                            <MenuItem value={'12:00'}>14:00</MenuItem>
                            <MenuItem value={'13:00'}>15:00</MenuItem>
                            <MenuItem value={'14:00'}>16:00</MenuItem>
                            <MenuItem value={'15:00'}>17:00</MenuItem>
                            <MenuItem value={'16:00'}>18:00</MenuItem>
                        </Select>
                    </Grid>
                    </form>
                </DialogContent>
                <DialogActions
                    className={classesPopup.modalFooterCenter + " " +
                    classesPopup.modalFooterCenter + " " + classesPopup.modalFooterCenter}
                >
                    <GridContainer justify="center">
                        <GridItem   xs={5} sm={5} md={5}>
                            <Button onClick={() => changeWorkingDays()} color="info" style={{width:"100%"}}>Update Working Days</Button>
                            <Button onClick={() => backToControlPanel()} color="primary" style={{width:"100%"}}>Back to Control Panel</Button>
                            <Button onClick={() => closeWorkingDays()} color="default" style={{width:"100%"}}>Never Mind...</Button>
                        </GridItem>
                    </GridContainer>
                </DialogActions>
            </Dialog>

        </div>
    );
}
