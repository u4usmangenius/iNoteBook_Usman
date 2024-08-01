import React from "react";

const About = () => {
  const download = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:5000/api/results/classify/download/pdf",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add other headers here if necessary
          },
          body: JSON.stringify({
            // StartingDate: addResultStore.formData.StartDate,
          }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        // Handle the blob response (e.g., save to file, display in UI, etc.)
        console.log("Blob received", blob);
        // Example: Create a link to download the PDF
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "filename.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        console.error("Failed to fetch PDF:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching PDF:", error);
    }
  };

  return (
    <>
      <h1>This is About page</h1>
      <button
        onClick={(e) => {
          download(e);
        }}
      >
        Download PDF
      </button>
    </>
  );
};

export default About;
