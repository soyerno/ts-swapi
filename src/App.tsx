import React, { useEffect, useState } from 'react';
import './App.scss';
import Species from './Species';
import { SpecieSwapi } from './types/swapi';

const API_URL = 'https://swapi.dev/api/films/2/';

type SpeciesNames = 'droid' | 'human' | 'trandoshan' | 'wookie' | 'yoda';

const SPECIES_IMAGES: {[ key: string ]: string} = {
  droid:
    'https://static.wikia.nocookie.net/starwars/images/f/fb/Droid_Trio_TLJ_alt.png',
  human:
    'https://static.wikia.nocookie.net/starwars/images/3/3f/HumansInTheResistance-TROS.jpg',
  trandoshan:
    'https://static.wikia.nocookie.net/starwars/images/7/72/Bossk_full_body.png',
  wookie:
    'https://static.wikia.nocookie.net/starwars/images/1/1e/Chewbacca-Fathead.png',
  yoda: 'https://static.wikia.nocookie.net/starwars/images/d/d6/Yoda_SWSB.png',
};
const CM_TO_IN_CONVERSION_RATIO = 2.54;

const fetchClient = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  return json;
};

function useSwapiSpecies() {
  const [species, setSpecies] = useState<SpecieSwapi[]>([]);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (species.length > 0) {
      return;
    }

    const fetchSpecies = async () => {
      try {
        const film = await fetchClient(API_URL);

        const loadSpecies = film.species.map((speciesUrl: string) => {
          return fetchClient(speciesUrl);
        });

        const loadedSpecies: SpecieSwapi[] = await Promise.all(loadSpecies) || [];

        setSpecies(loadedSpecies);
      } catch (err) {
        setError(true);
      }
    };

    fetchSpecies();
  }, [species]);

  return { species, error };
}

function mapImage(speciesName: string): string {
  return SPECIES_IMAGES[
    speciesName.toLowerCase().replace('https', 'http').split("'")[0]
  ];
}

function translateToInches(averageHeight: number) {
  if (isNaN(averageHeight)) {
    return 'N/A';
  }
  return `${Math.round(averageHeight / CM_TO_IN_CONVERSION_RATIO)}"`;
}

function SpeciesList() {
  const { species, error } = useSwapiSpecies();

  if (error) {
    return <p>Something went wrong calling swapi</p>;
  }

  if (species.length > 0) {
    return <>
      {
        species.map((species: SpecieSwapi) => {
          const props = {
            key: species.name,
            name: species.name,
            classification: species.classification,
            designation: species.designation,
            height: translateToInches(species.average_height),
            image: mapImage(species.name),
            numFilms: species.films.length,
            language: species.language,
          };
          return <Species {...props} />;
        })
      }
    </>
  }

  return <p>Loading Species... please wait...</p>;
}

function App() {
  return (
    <div className="App">
      <h1>Empire Strikes Back - Species Listing</h1>
      <div className="App-species">
        <SpeciesList />
      </div>
    </div>
  );
}

export default App;
