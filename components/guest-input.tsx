import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, Minus } from "lucide-react";
import { useState } from "react";

interface GuestInputProps {
  value: {
    adults: number;
    children: number;
    childrenAges: number[];
  };
  onChange: (value: {
    adults: number;
    children: number;
    childrenAges: number[];
  }) => void;
}

export function GuestInput({ value, onChange }: GuestInputProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAdultsChange = (newAdults: number) => {
    if (newAdults >= 1) {
      onChange({ ...value, adults: newAdults });
    }
  };

  const handleChildrenChange = (newChildren: number) => {
    if (newChildren >= 0) {
      const newChildrenAges = [...value.childrenAges];
      if (newChildren > value.children) {
        // Add new child with default age 1
        newChildrenAges.push(1);
      } else {
        // Remove last child
        newChildrenAges.pop();
      }
      onChange({
        ...value,
        children: newChildren,
        childrenAges: newChildrenAges,
      });
    }
  };

  const handleChildAgeChange = (index: number, age: number) => {
    const newAges = [...value.childrenAges];
    newAges[index] = Math.min(Math.max(age, 1), 17); // Clamp between 1 and 17
    onChange({ ...value, childrenAges: newAges });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          <div className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            {value.adults + value.children} Guests ({value.adults} Adults
            {value.children > 0 ? `, ${value.children} Children` : ""})
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-medium">Adults</label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleAdultsChange(value.adults - 1)}
                  disabled={value.adults <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{value.adults}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleAdultsChange(value.adults + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <label className="font-medium">Children</label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleChildrenChange(value.children - 1)}
                  disabled={value.children <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{value.children}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleChildrenChange(value.children + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {value.children > 0 && (
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700">
                  Children's Ages
                </div>
                {value.childrenAges.map((age, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <label className="text-sm">Child {index + 1}</label>
                    <Input
                      type="number"
                      min="1"
                      max="17"
                      value={age}
                      onChange={(e) =>
                        handleChildAgeChange(index, parseInt(e.target.value))
                      }
                      className="w-20"
                    />
                    <span className="text-sm text-gray-500">years</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
