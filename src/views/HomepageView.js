import SummaryCard from '../components/shared/SummaryCard';

const HOMEPAGE_REFERENCE_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCN2s1j0ltgUaA-pqFcT0fohozGc3qU7dEhz650NiKP-hgp0ZnRAoxoaXMb53I4sxAgNk06B6ho8E7bwCP6UIb65vvvwQsLrGxS8GUUV9rZyIJDG90ktw5W8DEuLElFk199exC80-m1dZBWanIsJ7ggFURur_YLbsDwJXJlHqdY75wjIQei0wkYCbS-bQn-t5zMEA5Kkz6Y1OPPGzkYjmAs9QRjwrlxxUJDw8QQP2X8hLyPOV3k7Z0b65mpHAKr-nie-k_uelxwzTvP',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDzidclUnGogUmmKmBObQBeYItVcT1Ri_2zKLeNb0KQFQBdT4rRAB0unMibZrM7VdMr45hHFPPlgbw1bDTWzb7ZkfOw0NSzodt69NnXsOZw_zTtmX3dV0WsQEEE2jb5Dh_eumC8V_FVCjuD7g-Yj5E58AaLfp0qtLqAtVUgi7KfMukPWzwG8IyEhD7cO8k-KxV9bMUbBe_kX-T4PhrMeSaNNKHtMTsVagXYMGLaYY29I8WACk5VF8QX8EBEuPWHetf3eWBMmRwSEVE5',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCXFYRKSZbr-6IEPKPG040ps2Glc3pp3Cg4q3xMn8Xo-ZRimQB4EYOTnwjN3ieslhNYOPlPgXbvLZ6CA8mmhawe4WcEe67pict5nO46Qp7CmdLUb0Os0KI_9MkKJVCPKFkDyjbjUIv38CvXEAECQrVEeb26xOtLM7B00dr9VckcoZEy1op8Hj0cXQQb45LksMBFw5gEA9GIw5kMushxeZAm5-0qNQPV5YyfUSH0pTDV3g3EO2EuXbCuDgYrYE5VML5-pbk3klSgifMd',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAhvLdwnAk-3z2NA5BkMlV6FNnMISj96ml9qnTkSgvhgN7u2p5ybxE1J3R_4QqIEnUuOs61Ft3j-GBSSqR79lncFLq1d3mdbqvWvI8QSDxgiOIEEfgWj32Ybt6f7uYH33bmr42IUXbWhXs6Uz8QNauFsvbnLO2zt7VCr-p40lAefr4_2rff_XNjm3FqcaEW-Nhn3R_eB9pv1lEzXTj5KJ550gmXV1Y3-FzbHJWuEdGAHJa4QEzS01BK7-L4MI255bNgu-seYDhd-rqp',
];

function StatusMarker({ isActive }) {
  return (
    <span className={`homepage-status-marker ${isActive ? 'is-active' : 'is-inactive'}`}>
      {isActive ? 'A' : 'I'}
    </span>
  );
}

function HomepageEntityCard({ image, isActive, meta, onOpen, title }) {
  return (
    <button type="button" className="homepage-entity-card" onClick={onOpen}>
      <div className="homepage-entity-media">
        <img src={image} alt={title} />
      </div>
      <div className="homepage-entity-card-head homepage-entity-card-head-simple">
        <div className="homepage-entity-title-group">
          <div>
            <div className="homepage-entity-title-row">
              <StatusMarker isActive={isActive} />
              <strong>{title}</strong>
            </div>
            {meta ? <p>{meta}</p> : null}
          </div>
        </div>
      </div>
    </button>
  );
}

function HomepageView({
  categories,
  featuredCategories,
  heroes,
  isLoadingNewArrivalRules,
  isLoadingTrendingProducts,
  isLoadingFeaturedCategories,
  isLoadingHeroes,
  onAddFeaturedCategory,
  onAddHero,
  onAddNewArrivalRule,
  onAddTrendingProduct,
  onViewFeaturedCategory,
  onViewHero,
  onViewNewArrivalRule,
  onViewTrendingProduct,
  newArrivalRules,
  products,
  trendingProducts,
}) {
  const activeCategories = categories.filter((item) => item.isActive);
  const productReference = [...products]
    .sort((left, right) => {
      if (left.status === 'ACTIVE' && right.status !== 'ACTIVE') return -1;
      if (left.status !== 'ACTIVE' && right.status === 'ACTIVE') return 1;
      if (left.isFeatured && !right.isFeatured) return -1;
      if (!left.isFeatured && right.isFeatured) return 1;
      return Number(right.id) - Number(left.id);
    })
    .slice(0, 7);

  const sectionCount = [
    heroes.length,
    featuredCategories.length,
    trendingProducts.length,
    newArrivalRules.length,
  ].filter((count) => count > 0).length;

  const getPreviewImage = (item, index) => item?.imageUrl || item?.primaryImageUrl || HOMEPAGE_REFERENCE_IMAGES[index % HOMEPAGE_REFERENCE_IMAGES.length];
  const getRulePreviewProduct = (rule) => [...products]
    .filter((item) => (rule?.onlyActive ? item.status === 'ACTIVE' : true))
    .filter((item) => (!rule?.categoryName ? true : item.category === rule.categoryName))
    .filter((item) => (!rule?.tagName ? true : item.tags.includes(rule.tagName)))
    .sort((left, right) => Number(right.id) - Number(left.id))[0] || null;

  return (
    <>
      <section className="summary-grid">
        <SummaryCard label="Homepage Blocks" value={sectionCount} tone="default" />
        <SummaryCard label="Hero Candidates" value={products.filter((item) => item.status === 'ACTIVE').length} tone="accent" />
        <SummaryCard label="Active Categories" value={activeCategories.length} tone="warning" />
        <SummaryCard label="Catalog Items" value={products.length} tone="danger" />
      </section>

      <section className="homepage-studio">
        <article className="homepage-stage">
          <div className="homepage-stage-head">
            <div>
              <p className="eyebrow">Homepage Studio</p>
              <h3>Merchandising layout</h3>
              <p className="homepage-stage-subtitle">Every block is now card based. Click a card to view details and manage it.</p>
            </div>
          </div>

          <section className="homepage-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Hero Section</p>
                <h3>Hero cards</h3>
              </div>
              <button type="button" className="primary-button" onClick={onAddHero}>
                New Hero
              </button>
            </div>
            <div className="homepage-entity-grid">
              {isLoadingHeroes ? (
                <div className="homepage-empty">Loading hero configuration...</div>
              ) : heroes.length ? heroes
                .slice()
                .sort((left, right) => left.displayOrder - right.displayOrder)
                .map((hero, index) => (
                  <HomepageEntityCard
                    key={hero.id}
                    image={getPreviewImage(hero, index)}
                    isActive={hero.isActive}
                    meta={hero.eyebrow || `Order ${hero.displayOrder}`}
                    onOpen={() => onViewHero(hero)}
                    title={hero.title}
                  />
                )) : (
                <div className="homepage-empty">No heroes configured yet.</div>
              )}
            </div>
          </section>

          <section className="homepage-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Featured Categories</p>
                <h3>Featured category cards</h3>
              </div>
              <button type="button" className="ghost-button" onClick={onAddFeaturedCategory}>
                New Tile
              </button>
            </div>
            <div className="homepage-entity-grid">
              {isLoadingFeaturedCategories ? (
                <div className="homepage-empty">Loading featured category configuration...</div>
              ) : featuredCategories.length ? featuredCategories
                .slice()
                .sort((left, right) => left.displayOrder - right.displayOrder)
                .map((category, index) => (
                  <HomepageEntityCard
                    key={category.id}
                    image={category.imageUrl || getPreviewImage(category, index + 1)}
                    isActive={category.isActive}
                    meta={category.caption || category.emphasis}
                    onOpen={() => onViewFeaturedCategory(category)}
                    title={category.categoryName}
                  />
                )) : (
                <div className="homepage-empty">No featured categories configured yet.</div>
              )}
            </div>
          </section>

          <section className="homepage-split-grid">
            <article className="homepage-panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Trending Products</p>
                  <h3>Trending product cards</h3>
                </div>
                <button type="button" className="ghost-button" onClick={onAddTrendingProduct}>
                  New Item
                </button>
              </div>
              <div className="homepage-entity-grid">
                {isLoadingTrendingProducts ? (
                  <div className="homepage-empty">Loading trending product configuration...</div>
                ) : trendingProducts.length ? trendingProducts
                  .slice()
                  .sort((left, right) => left.displayOrder - right.displayOrder)
                  .map((entry, index) => {
                    const product = products.find((item) => String(item.id) === entry.productId);

                    return (
                      <HomepageEntityCard
                        key={entry.id}
                        image={getPreviewImage(product, index + 2)}
                        isActive={entry.isActive}
                        meta={entry.label || product?.category || `Order ${entry.displayOrder}`}
                        onOpen={() => onViewTrendingProduct(entry)}
                        title={product?.name || 'Linked product missing'}
                      />
                    );
                  }) : (
                  <div className="homepage-empty">No trending products configured yet.</div>
                )}
              </div>
            </article>

            <article className="homepage-panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">New Arrivals</p>
                  <h3>New arrivals rule cards</h3>
                </div>
                <button type="button" className="ghost-button" onClick={onAddNewArrivalRule}>
                  New Rule
                </button>
              </div>
              <div className="homepage-entity-grid">
                {isLoadingNewArrivalRules ? (
                  <div className="homepage-empty">Loading arrivals rule configuration...</div>
                ) : newArrivalRules.length ? newArrivalRules.map((rule, index) => {
                  const previewProduct = getRulePreviewProduct(rule);
                  const title = rule.categoryName || rule.tagName || `Rule ${rule.id}`;
                  const meta = `Limit ${rule.limitCount} • ${rule.onlyActive ? 'Active only' : 'Any status'}`;

                  return (
                    <HomepageEntityCard
                      key={rule.id}
                      image={getPreviewImage(previewProduct || rule, index + 3)}
                      isActive={rule.isActive}
                      meta={meta}
                      onOpen={() => onViewNewArrivalRule(rule)}
                      title={title}
                    />
                  );
                }) : (
                  <div className="homepage-empty">No new arrivals rules configured yet.</div>
                )}
              </div>
            </article>
          </section>
        </article>

        <aside className="homepage-sidebar">
          <article className="homepage-sidebar-card">
            <div className="homepage-sidebar-head">
              <div>
                <p className="eyebrow">Catalog Reference</p>
                <h3>Products to merchandise</h3>
              </div>
              <span className="hero-chip">{products.length} total</span>
            </div>
            <p className="homepage-sidebar-copy">
              Use this panel while selecting hero links, trending items, and arrival rules.
            </p>
            <div className="homepage-product-reference-list">
              {productReference.length ? productReference.map((product, index) => (
                <article key={product.id} className="homepage-product-reference-row">
                  <div className="homepage-product-reference-media">
                    <img src={getPreviewImage(product, index)} alt={product.name} />
                  </div>
                  <div className="homepage-product-reference-copy">
                    <div className="homepage-product-reference-top">
                      <div className="homepage-product-reference-title">
                        <StatusMarker isActive={String(product.status || '').toUpperCase() === 'ACTIVE'} />
                        <strong>{product.name}</strong>
                      </div>
                    </div>
                    <p>{product.category || 'Uncategorized'}</p>
                  </div>
                </article>
              )) : (
                <div className="homepage-empty">No products available yet.</div>
              )}
            </div>
          </article>
        </aside>
      </section>
    </>
  );
}

export default HomepageView;
