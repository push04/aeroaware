import { LocationSearch } from '../LocationSearch';

export default function LocationSearchExample() {
  return (
    <div className="flex justify-center p-8 bg-background">
      <LocationSearch
        currentLocation="New Delhi, India"
        onLocationSelect={(loc) => console.log('Location selected:', loc)}
      />
    </div>
  );
}
