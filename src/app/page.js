/* eslint-disable react/no-unescaped-entities */

"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import React from "react";

const icons = {
  skinColors: {
    clair: "/icons/skin_clair.png",
    moyen: "/icons/skin_moyen.png",
    fonce: "/icons/skin_fonce.png",
  },
  hairColors: {
    blond: "/icons/hair_blond.png",
    brun: "/icons/hair_brun.png",
    noir: "/icons/hair_noir.png",
    roux: "/icons/hair_roux.png",
  },
  glasses: {
    oui: "/icons/glasses_yes.png",
    non: "/icons/glasses_no.png",
  },
};

const storyDurationOptions = [15, 30, 60, 120, 180, 240, 300];

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
  const [storyDuration, setStoryDuration] = useState(15);
  const [childProfile, setChildProfile] = useState({
    skinColor: "",
    hairColor: "",
    glasses: "",
  });
  const [customValues, setCustomValues] = useState({
    personality: "",
    moral: "",
  });

  const audioRef = useRef(null);

  useEffect(() => {
    if (audio && audioRef.current) {
      audioRef.current.play();
    }
  }, [audio]);

  const personalities = [
    "Aventurier",
    "Timide",
    "Curieux",
    "Créatif",
    "Courageux",
  ];
  const morals = [
    "L'amitié",
    "La persévérance",
    "Le respect",
    "Le partage",
    "La générosité",
  ];
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

  const handleStoryDurationChange = (value) => {
    const closestValue = storyDurationOptions.reduce((prev, curr) =>
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
    setStoryDuration(closestValue);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const fullPrompt = `Nom de l'enfant : ${childName}. 
      Personnalité : ${customValues.personality || personality}. 
      Moral : ${customValues.moral || moral}. 
      Tranche d'âge : ${ageRange}. 
      Durée du conte : ${storyDuration} secondes.
      Couleur de la peau : ${childProfile.skinColor}.
      Couleur des cheveux : ${childProfile.hairColor}.
      Lunettes : ${childProfile.glasses}.
      ${prompt}`;

    const storyResponse = await fetch("/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: `${fullPrompt}`, 
        duration: storyDuration }),
    });
    const storyData = await storyResponse.json();
    setStory(storyData.story);

    /** 
    const storyResponse2 = await fetch("/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "what was the previous tale" }),
    });
    const storyData2 = await storyResponse.json();
    setStory(storyData.story);
    **/
    const imageResponse = await fetch("/api/stability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ story: storyData.story }),
    });
    const imageData = await imageResponse.json();
    setImages(imageData.images);

    const { title, tale } = extractTitleAndStory(storyData.story);

    const textForAudio = `${title}. ${tale}`;

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
    setStoryDuration(15);
    setChildProfile({
      skinColor: "",
      hairColor: "",
      glasses: "",
    });
  };

  const extractTitleAndStory = (text) => {
    const titleMatch = text.match(/Titre\s*:\s*(.*?)\n/);
    const title = titleMatch ? titleMatch[1].trim() : "Sans titre";
    const tale = text.replace(/Titre\s*:\s*.*?\n/, "").trim();
    return { title, tale };
  };

  const { title, tale } = extractTitleAndStory(story);

  return (
    <div className="flex flex-col items-center justify-center  bg-gradient-to-b from-blue-200 to-orange-100 pt-10">
      <div className="w-full h-full overflow-y-visible flex flex-col items-center justify-center py-10">
        {!story ? (
          <form
            onSubmit={handleSubmit}
            className="p-8 bg-white rounded-lg shadow-xl w-full max-w-xl min-h-[500px]"
          >
            <h2 className="text-3xl font-extrabold text-orange-600 mb-6 text-center mt-4">
              Créez un conte personnalisé
            </h2>

            {/* Nom de l'enfant */}
            <div className="mb-6">
              <label
                htmlFor="childName"
                className="block text-base font-semibold text-gray-800"
              >
                <p>"Nom de l'enfant"</p>
              </label>
              <input
                id="childName"
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="mt-2 p-3 w-full rounded-md border border-gray-300 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-orange-400"
                placeholder="Entrez le nom"
              />
            </div>

            {/* Sélection de la personnalité */}
            <div className="mb-6">
              <label
                htmlFor="personality"
                className="block text-base font-semibold text-gray-800"
              >
                <p>Personnalité de l'enfant:</p>
              </label>
              <select
                id="personality"
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                className="mt-2 p-3 w-full rounded-md border border-gray-300 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-orange-400"
              >
                <option value="">Sélectionner une personnalité</option>
                {personalities.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
                <option value="Autre">Autre</option>
              </select>

              {personality === "Autre" && (
                <input
                  type="text"
                  placeholder="Entrez une personnalité"
                  value={customValues.personality}
                  onChange={(e) =>
                    setCustomValues({
                      ...customValues,
                      personality: e.target.value,
                    })
                  }
                  className="mt-3 p-3 w-full rounded-md border border-gray-300 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-orange-400"
                />
              )}
            </div>

            {/* Boutons de tranche d'âge */}
            <div className="mb-6">
              <label className="block text-base font-semibold text-gray-800">
                Tranche d'âge :
              </label>
              <div className="flex flex-row items-start">
                {ageRanges.map((age, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleAgeRangeSelect(age)}
                    className={`mt-3 p-3 w-full rounded-lg transition ${
                      ageRange === age
                        ? "bg-orange-500 text-white shadow-lg"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {age}
                  </button>
                ))}
              </div>
            </div>

            {/* Durée du conte */}
            <div className="mb-6">
              <label
                htmlFor="storyDuration"
                className="block text-base font-semibold text-gray-800"
              >
                Durée du conte (entre 15 secondes et 5 minutes):
              </label>
              <input
                id="storyDuration"
                type="range"
                min="15"
                max="300"
                step="15"
                value={storyDuration}
                onChange={(e) => handleStoryDurationChange(e.target.value)}
                className="mt-2 w-full"
              />
              <div className="mt-2 text-center text-orange-600 font-bold">
                {storyDuration < 60
                  ? `${storyDuration} secondes`
                  : `${storyDuration / 60} minutes`}
              </div>
            </div>

            {/* Personnalisation du profil de l'enfant */}
            <div className="mb-6">
              <label className="block text-base font-semibold text-gray-800">
                Personnalisation de l'enfant :
              </label>
              <div className="mt-4">
                <p className="text-sm text-gray-600">Couleur de la peau</p>
                <div className="mt-2 grid grid-cols-5 gap-3">
                  {Object.keys(icons.skinColors).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setChildProfile({ ...childProfile, skinColor: color })
                      }
                      className={`p-2 rounded-md border ${
                        childProfile.skinColor === color
                          ? "border-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      <Image
                        src={icons.skinColors[color]}
                        alt={`Skin color ${color}`}
                        width={50}
                        height={50}
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">Couleur des cheveux</p>
                <div className="mt-2 grid grid-cols-5 gap-3">
                  {Object.keys(icons.hairColors).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setChildProfile({ ...childProfile, hairColor: color })
                      }
                      className={`p-2 rounded-md border ${
                        childProfile.hairColor === color
                          ? "border-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      <Image
                        src={icons.hairColors[color]}
                        alt={`Hair color ${color}`}
                        width={50}
                        height={50}
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">Lunettes</p>
                <div className="mt-2 grid grid-cols-5 gap-3">
                  {Object.keys(icons.glasses).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setChildProfile({ ...childProfile, glasses: option })
                      }
                      className={`p-2 rounded-md border ${
                        childProfile.glasses === option
                          ? "border-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      <Image
                        src={icons.glasses[option]}
                        alt={`Glasses ${option}`}
                        width={50}
                        height={50}
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Morale du conte */}
            <div className="mb-4">
              <label className="block text-base font-semibold text-gray-800">
                Morale du conte :
              </label>
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
                  onChange={(e) =>
                    setCustomValues({
                      ...customValues,
                      moral: e.target.value,
                    })
                  }
                  className="mt-2 p-2 w-full rounded-md border-gray-300 bg-gray-100 text-gray-700"
                />
              )}
            </div>

            {/* Fil conducteur */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900">
                Fil conducteur :
              </label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mt-1 p-2 w-full rounded-md border-gray-300 bg-gray-100 text-gray-700"
              />
              <button
                type="button"
                onClick={handleSurpriseMe}
                className="mt-2 text-blue-500 hover:text-blue-700"
              >
                Surprenez-moi !
              </button>
            </div>

            <button
              type="submit"
              className="px-4 py-2 w-full text-white bg-orange-500 rounded hover:bg-orange-600"
            >
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
    </div>
  );
}
