import { useState } from "react";
import Image from "next/image";

/* eslint-disable react/no-unescaped-entities */


const StoryViewer = ({ pages }) => {
  const [currentPage, setCurrentPage] = useState(0); // Page actuelle (index)

  // Fonction pour aller à la page suivante
  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Fonction pour aller à la page précédente
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Page actuelle
  const { text, image, audio } = pages[currentPage];

  return (
    <div style={{ textAlign: "center" }}>
      {/* Texte de la page */}
      <h2>Page {currentPage + 1}</h2>
      <p style={{ margin: "20px" }}>{text}</p>

      {/* Image de la page */}
      <Image 
        src={image}
        alt={`Page ${currentPage + 1}`}
        style={{ width: "300px", height: "auto", margin: "20px" }}
      />

      {/* Audio pour la page */}
      <audio controls>
        <source src={audio} type="audio/mpeg" />
        Votre navigateur ne supporte pas l'élément audio.
      </audio>

      {/* Flèches de navigation */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={prevPage} disabled={currentPage === 0} style={{ marginRight: "10px" }}>
          ◀ Précédent
        </button>
        <button onClick={nextPage} disabled={currentPage === pages.length - 1}>
          Suivant ▶
        </button>
      </div>
    </div>
  );
};

export default StoryViewer;
