import FeatureCard from "./FeatureCard";

interface Feature {
  id: string;
  image: string;
  title: string;
  description: string;
  onClick?: () => void;
}

interface FeatureSectionProps {
  features: Feature[];
}

export default function FeatureSection({ features }: FeatureSectionProps) {
  return (
    <section className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="w-full mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            주요 서비스
          </h2>
          <p className="text-xl text-gray-600">
            쾌적한 도시 생활을 위한 스마트 솔루션
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {features.map((feature) => (
            <FeatureCard
              key={feature.id}
              image={feature.image}
              title={feature.title}
              description={feature.description}
              onClick={feature.onClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
