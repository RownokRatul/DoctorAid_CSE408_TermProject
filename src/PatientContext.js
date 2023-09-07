import { createContext, useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom'; // If using react-router v6
import { Dialog, DialogTitle, DialogContentText, Typography } from '@mui/material';

export const PatientContext = createContext();

export const PatientProvider = ({ children }) => {
  const initialPatientID = localStorage.getItem("patientID");
  const initialDoctorInfo = JSON.parse(localStorage.getItem("doctorInfo") || null);
  
  const [patientID, setPatientID] = useState(initialPatientID ? parseInt(initialPatientID, 10) : null);
  const [doctorInfo, setDoctorInfo] = useState(initialDoctorInfo);
  const [showInvalidIDDialog, setShowInvalidIDDialog] = useState(false);
  const [showInvalidDoctorDialog, setShowInvalidDoctorDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.removeItem("patientID");
      localStorage.removeItem("doctorInfo");
    }, 15 * 60 * 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [patientID, doctorInfo]);

  useEffect(() => {
    if(patientID !== null) {
      localStorage.setItem("patientID", patientID);
    }
    if(doctorInfo) {
      localStorage.setItem("doctorInfo", JSON.stringify(doctorInfo));
    }
  }, [patientID, doctorInfo]);

  const isPatientIDValid = () => {
    const isValid = patientID !== null && !isNaN(patientID);
    
    if (!isValid) {
      setShowInvalidIDDialog(true);
    }

    return isValid;
  };

  const isDoctorInfoValid = () => {

    console.log("Doctor Info----------------: ", doctorInfo);
    const isValid = doctorInfo !== null;
    console.log("isValid: ", isValid);


    return isValid;
  }
  
  const logoutDoctor = () => {
    console.log("Logging out doctor");
    setDoctorInfo(null);
    setPatientID(null);
    localStorage.removeItem("doctorInfo");
    localStorage.removeItem("patientID");
  };
  

  const handleCloseDialog = () => {
    setShowInvalidIDDialog(false);
  };

  return (
    <PatientContext.Provider value={{ patientID, setPatientID, isPatientIDValid, doctorInfo, setDoctorInfo,logoutDoctor,isDoctorInfoValid }}>
      {children}
      <Dialog open={showInvalidIDDialog} onClose={handleCloseDialog}>
        <DialogTitle style={{ backgroundColor: 'red', textAlign: 'center' }}>
          <Typography variant="h6" style={{ fontWeight: 'bold', color: 'white' }}>
            Invalid Patient ID
          </Typography>
        </DialogTitle>
        <DialogContentText style={{ textAlign: 'center' }}>
          Please enter a valid patient ID to continue.
        </DialogContentText>
      </Dialog>
    </PatientContext.Provider>
  );
}