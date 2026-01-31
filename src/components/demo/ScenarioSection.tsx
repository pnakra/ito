interface ScenarioSectionProps {
  number: number;
  title: string;
  signalColor: "green" | "yellow" | "red";
  children: React.ReactNode;
}

const colorMap = {
  green: "border-green-500",
  yellow: "border-yellow-500",
  red: "border-red-500",
};

const ScenarioSection = ({
  number,
  title,
  signalColor,
  children,
}: ScenarioSectionProps) => {
  return (
    <section className="mb-16 print:mb-12 page-break-after">
      <h2 className={`text-2xl font-bold mb-6 border-b-2 ${colorMap[signalColor]} pb-2`}>
        Scenario {number}: {title}
      </h2>
      {children}
    </section>
  );
};

export default ScenarioSection;
