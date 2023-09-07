
import React, { useState,useContext, useEffect } from 'react';
import { Button, Card, Container, Box } from '@mui/material';
import { createClient } from '@supabase/supabase-js';

import AddressCard from './Components/AddressCard';
import CurrentAddressCard from './Components/CurrentAddressCard';

import CurrentOccupationCard from './Components/CurrentOccupation';
import OccupationCard from './Components/Occupation';
import historyCard from './Components/TravelHistory';
import DiseasesCard from './Components/DiseaseCard';
import PrescriptionCard from './Components/PrescriptionUploadCard';
import { PatientContext } from '../../PatientContext';
import axios from 'axios';

const InternDoctor = () => {
  const { SUPABASE_URL } = useContext(PatientContext);
  const { SUPABASE_ANN_KEY } = useContext(PatientContext);

  const {phoneNumber}=useContext(PatientContext);
  const [patientInfo, setPatientInfo] = useState(null); // To store the search results

  const [page, setPage] = useState(1); // State to manage the current page
  const [info, setInfo] = useState({
    
    currentAddress: { name: '', from: '' },
    addresses: [],
    currentOccupation: { name: '', from: '' },
    occupations: [],
    histories: [] 

  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post('api/v0/search_patient/', {
          phone: phoneNumber,
        });
        setPatientInfo(response.data.data);
        console.log("response",response.data);

        
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []); 

 
  useEffect(() => {
    if(patientInfo) {
      const addressLen = patientInfo.addresses.length;
      const occupationLen = patientInfo.occupations.length;

      setInfo({
        currentAddress: { 
          name: patientInfo.addresses[addressLen - 1], 
          from: new Date(patientInfo.address_from[addressLen - 1]).toISOString().split('T')[0]
        },
        addresses: patientInfo.addresses.slice(0, addressLen - 1).map((addr, index) => ({
          name: addr,
          from: new Date(patientInfo.address_from[index]).toISOString().split('T')[0],
          to: new Date(patientInfo.address_to[index]).toISOString().split('T')[0]
        })),
        currentOccupation: {
          name: patientInfo.occupations[occupationLen - 1],
          from: new Date(patientInfo.occupation_from[occupationLen - 1]).toISOString().split('T')[0]
        },
        occupations: patientInfo.occupations.slice(0, occupationLen - 1).map((occupation, index) => ({
          name: occupation,
          from: new Date(patientInfo.occupation_from[index]).toISOString().split('T')[0],
          to: new Date(patientInfo.occupation_to[index]).toISOString().split('T')[0]
        })),
        histories: [] // Assuming patientInfo doesn't have histories for now
      });
      setSelectedDiseases([]); // Assuming patientInfo doesn't have diseases for now
      setPrescriptions([{ file: '', date: '' }]); // Assuming patientInfo doesn't have prescriptions for now
    }
}, [patientInfo]);




 
  const handleCurrentAddressChange = (field, value) => {
    setInfo({ ...info, currentAddress: { ...info.currentAddress, [field]: value } });
  };

  const handleCurrentOccupationChange = (field, value) => {
    setInfo({ ...info, currentOccupation: { ...info.currentOccupation, [field]: value } });
};

  

    const handleAddressChange = (index, field, value) => {
        const newAddresses = [...info.addresses];
        newAddresses[index][field] = value;
        setInfo({ ...info, addresses: newAddresses });
    };

    const handleOccupationChange = (index, field, value) => {
      const newOccupations = [...info.occupations];
      newOccupations[index][field] = value;
      setInfo({ ...info, occupations: newOccupations });
    };
    const handlehistoryChange = (index, field, value) => {
      const newhistories = [...info.histories];
      newhistories[index][field] = value;
      setInfo({ ...info, histories: newhistories });
    };

    const addAddress = () => {
        setInfo({ ...info, addresses: [...info.addresses, { name: '', from: '', to: '' }] });
    };

    const addOccupation = () => {
      setInfo({ ...info, occupations: [...info.occupations, { name: '', from: '', to: '' }] });
    };
    const addhistory = () => {
      setInfo({ ...info, histories: [...info.histories, { name: '', from: '', to: '' }] });
    };

    const [selectedDiseases, setSelectedDiseases] = useState([]);
    const [prescriptions, setPrescriptions] = useState([{ file: '', date: '' }]);

    const handleDiseaseSelection = (disease) => {
        setSelectedDiseases(selectedDiseases.includes(disease)
        ? selectedDiseases.filter(d => d !== disease)
        : [...selectedDiseases, disease]);
    };

    const handlePrescriptionChange = (index, field, value) => {
        const newPrescriptions = [...prescriptions];
        newPrescriptions[index][field] = value;
        setPrescriptions(newPrescriptions);
    };

    const addPrescription = () => {
        setPrescriptions([...prescriptions, { file: '', date: '' }]);
    };

    const handleNext= () => {
    
    setPage(2);
  }

  const uploadFileAndGetURL = async (file) => {

    console.log(SUPABASE_URL);
    console.log(SUPABASE_ANN_KEY);

    const bucket = "prescriptions";
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANN_KEY);

    const { error } = await supabase.storage.from(bucket).upload(file.name, file);
  
    if (error) {
      console.error("Upload error", error);
      return null;
    }
    return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${encodeURIComponent(file.name)}`;
  };


  const handleFinalSubmit = async () => {
    // Combine all the information collected across the two pages

    const file_URL = await uploadFileAndGetURL(prescriptions[0].file);
    console.log(file_URL);

    const result = {
      addresses: [info.currentAddress.name, ...info.addresses.map(a => a.name)],
      address_from: [info.currentAddress.from, ...info.addresses.map(a => a.from)],
      address_to: info.addresses.map(a => a.to),
      occupations: [info.currentOccupation.name, ...info.occupations.map(a => a.name)],
      occupation_from: [info.currentOccupation.from, ...info.occupations.map(a => a.from)],
      occupation_to: info.occupations.map(a => a.to),
      histories: info.histories.map(a => a.name),
      history_from: info.histories.map(a => a.from),
      history_to: info.histories.map(a => a.to),
      diseases: selectedDiseases,
      prescriptions: file_URL,
    };
  
    // Output the final result to the console
    console.log(JSON.stringify(result));
  };

  return (
    <Container maxWidth="md">
      <Box bgcolor="background.paper" p={3} boxShadow={20} borderRadius={2} marginTop={10}>
        {page === 1 ? (
          <>
             <Box mb={2}>
          <Card>
            <CurrentAddressCard currentAddress={info.currentAddress} handleChange={handleCurrentAddressChange} />
          </Card>
        </Box>
        <Box mb={2}>
          <Card>
            <AddressCard addresses={info.addresses} handleAddressChange={handleAddressChange} addAddress={addAddress} />
          </Card>
        </Box>


        <Box mb={2}>
          <Card>
            <CurrentOccupationCard currentOccupation={info.currentOccupation} handleChange={handleCurrentOccupationChange} />
          </Card>
        </Box>
        <Box mb={2}>
          <Card>
            <OccupationCard occupations={info.occupations} handleOccupationChange={handleOccupationChange} addOccupation={addOccupation} />
          </Card>
        </Box>

        

        <Box mb={2}>
          <Card>
            <historyCard histories={info.histories} handlehistoryChange={handlehistoryChange} addhistory={addhistory} />
          </Card>
        </Box>
            <Button variant="contained" color="primary" onClick={handleNext}>Next</Button>
          </>
        ) : (
          <>
            <Box mb={2}>
              <Card>
                <DiseasesCard selectedDiseases={selectedDiseases} handleDiseaseSelection={handleDiseaseSelection} />
              </Card>
            </Box>
            <Box mb={2}>
              <Card>
                <PrescriptionCard prescriptions={prescriptions} handlePrescriptionChange={handlePrescriptionChange} addPrescription={addPrescription} />
              </Card>
            </Box>
            <Button variant="contained" color="primary" onClick={handleFinalSubmit}>Submit</Button>
          </>
        )}
      </Box>
    </Container>
  );
};

export default InternDoctor;