import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from '@mui/material/Typography';
import Userdata from '../components/Userdata';
import Review from '../components/Review';
import MovieSelect from '../components/MovieSelect';
import conf from "../Config";
import {useContext, useEffect} from "react";
import {CurrentUserContext} from "../App";
import {useNavigate} from "react-router-dom";

const steps = ['Update User Data 🧍', 'Rate movies 🎥', 'Done 🎉🎉🎉'];






export default function ChangeUser() {

  const { currentUser, setCurrentUser } = useContext(CurrentUserContext);

  function getStepContent(step: number) {
  switch (step) {
    case 0:
      return <Userdata userData={userData} sendUserDataToParent={sendUserDataToParent} />;
    case 1:
      return <MovieSelect sendRowsToParent={sendRowsToParent} />;
    case 2:
      return <Review />;
    default:
      throw new Error('Unknown step');
  }
}
  const [activeStep, setActiveStep] = React.useState(0);
  const [parentRows, setParentRows] = React.useState([]);

  function sendRowsToParent(value) {
    console.log('aaa', value)
    setParentRows(value);
  }

  const [userData, setUserData] = React.useState({});

  function sendUserDataToParent(value){
    setUserData(value);
  }

  const [newUserId, setNewUserId] = React.useState(null);

  async function getNewUserId(){
    fetch(conf.WADNDD_API_URL + `/model/all/user/count`).then((response) => response.json()).then((data) => {
      var tempUserData = JSON.parse(JSON.stringify(userData))
      setNewUserId(data.user_count)
      tempUserData.id = data.user_count + 1
      setUserData(tempUserData)
    })
  }

  useEffect(() => {
    getNewUserId();
  },[])
  let navigate = useNavigate();
  const handleNext = () => {
    setLoading(true)
    if (activeStep === 0){
      if (newUserId === userData.id){
        console.log('aaaaaaa', userData)
        fetch(conf.WADNDD_API_URL + `/model/update_users`, {
          method: "POST",
          body: JSON.stringify({'userID': userData.id }),
          headers: {
          "Content-Type": "application/json",
          },
        }).then(()=>setLoading(false)).then(()=>setActiveStep(activeStep + 1))
      }
      setLoading(false)
      setActiveStep(activeStep + 1)
      setCurrentUser(userData.id)
    }

    if (activeStep === 1) {
      var data = []
      parentRows.map((item) => {
        data.push({
          'userID': userData.id,
          'itemID': item.id,
          'rating': Number(item.rating)
        })
      });
      fetch(conf.WADNDD_API_URL + `/model/update_ratings`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      }).then(() => {
        fetch(conf.NCF_API_URL + `/model/update_ratings`, {
          method: "POST",
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json",
          },
         }
        )
      }
      ).then(() => {
        fetch(conf.BiVAE_API_URL + `/model/update_ratings`, {
          method: "POST",
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json",
          },
         }
        )
      }
      ).then(() => setLoading(false)).then(() => setActiveStep(activeStep + 1))

    }

    if (activeStep === 2){
      navigate('/')
    }

  }
  const [loading, setLoading] = React.useState(false);

  return (
      <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
        <Paper elevation={24} sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 }, backgroundColor: '#dedcdc'}}>
          <Typography component="h1" variant="h4" align="center">
            Change User
          </Typography>
          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5}}>
            {steps.map((label) => (
              <Step key={label} sx={{
                '& .MuiStepLabel-root .Mui-completed': {
                  color:  '#ff6060', // circle color (COMPLETED)
                },
                '& .MuiStepLabel-root .Mui-active': {
                  color:  '#ff6060', // circle color (ACTIVE)
                },
              }}
              >
                <StepLabel >{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
            <React.Fragment>
              {getStepContent(activeStep)}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <LoadingButton
                  loading={loading}
                  variant="contained"
                  onClick={handleNext}
                  sx={{ mt: 3, ml: 1 }}
                  color="error"
                >
                  {activeStep === steps.length - 1 ? 'Done' : 'Next'}
                </LoadingButton>
              </Box>
            </React.Fragment>
        </Paper>
      </Container>
  );
}