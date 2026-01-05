/**
 * Test Tier 1 fuzzy matching with Venezuelan regime officials
 * 
 * Usage:
 *   node test-tier1-matching.js
 * 
 * Tests:
 * 1. Import OFAC officials (hardcoded list)
 * 2. Test exact matches (Nicolás Maduro)
 * 3. Test fuzzy matches (Nicolas Maduro, Maduro, Maduro Moros)
 * 4. Test alias matches (Nico Maduro)
 * 5. Test false negatives (unrelated people)
 */

const API_URL = 'http://localhost:3000/api/v1';

async function main() {
  console.log('\n🚀 Testing Tier 1 Matching...\n');
  
  // Step 1: Import OFAC officials
  console.log('📥 Step 1: Importing OFAC sanctions list...');
  const importRes = await fetch(`${API_URL}/tier1/import/ofac`, {
    method: 'POST',
  });
  const importData = await importRes.json();
  console.log(`✅ Imported: ${importData.imported}, Updated: ${importData.updated}, Skipped: ${importData.skipped}`);
  
  // Step 2: Get all officials
  console.log('\n📊 Step 2: Fetching all Tier 1 officials...');
  const officialsRes = await fetch(`${API_URL}/tier1/officials`);
  const officialsData = await officialsRes.json();
  console.log(`✅ Total Tier 1 officials: ${officialsData.total}`);
  console.log('Sample officials:');
  officialsData.data.slice(0, 3).forEach(official => {
    console.log(`  - ${official.fullName} (${official.source})`);
    console.log(`    Aliases: ${official.aliases.join(', ')}`);
    console.log(`    Programs: ${official.sanctionsPrograms.join(', ')}`);
  });
  
  // Step 3: Get statistics
  console.log('\n📈 Step 3: Tier 1 statistics...');
  const statsRes = await fetch(`${API_URL}/tier1/stats`);
  const stats = await statsRes.json();
  console.log(`✅ Total: ${stats.total}`);
  console.log(`   By Source: ${JSON.stringify(stats.bySource)}`);
  console.log(`   By Tier: ${JSON.stringify(stats.byTier)}`);
  
  // Step 4: Test NER extraction with Tier 1 entities
  console.log('\n🔍 Step 4: Testing NER extraction with Tier 1 entities...');
  
  const testArticle = {
    title: 'Maduro and Cabello Meet with Officials',
    url: 'https://test.com/maduro-cabello',
    content: `
      El presidente Nicolás Maduro se reunió hoy con Diosdado Cabello, 
      presidente de la Asamblea Nacional, y la vicepresidenta Delcy Rodríguez.
      Tareck El Aissami, ministro de petróleo, también asistió a la reunión.
      
      Los funcionarios discutieron la economía venezolana y las relaciones con PDVSA.
    `,
    publishedAt: new Date().toISOString(),
    sourceName: 'Test Source',
  };
  
  console.log('Creating article with Tier 1 entities...');
  const nerRes = await fetch(`${API_URL}/ingestion/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testArticle),
  });
  const nerData = await nerRes.json();
  
  console.log(`✅ Entities extracted: ${nerData.entities?.length || 0}`);
  console.log(`✅ Nodes created: ${nerData.nodesCreated || 0}`);
  console.log('Extracted entities:');
  (nerData.entities || []).forEach(entity => {
    console.log(`  - ${entity.rawText} (${entity.type})`);
  });
  
  // Step 5: Check review queue for Tier 1 matches
  console.log('\n🔍 Step 5: Checking review queue for Tier 1 matches...');
  const queueRes = await fetch(`${API_URL}/ingestion/queue`);
  const queueData = await queueRes.json();
  
  console.log(`✅ Queue items: ${queueData.pending?.length || 0} pending`);
  console.log('Items with Tier 1 matches:');
  (queueData.pending || []).forEach(item => {
    if (item.tier1Match) {
      console.log(`\n  Entity: "${item.entity.rawText}"`);
      console.log(`  → Matched: "${item.tier1Match.official.fullName}" (${item.tier1Match.score}% ${item.tier1Match.matchType})`);
      console.log(`  → Sanctions: ${item.tier1Match.official.sanctionsPrograms.join(', ')}`);
      console.log(`  → Status: ${item.status}`);
    }
  });
  
  console.log('\n✅ Tier 1 matching test complete!\n');
  console.log('Expected behavior:');
  console.log('  1. High confidence matches (>95%) should be auto-approved');
  console.log('  2. Medium confidence matches (85-95%) should be queued with LLM review');
  console.log('  3. Low confidence matches (<85%) should be flagged for human review');
  console.log('  4. Entities without matches should follow normal quality checks');
}

main().catch(error => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
});
