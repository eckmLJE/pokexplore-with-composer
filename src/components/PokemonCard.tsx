import { Link } from 'react-router';
import usePokemonDetail from '../hooks/usePokemonDetail';

interface PokemonCardProps {
  name: string;
}

const PokemonCard = ({ name }: PokemonCardProps) => {
  const { data, error, isLoading } = usePokemonDetail(name);

  return (
    <Link
      to={`/${name}`}
      className="block bg-gray-200 p-4 rounded hover:bg-gray-300 transition-colors"
    >
      {isLoading ? (
        <p>Loading types...</p>
      ) : error ? (
        <p>Error loading types</p>
      ) : (
        <div className="flex items-center flex-wrap justify-center gap-2 mb-2">
          {data?.types.map((typeInfo) => (
            <span
              key={typeInfo.type.name}
              className="border border-gray-400 rounded-sm px-2 py-0.5 capitalize"
            >
              {typeInfo.type.name}
            </span>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="w-[96px] h-[96px] bg-gray-300 mb-2 mx-auto" />
      ) : error ? (
        <div>Error loading image</div>
      ) : (
        <>
          <img
            src={data?.sprites.front_default}
            alt={`${name} sprite`}
            className="mb-2 w-[96px] h-[96px] mx-auto"
          />
          <span className="text-lg font-medium capitalize block text-center">
            {name}
          </span>
        </>
      )}
    </Link>
  );
};

export default PokemonCard;
