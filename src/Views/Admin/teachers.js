
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
import {deleteTeacher, editTeacherCategory, editTeacherContactInfo, getAdminByUid} from "../../Actions/firestore_functions_admin";
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
    const [contactInfoModal, setContactInfoModal] = React.useState(false);
    const [categoryModal, setCategoryModal] = React.useState(false);
    const [category, setCategory] = React.useState([]);
    const [workingTimes, setWorkingTimes] = React.useState([]);
    const categories = ["Kids","Adults","Business","Spoken"];

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
        students: ""
    });
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [allTeacherMailsList, setAllTeacherMailsList] =React.useState([]);
    const [triggerMount, setTriggerMount] = React.useState(true);


    React.useEffect(() => {

        getAdminByUid(firebase.auth().currentUser.uid).then((adminData)=>{
            setAllTeacherMailsList(Object.keys(adminData.all_teachers));
            let all_teachers = adminData.all_teachers;
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
        document.getElementById("feedbackForm").reset();
        setModal2(false)
    };

    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: 48 * 4.5 + 8,
                width: "20%",
            },
        },
    };

    const timeSelect = (
    <div>
        <FormControl className={classes.formControl}>
        <InputLabel>Day</InputLabel>
        <Select
            labelId="day-select-label"
            className={"day"}
        >
            <MenuItem value={'Sunday'}>Sunday</MenuItem>
            <MenuItem value={'Monday'}>Monday</MenuItem>
            <MenuItem value={'Tuesday'}>Tuesday</MenuItem>
            <MenuItem value={'Wednesday'}>Wednesday</MenuItem>
            <MenuItem value={'Thursday'}>Thursday</MenuItem>
            <MenuItem value={'Friday'}>Friday</MenuItem>
            <MenuItem value={'Saturday'}>Saturday</MenuItem>
        </Select>
        </FormControl>
        <FormControl className={classes.formControl} >
            <InputLabel>Start time</InputLabel>
        <Select
            className={"startTime"}
        >
            <MenuItem value={'00:00'}>00:00</MenuItem>
            <MenuItem value={'01:00'}>01:00</MenuItem>
            <MenuItem value={'02:00'}>02:00</MenuItem>
            <MenuItem value={'03:00'}>03:00</MenuItem>
            <MenuItem value={'04:00'}>04:00</MenuItem>
            <MenuItem value={'05:00'}>05:00</MenuItem>
            <MenuItem value={'06:00'}>06:00</MenuItem>
            <MenuItem value={'07:00'}>07:00</MenuItem>
            <MenuItem value={'08:00'}>08:00</MenuItem>
            <MenuItem value={'09:00'}>09:00</MenuItem>
            <MenuItem value={'10:00'}>10:00</MenuItem>
            <MenuItem value={'11:00'}>11:00</MenuItem>
            <MenuItem value={'12:00'}>12:00</MenuItem>
            <MenuItem value={'13:00'}>13:00</MenuItem>
            <MenuItem value={'14:00'}>14:00</MenuItem>
            <MenuItem value={'15:00'}>15:00</MenuItem>
            <MenuItem value={'16:00'}>16:00</MenuItem>
            <MenuItem value={'17:00'}>17:00</MenuItem>
            <MenuItem value={'18:00'}>18:00</MenuItem>
            <MenuItem value={'19:00'}>19:00</MenuItem>
            <MenuItem value={'20:00'}>20:00</MenuItem>
            <MenuItem value={'21:00'}>21:00</MenuItem>
            <MenuItem value={'22:00'}>22:00</MenuItem>
            <MenuItem value={'23:00'}>23:00</MenuItem>
            <MenuItem value={'24:00'}>24:00</MenuItem>
        </Select>
        </FormControl>
        <FormControl className={classes.formControl} >
            <InputLabel>End time</InputLabel>
        <Select
            className={"endTime"}
        >
            <MenuItem value={'00:00'}>00:00</MenuItem>
            <MenuItem value={'01:00'}>01:00</MenuItem>
            <MenuItem value={'02:00'}>02:00</MenuItem>
            <MenuItem value={'03:00'}>03:00</MenuItem>
            <MenuItem value={'04:00'}>04:00</MenuItem>
            <MenuItem value={'05:00'}>05:00</MenuItem>
            <MenuItem value={'06:00'}>06:00</MenuItem>
            <MenuItem value={'07:00'}>07:00</MenuItem>
            <MenuItem value={'08:00'}>08:00</MenuItem>
            <MenuItem value={'09:00'}>09:00</MenuItem>
            <MenuItem value={'10:00'}>10:00</MenuItem>
            <MenuItem value={'11:00'}>11:00</MenuItem>
            <MenuItem value={'12:00'}>12:00</MenuItem>
            <MenuItem value={'13:00'}>13:00</MenuItem>
            <MenuItem value={'14:00'}>14:00</MenuItem>
            <MenuItem value={'15:00'}>15:00</MenuItem>
            <MenuItem value={'16:00'}>16:00</MenuItem>
            <MenuItem value={'17:00'}>17:00</MenuItem>
            <MenuItem value={'18:00'}>18:00</MenuItem>
            <MenuItem value={'19:00'}>19:00</MenuItem>
            <MenuItem value={'20:00'}>20:00</MenuItem>
            <MenuItem value={'21:00'}>21:00</MenuItem>
            <MenuItem value={'22:00'}>22:00</MenuItem>
            <MenuItem value={'23:00'}>23:00</MenuItem>
            <MenuItem value={'24:00'}>24:00</MenuItem>
        </Select>
        </FormControl>
        <Button onClick={(event) => {}} color="danger">
            Delete
        </Button>
    </div>
    )

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
        let kids = document.getElementById('kidsBox');
        let adults = document.getElementById('adultsBox');
        let business = document.getElementById('businessBox');
        let spoken = document.getElementById('spokenBox');
        if (kids.checked){
            categoryList.push('kids');
            kids.checked = false;
        }
        if (adults.checked){
            categoryList.push('adults');
            adults.checked = false;
        }
        if (business.checked){
            categoryList.push('business');
            business.checked = false;
        }
        if (spoken.checked){
            categoryList.push('spoken');
            spoken.checked = false;
        }
        if(categoryList.length === 0){
            noCategorySelectedAlert();
            return 0
        }

        editTeacherCategory(selectedTeacher.teacher_mail, categoryList).then(() =>{
            setCategoryModal(false);
            confirmCategoryUpdateAlert();
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
        document.getElementById('kidsBox').checked = false;
        document.getElementById('adultsBox').checked = false;
        document.getElementById('businessBox').checked = false;
        document.getElementById('spokenBox').checked = false;
        setCategoryModal(false);
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
        setCategoryModal(false);
        document.getElementById('kidsBox').checked = false;
        document.getElementById('adultsBox').checked = false;
        document.getElementById('businessBox').checked = false;
        document.getElementById('spokenBox').checked = false;
        setModal(true);
    };

    const handleChange = event => {
        setCategory(event.target.value);
    };

    const handleChangeMultiple = event => {
        const { options } = event.target;
        const value = [];
        for (let i = 0, l = options.length; i < l; i += 1) {
            if (options[i].selected) {
                value.push(options[i].value);
            }
        }
        setCategory(value);
    };

    const handleDay = event => {
        const { options } = event.target;
        const value = [];
        // for (let i = 0, l = options.length; i < l; i += 1) {
        //     if (options[i].selected) {
        //         value.push(options[i].value);
        //     }
        // }
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
                                            "Mail",
                                            "Phone",
                                            "Skype Username",
                                            "Categories",
                                            <Button onClick={() => setModal2(true)} color="success">ADD TEACHER</Button>
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
                                <Button onClick={() => setModal(false)} color="info" style={{width:"100%"}}>Edit working time</Button>
                                <Button onClick={() => contactInfoSetup()} color="info" style={{width:"100%"}}>Edit contact info</Button>
                                <Button onClick={() => categoryModalSetup()} color="info" style={{width:"100%"}}>Edit categories</Button>
                                <Button onClick={() => warningWithConfirmMessage()} color="danger" style={{width:"100%"}}>Delete Teacher</Button>
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
                    <h5>Would you like to change the categories?</h5>
                    <br/>
                    <form id={"categoryForm"}>
                        <Checkbox id={'kidsBox'} value={"kids"} color={'primary'} label={'Kids'}/>Kids
                        <Checkbox id={'adultsBox'} value={"adults"} color={'primary'} label={'Adults'}/>Adults
                        <Checkbox id={'businessBox'} value={"business"} color={'primary'} label={'Business'}/>Business
                        <Checkbox id={'spokenBox'} value={"spoken"} color={'primary'} label={"Spoken"}/>Spoken
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
                        onClick={() => setModal(false)}
                    >
                        <Close className={classesPopup.modalClose} />
                    </Button>
                    <h3 className={classesPopup.modalTitle}>Add new teacher</h3>
                </DialogTitle>
                <DialogContent>
                    <form id="feedbackForm" className={classes.form}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    readOnly
                                    name="first_name"
                                    variant="outlined"
                                    fullWidth
                                    id="first_name"
                                    label="First name"
                                    autoFocus
                                    autoComplete="first_name"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    readOnly
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
                                    readOnly
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
                                    readOnly
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
                                    id="demo-mutiple-checkbox"
                                    multiple
                                    value={category}
                                    onChange={handleChange}
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
                                <h5>Working hours</h5>
                                {timeSelect}

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
                            <Button onClick={() => warningWithConfirmMessage()} color="info">
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

        </div>
    );
}
