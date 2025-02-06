import { useQuery, UseQueryResult } from '@tanstack/react-query';

export interface PokemonDetailResponse {
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
    [key: string]: unknown;
  };
  abilities: Array<{
    ability: {
      name: string;
      url: string;
    };
    is_hidden: boolean;
    slot: number;
  }>;
  types: Array<{
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }>;
}

const fetchPokemonDetail = async (
  name: string
): Promise<PokemonDetailResponse> => {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  if (!res.ok) throw new Error('Error fetching pokemon detail');
  return res.json();
};

export function usePokemonDetail(
  name: string,
  enabled: boolean = true
): UseQueryResult<PokemonDetailResponse, Error> {
  return useQuery({
    queryKey: ['pokemonDetail', name],
    queryFn: () => fetchPokemonDetail(name),
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
    enabled,
  });
}

export default usePokemonDetail;
