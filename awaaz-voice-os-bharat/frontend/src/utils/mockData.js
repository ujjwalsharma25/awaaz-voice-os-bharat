export const MOCK_USERS = {
  "9528603439": {
    name:"UJJWAL SHARMA",    nameHi:"उज्ज्वल शर्मा",
    phone:"9528603439",     aadhaar:"XXXX XXXX 3456",
    village:"KANKER KHERA",       villageHi:"कांकर खेड़ा",
    district:"MEERUT",    districtHi:"मेरठ",
    state:"Uttar Pradesh",  stateHi:"उत्तर प्रदेश",
    pincode:"250001",       rationCard:"UP-2024-88821",
    jobCard:"UP/VNS/001/0042", preferredLanguage:"hi", avatar:"👨‍🌾",
  },
  "7310808564": {
    name:"SHUBHAM TOMAR",     nameHi:"शुभम तोमर",
    phone:"7310808564",     aadhaar:"XXXX XXXX 7890",
    village:"KANKER KHERA",    villageHi:"कांकर खेड़ा",
    district:"MEERUT", districtHi:"मेरठ",
    state:"UTTAR PRADESH",          stateHi:"उत्तर प्रदेश",
    pincode:"842001",       rationCard:"BR-2023-44321",
    jobCard:"BR/MZF/002/0018", preferredLanguage:"hi", avatar:"👩‍🌾",
  },
  "9068200760": {
    name:"Aastha Kaushik",     nameHi:"आस्था कौशिक",
    phone:"9068200760",     aadhaar:"XXXX XXXX 2345",
    village:"KANKER KHERA",    villageHi:"कांकर खेड़ा",
    district:"MEERUT",   districtHi:"मेरठ",
    state:"UTTAR PRADESH",        stateHi:"उत्तर प्रदेश",
    pincode:"380001",       rationCard:"GJ-2024-11234",
    jobCard:"GJ/AHM/003/0091", preferredLanguage:"gu", avatar:"👨‍🌾",
  },
  "76688 52397": {
    name:"NISHANT KUMAR",    nameHi:"निशांत कुमार",
    phone:"76688 52397",     aadhaar:"XXXX XXXX 6789",
    village:"KANKER KHERA",    villageHi:"कांकर खेड़ा",
    district:"BAGPAT",   districtHi:"बागपत",
    state:"UTTAR PRADESH",     stateHi:"उत्तर प्रदेश",
    pincode:"613001",       rationCard:"TN-2023-55678",
    jobCard:"TN/TNJ/004/0023", preferredLanguage:"ta", avatar:"👩‍🌾",
  },
  "9389987053": {
    name:"Aanya Malik",    nameHi:"आन्या मालिक",
    phone:"9389987053",     aadhaar:"XXXX XXXX 6789",
    village:"KANKER KHERA",    villageHi:"कांकर खेड़ा",
    district:"BAGPAT",   districtHi:"बागपत",
    state:"UTTAR PRADESH",     stateHi:"उत्तर प्रदेश",
    pincode:"613001",       rationCard:"TN-2023-55678",
    jobCard:"TN/TNJ/004/0023", preferredLanguage:"ta", avatar:"👩‍🌾",
  },
};

export const getMockUser = (phone) =>
  MOCK_USERS[phone] || {
    name:"New User",     nameHi:"नया उपयोगकर्ता",
    phone,               aadhaar:"XXXX XXXX 0000",
    village:"",          villageHi:"",
    district:"",         districtHi:"",
    state:"",            stateHi:"",
    pincode:"",          rationCard:"",
    jobCard:"",          preferredLanguage:"hi",
    avatar:"👤",
  };

export const generateOTP = () => String(Math.floor(1000 + Math.random() * 9000));