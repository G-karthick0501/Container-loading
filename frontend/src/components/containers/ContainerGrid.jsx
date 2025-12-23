import ContainerCard from './ContainerCard';

const USAGE_LABELS = {
  MOST_COMMON: { label: '⭐ Most Common', order: 1 },
  COMMON: { label: 'Common', order: 2 },
  SPECIALIZED: { label: 'Specialized', order: 3 },
  LAST_MILE: { label: '🚚 Last Mile', order: 4 }
};

function ContainerGrid({ containers, selectedId, recommendedId, onSelect }) {
  // Group by usage
  const grouped = containers.reduce((acc, container) => {
    const usage = container.usage || 'COMMON';
    if (!acc[usage]) acc[usage] = [];
    acc[usage].push(container);
    return acc;
  }, {});

  // Sort groups by order
  const sortedGroups = Object.entries(grouped)
    .sort(([a], [b]) => (USAGE_LABELS[a]?.order || 99) - (USAGE_LABELS[b]?.order || 99));

  if (containers.length === 0) {
    return <p className="text-gray-500 py-4">No containers available for this mode.</p>;
  }

  return (
    <div className="space-y-6">
      {sortedGroups.map(([usage, usageContainers]) => (
        <div key={usage}>
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {USAGE_LABELS[usage]?.label || usage}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {usageContainers.map((container) => (
              <ContainerCard
                key={container.id}
                container={container}
                selected={selectedId === container.id}
                recommended={recommendedId === container.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ContainerGrid;