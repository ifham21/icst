import React, { useState, useRef, useEffect } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import SignatureCanvas from 'react-signature-canvas';
import logo from "../assets/icst-logo.png";
import applicationPdf from "../assets/ApplicationV23.pdf";

// Responsive field styles
const fieldStyle = {
  width: "100%",
  padding: "0.75rem",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "1rem",
  backgroundColor: "#fff",
  color: "#333",
  marginTop: "0.25rem",
  boxSizing: "border-box",
  appearance: "none"
};

const labelStyle = {
  display: "block",
  marginBottom: "0.25rem",
  fontWeight: "bold",
};

const errorStyle = {
  color: "#d32f2f",
  fontSize: "0.8rem",
  marginTop: "0.25rem"
};

const tabButtonStyle = (active) => ({
  padding: "0.5rem 1rem",
  backgroundColor: active ? "#c62828" : "#f5f5f5",
  color: active ? "white" : "#333",
  border: "none",
  borderRadius: "4px 4px 0 0",
  cursor: "pointer",
  fontWeight: "bold",
  flex: 1,
  textAlign: "center"
});

const PdfFormFiller = () => {
  const programmeOptions = [
    "Certificate in IT & Business",
    "Certificate in Quantity Surveying Assistant",
    "Higher Diploma in Information Technology",
    "Higher Diploma in Business & Accounting",
    "ACCA",
    "Higher Diploma in Quantity Surveying",
    "Higher Diploma in Civil Engineering",
    "Postgraduate Diploma",
    "Any Other",
  ];

  const gradeOptions = ["A", "B", "C", "S", "F"];
  const genderOptions = ["Male", "Female"];

  const labelMap = {
    dob: "Date of Birth",
    nic: "NIC No",
    district: "District",
    address: "Postal Address",
    mobile: "Mobile",
    whatsapp: "WhatsApp No",
    email: "Email",
    guardianName: "Parent/Guardian Name",
    guardianMobile: "Parent/Guardian Mobile",
    olYear: "O/L Year",
    olMedium: "O/L Medium",
    alYear: "A/L Year",
    alMedium: "A/L Medium",
    zScore: "Z-Score",
    date: "Date"
  };

  // Initialize form state
  const [formData, setFormData] = useState({
    initials: "",
    programme: "",
    hostelRequired: "",
    gender: "",
    dob: "",
    nic: "",
    district: "",
    address: "",
    mobile: "",
    whatsapp: "",
    email: "",
    guardianName: "",
    guardianMobile: "",
    olYear: "",
    olMedium: "",
    alYear: "",
    alMedium: "",
    olSubjects: Array(9).fill(0).map(() => ({ subject: "", grade: "" })),
    alSubjects: Array(3).fill(0).map(() => ({ subject: "", grade: "" })),
    generalEnglish: "",
    generalPaper: "",
    zScore: "",
    date: ""
  });

  // Validation state
  const [errors, setErrors] = useState({});
  const [isTouched, setIsTouched] = useState({});
  
  // Signature state
  const [signatureFile, setSignatureFile] = useState(null);
  const signaturePadRef = useRef(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signatureTab, setSignatureTab] = useState("upload"); // "upload" or "draw"

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Validate on change if field has been touched
    if (isTouched[name]) {
      validateField(name, value);
    }
  };

  // Handle subject changes
  const handleSubjectChange = (type, index, key, value) => {
    const updated = [...formData[type]];
    updated[index] = { ...updated[index], [key]: value };
    setFormData((prev) => ({ ...prev, [type]: updated }));
  };

  // Handle field blur (mark as touched)
  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (!isTouched[name]) {
      setIsTouched(prev => ({ ...prev, [name]: true }));
      validateField(name, value);
    }
  };

  // Validate a single field
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case "initials":
        if (!value.trim()) newErrors.initials = "Name with Initials is required";
        else delete newErrors.initials;
        break;
      
      case "programme":
        if (!value) newErrors.programme = "Programme is required";
        else delete newErrors.programme;
        break;
      
      case "hostelRequired":
        if (!value) newErrors.hostelRequired = "Hostel option is required";
        else delete newErrors.hostelRequired;
        break;
      
      case "gender":
        if (!value) newErrors.gender = "Gender is required";
        else delete newErrors.gender;
        break;
      
      case "dob":
        if (!value) newErrors.dob = "Date of Birth is required";
        else {
          const today = new Date();
          const dobDate = new Date(value);
          if (dobDate > today) newErrors.dob = "Date cannot be in the future";
          else delete newErrors.dob;
        }
        break;
      
      case "nic":
        if (!value) newErrors.nic = "NIC is required";
        else if (!/^([0-9]{9}[vVxX]|[0-9]{12})$/.test(value)) 
          newErrors.nic = "Invalid NIC format (e.g., 123456789V or 199912345678)";
        else delete newErrors.nic;
        break;
      
      case "district":
        if (!value.trim()) newErrors.district = "District is required";
        else delete newErrors.district;
        break;
      
      case "address":
        if (!value.trim()) newErrors.address = "Address is required";
        else delete newErrors.address;
        break;
      
      case "mobile":
        if (!value) newErrors.mobile = "Mobile number is required";
        else if (!/^07\d{8}$/.test(value)) 
          newErrors.mobile = "Must be 10 digits starting with 07 (e.g., 0712345678)";
        else delete newErrors.mobile;
        break;
      
      case "whatsapp":
        if (value && !/^07\d{8}$/.test(value)) 
          newErrors.whatsapp = "Must be 10 digits starting with 07 (e.g., 0712345678)";
        else delete newErrors.whatsapp;
        break;
      
      case "email":
        if (!value) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) 
          newErrors.email = "Invalid email format";
        else delete newErrors.email;
        break;
      
      case "guardianName":
        if (!value.trim()) newErrors.guardianName = "Guardian name is required";
        else delete newErrors.guardianName;
        break;
      
      case "guardianMobile":
        if (value && !/^07\d{8}$/.test(value)) 
          newErrors.guardianMobile = "Must be 10 digits starting with 07";
        else delete newErrors.guardianMobile;
        break;
      
      case "olYear":
        if (!value) newErrors.olYear = "O/L Year is required";
        else if (!/^\d{4}$/.test(value) || parseInt(value) < 1950 || parseInt(value) > new Date().getFullYear())
          newErrors.olYear = "Invalid year";
        else delete newErrors.olYear;
        break;
      
      case "alYear":
        if (!value) newErrors.alYear = "A/L Year is required";
        else if (!/^\d{4}$/.test(value) || parseInt(value) < 1950 || parseInt(value) > new Date().getFullYear())
          newErrors.alYear = "Invalid year";
        else delete newErrors.alYear;
        break;
      
      case "olMedium":
        if (!value) newErrors.olMedium = "O/L Medium is required";
        else delete newErrors.olMedium;
        break;
      
      case "alMedium":
        if (!value) newErrors.alMedium = "A/L Medium is required";
        else delete newErrors.alMedium;
        break;
      
      case "generalPaper":
        if (value && (!/^\d+$/.test(value) || parseInt(value) < 0 || parseInt(value) > 100))
          newErrors.generalPaper = "Must be between 0-100";
        else delete newErrors.generalPaper;
        break;
      
      case "date":
        if (!value) newErrors.date = "Date is required";
        else delete newErrors.date;
        break;
      
      default:
        break;
    }
    
    setErrors(newErrors);
  };


    // Validate subject groups (O/L and A/L)
  const validateSubjectGroups = (newErrors) => {
    // Validate O/L subjects
    formData.olSubjects.forEach((subject, index) => {
      const subjectKey = `olSubject_${index}`;
      if ((subject.subject && !subject.grade) || (!subject.subject && subject.grade)) {
        newErrors[subjectKey] = "Both subject and grade are required";
      } else {
        delete newErrors[subjectKey];
      }
    });

    // Validate A/L subjects
    formData.alSubjects.forEach((subject, index) => {
      const subjectKey = `alSubject_${index}`;
      if ((subject.subject && !subject.grade) || (!subject.subject && subject.grade)) {
        newErrors[subjectKey] = "Both subject and grade are required";
      } else {
        delete newErrors[subjectKey];
      }
    });

    // Check if at least one subject is entered for O/L
    const hasOLSubjects = formData.olSubjects.some(subject => subject.subject && subject.grade);
    if (!hasOLSubjects) {
      newErrors.olSubjects = "At least one O/L subject is required";
    } else {
      delete newErrors.olSubjects;
    }

    // Check if at least one subject is entered for A/L
    const hasALSubjects = formData.alSubjects.some(subject => subject.subject && subject.grade);
    if (!hasALSubjects) {
      newErrors.alSubjects = "At least one A/L subject is required";
    } else {
      delete newErrors.alSubjects;
    }
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "initials", "programme", "hostelRequired", "gender", "dob", "nic", 
      "district", "address", "mobile", "email", "guardianName", "olYear", 
      "olMedium", "alYear", "alMedium", "date"
    ];
    
    // Validate all required fields
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = `${labelMap[field] || field} is required`;
      }
    });
    
    // Validate specific fields with patterns
    if (!/^07\d{8}$/.test(formData.mobile)) {
      newErrors.mobile = "Must be 10 digits starting with 07 (e.g., 0712345678)";
    }
    
    if (formData.whatsapp && !/^07\d{8}$/.test(formData.whatsapp)) {
      newErrors.whatsapp = "Must be 10 digits starting with 07";
    }
    
    if (formData.guardianMobile && !/^07\d{8}$/.test(formData.guardianMobile)) {
      newErrors.guardianMobile = "Must be 10 digits starting with 07";
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (formData.nic && !/^([0-9]{9}[vVxX]|[0-9]{12})$/.test(formData.nic)) {
      newErrors.nic = "Invalid NIC format (e.g., 123456789V or 199912345678)";
    }
    
    if (formData.generalPaper && (!/^\d+$/.test(formData.generalPaper) || parseInt(formData.generalPaper) > 100)) {
      newErrors.generalPaper = "Must be between 0-100";
    }

    // Validate subject groups
    validateSubjectGroups(newErrors);
    
    // Validate signature
    if (signatureTab === "upload" && !signatureFile) {
      newErrors.signature = "Please upload your signature";
    } else if (signatureTab === "draw") {
      if (signaturePadRef.current && signaturePadRef.current.isEmpty()) {
        newErrors.signature = "Please draw your signature";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // PDF generation functions
  const drawText = (page, text, x, y, font, size = 10) => {
    page.drawText(text, { x, y, size, font, color: rgb(0, 0, 0) });
  };

  const drawTick = (page, x, y, font, size = 12) => {
    page.drawText("X", { x, y, size, font, color: rgb(0, 0, 0) });
  };

  const programmePositions = {
    "Certificate in IT & Business": [262, 680],
    "Certificate in Quantity Surveying Assistant": [262, 665],
    "Higher Diploma in Information Technology": [262, 650],
    "Higher Diploma in Business & Accounting": [262, 635],
    "ACCA": [262, 620],
    "Higher Diploma in Quantity Surveying": [500, 680],
    "Higher Diploma in Civil Engineering": [500, 665],
    "Higher Diploma in Quantity Surveying": [500, 650],
    "Postgraduate Diploma": [500, 635],
    "Any Other": [500, 620],
  };

  const olCoordinates = [
    { subject: [90, 330], grade: [220, 330] },
    { subject: [90, 315], grade: [220, 315] },
    { subject: [90, 300], grade: [220, 300] },
    { subject: [90, 285], grade: [220, 285] },
    { subject: [90, 270], grade: [220, 270] },
    { subject: [90, 255], grade: [220, 255] },
    { subject: [90, 240], grade: [220, 240] },
    { subject: [90, 225], grade: [220, 225] },
    { subject: [90, 210], grade: [220, 210] },
  ];

  const alCoordinates = [
    { subject: [330, 331], grade: [490, 331] },
    { subject: [330, 316], grade: [490, 316] },
    { subject: [330, 301], grade: [490, 301] },
  ];

  const renderSubjectGrade = (page, entries, coordinates, font) => {
    entries.forEach((entry, i) => {
      if (coordinates[i]) {
        drawText(page, entry.subject || "", ...coordinates[i].subject, font);
        drawText(page, entry.grade || "", ...coordinates[i].grade, font);
      }
    });
  };

  // Signature handling
  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setHasDrawn(false);
    }
  };

  // Generate PDF
  const generatePDF = async () => {
    if (!validateForm()) return;
    
    try {
          // Change this line:
    // const pdfUrl = `${process.env.PUBLIC_URL}/ApplicationV23.pdf`;
    const pdfUrl = applicationPdf; // Use the imported path

    console.log("Fetching PDF from:", pdfUrl);
      console.log("Fetching PDF from:", pdfUrl);  // Debugging line
      
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
      }
      
      const existingPdfBytes = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const page = pdfDoc.getPages()[0];

      // Draw form data
      drawText(page, formData.initials, 165, 721, font);
      
      if (programmePositions[formData.programme]) {
        const [x, y] = programmePositions[formData.programme];
        drawTick(page, x, y, font);
      }

      if (formData.hostelRequired === "Yes") drawTick(page, 208, 594, font);
      else if (formData.hostelRequired === "No") drawTick(page, 278, 594, font);

      drawText(page, formData.gender, 115, 580, font);
      drawText(page, formData.dob, 380, 580, font);
      drawText(page, formData.nic, 115, 558, font);
      drawText(page, formData.district, 340, 558, font);
      drawText(page, formData.address, 155, 535, font);
      drawText(page, formData.mobile, 113, 517, font);
      drawText(page, formData.whatsapp, 360, 517, font);
      drawText(page, formData.email, 108, 492, font);
      drawText(page, formData.guardianName, 185, 469, font);
      drawText(page, formData.guardianMobile, 192, 447, font);
      drawText(page, formData.olYear, 96, 370, font);
      drawText(page, formData.olMedium, 222, 370, font);
      drawText(page, formData.alYear, 350, 370, font);
      drawText(page, formData.alMedium, 470, 370, font);

      renderSubjectGrade(page, formData.olSubjects, olCoordinates, font);
      renderSubjectGrade(page, formData.alSubjects, alCoordinates, font);

      drawText(page, formData.generalEnglish, 490, 275, font);
      drawText(page, formData.generalPaper, 490, 258, font);
      drawText(page, formData.zScore, 470, 241, font);
      drawText(page, formData.date, 435, 106, font);

      // Handle signature
      if (signatureTab === "upload" && signatureFile) {
        const imageBytes = await signatureFile.arrayBuffer();
        const signatureImage = await pdfDoc.embedPng(imageBytes);
        const scaledWidth = 60;
        const scale = scaledWidth / signatureImage.width;
        const scaledHeight = signatureImage.height * scale;
        page.drawImage(signatureImage, { 
          x: 80, 
          y: 106, 
          width: scaledWidth, 
          height: scaledHeight 
        });
      } 
else if (signatureTab === "draw" && signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
  const dataUrl = signaturePadRef.current.toDataURL("image/png");
  const res = await fetch(dataUrl);
  const buf = await res.arrayBuffer();
  const img = await pdfDoc.embedPng(buf);

  const scaledWidth = 60; // Or whatever max width you want
  const scale = scaledWidth / img.width;
  const scaledHeight = img.height * scale;

  page.drawImage(img, {
    x: 80,
    y: 106,
    width: scaledWidth,
    height: scaledHeight
  });
}

      // Download PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Filled_Application_V23.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  // Render form field with validation
  function renderField(label, name, type = "text", options = []) {
    const isDate = name.toLowerCase().includes("date") || name === "dob";
    const error = errors[name];
    
    return (
      <div style={{ margin: "0.75rem 0" }} key={name}>
        <label style={labelStyle}>{label}:</label>
        {type === "select" ? (
          <select 
            name={name} 
            value={formData[name]} 
            onChange={handleChange}
            onBlur={handleBlur}
            style={{
              ...fieldStyle,
              borderColor: error ? "#d32f2f" : "#ccc"
            }}
          >
            <option value="">-- Select --</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <input
            type={isDate ? "date" : type}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            onBlur={handleBlur}
            style={{
              ...fieldStyle,
              borderColor: error ? "#d32f2f" : "#ccc"
            }}
          />
        )}
        {error && <div style={errorStyle}>{error}</div>}
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: "#f4f4f4", 
      padding: "1rem", 
      minHeight: "100vh",
      boxSizing: "border-box"
    }}>
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          backgroundColor: "#fff",
          padding: "1.5rem",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <img
            src={logo}
            alt="ICST Logo"
            style={{ 
              width: "100%", 
              maxWidth: "350px", 
              height: "auto",
              marginBottom: "1rem"
            }}
          />
          <h1 style={{ margin: 0, fontSize: "1.5rem" }}>STUDENT APPLICATION FORM</h1>
        </div>

        {renderField("Programme", "programme", "select", programmeOptions)}
        {renderField("Hostel Required", "hostelRequired", "select", ["Yes", "No"])}
        {renderField("Name with Initials", "initials")}
        {renderField("Gender", "gender", "select", genderOptions)}

        {Object.entries(formData).map(([key, value]) => {
          if (
            Array.isArray(value) ||
            ["programme", "hostelRequired", "gender", "initials", 
             "generalEnglish", "generalPaper", "zScore", "date"].includes(key)
          ) return null;
          return renderField(labelMap[key] || key, key);
        })}

      <div style={{ margin: "1.5rem 0" }}>
        <h3>GCE O/L Subjects</h3>
        {errors.olSubjects && <div style={errorStyle}>{errors.olSubjects}</div>}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "0.5rem"
        }}>
          {formData.olSubjects.map((entry, index) => (
            <div key={index} style={{ 
              display: "flex", 
              gap: "0.5rem",
              flexWrap: "wrap"
            }}>
              <div style={{ flex: 1 }}>
                <input
                  placeholder={`Subject ${index + 1}`}
                  value={entry.subject}
                  onChange={(e) => handleSubjectChange("olSubjects", index, "subject", e.target.value)}
                  style={{
                    ...fieldStyle,
                    borderColor: errors[`olSubject_${index}`] ? "#d32f2f" : "#ccc"
                  }}
                />
              </div>
              <div style={{ minWidth: "100px" }}>
                <select
                  value={entry.grade}
                  onChange={(e) => handleSubjectChange("olSubjects", index, "grade", e.target.value)}
                  style={{
                    ...fieldStyle,
                    borderColor: errors[`olSubject_${index}`] ? "#d32f2f" : "#ccc"
                  }}
                >
                  <option value="">-- Grade --</option>
                  {gradeOptions.map((grade) => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
              {errors[`olSubject_${index}`] && (
                <div style={{ 
                  ...errorStyle, 
                  width: "100%", 
                  marginTop: "0.25rem" 
                }}>
                  {errors[`olSubject_${index}`]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ margin: "1.5rem 0" }}>
        <h3>GCE A/L Subjects</h3>
        {errors.alSubjects && <div style={errorStyle}>{errors.alSubjects}</div>}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "0.5rem"
        }}>
          {formData.alSubjects.map((entry, index) => (
            <div key={index} style={{ 
              display: "flex", 
              gap: "0.5rem",
              flexWrap: "wrap"
            }}>
              <div style={{ flex: 1 }}>
                <input
                  placeholder={`Subject ${index + 1}`}
                  value={entry.subject}
                  onChange={(e) => handleSubjectChange("alSubjects", index, "subject", e.target.value)}
                  style={{
                    ...fieldStyle,
                    borderColor: errors[`alSubject_${index}`] ? "#d32f2f" : "#ccc"
                  }}
                />
              </div>
              <div style={{ minWidth: "100px" }}>
                <select
                  value={entry.grade}
                  onChange={(e) => handleSubjectChange("alSubjects", index, "grade", e.target.value)}
                  style={{
                    ...fieldStyle,
                    borderColor: errors[`alSubject_${index}`] ? "#d32f2f" : "#ccc"
                  }}
                >
                  <option value="">-- Grade --</option>
                  {gradeOptions.map((grade) => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
              {errors[`alSubject_${index}`] && (
                <div style={{ 
                  ...errorStyle, 
                  width: "100%", 
                  marginTop: "0.25rem" 
                }}>
                  {errors[`alSubject_${index}`]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

        {renderField("General English", "generalEnglish", "select", gradeOptions)}
        {renderField("General Paper", "generalPaper")}
        {renderField("Z-Score", "zScore")}
        {renderField("Date", "date")}

        <div style={{ margin: "1.5rem 0" }}>
          <h3>Signature</h3>
          
          <div style={{ 
            display: "flex", 
            marginBottom: "1rem",
            gap: "0.5rem"
          }}>
            <button 
              style={tabButtonStyle(signatureTab === "upload")}
              onClick={() => setSignatureTab("upload")}
            >
              Upload Signature
            </button>
            <button 
              style={tabButtonStyle(signatureTab === "draw")}
              onClick={() => setSignatureTab("draw")}
            >
              Draw Signature
            </button>
          </div>
          
          {signatureTab === "upload" && (
            <div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => {
                  setSignatureFile(e.target.files[0] || null);
                  setErrors(prev => ({ ...prev, signature: null }));
                }}
                style={{ ...fieldStyle, padding: "0.5rem" }}
              />
            </div>
          )}
          
          {signatureTab === "draw" && (
            <div>
              <div style={{ marginBottom: "1rem", position: "relative" }}>
                <SignatureCanvas
                  ref={signaturePadRef}
                  canvasProps={{
                    width: 300,
                    height: 150,
                    style: { 
                      border: "1px solid #000", 
                      width: "100%",
                      maxWidth: "300px",
                      backgroundColor: "#fff",
                      touchAction: "none"
                    }
                  }}
                  penColor="black"
                  minWidth={2}
                  maxWidth={4}
                  velocityFilterWeight={0.7}
                  onEnd={() => {
                    setHasDrawn(!signaturePadRef.current.isEmpty());
                    setErrors(prev => ({ ...prev, signature: null }));
                  }}
                />
                {!hasDrawn && (
                  <div style={{ 
                    position: "absolute", 
                    top: "50%", 
                    left: "50%", 
                    transform: "translate(-50%, -50%)", 
                    color: "#999",
                    pointerEvents: "none",
                    textAlign: "center"
                  }}>
                    Draw your signature here
                    <div style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
                      (Use mouse or finger)
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={clearSignature} 
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Clear Signature
              </button>
            </div>
          )}
          
          {errors.signature && (
            <div style={errorStyle}>{errors.signature}</div>
          )}
        </div>

        <button
          onClick={generatePDF}
          style={{
            marginTop: "1rem",
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            backgroundColor: "#c62828",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            width: "100%",
            transition: "background-color 0.3s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#0d47a1")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#c62828")}
        >
          Download Filled PDF
        </button>
      </div>
    </div>
  );
};

export default PdfFormFiller;