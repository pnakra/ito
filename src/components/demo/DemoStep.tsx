import { Card } from "@/components/ui/card";

interface DemoStepProps {
  stepNumber: number;
  title: string;
  description: string;
  screenshotUrl?: string;
  borderColor?: string;
  children?: React.ReactNode;
}

const DemoStep = ({
  stepNumber,
  title,
  description,
  screenshotUrl,
  borderColor = "border-blue-500",
  children,
}: DemoStepProps) => {
  return (
    <Card className={`p-6 border-l-4 ${borderColor}`}>
      <h4 className="font-semibold text-lg mb-2">
        Step {stepNumber}: {title}
      </h4>
      <p className="text-gray-600 mb-4">{description}</p>
      
      {screenshotUrl && (
        <div className="mb-4 flex justify-center">
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden shadow-lg max-w-[300px]">
            <img 
              src={screenshotUrl} 
              alt={`Step ${stepNumber}: ${title}`}
              className="w-full h-auto"
            />
          </div>
        </div>
      )}
      
      {children}
    </Card>
  );
};

export default DemoStep;
