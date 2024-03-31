import { useContext } from 'react';
import CollectionContext from '../../../contexts/CollectionContext';

const CollectionSelector = () => {
  const { collection, loadCollection } = useContext(CollectionContext);

  const handleSelect = async () => {
    loadCollection('C:\\Andrew\\Just For Test'); // TODO
  };

  return (
    <button onClick={handleSelect} className="border border-black">
      {collection?.name ?? 'Select collection'}
    </button>
  );
};
export default CollectionSelector;
