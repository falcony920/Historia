 "use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import React from 'react';

export default function StoryPage() {
  const [prompt, setPrompt] = useState("");
  const [childName, setChildName] = useState("");
  const [personality, setPersonality] = useState("");
  const [customPersonality, setCustomPersonality] = useState("");
  const [moral, setMoral] = useState("");
  const [story, setStory] = useState("");
  const [images, setImages] = useState([]);
  const [audio, setAudio] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [customValues, setCustomValues] = useState({ personality: "", moral: "" });
  const audioRef = useRef(null);

  useEffect(() => {
    if (audio && audioRef.current) {
      audioRef.current.play();
    }
  }, [audio]);

  // Liste des personnalités et des morales
  const personalities = ["Aventurier", "Timide", "Curieux", "Créatif", "Courageux"];
  const morals = ["L'amitié", "La persévérance", "Le respect", "Le partage", "La générosité"];
  const ageRanges = ["0-3", "4-6", "7-9", "10-12", "13+"];

  const handleAgeRangeSelect = (age) => setAgeRange(age);

  const getRandomPrompt = () => {
    const prompts = [
      "L'enfant découvre une porte secrète dans sa maison.",
      "Un dragon demande l'aide de l'enfant pour retrouver son trésor.",
      "L'enfant voyage à travers un miroir magique.",
      "Un animal parlant devient le meilleur ami de l'enfant.",
      "L'enfant doit résoudre un mystère dans une ville fantôme.",
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  };

  const handleSurpriseMe = () => {
    setPrompt(getRandomPrompt());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Préparer le prompt final pour l'API
    const fullPrompt = `Nom de l'enfant : ${childName}. 
      Personnalité : ${customValues.personality || personality}. 
      Moral : ${customValues.moral || moral}. 
      Tranche d'âge : ${ageRange}. 
      ${prompt}`;

    // Appeler l'API pour générer le conte
    const storyResponse = await fetch("/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: fullPrompt }),
    });
    const storyData = await storyResponse.json();
    setStory(storyData.story);

      // Fetching images based on the story
      const imageResponse = await fetch("/api/stability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story: storyData.story }),
      });
      const imageData = await imageResponse.json();
      setImages(imageData.images);
  
      // Extract title and tale
      const { title, tale } = extractTitleAndStory(storyData.story);
  
      // Concatenate title and tale for the audio input
      const textForAudio = `${title}. ${tale}`;
  
      // Fetching audio based on the concatenated title and tale
      const audioResponse = await fetch("/api/elevenlabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ textInput: textForAudio }),
      });
  
      const arrayBuffer = await audioResponse.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
      const blobUrl = URL.createObjectURL(blob);
      setAudio(blobUrl);
      
  };

  const resetStory = () => {
    setStory("");
    setImages([]);
    setAudio("");
    setPrompt("");
    setChildName("");
    setPersonality("");
    setCustomPersonality("");
    setMoral("");
    setCustomValues({ personality: "", moral: "" });
    setAgeRange("");
  };

  const extractTitleAndStory = (text) => {
    const titleMatch = text.match(/Titre\s*:\s*(.*?)\n/);
    const title = titleMatch ? titleMatch[1].trim() : "Sans titre";
    const tale = text.replace(/Titre\s*:\s*.*?\n/, "").trim();
    return { title, tale };
  };

  const { title, tale } = extractTitleAndStory(story);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-indigo-50 to-indigo-100">
      {!story ? (
        <form
          onSubmit={handleSubmit}
          className="p-8 bg-white rounded-lg shadow-xl w-full max-w-md"
        >
          <h2 className="text-3xl font-extrabold text-indigo-700 mb-6 text-center">
            Créez un conte personnalisé
          </h2>
  
          {/* Nom de l'enfant */}
          <div className="mb-6">
            <label htmlFor="childName" className="block text-base font-semibold text-gray-800">
              Nom de l'enfant:
            </label>
            <input
              id="childName"
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              className="mt-2 p-3 w-full rounded-md border border-gray-300 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-400"
              placeholder="Entrez le nom"
            />
          </div>
  
          {/* Sélection de la personnalité */}
          <div className="mb-6">
            <label htmlFor="personality" className="block text-base font-semibold text-gray-800">
              Personnalité de l'enfant:
            </label>
            <select
              id="personality"
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              className="mt-2 p-3 w-full rounded-md border border-gray-300 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Sélectionner une personnalité</option>
              {personalities.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
              <option value="Autre">Autre</option>
            </select>
  
            {/* Champ personnalisé pour "Autre" */}
            {personality === "Autre" && (
              <input
                type="text"
                placeholder="Entrez une personnalité"
                value={customValues.personality}
                onChange={(e) => setCustomValues({ ...customValues, personality: e.target.value })}
                className="mt-3 p-3 w-full rounded-md border border-gray-300 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-400"
              />
            )}
          </div>

                    {/* Boutons de tranche d'âge */}
                    <div className="mb-6">
            <label className="block text-base font-semibold text-gray-800">Tranche d'âge :</label>
            <div className="flex flex-row items-start">
              {ageRanges.map((age, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleAgeRangeSelect(age)}
                  className={`mt-3 p-3 w-full rounded-lg transition ${
                    ageRange === age
                      ? "bg-emerald-500 text-white shadow-lg"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>

          {/* Valeurs et morales */}
          <div className="mb-4">
            <label className="block text-base font-semibold text-gray-800">Morale du conte :</label>
            <select
              value={moral}
              onChange={(e) => setMoral(e.target.value)}
              className="mt-2 p-3 w-full rounded-md border-gray-300 bg-gray-100 text-gray-700"
            >
              <option value="">Sélectionner une valeur</option>
              {morals.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
              <option value="Autre">Autre</option>
            </select>
            {moral === "Autre" && (
              <input
                type="text"
                placeholder="Décrire la valeur"
                value={customValues.moral}
                onChange={(e) => setCustomValues({ ...customValues, moral: e.target.value })}
                className="mt-2 p-2 w-full rounded-md border-gray-300 bg-gray-100 text-gray-700"
              />
            )}

          </div>



          {/* Fil conducteur */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900">Fil conducteur :</label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-1 p-2 w-full rounded-md border-gray-300 bg-gray-100 text-gray-700"
            />
            <button type="button" onClick={handleSurpriseMe} className="mt-2 text-blue-500 hover:text-blue-700">
              Surprenez-moi !
            </button>
          </div>

          <button type="submit" className="px-4 py-2 w-full text-white bg-green-500 rounded hover:bg-green-600">
            Générer le conte
          </button>
 
        </form>
      ) : (
        <div className="flex flex-col items-center justify-center h-screen bg-indigo-50">
          <div className="p-8 bg-white rounded-lg shadow-lg w-full max-w-4xl">
            <h1 className="text-3xl font-semibold text-indigo-800 mb-6">{title}</h1>

            {/* Contenu du conte et image */}
            <div className="flex flex-col md:flex-row items-stretch gap-6 mb-6">
              {/* Section du conte */}
              <div className="flex-1 overflow-y-auto bg-gray-50 p-4 rounded-lg">
                <p className="text-lg text-gray-800 h-full whitespace-pre-line">
                  {tale}
                </p>
              </div>


              {/* Section des images */}
              {images.length > 0 && (
                <div className="flex-shrink-0 w-full md:w-1/2 bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                  <Image
                    alt="Illustration du conte"
                    width={512}
                    height={512}
                    src={`data:image/jpeg;base64,${images[0]}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Section audio en dessous */}
            {audio && (
              <div className="mb-6">
                <audio ref={audioRef} controls src={`${audio}`} className="w-full rounded-lg" />
              </div>
            )}

            {/* Bouton de réinitialisation */}
            <button
              onClick={resetStory}
              className="mt-4 px-5 py-3 text-white bg-rose-500 rounded-lg w-full hover:bg-rose-600 transition focus:outline-none focus:ring-4 focus:ring-rose-300"
            >
              Générer nouveau conte
            </button>
          </div>
        </div>
      )}
    </div>
  );
  
}

/** 
        <div>
          <h1 className="text-2xl font-bold mb-4">Votre histoire générée</h1>
          <p>{story}</p>
          <button onClick={resetStory} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">
            Réinitialiser
          </button>
        </div>
      )}
    </div>
  );
}
**/


