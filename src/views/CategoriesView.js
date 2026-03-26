import CompactCollection, { CategoryRow, CompactTable, CompactTableHeader } from '../components/shared/CompactCollection';
import SummaryCard from '../components/shared/SummaryCard';

function CategoriesView({ categories, categorySummary, isLoadingCategories, onAddCategory, parentOptions }) {
  return (
    <>
      <section className="summary-grid">
        <SummaryCard label="Total Categories" value={categorySummary.totalCategories} tone="default" />
        <SummaryCard label="Root Categories" value={categorySummary.topLevelCategories} tone="accent" />
        <SummaryCard label="Child Categories" value={categorySummary.childCategories} tone="warning" />
        <SummaryCard label="Parent Options" value={parentOptions.length} tone="default" />
      </section>

      <CompactCollection
        addLabel="Add Category"
        countLabel={`${categories.length} records`}
        emptyLabel="No categories available yet."
        hasItems={categories.length > 0}
        isLoading={isLoadingCategories}
        loadingLabel="Loading categories..."
        onAdd={onAddCategory}
        title="Category Directory"
      >
        <CompactTable>
          <CompactTableHeader columns={['Category', 'Slug', 'Parent', 'Description', 'State']} />
          <tbody>
            {categories.map((category) => (
              <CategoryRow key={category.id} category={category} />
            ))}
          </tbody>
        </CompactTable>
      </CompactCollection>
    </>
  );
}

export default CategoriesView;
