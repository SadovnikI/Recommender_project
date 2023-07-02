import * as React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { alpha, styled } from '@mui/material/styles';
import {Divider} from "@mui/material";


export default function Userdata({userData, sendUserDataToParent}) {



  const CssTextField = styled(TextField)({
      '& label.Mui-focused': {
        color: '#fa1c1c',
      },
      '& .MuiInput-underline:after': {
        borderBottomColor: '#f65656',
      },
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: '#171717',
        },
        '&:hover fieldset': {
          borderColor: '#f65656',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#f65656',
        },
      },
    });

  const CssFormControl = styled(FormControl)({
      '& label.Mui-focused': {
        color: '#fa1c1c',
      },
      '& .MuiInput-underline:after': {
        borderBottomColor: '#f65656',
      },
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderBottomColor: '#f65656',
        },
        '&:hover fieldset': {
          borderColor: '#f65656',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#f65656',
        },
      },
    });


  const [zip, setZip] = React.useState('');
  const [age, setAge] = React.useState('');
  const [occupation, setOccupation] = React.useState('');
  const [gender, setGender] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [firstName, setFirstName] = React.useState('');
  const [userId, setUserId] = React.useState('');
  const payload = {'id': userId, 'firstName': firstName, 'lastName': lastName, 'gender': gender, 'occupation': occupation, 'age': age, 'zip': zip}
  const onChangeUserId = (event: SelectChangeEvent) =>{
      const value = event.target.value
      setUserId(value)
      var tempUserData = JSON.parse(JSON.stringify(userData))
      tempUserData.id = Number(value)
      sendUserDataToParent(tempUserData)
  }

  const onChangeFirstName = (event: SelectChangeEvent) => {
      const value = event.target.value
      setFirstName(value)
      var tempUserData = JSON.parse(JSON.stringify(userData))
      tempUserData.firstName = value
      sendUserDataToParent(tempUserData)
  };

  const onChangeLastName = (event: SelectChangeEvent) => {
      const value = event.target.value
      setLastName(value)
      var tempUserData = JSON.parse(JSON.stringify(userData))
      tempUserData.lastName = value
      sendUserDataToParent(tempUserData)
  }


  const onChangeGender = (event: SelectChangeEvent) => {
      const value = event.target.value
      setGender(value)
      var tempUserData = JSON.parse(JSON.stringify(userData))
      tempUserData.gender = value
      sendUserDataToParent(tempUserData)
  }

  const onChangeOccupation = (event: SelectChangeEvent) => {
      const value = event.target.value
      setOccupation(value)
      var tempUserData = JSON.parse(JSON.stringify(userData))
      tempUserData.occupation = value
      sendUserDataToParent(tempUserData)
  }

  const onChangeAge= (event: SelectChangeEvent) => {
      const value = event.target.value
      setAge(value)
      var tempUserData = JSON.parse(JSON.stringify(userData))
      tempUserData.age = Number(value)
      sendUserDataToParent(tempUserData)
  }


  const onChangeZip = (event: SelectChangeEvent) => {
      const value = event.target.value
      setZip(value)
      var tempUserData = JSON.parse(JSON.stringify(userData))
      tempUserData.zip = Number(value)
      sendUserDataToParent(tempUserData)
  }


  const occupations = ['administrator','artist','doctor','educator','engineer','entertainment','executive','healthcare','homemaker','lawyer','librarian','marketing','none','other','programmer','retired','salesman','scientist','student','technician','writer']

  return (
    <React.Fragment>
      <Divider/>
      <Typography sx={{mt:3}} align="center" variant="h5" gutterBottom>
        Choose user by ID
      </Typography>
        <Grid sx={{mt:2, mb:4}} item xs={12}>
          <CssTextField
            id="user_id"
            name="user_id"
            label="User Id"
            fullWidth
            autoComplete="1"
            variant="standard"
            value={userId}
            onChange={onChangeUserId}
          />
        </Grid>
      <Divider>OR</Divider>
      <Typography sx={{mt:2}} align="center" variant="h5" gutterBottom>
        Create new user
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <CssTextField
            id="firstName"
            name="firstName"
            label="First name"
            fullWidth
            autoComplete="given-name"
            variant="standard"
            value={firstName}
            onChange={onChangeFirstName}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CssTextField
            id="lastName"
            name="lastName"
            label="Last name"
            fullWidth
            autoComplete="family-name"
            variant="standard"
            value={lastName}
            onChange={onChangeLastName}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
        <CssFormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Gender </FormLabel>
          <RadioGroup
            row
            id="gender"
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
            value={gender}
            onChange={onChangeGender}
          >
            <FormControlLabel value="female" control={<Radio sx={{'&, &.Mui-checked': {color: '#f65656',},}}/>} label="Female" />
            <FormControlLabel value="male" control={<Radio sx={{'&, &.Mui-checked': {color: '#f65656',},}}/>} label="Male" />
          </RadioGroup>
        </CssFormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <CssFormControl variant="standard" sx={{minWidth: 240, marginTop:1}}>
            <InputLabel id="demo-simple-select-standard-label">Occupation </InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              value={occupation}
              onChange={onChangeOccupation}
              label="Occupation"
            >
              {
                occupations.map((item) => (<MenuItem value={item} key={item}>{item.charAt(0).toUpperCase() + item.slice(1)}</MenuItem>))
              }
            </Select>
          </CssFormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <CssTextField
            id="age"
            name="age"
            label="Age"
            fullWidth
            autoComplete="22"
            variant="standard"
            value={age}
            onChange={onChangeAge}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CssTextField
            id="zip"
            name="zip"
            label="Zip / Postal code"
            fullWidth
            autoComplete="shipping postal-code"
            variant="standard"
            value={zip}
            onChange={onChangeZip}
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}