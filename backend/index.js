const connectToMongo = require("./db");
const express = require("express");
var cors = require("cors");
const PDFDocument = require("pdfkit");

connectToMongo();
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const students = Array.from({ length: 20 }, (v, i) => ({
  studentId: i + 1,
  stdRollNo: `10${i + 1}`,
  fullName: `Student ${i + 1}`,
}));

// Static data for student results
const allStudentsResults = students.map((student, index) => ({
  studentId: student.studentId,
  stdRollNo: student.stdRollNo,
  fullName: student.fullName,
  total_ObtMarks: 80 + index * 5, // Example obtained marks
  total_totMarks: 100, // Example total marks
}));

app.post("/api/results/classify/download/pdf", (req, res) => {
  // Static data for the request body
  const Batch = "2024";
  const ClassName = "10th Grade";
  const sectionName = "A";
  const StartingDate = "2024-01-01";
  const EndingDate = "2024-06-30";

  const allStudents = allStudentsResults.flat();

  // Example institute name
  let instituteName = "Best Institute for Students";

  // Generate PDF
  const pdf = new PDFDocument();
  const filename = `results${Batch}-${ClassName}-${sectionName}.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  pdf.pipe(res);
  const labelFont = "Helvetica-Bold";
  const valueFont = "Helvetica";
  const fontSize = 12;

  const colWidths = [65, 113, 80, 60, 80, 65, 100];
  const headers = [
    "Roll No",
    "Name",
    "Obtained",
    "Total",
    "Percentage",
    "Position",
  ];

  const createHeader = () => {
    pdf.font(labelFont).fontSize(20);
    const pageWidth = pdf.page.width;
    const textWidth = pdf.widthOfString(instituteName);
    const xPosition = (pageWidth - textWidth) / 2;
    pdf.text(instituteName, xPosition, 54);

    pdf.font(labelFont).fontSize(12);
    pdf.font(labelFont).fontSize(fontSize);
    pdf.text("Batch:", 50, 90);
    pdf.text("Class:", 200, 90);
    pdf.text("Section:", 50, 110);
    pdf.text("Time Span:", 200, 110);
    pdf.font(valueFont).fontSize(fontSize);
    pdf.text(Batch, 120, 90);
    pdf.text(ClassName, 280, 90);
    pdf.text(sectionName?.slice(0, 10), 120, 110);
    pdf.text(`${StartingDate} to ${EndingDate}`, 280, 110);

    pdf.font(labelFont).fontSize(17);
    pdf.text("Result", 50, 140);
    pdf.fontSize(fontSize);
    pdf.font(valueFont);
    pdf.font(labelFont).fontSize(fontSize);

    pdf.opacity(0.11);
    pdf.fillColor("Charcoal Gray");
    pdf.font(valueFont).fontSize(41);
    pdf.text(instituteName, xPosition, 365);
    pdf.opacity(1);
    pdf.fillColor("black");
    pdf.fontSize(12);

    pdf.font(valueFont);
  };

  const secondaryHeader = () => {
    let x = 85;
    pdf.font(labelFont);
    pdf.fontSize(fontSize);
    headers.forEach((header, index) => {
      pdf.text(header, x, 170);
      x += colWidths[index];
    });
    pdf.font(valueFont);
  };

  const addSignatureAndDate = () => {
    pdf.font(labelFont).fontSize(12);
    pdf.moveDown(2);
    pdf.font(labelFont).fontSize(12);
    pdf.text("Signature__________________", 40, 680);
    pdf.text("Date_______________", 350, 700);
    pdf.text("Stamp__________________", 40, 700);
  };

  const addRowsToTable = (start, end) => {
    let y = 190;

    for (let i = start; i < end && i < allStudents.length; i++) {
      let x = 85;
      let percntg =
        (allStudents[i].total_ObtMarks / allStudents[i].total_totMarks) * 100;
      const rowData = [
        allStudents[i].stdRollNo,
        allStudents[i].fullName?.slice(0, 21),
        allStudents[i].total_ObtMarks,
        allStudents[i].total_totMarks,
        percntg.toFixed(1),
      ];

      // Calculate the position correctly
      const position = i - start + 1;

      let positionSuffix;
      if (position === 1) {
        positionSuffix = "1st";
      } else if (position === 2) {
        positionSuffix = "2nd";
      } else if (position === 3) {
        positionSuffix = "3rd";
      } else {
        positionSuffix = position.toString() + "th";
      }
      rowData.push(positionSuffix);

      pdf.font(valueFont);
      rowData.forEach((data, index) => {
        pdf.text(data?.toString(), x, y);
        x += colWidths[index];
      });
      pdf.moveDown(1);
      y += 20;
    }
  };

  const createPDF = () => {
    let currentIndex = 0;
    let itemsPerPage = 21;
    let totalPages = Math.ceil(allStudents.length / itemsPerPage);

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      if (pageIndex > 0) {
        pdf.addPage();
      }
      createHeader();
      secondaryHeader();
      addRowsToTable(currentIndex, currentIndex + itemsPerPage);
      currentIndex += itemsPerPage;

      if (pageIndex === totalPages - 1) {
        addSignatureAndDate();
      }
    }
    pdf.end();
  };

  createPDF();
});
// Available Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

app.listen(port, () => {
  console.log(`iNotebook backend listening at http://localhost:${port}`);
});
