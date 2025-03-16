import { Card } from "@/components/ui/card";
import { airlines } from "@/utils/airlines";
import Image from "next/image";

export default function AirlinesPage() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Partner Airlines</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.values(airlines).map((airline) => (
          <Card key={airline.code} className="p-6">
            <div className="flex items-center space-x-4">
              {airline.logo && (
                <div className="relative w-16 h-16">
                  <Image
                    src={airline.logo}
                    alt={airline.name}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <div>
                <h2 className="font-semibold text-lg">{airline.name}</h2>
                <p className="text-sm text-gray-500">
                  {airline.alliance || 'Independent'}
                </p>
                <p className="text-xs text-gray-400">Code: {airline.code}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}