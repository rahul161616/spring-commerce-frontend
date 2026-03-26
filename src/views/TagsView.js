import CompactCollection, { CompactTable, CompactTableHeader, TagRow } from '../components/shared/CompactCollection';
import SummaryCard from '../components/shared/SummaryCard';

function TagsView({ isLoadingTags, onAddTag, tagSummary, tags }) {
  return (
    <>
      <section className="summary-grid">
        <SummaryCard label="Total Tags" value={tagSummary.totalTags} tone="default" />
        <SummaryCard label="Active Tags" value={tagSummary.activeTags} tone="accent" />
        <SummaryCard label="Inactive Tags" value={tagSummary.inactiveTags} tone="warning" />
        <SummaryCard label="Backend Target" value="8088" tone="default" />
      </section>

      <CompactCollection
        addLabel="Add Tag"
        countLabel={`${tags.length} records`}
        emptyLabel="No tags available yet."
        hasItems={tags.length > 0}
        isLoading={isLoadingTags}
        loadingLabel="Loading tags..."
        onAdd={onAddTag}
        title="Tag Directory"
      >
        <CompactTable>
          <CompactTableHeader columns={['Tag', 'Slug', 'Description', 'State']} />
          <tbody>
            {tags.map((tag) => (
              <TagRow key={tag.id} tag={tag} />
            ))}
          </tbody>
        </CompactTable>
      </CompactCollection>
    </>
  );
}

export default TagsView;
