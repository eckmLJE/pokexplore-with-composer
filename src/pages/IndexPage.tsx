import React, { useState } from 'react';
import { useQuery, useQueries, UseQueryResult } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import PokemonCard from '../components/PokemonCard';

// Existing Pokemon list response
interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: { name: string; url: string }[];
}

const fetchPokemonList = async (): Promise<PokemonListResponse> => {
  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
  if (!res.ok) throw new Error('Error fetching pokemon list');
  return res.json();
};

// Types list response for radio buttons
interface PokemonTypeListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: { name: string; url: string }[];
}

const fetchPokemonTypes = async (): Promise<PokemonTypeListResponse> => {
  const res = await fetch('https://pokeapi.co/api/v2/type');
  if (!res.ok) throw new Error('Error fetching types');
  return res.json();
};

// Response for a specific type
interface PokemonOfTypeResponse {
  pokemon: Array<{ pokemon: { name: string; url: string }, slot: number }>;
}

const fetchPokemonByType = async (type: string): Promise<PokemonOfTypeResponse> => {
  const res = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
  if (!res.ok) throw new Error('Error fetching pokemons of type');
  return res.json();
};

function IndexPage() {
  // Query for all Pokemon (151)
  const { data, error, isLoading } = useQuery<PokemonListResponse, Error>({
    queryKey: ['pokemonList'],
    queryFn: fetchPokemonList,
  });

  // Query for types list
  const {
    data: typesData,
    error: typesError,
    isLoading: typesLoading,
  } = useQuery<PokemonTypeListResponse, Error>({
    queryKey: ['pokemonTypes'],
    queryFn: fetchPokemonTypes,
  });

  // Use URL search params for search term and selected type
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';
  const typeParam = searchParams.get('type') || '';
  const selectedTypes = typeParam ? typeParam.split(',').filter(Boolean) : [];

  // Local state for pagination remains unchanged
  const [visibleCount, setVisibleCount] = useState(12);
  const typeQueries = useQueries({
    queries: selectedTypes.map((type) => ({
      queryKey: ['pokemonOfType', type],
      queryFn: () => fetchPokemonByType(type)
    }))
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Update URL search param "search" and retain current type
    setSearchParams({ search: value, type: selectedTypes.join(',') });
    setVisibleCount(12);
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const type = event.target.value;
    const newSelectedTypes = event.target.checked
      ? [...selectedTypes, type]
      : selectedTypes.filter(t => t !== type);
    setSearchParams({ search: searchTerm, type: newSelectedTypes.join(',') });
    setVisibleCount(12);
  };

  // Determine the base list to filter: always use the global list of 151, then filter by selected types if any
  let baseList: { name: string; url: string }[] = data ? data.results : [];
  if (selectedTypes.length > 0) {
    const typePokemonNames = new Set<string>();
    typeQueries.forEach((query: UseQueryResult<PokemonOfTypeResponse, Error>) => {
      if (query.data) {
        query.data.pokemon.forEach((item) => {
          typePokemonNames.add(item.pokemon.name);
        });
      }
    });
    baseList = baseList.filter(pokemon => typePokemonNames.has(pokemon.name));
  }

  // Apply search filter
  const filteredResults = baseList.filter(pokemon =>
    pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedPokemon = filteredResults.slice(0, visibleCount);

  // Determine loading state for the pokemon list
  const isPokemonLoading = selectedTypes.length > 0
    ? (typeQueries.some((query: UseQueryResult<PokemonOfTypeResponse, Error>) => query.isLoading) || isLoading)
    : isLoading;
  const pokemonError = selectedTypes.length > 0
    ? (typeQueries.find((query: UseQueryResult<PokemonOfTypeResponse, Error>) => query.error)?.error || error)
    : error;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Pokemon List</h1>
      <div className="mb-4">
        <label
          htmlFor="pokemon-search"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Search Pokemon:
        </label>
        <input
          id="pokemon-search"
          type="text"
          placeholder="Type a name to search"
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-4">
        {typesLoading ? (
          <div>Loading types...</div>
        ) : typesError ? (
          <div>Error loading types.</div>
        ) : (
          <>
            {typesData?.results.map((type) => (
              <label key={type.name} className="inline-flex items-center mr-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  name="pokemonType"
                  value={type.name}
                  onChange={handleTypeChange}
                  checked={selectedTypes.includes(type.name)}
                />
                <span className="ml-1 capitalize">{type.name}</span>
              </label>
            ))}
            {selectedTypes.length > 0 && (
              <button
                onClick={() => { setSearchParams({ search: searchTerm, type: '' }); setVisibleCount(12); }}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Clear Types
              </button>
            )}
          </>
        )}
      </div>
      {isPokemonLoading ? (
        <div>Loading pokemon...</div>
      ) : pokemonError ? (
        <div>Error loading pokemon.</div>
      ) : filteredResults.length > 0 ? (
        <>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {displayedPokemon.map((pokemon) => (
              <li key={pokemon.name}>
                <PokemonCard name={pokemon.name} />
              </li>
            ))}
          </ul>
          {filteredResults.length > visibleCount && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setVisibleCount(visibleCount + 12)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Load More
              </button>
            </div>
          )}
        </>
      ) : (
        <div>No pokemon found matching your search.</div>
      )}
    </div>
  );
}

export default IndexPage;
