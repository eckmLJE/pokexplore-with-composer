import { useParams, Link } from 'react-router';
import usePokemonDetail from '../hooks/usePokemonDetail';

function DetailPage() {
  const { pokemonName } = useParams<{ pokemonName: string }>();
  const { data, error, isLoading } = usePokemonDetail(
    pokemonName || '',
    Boolean(pokemonName)
  );

  return (
    <div>
      <Link to="/" className="text-blue-500 underline mb-4 inline-block">
        Back to list
      </Link>
      {isLoading ? (
        <div>Loading pokemon details...</div>
      ) : error ? (
        <div>Error loading pokemon details.</div>
      ) : (
        <>
          <h1 className="text-3xl font-bold capitalize mb-4">{data?.name}</h1>
          <img
            src={data?.sprites.front_default}
            alt={data?.name}
            className="mb-4"
          />
          <p>Height: {data?.height}</p>
          <p>Weight: {data?.weight}</p>
          <div className="mt-4">
            <h2 className="text-xl font-bold">Abilities</h2>
            <ul className="list-disc ml-6 mt-2">
              {data?.abilities.map((abilityInfo) => (
                <li key={abilityInfo.ability.name} className="capitalize">
                  {abilityInfo.ability.name}
                  {abilityInfo.is_hidden ? ' (hidden)' : ''}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4">
            <h2 className="text-xl font-bold">Types</h2>
            <ul className="list-disc ml-6 mt-2">
              {data?.types.map((typeInfo) => (
                <li key={typeInfo.type.name} className="capitalize">
                  {typeInfo.type.name}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default DetailPage;
