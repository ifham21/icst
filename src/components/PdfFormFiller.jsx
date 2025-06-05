import React, { useState, useRef } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import logo from "../assets/icst-logo.png";

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

  const [signatureFile, setSignatureFile] = useState(null);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubjectChange = (type, index, key, value) => {
    const updated = [...formData[type]];
    updated[index] = { ...updated[index], [key]: value };
    setFormData((prev) => ({ ...prev, [type]: updated }));
  };

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
    "Postgraduate Diploma": [500, 650],
    "Any Other": [500, 630],
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

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

    const handleMouseDown = () => setIsDrawing(true);
  const handleMouseUp = () => setIsDrawing(false);
  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  // const validateForm = () => {
  //   const requiredFields = Object.entries(formData).filter(
  //     ([key]) =>
  //       !["guardianMobile", "hostelRequired", "olSubjects", "alSubjects"].includes(key)
  //   );
  //   const errors = [];

  //   requiredFields.forEach(([key, val]) => {
  //     if (typeof val === "string" && val.trim() === "") {
  //       errors.push(`${labelMap[key] || key} is required.`);
  //     }
  //   });

  //   const phoneFields = ["mobile", "whatsapp", "guardianMobile"];
  //   phoneFields.forEach((key) => {
  //     if (formData[key] && !/^07\d{8}$/.test(formData[key])) {
  //       errors.push(`${labelMap[key] || key} should be a valid 10-digit number (e.g., 07XXXXXXXX).`);
  //     }
  //   });

  //   if (formData.generalPaper && (!/^\d+$/.test(formData.generalPaper) || +formData.generalPaper > 100)) {
  //     errors.push("General Paper score must be a number between 0 and 100.");
  //   }

  //   const canvas = canvasRef.current;
  //   const drawnSignature = canvas ? canvas.toDataURL("image/png") : null;

  //   // if (!signatureFile && (!drawnSignature || drawnSignature === canvas?.toDataURL("image/png", 0))) {
  //   //   errors.push("Please upload or draw your signature.");
  //   // }
  //   if (!signatureFile && !hasDrawn) {
  //     errors.push("Please upload or draw your signature.");
  //   }

  //   setErrorMessages(errors);
  //   return errors.length === 0;
  // };

  const generatePDF = async () => {
    // if (!validateForm()) {
    //   setShowErrorModal(true);
    //   return;
    // }
    const existingPdfBytes = await fetch("/ApplicationV23.pdf").then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const page = pdfDoc.getPages()[0];

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

    // Signature
    const canvas = canvasRef.current;
    if (!signatureFile && canvas) {
      const dataUrl = canvas.toDataURL("image/png");
      const res = await fetch(dataUrl);
      const buf = await res.arrayBuffer();
      const img = await pdfDoc.embedPng(buf);
      page.drawImage(img, { x: 80, y: 106, width: 60, height: 30 });
    } else if (signatureFile) {
      const imageBytes = await signatureFile.arrayBuffer();
      const signatureImage = await pdfDoc.embedPng(imageBytes);
      const scaledWidth = 60;
      const scale = scaledWidth / signatureImage.width;
      const scaledHeight = signatureImage.height * scale;
      page.drawImage(signatureImage, { x: 80, y: 106, width: scaledWidth, height: scaledHeight });
    }else {
      drawText(page, "_________________________", 80, 106, font);
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Filled_Application_V23.pdf";
    link.click();
  };

  function renderField(label, name, type = "text", options = []) {
    const isDate = name.toLowerCase().includes("date") || name === "dob";
    return (
      <div style={{ margin: "0.75rem 0" }} key={name}>
        <label style={labelStyle}>{label}:</label>
        {type === "select" ? (
          <select name={name} value={formData[name]} onChange={handleChange} style={fieldStyle}>
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
            style={fieldStyle}
          />
        )}
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f4f4f4", padding: "2rem", minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          backgroundColor: "#fff",
          padding: "2rem",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <img
            src={logo}
            alt="ICST Logo"
            style={{ width: "350px", height: "160px",}}
          />
          <h1 style={{ margin: 0, fontSize: "1.8rem" }}>STUDENT APPLICATION FORM</h1>
        </div>

        {renderField("Programme", "programme", "select", programmeOptions)}
        {renderField("Hostel Required", "hostelRequired", "select", ["Yes", "No"])}
        {renderField("Name with Initials", "initials")}
        {renderField("Gender", "gender", "select", genderOptions)}

        {Object.entries(formData).map(([key, value]) => {
          if (
            Array.isArray(value) ||
            ["programme", "hostelRequired", "gender", "initials", "generalEnglish", "generalPaper", "zScore", "date"].includes(key)
          ) return null;
          return renderField(labelMap[key] || key, key);
        })}

        <h3>GCE O/L Subjects</h3>
        {formData.olSubjects.map((entry, index) => (
          <div key={index} style={{ marginBottom: "0.5rem" }}>
            <input
              placeholder={`Subject ${index + 1}`}
              value={entry.subject}
              onChange={(e) => handleSubjectChange("olSubjects", index, "subject", e.target.value)}
              style={fieldStyle}
            />
            <select
              value={entry.grade}
              onChange={(e) => handleSubjectChange("olSubjects", index, "grade", e.target.value)}
              style={fieldStyle}
            >
              <option value="">-- Grade --</option>
              {gradeOptions.map((grade) => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
        ))}

        <h3>GCE A/L Subjects</h3>
        {formData.alSubjects.map((entry, index) => (
          <div key={index} style={{ marginBottom: "0.5rem" }}>
            <input
              placeholder={`Subject ${index + 1}`}
              value={entry.subject}
              onChange={(e) => handleSubjectChange("alSubjects", index, "subject", e.target.value)}
              style={fieldStyle}
            />
            <select
              value={entry.grade}
              onChange={(e) => handleSubjectChange("alSubjects", index, "grade", e.target.value)}
              style={fieldStyle}
            >
              <option value="">-- Grade --</option>
              {gradeOptions.map((grade) => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
        ))}

        {renderField("General English", "generalEnglish", "select", gradeOptions)}
        {renderField("General Paper", "generalPaper")}
        {renderField("Z-Score", "zScore")}
        {renderField("Date", "date")}

        <h3>Signature</h3>
        <label>Upload Signature:</label>
        <input type="file" accept="image/*" onChange={(e) => setSignatureFile(e.target.files[0] || null)} />

        <label style={{ ...labelStyle, marginTop: "1rem" }}>Or Draw Signature:</label>
        <canvas
          ref={canvasRef}
          width={300}
          height={100}
          style={{ border: "1px solid #000", marginBottom: "1rem" }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        />
        <button onClick={clearCanvas} style={{ marginBottom: "1rem" }}>Clear Signature</button>

        {showErrorModal && (
          <div style={{ backgroundColor: "#ffcdd2", padding: "1rem", borderRadius: "6px", color: "#b71c1c" }}>
            <strong>Please correct the following errors:</strong>
            <ul>
              {errorMessages.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

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